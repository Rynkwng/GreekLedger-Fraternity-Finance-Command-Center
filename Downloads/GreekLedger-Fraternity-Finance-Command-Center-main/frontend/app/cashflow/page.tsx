'use client';

import { useEffect, useState } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ReferenceLine } from 'recharts';

export default function CashFlowPage() {
  const [projection, setProjection] = useState<any>(null);
  const [recurringTransactions, setRecurringTransactions] = useState<any[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    type: 'INCOME',
    category: 'OPERATIONS',
    amount: 0,
    frequency: 'MONTHLY',
    startDate: '',
  });

  useEffect(() => {
    fetchProjection();
    fetchRecurringTransactions();
  }, []);

  const fetchProjection = async () => {
    try {
      const response = await axios.get('/api/cashflow/projection?months=12');
      setProjection(response.data);
    } catch (error) {
      toast.error('Failed to fetch projection');
    }
  };

  const fetchRecurringTransactions = async () => {
    try {
      const response = await axios.get('/api/cashflow/recurring');
      setRecurringTransactions(response.data);
    } catch (error) {
      toast.error('Failed to fetch recurring transactions');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await axios.post('/api/cashflow/recurring', {
        ...formData,
        amount: parseFloat(formData.amount.toString()),
        startDate: new Date(formData.startDate),
      });
      toast.success('Recurring transaction added!');
      setShowModal(false);
      fetchRecurringTransactions();
      fetchProjection();
      setFormData({
        name: '',
        type: 'INCOME',
        category: 'OPERATIONS',
        amount: 0,
        frequency: 'MONTHLY',
        startDate: '',
      });
    } catch (error) {
      toast.error('Failed to add transaction');
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('Delete this recurring transaction?')) {
      try {
        await axios.delete(`/api/cashflow/recurring/${id}`);
        toast.success('Transaction deleted');
        fetchRecurringTransactions();
        fetchProjection();
      } catch (error) {
        toast.error('Failed to delete transaction');
      }
    }
  };

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-8">Cash Flow & Reserves</h1>

      {/* Current Balance */}
      {projection && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="card bg-gradient-to-br from-blue-500 to-blue-600 text-white">
              <h3 className="text-sm font-medium opacity-90">Current Balance</h3>
              <p className="text-3xl font-bold mt-2">
                ${projection.currentBalance.toLocaleString()}
              </p>
            </div>
            <div className="card bg-gradient-to-br from-yellow-500 to-yellow-600 text-white">
              <h3 className="text-sm font-medium opacity-90">Minimum Reserve</h3>
              <p className="text-3xl font-bold mt-2">
                ${projection.minReserveThreshold.toLocaleString()}
              </p>
            </div>
            <div className={`card bg-gradient-to-br ${
              projection.currentBalance >= projection.minReserveThreshold
                ? 'from-green-500 to-green-600'
                : 'from-red-500 to-red-600'
            } text-white`}>
              <h3 className="text-sm font-medium opacity-90">Reserve Status</h3>
              <p className="text-2xl font-bold mt-2">
                {projection.currentBalance >= projection.minReserveThreshold
                  ? '✓ Healthy'
                  : '⚠ Below Threshold'}
              </p>
            </div>
          </div>

          {/* Projection Chart */}
          <div className="card mb-8">
            <h2 className="text-xl font-semibold mb-4">12-Month Projection</h2>
            <ResponsiveContainer width="100%" height={400}>
              <LineChart data={projection.projection}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip formatter={(value: any) => `$${value.toFixed(2)}`} />
                <Legend />
                <ReferenceLine
                  y={projection.minReserveThreshold}
                  label="Min Reserve"
                  stroke="#ef4444"
                  strokeDasharray="3 3"
                />
                <Line
                  type="monotone"
                  dataKey="projectedBalance"
                  stroke="#0ea5e9"
                  strokeWidth={3}
                  name="Projected Balance"
                />
                <Line
                  type="monotone"
                  dataKey="income"
                  stroke="#10b981"
                  strokeWidth={2}
                  name="Income"
                />
                <Line
                  type="monotone"
                  dataKey="expenses"
                  stroke="#ef4444"
                  strokeWidth={2}
                  name="Expenses"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Warnings */}
          {projection.projection.some((m: any) => m.belowThreshold) && (
            <div className="card bg-red-50 border-l-4 border-red-500 mb-8">
              <h3 className="text-lg font-semibold text-red-800 mb-2">⚠️ Warning</h3>
              <p className="text-red-700">
                Your projected balance will fall below the minimum reserve threshold in the following months:
              </p>
              <ul className="list-disc list-inside mt-2 text-red-700">
                {projection.projection
                  .filter((m: any) => m.belowThreshold)
                  .map((m: any) => (
                    <li key={m.month}>
                      {m.month}: ${m.projectedBalance.toFixed(2)}
                    </li>
                  ))}
              </ul>
            </div>
          )}
        </>
      )}

      {/* Recurring Transactions */}
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-semibold">Recurring Transactions</h2>
        <button onClick={() => setShowModal(true)} className="btn-primary">
          + Add Recurring Transaction
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {recurringTransactions.map((transaction) => (
          <div key={transaction.id} className="card border-l-4" style={{
            borderLeftColor: transaction.type === 'INCOME' ? '#10b981' : '#ef4444'
          }}>
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-semibold text-lg">{transaction.name}</h3>
                <p className="text-sm text-gray-600">{transaction.description}</p>
                <div className="flex gap-2 mt-2">
                  <span className={`badge ${
                    transaction.type === 'INCOME' ? 'badge-success' : 'badge-danger'
                  }`}>
                    {transaction.type}
                  </span>
                  <span className="badge badge-info">{transaction.frequency}</span>
                  {transaction.category && (
                    <span className="badge badge-info">{transaction.category}</span>
                  )}
                </div>
              </div>
              <div className="text-right">
                <p className={`text-2xl font-bold ${
                  transaction.type === 'INCOME' ? 'text-green-600' : 'text-red-600'
                }`}>
                  {transaction.type === 'INCOME' ? '+' : '-'}${transaction.amount.toFixed(2)}
                </p>
                <button
                  onClick={() => handleDelete(transaction.id)}
                  className="text-red-600 hover:text-red-800 text-sm mt-2"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {recurringTransactions.length === 0 && (
        <div className="card text-center py-12">
          <p className="text-gray-500">No recurring transactions yet</p>
        </div>
      )}

      {/* Add Transaction Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-8 max-w-md w-full">
            <h2 className="text-2xl font-bold mb-4">Add Recurring Transaction</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="label">Name</label>
                <input
                  type="text"
                  className="input"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>
              <div>
                <label className="label">Type</label>
                <select
                  className="input"
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                  required
                >
                  <option value="INCOME">Income</option>
                  <option value="EXPENSE">Expense</option>
                </select>
              </div>
              <div>
                <label className="label">Amount</label>
                <input
                  type="number"
                  step="0.01"
                  className="input"
                  value={formData.amount}
                  onChange={(e) => setFormData({ ...formData, amount: parseFloat(e.target.value) })}
                  required
                />
              </div>
              <div>
                <label className="label">Frequency</label>
                <select
                  className="input"
                  value={formData.frequency}
                  onChange={(e) => setFormData({ ...formData, frequency: e.target.value })}
                  required
                >
                  <option value="MONTHLY">Monthly</option>
                  <option value="QUARTERLY">Quarterly</option>
                  <option value="SEMESTER">Semester</option>
                  <option value="ANNUALLY">Annually</option>
                </select>
              </div>
              <div>
                <label className="label">Start Date</label>
                <input
                  type="date"
                  className="input"
                  value={formData.startDate}
                  onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                  required
                />
              </div>
              <div className="flex gap-4 mt-6">
                <button type="submit" className="btn-primary flex-1">
                  Add Transaction
                </button>
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="btn-secondary flex-1"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

