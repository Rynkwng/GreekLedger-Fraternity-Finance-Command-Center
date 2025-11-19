'use client';

import { useEffect, useState } from 'react';
import axios from 'axios';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

const COLORS = ['#0ea5e9', '#8b5cf6', '#10b981', '#f59e0b', '#ef4444', '#ec4899'];

export default function Dashboard() {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const response = await axios.get('/api/analytics/dashboard');
      setStats(response.data);
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-xl">Loading...</div>
      </div>
    );
  }

  const collectionRate = stats?.members.duesOwed > 0
    ? (stats.members.duesPaid / stats.members.duesOwed) * 100
    : 0;

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Dashboard</h1>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="card bg-gradient-to-br from-blue-500 to-blue-600 text-white">
          <h3 className="text-sm font-medium opacity-90">Active Members</h3>
          <p className="text-3xl font-bold mt-2">{stats?.members.total || 0}</p>
        </div>

        <div className="card bg-gradient-to-br from-green-500 to-green-600 text-white">
          <h3 className="text-sm font-medium opacity-90">Dues Collected</h3>
          <p className="text-3xl font-bold mt-2">
            ${(stats?.members.duesPaid || 0).toLocaleString()}
          </p>
          <p className="text-sm mt-1 opacity-90">{collectionRate.toFixed(1)}% of total</p>
        </div>

        <div className="card bg-gradient-to-br from-yellow-500 to-yellow-600 text-white">
          <h3 className="text-sm font-medium opacity-90">Outstanding</h3>
          <p className="text-3xl font-bold mt-2">
            ${(stats?.members.outstanding || 0).toLocaleString()}
          </p>
        </div>

        <div className="card bg-gradient-to-br from-purple-500 to-purple-600 text-white">
          <h3 className="text-sm font-medium opacity-90">Pending Reimbursements</h3>
          <p className="text-3xl font-bold mt-2">{stats?.reimbursements.pending || 0}</p>
          <p className="text-sm mt-1 opacity-90">
            ${(stats?.reimbursements.pendingAmount || 0).toLocaleString()}
          </p>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        {/* Recent Activity */}
        <div className="card">
          <h2 className="text-xl font-semibold mb-4">Recent Payments</h2>
          <div className="space-y-3">
            {stats?.recentActivity?.payments?.slice(0, 5).map((payment: any) => (
              <div key={payment.id} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium">{payment.member.firstName} {payment.member.lastName}</p>
                  <p className="text-sm text-gray-500">
                    {new Date(payment.paymentDate).toLocaleDateString()}
                  </p>
                </div>
                <span className="font-semibold text-green-600">
                  ${payment.amount.toFixed(2)}
                </span>
              </div>
            ))}
            {(!stats?.recentActivity?.payments || stats.recentActivity.payments.length === 0) && (
              <p className="text-gray-500 text-center py-4">No recent payments</p>
            )}
          </div>
        </div>

        {/* Recent Reimbursements */}
        <div className="card">
          <h2 className="text-xl font-semibold mb-4">Recent Reimbursements</h2>
          <div className="space-y-3">
            {stats?.recentActivity?.reimbursements?.slice(0, 5).map((reimbursement: any) => (
              <div key={reimbursement.id} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium">{reimbursement.member.firstName} {reimbursement.member.lastName}</p>
                  <p className="text-sm text-gray-500">{reimbursement.event}</p>
                  <span className={`badge ${
                    reimbursement.status === 'PAID' ? 'badge-success' :
                    reimbursement.status === 'APPROVED' ? 'badge-info' :
                    reimbursement.status === 'DENIED' ? 'badge-danger' :
                    'badge-warning'
                  }`}>
                    {reimbursement.status}
                  </span>
                </div>
                <span className="font-semibold text-red-600">
                  ${reimbursement.amount.toFixed(2)}
                </span>
              </div>
            ))}
            {(!stats?.recentActivity?.reimbursements || stats.recentActivity.reimbursements.length === 0) && (
              <p className="text-gray-500 text-center py-4">No recent reimbursements</p>
            )}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="card">
        <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <a href="/members" className="btn-primary text-center">
            Manage Members
          </a>
          <a href="/reimbursements" className="btn-primary text-center">
            View Reimbursements
          </a>
          <a href="/events" className="btn-primary text-center">
            Plan Events
          </a>
          <a href="/analytics" className="btn-primary text-center">
            View Analytics
          </a>
        </div>
      </div>
    </div>
  );
}

