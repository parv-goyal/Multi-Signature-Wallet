#[cfg(test)]
mod tests {
    use array::ArrayTrait;
    use result::ResultTrait;
    use starknet::{ContractAddress, contract_address_const};
    use super::MultiSigWallet;
    use super::IMultiSigWalletDispatcher;
    use super::IMultiSigWalletDispatcherTrait;
    use starknet::syscalls::deploy_syscall;
    use traits::TryInto;

    // Helper function to deploy contract with test owners
    fn deploy_contract() -> IMultiSigWalletDispatcher {
        let mut owners = ArrayTrait::new();
        owners.append(contract_address_const::<1>());
        owners.append(contract_address_const::<2>());
        owners.append(contract_address_const::<3>());

        let mut calldata = ArrayTrait::new();
        let (contract_address, _) = deploy_syscall(
            MultiSigWallet::TEST_CLASS_HASH,
            0,
            calldata.span(),
            false
        ).unwrap();

        IMultiSigWalletDispatcher { contract_address }
    }

    #[test]
    fn test_constructor() {
        let contract = deploy_contract();
        
        // Test owner validation
        assert(contract.is_owner(contract_address_const::<1>()), 'Owner 1 not found');
        assert(contract.is_owner(contract_address_const::<2>()), 'Owner 2 not found');
        assert(contract.is_owner(contract_address_const::<3>()), 'Owner 3 not found');
        assert(!contract.is_owner(contract_address_const::<4>()), 'Non-owner found');
        
        // Test required approvals
        assert(contract.get_required_approvals() == 2_u32, 'Invalid required approvals');
    }

    #[test]
    #[should_panic(expected: ('Duplicate owner',))]
    fn test_duplicate_owners() {
        let mut owners = ArrayTrait::new();
        owners.append(contract_address_const::<1>());
        owners.append(contract_address_const::<1>()); // Duplicate owner
        
        let mut calldata = ArrayTrait::new();
        let (_, _) = deploy_syscall(
            MultiSigWallet::TEST_CLASS_HASH,
            0,
            calldata.span(),
            false
        ).unwrap();
    }

    #[test]
    #[should_panic(expected: ('Invalid required approvals',))]
    fn test_invalid_required_approvals() {
        let mut owners = ArrayTrait::new();
        owners.append(contract_address_const::<1>());
        owners.append(contract_address_const::<2>());
        
        let mut calldata = ArrayTrait::new();
        calldata.append(3_u32); // Required approvals > number of owners
        
        let (_, _) = deploy_syscall(
            MultiSigWallet::TEST_CLASS_HASH,
            0,
            calldata.span(),
            false
        ).unwrap();
    }

    #[test]
    fn test_submit_and_approve_transaction() {
        let contract = deploy_contract();
        
        // Submit transaction
        let mut data = ArrayTrait::new();
        let tx_id = contract.submit_transaction(
            contract_address_const::<4>(),
            1000_u256,
            data
        );
        
        // Verify transaction
        let transaction = contract.get_transaction(tx_id);
        assert(!transaction.executed, 'Should not be executed');
        assert(transaction.approval_count == 0_u32, 'Should have no approvals');
        
        // First approval
        contract.approve_transaction(tx_id);
        assert(
            contract.is_approved(tx_id, contract_address_const::<1>()),
            'First approval not recorded'
        );
        assert(contract.get_approval_count(tx_id) == 1_u32, 'Invalid approval count');
        
        // Second approval (should trigger execution)
        contract.approve_transaction(tx_id);
        let transaction = contract.get_transaction(tx_id);
        assert(transaction.executed, 'Should be executed');
        assert(transaction.approval_count == 2_u32, 'Should have 2 approvals');
    }

    #[test]
    #[should_panic(expected: ('Already approved',))]
    fn test_double_approval() {
        let contract = deploy_contract();
        
        // Submit and approve transaction
        let mut data = ArrayTrait::new();
        let tx_id = contract.submit_transaction(
            contract_address_const::<4>(),
            1000_u256,
            data
        );
        
        contract.approve_transaction(tx_id);
        // Try to approve again (should fail)
        contract.approve_transaction(tx_id);
    }

    #[test]
    #[should_panic(expected: ('Already executed',))]
    fn test_approve_executed_transaction() {
        let contract = deploy_contract();
        
        // Submit and get required approvals
        let mut data = ArrayTrait::new();
        let tx_id = contract.submit_transaction(
            contract_address_const::<4>(),
            1000_u256,
            data
        );
        
        contract.approve_transaction(tx_id); // First approval
        contract.approve_transaction(tx_id); // Second approval (triggers execution)
        
        // Try to approve executed transaction (should fail)
        contract.approve_transaction(tx_id);
    }

    #[test]
    #[should_panic(expected: ('Owner not found',))]
    fn test_non_owner_submit() {
        let contract = deploy_contract();
        
        // Try to submit as non-owner
        let mut data = ArrayTrait::new();
        contract.submit_transaction(
            contract_address_const::<4>(),
            1000_u256,
            data
        );
    }

    #[test]
    #[should_panic(expected: ('Owner not found',))]
    fn test_non_owner_approve() {
        let contract = deploy_contract();
        
        // Submit transaction as owner
        let mut data = ArrayTrait::new();
        let tx_id = contract.submit_transaction(
            contract_address_const::<4>(),
            1000_u256,
            data
        );
        
        // Try to approve as non-owner
        contract.approve_transaction(tx_id);
    }
}