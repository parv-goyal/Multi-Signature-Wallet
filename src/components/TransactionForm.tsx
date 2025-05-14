import React, { useState } from 'react';
import { Account } from 'starknet';

interface TransactionFormProps {
  account: Account;
  onSubmit: (to: string, value: string, data: string) => Promise<void>;
}

export const TransactionForm: React.FC<TransactionFormProps> = ({ account, onSubmit }) => {
  const [to, setTo] = useState('');
  const [value, setValue] = useState('');
  const [data, setData] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await onSubmit(to, value, data);
      setTo('');
      setValue('');
      setData('');
    } catch (error) {
      console.error('Error submitting transaction:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="mt-4 space-y-4">
      <div>
        <label
          htmlFor="to"
          className="block text-sm font-medium text-gray-700"
        >
          Recipient Address
        </label>
        <input
          type="text"
          id="to"
          value={to}
          onChange={(e) => setTo(e.target.value)}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          placeholder="0x..."
          required
        />
      </div>

      <div>
        <label
          htmlFor="value"
          className="block text-sm font-medium text-gray-700"
        >
          Amount (in ETH)
        </label>
        <input
          type="text"
          id="value"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          placeholder="0.0"
          required
        />
      </div>

      <div>
        <label
          htmlFor="data"
          className="block text-sm font-medium text-gray-700"
        >
          Data (optional)
        </label>
        <textarea
          id="data"
          value={data}
          onChange={(e) => setData(e.target.value)}
          rows={3}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          placeholder="0x..."
        />
      </div>

      <button
        type="submit"
        disabled={isSubmitting}
        className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
      >
        {isSubmitting ? 'Submitting...' : 'Submit Transaction'}
      </button>
    </form>
  );
};