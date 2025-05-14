import { Contract, Provider, Account, constants } from "starknet";

const CONTRACT_ADDRESS = "YOUR_CONTRACT_ADDRESS";
const CONTRACT_ABI = [
  {
    "members": [
      {
        "name": "tx_id",
        "offset": 0,
        "type": "felt"
      },
      {
        "name": "proposer",
        "offset": 1,
        "type": "felt"
      },
      {
        "name": "to",
        "offset": 2,
        "type": "felt"
      },
      {
        "name": "value",
        "offset": 3,
        "type": "felt"
      }
    ],
    "name": "Transaction",
    "size": 4,
    "type": "struct"
  },
  {
    "inputs": [
      {
        "name": "owners",
        "type": "felt*"
      },
      {
        "name": "required_approvals",
        "type": "felt"
      }
    ],
    "name": "constructor",
    "outputs": [],
    "type": "constructor"
  },
  {
    "inputs": [
      {
        "name": "to",
        "type": "felt"
      },
      {
        "name": "value",
        "type": "felt"
      },
      {
        "name": "data",
        "type": "felt*"
      }
    ],
    "name": "submit_transaction",
    "outputs": [
      {
        "name": "tx_id",
        "type": "felt"
      }
    ],
    "type": "function"
  },
  {
    "inputs": [
      {
        "name": "tx_id",
        "type": "felt"
      }
    ],
    "name": "approve_transaction",
    "outputs": [],
    "type": "function"
  },
  {
    "inputs": [
      {
        "name": "address",
        "type": "felt"
      }
    ],
    "name": "is_owner",
    "outputs": [
      {
        "name": "res",
        "type": "felt"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "name": "tx_id",
        "type": "felt"
      }
    ],
    "name": "get_transaction",
    "outputs": [
      {
        "name": "transaction",
        "type": "Transaction"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  }
];

export class MultiSigWallet {
  private contract: Contract;
  private account: Account | null;

  constructor(provider: Provider, account: Account | null = null) {
    this.contract = new Contract(CONTRACT_ABI, CONTRACT_ADDRESS, provider);
    this.account = account;
  }

  async isOwner(address: string): Promise<boolean> {
    const result = await this.contract.is_owner(address);
    return result.res.toString() === '1';
  }

  async submitTransaction(to: string, value: string, data: string[] = []): Promise<string> {
    if (!this.account) throw new Error('No account connected');
    
    const result = await this.contract.submit_transaction(to, value, data);
    return result.tx_id.toString();
  }

  async approveTransaction(txId: string): Promise<void> {
    if (!this.account) throw new Error('No account connected');
    
    await this.contract.approve_transaction(txId);
  }

  async getTransaction(txId: string): Promise<any> {
    const result = await this.contract.get_transaction(txId);
    return {
      to: result.transaction.to.toString(),
      value: result.transaction.value.toString(),
      proposer: result.transaction.proposer.toString(),
      executed: result.transaction.executed
    };
  }

  setAccount(account: Account | null) {
    this.account = account;
    if (account) {
      this.contract.connect(account);
    }
  }
}