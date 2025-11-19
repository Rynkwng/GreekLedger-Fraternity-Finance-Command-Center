'use client';

import { useEffect, useState } from 'react';
import axios from 'axios';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip, LineChart, Line, XAxis, YAxis, CartesianGrid } from 'recharts';

const COLORS = ['#0ea5e9', '#8b5cf6', '#10b981', '#f59e0b', '#ef4444', '#ec4899', '#06b6d4', '#84cc16'];

export default function AnalyticsPage() {
  const [spendingByCategory, setSpendingByCategory] = useState<any>(null);
  const [trends, setTrends] = useState<any[]>([]);
  const [perMember, setPerMember] = useState<any>(null);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      const [categoryRes, trendsRes, perMemberRes] = await Promise.all([
        axios.get('/api/analytics/spending-by-category'),
        axios.get('/api/analytics/spending-trends?months=6'),
        axios.get('/api/analytics/spending-per-member'),
      ]);
      
      setSpendingByCategory(categoryRes.data);
      setTrends(trendsRes.data);
      setPerMember(perMemberRes.data);
    } catch (error) {
      console.error('Failed to fetch analytics:', error);
    }
  };

  // Prepare trend data for line chart
  const trendChartData = trends.map(trend => ({
    month: trend.month,
    total: trend.total,
  }));

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-8">Spending Analytics</h1>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="card bg-gradient-to-br from-blue-500 to-blue-600 text-white">
          <h3 className="text-sm font-medium opacity-90">Total Spending</h3>
          <p className="text-3xl font-bold mt-2">
            ${(spendingByCategory?.total || 0).toLocaleString()}
          </p>
        </div>
        <div className="card bg-gradient-to-br from-purple-500 to-purple-600 text-white">
          <h3 className="text-sm font-medium opacity-90">Active Members</h3>
          <p className="text-3xl font-bold mt-2">{perMember?.activeMembers || 0}</p>
        </div>
        <div className="card bg-gradient-to-br from-green-500 to-green-600 text-white">
          <h3 className="text-sm font-medium opacity-90">Spending Per Member</h3>
          <p className="text-3xl font-bold mt-2">
            ${(perMember?.spendingPerMember || 0).toFixed(2)}
          </p>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        {/* Pie Chart */}
        <div className="card">
          <h2 className="text-xl font-semibold mb-4">Spending by Category</h2>
          {spendingByCategory && spendingByCategory.data.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={spendingByCategory.data}
                  dataKey="amount"
                  nameKey="category"
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  label={({ category, percentage }) => `${category}: ${percentage.toFixed(1)}%`}
                >
                  {spendingByCategory.data.map((entry: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value: any) => `$${value.toFixed(2)}`} />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-gray-500 text-center py-12">No spending data yet</p>
          )}
        </div>

        {/* Line Chart */}
        <div className="card">
          <h2 className="text-xl font-semibold mb-4">Spending Trends (Last 6 Months)</h2>
          {trendChartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={trendChartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip formatter={(value: any) => `$${value.toFixed(2)}`} />
                <Line type="monotone" dataKey="total" stroke="#0ea5e9" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-gray-500 text-center py-12">No trend data yet</p>
          )}
        </div>
      </div>

      {/* Category Breakdown Table */}
      {spendingByCategory && spendingByCategory.data.length > 0 && (
        <div className="card">
          <h2 className="text-xl font-semibold mb-4">Detailed Breakdown</h2>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Category
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Amount
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Percentage
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Visual
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {spendingByCategory.data.map((item: any, index: number) => (
                  <tr key={item.category}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div
                          className="w-3 h-3 rounded-full mr-3"
                          style={{ backgroundColor: COLORS[index % COLORS.length] }}
                        ></div>
                        <span className="font-medium">{item.category}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-lg font-semibold">
                      ${item.amount.toFixed(2)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {item.percentage.toFixed(1)}%
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="w-full bg-gray-200 rounded-full h-2.5">
                        <div
                          className="h-2.5 rounded-full"
                          style={{
                            width: `${item.percentage}%`,
                            backgroundColor: COLORS[index % COLORS.length],
                          }}
                        ></div>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Export Options */}
      <div className="card mt-8">
        <h2 className="text-xl font-semibold mb-4">Export Reports</h2>
        <div className="flex gap-4">
          <button className="btn-primary">
            📊 Export CSV
          </button>
          <button className="btn-primary">
            📄 Generate PDF Report
          </button>
        </div>
      </div>
    </div>
  );
}

