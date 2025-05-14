import React from 'react';
import { Account } from 'starknet';
import { CheckCircle, Clock, XCircle } from 'lucide-react';

interface Transaction {
  id: string;
  to: string;
  value: string;
  approvals: number;
  executed: boolean;
  approved: boolean;
}

interface TransactionListProps {
  transactions: Transaction[];
  account: Account;
  isOwner: boolean;
  onApprove: (txId: string) => Promise<void>;
}

export const TransactionList: React.FC<TransactionListProps> = ({
  transactions,
  account,
  isOwner,
  onApprove,
}) => {
  const handleApprove = async (txId: string) => {
    try {
      await onApprove(txId);
    } catch (error) {
      console.error('Error approving transaction:', error);
    }
  };

  return (
    <div className="mt-4">
      {transactions.length === 0 ? (
        <p className="text-sm text-gray-500">No transactions found</p>
      ) : (
        <div className="space-y-4">
          {transactions.map((tx) => (
            <div
              key={tx.id}
              className="bg-gray-50 rounded-lg p-4 flex items-center justify-between"
            >
              <div>
                <p className="text-sm font-medium text-gray-900">
                  To: {tx.to}
                </p>
                <p className="text-sm text-gray-500">
                  Value: {tx.value}
                </p>
                <p className="text-sm text-gray-500">
                  Approvals: {tx.approvals}
                </p>
              </div>
              <div className="flex items-center space-x-4">
                {tx.executed ? (
                  <CheckCircle className="h-6 w-6 text-green-500" />
                ) : tx.approved ? (
                  <Clock className="h-6 w-6 text-yellow-500" />
                ) : (
                  isOwner && (
                    <button
                      onClick={() => handleApprove(tx.id)}
                      className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                    >
                      Approve
                    </button>
                  )
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};