import React from 'react';
import { UserCircle } from 'lucide-react';

interface WalletProps {
  address: string;
}

export const Wallet: React.FC<WalletProps> = ({ address }) => {
  return (
    <div className="flex items-center p-4 bg-gray-50 rounded-lg">
      <UserCircle className="h-8 w-8 text-gray-400" />
      <span className="ml-3 text-sm font-medium text-gray-900">{address}</span>
    </div>
  );
};

interface WalletListProps {
  owners: string[];
}

export const WalletList: React.FC<WalletListProps> = ({ owners }) => {
  return (
    <div className="mt-4 space-y-2">
      {owners.length === 0 ? (
        <p className="text-sm text-gray-500">No owners found</p>
      ) : (
        owners.map((owner) => <Wallet key={owner} address={owner} />)
      )}
    </div>
  );
};