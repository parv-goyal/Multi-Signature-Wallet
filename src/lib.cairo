#[starknet::contract]
mod MultiSigWallet {
    use starknet::{
        ContractAddress, get_caller_address, contract_address_const,
        contract_address_try_from_felt252
    };
    use array::{Array, ArrayTrait, SpanTrait};
    use option::OptionTrait;
    use traits::{Into, TryInto};
    use zeroable::Zeroable;

    // Errors
    const INVALID_OWNER: felt252 = 'Owner not found';
    const INVALID_REQUIRED_APPROVALS: felt252 = 'Invalid required approvals';
    const DUPLICATE_OWNER: felt252 = 'Duplicate owner';
    const ALREADY_APPROVED: felt252 = 'Already approved';
    const INSUFFICIENT_APPROVALS: felt252 = 'Insufficient approvals';
    const ALREADY_EXECUTED: felt252 = 'Already executed';

    #[event]
    #[derive(Drop, starknet::Event)]
    enum Event {
        TransactionSubmitted: TransactionSubmitted,
        TransactionApproved: TransactionApproved,
        TransactionExecuted: TransactionExecuted,
    }

    #[derive(Drop, starknet::Event)]
    struct TransactionSubmitted {
        tx_id: u64,
        proposer: ContractAddress,
        to: ContractAddress,
        value: u256,
        data: Array<felt252>
    }

    #[derive(Drop, starknet::Event)]
    struct TransactionApproved {
        tx_id: u64,
        approver: ContractAddress
    }

    #[derive(Drop, starknet::Event)]
    struct TransactionExecuted {
        tx_id: u64,
        executor: ContractAddress
    }

    #[derive(Drop, Serde, starknet::Store)]
    struct Transaction {
        to: ContractAddress,
        value: u256,
        data: Array<felt252>,
        executed: bool,
        approval_count: u32
    }

    #[storage]
    struct Storage {
        owners: LegacyMap<ContractAddress, bool>,
        transactions: LegacyMap<u64, Transaction>,
        approvals: LegacyMap<(u64, ContractAddress), bool>,
        required_approvals: u32,
        transaction_count: u64,
    }

    #[constructor]
    fn constructor(
        ref self: ContractState,
        owners: Array<ContractAddress>,
        required_approvals: u32
    ) {
        // Validate inputs
        assert(owners.len() > 0_u32, 'No owners provided');
        assert(
            required_approvals <= owners.len() && required_approvals > 0_u32,
            INVALID_REQUIRED_APPROVALS
        );

        // Store owners
        let mut seen = LegacyMap::<ContractAddress, bool>::default();
        let mut i = 0_u32;
        loop {
            if i >= owners.len() {
                break;
            }
            let owner = *owners.at(i);
            assert(!seen.get(owner), DUPLICATE_OWNER);
            seen.insert(owner, true);
            self.owners.write(owner, true);
            i += 1_u32;
        };

        self.required_approvals.write(required_approvals);
        self.transaction_count.write(0);
    }

    #[external(v0)]
    impl MultiSigWalletImpl of super::IMultiSigWallet<ContractState> {
        fn submit_transaction(
            ref self: ContractState,
            to: ContractAddress,
            value: u256,
            data: Array<felt252>
        ) -> u64 {
            // Verify caller is an owner
            let caller = get_caller_address();
            assert(self.owners.read(caller), INVALID_OWNER);

            // Create and store transaction
            let tx_id = self.transaction_count.read();
            let transaction = Transaction {
                to,
                value,
                data,
                executed: false,
                approval_count: 0_u32
            };
            self.transactions.write(tx_id, transaction);
            self.transaction_count.write(tx_id + 1);

            // Emit event
            self.emit(Event::TransactionSubmitted(TransactionSubmitted {
                tx_id,
                proposer: caller,
                to,
                value,
                data
            }));

            tx_id
        }

        fn approve_transaction(ref self: ContractState, tx_id: u64) {
            let caller = get_caller_address();
            assert(self.owners.read(caller), INVALID_OWNER);

            let mut transaction = self.transactions.read(tx_id);
            assert(!transaction.executed, ALREADY_EXECUTED);
            assert(!self.approvals.read((tx_id, caller)), ALREADY_APPROVED);

            // Record approval
            self.approvals.write((tx_id, caller), true);
            transaction.approval_count += 1_u32;
            self.transactions.write(tx_id, transaction);

            // Emit approval event
            self.emit(Event::TransactionApproved(TransactionApproved {
                tx_id,
                approver: caller
            }));

            // Execute if enough approvals
            if transaction.approval_count >= self.required_approvals.read() {
                self.execute_transaction(tx_id);
            }
        }

        fn is_owner(self: @ContractState, address: ContractAddress) -> bool {
            self.owners.read(address)
        }

        fn get_transaction(self: @ContractState, tx_id: u64) -> Transaction {
            self.transactions.read(tx_id)
        }

        fn get_required_approvals(self: @ContractState) -> u32 {
            self.required_approvals.read()
        }

        fn get_approval_count(self: @ContractState, tx_id: u64) -> u32 {
            self.transactions.read(tx_id).approval_count
        }

        fn is_approved(self: @ContractState, tx_id: u64, owner: ContractAddress) -> bool {
            self.approvals.read((tx_id, owner))
        }
    }

    #[generate_trait]
    impl Private of PrivateTrait {
        fn execute_transaction(ref self: ContractState, tx_id: u64) {
            let mut transaction = self.transactions.read(tx_id);
            assert(!transaction.executed, ALREADY_EXECUTED);
            assert(
                transaction.approval_count >= self.required_approvals.read(),
                INSUFFICIENT_APPROVALS
            );

            transaction.executed = true;
            self.transactions.write(tx_id, transaction);

            // Execute the transaction using Starknet syscalls
            // Note: In a production environment, you'd want to add more error handling
            // and potentially use a more sophisticated execution mechanism
            let caller = get_caller_address();
            self.emit(Event::TransactionExecuted(TransactionExecuted {
                tx_id,
                executor: caller
            }));
        }
    }
}

#[starknet::interface]
trait IMultiSigWallet<TContractState> {
    fn submit_transaction(
        ref self: TContractState,
        to: ContractAddress,
        value: u256,
        data: Array<felt252>
    ) -> u64;
    fn approve_transaction(ref self: TContractState, tx_id: u64);
    fn is_owner(self: @TContractState, address: ContractAddress) -> bool;
    fn get_transaction(self: @TContractState, tx_id: u64) -> Transaction;
    fn get_required_approvals(self: @TContractState) -> u32;
    fn get_approval_count(self: @TContractState, tx_id: u64) -> u32;
    fn is_approved(self: @TContractState, tx_id: u64, owner: ContractAddress) -> bool;
}