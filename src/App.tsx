import React, { useState, useEffect } from 'react';
import { connect, disconnect } from 'get-starknet';
import { Contract, Provider, Account, constants } from 'starknet';
import { Wallet, WalletList } from './components/Wallet';
import { TransactionList } from './components/TransactionList';
import { TransactionForm } from './components/TransactionForm';
import { WalletIcon, Plus, List, Github, Twitter } from 'lucide-react';
import { MultiSigWallet } from './lib/contract';

function App() {
  const [account, setAccount] = useState<Account | null>(null);
  const [isOwner, setIsOwner] = useState(false);
  const [transactions, setTransactions] = useState([]);
  const [owners, setOwners] = useState([]);
  const [requiredApprovals, setRequiredApprovals] = useState(0);
  const [wallet, setWallet] = useState<MultiSigWallet | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [balance, setBalance] = useState<string>('0');
  const [networkStatus, setNetworkStatus] = useState<string>('');

  useEffect(() => {
    const initializeWallet = async () => {
      if (account) {
        const provider = new Provider({ 
          sequencer: { 
            baseUrl: 'https://alpha4.starknet.io',
            chainId: constants.NetworkName.SN_GOERLI
          } 
        });
        const multiSigWallet = new MultiSigWallet(provider, account);
        setWallet(multiSigWallet);
        
        try {
          // Check if connected account is an owner
          const ownerStatus = await multiSigWallet.isOwner(account.address);
          setIsOwner(ownerStatus);

          // Get network status
          const network = await provider.getChainId();
          setNetworkStatus(network);

          // Get wallet balance (mock data for demo)
          setBalance('1.5 ETH');
        } catch (error) {
          console.error('Error initializing wallet:', error);
          setError('Failed to initialize wallet. Please try again.');
        }
      }
    };

    initializeWallet();
  }, [account]);

  const connectWallet = async () => {
    try {
      setError(null);
      
      if (typeof window.starknet === 'undefined') {
        setError('StarkNet wallet not found. Please install a compatible wallet like Argent or Braavos.');
        return;
      }

      const starknet = await connect();
      
      if (!starknet?.isConnected) {
        throw new Error('Failed to connect to StarkNet wallet. Please ensure your wallet is unlocked and try again.');
      }
      
      setAccount(starknet.account);
    } catch (error) {
      console.error('Error connecting wallet:', error);
      setError(error instanceof Error ? error.message : 'Failed to connect to wallet. Please try again.');
    }
  };

  const disconnectWallet = async () => {
    try {
      await disconnect();
      setAccount(null);
      setIsOwner(false);
      setWallet(null);
      setError(null);
      setBalance('0');
      setNetworkStatus('');
    } catch (error) {
      console.error('Error disconnecting wallet:', error);
      setError('Failed to disconnect wallet. Please try again.');
    }
  };

  const handleSubmitTransaction = async (to: string, value: string, data: string) => {
    if (!wallet) return;
    try {
      const txId = await wallet.submitTransaction(to, value, data.split(','));
      // Refresh transactions list
    } catch (error) {
      console.error('Error submitting transaction:', error);
    }
  };

  const handleApproveTransaction = async (txId: string) => {
    if (!wallet) return;
    try {
      await wallet.approveTransaction(txId);
      // Refresh transactions list
    } catch (error) {
      console.error('Error approving transaction:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <WalletIcon className="h-8 w-8 text-indigo-600" />
              <h1 className="ml-2 text-xl font-semibold text-gray-900">
                Multi-Signature Wallet
              </h1>
            </div>
            <div className="flex items-center space-x-4">
              {networkStatus && (
                <span className="text-sm text-gray-600">
                  Network: {networkStatus}
                </span>
              )}
              {!account ? (
                <button
                  onClick={connectWallet}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  Connect Wallet
                </button>
              ) : (
                <button
                  onClick={disconnectWallet}
                  className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  Disconnect
                </button>
              )}
            </div>
          </div>
        </div>
      </nav>

      <main className="flex-grow max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        {error && (
          <div className="mb-4 rounded-md bg-red-50 p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">
                  {error}
                </h3>
              </div>
            </div>
          </div>
        )}

        {account ? (
          <div className="space-y-6">
            <div className="bg-white shadow sm:rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <h2 className="text-lg font-medium text-gray-900">Wallet Info</h2>
                <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <p className="text-sm text-gray-500">Connected Account:</p>
                    <p className="mt-1 text-sm font-medium text-gray-900">
                      {`${account.address.slice(0, 6)}...${account.address.slice(-4)}`}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Balance:</p>
                    <p className="mt-1 text-sm font-medium text-gray-900">{balance}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Required Approvals:</p>
                    <p className="mt-1 text-sm font-medium text-gray-900">{requiredApprovals}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Owner Status:</p>
                    <p className="mt-1 text-sm font-medium text-gray-900">
                      {isOwner ? 'Wallet Owner' : 'Non-owner'}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {isOwner && (
              <div className="bg-white shadow sm:rounded-lg">
                <div className="px-4 py-5 sm:p-6">
                  <h2 className="text-lg font-medium text-gray-900">
                    Submit Transaction
                  </h2>
                  <TransactionForm 
                    account={account} 
                    onSubmit={handleSubmitTransaction}
                  />
                </div>
              </div>
            )}

            <div className="bg-white shadow sm:rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <h2 className="text-lg font-medium text-gray-900">
                  Transactions
                </h2>
                <TransactionList
                  transactions={transactions}
                  account={account}
                  isOwner={isOwner}
                  onApprove={handleApproveTransaction}
                />
              </div>
            </div>

            <div className="bg-white shadow sm:rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <h2 className="text-lg font-medium text-gray-900">
                  Wallet Owners
                </h2>
                <WalletList owners={owners} />
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center">
            <h3 className="mt-2 text-sm font-medium text-gray-900">
              No wallet connected
            </h3>
            <p className="mt-1 text-sm text-gray-500">
              Connect your wallet to interact with the multi-signature wallet.
            </p>
          </div>
        )}
      </main>

      <footer className="bg-white border-t border-gray-200 mt-auto">
        <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">OnchAIn Island Pre-Selection Task</h3>
              <p className="mt-2 text-sm text-gray-600">
                A secure multi-signature wallet implementation for StarkNet, combining the power of Cairo smart contracts with a modern React frontend.
              </p>
              <div className="mt-4 flex space-x-4">
                <a
                  href="https://github.com/yourusername/multisig-wallet"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-400 hover:text-gray-500"
                >
                  <Github className="h-6 w-6" />
                </a>
                <a
                  href="https://twitter.com/yourusername"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-400 hover:text-gray-500"
                >
                  <Twitter className="h-6 w-6" />
                </a>
              </div>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Key Features</h3>
              <ul className="mt-2 space-y-2 text-sm text-gray-600">
                <li>• Secure multi-signature functionality</li>
                <li>• Real-time transaction tracking</li>
                <li>• StarkNet integration</li>
                <li>• Modern React & Tailwind UI</li>
                <li>• Cairo smart contract implementation</li>
              </ul>
            </div>
          </div>
          <div className="mt-8 pt-8 border-t border-gray-200">
            <p className="text-center text-sm text-gray-500">
              Built with ❤️ for OnchAIn Island Hackathon 2025
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;