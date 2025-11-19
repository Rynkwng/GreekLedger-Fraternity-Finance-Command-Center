'use client';

import { useEffect, useState } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';

interface Member {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  pledgeClass: string;
  status: string;
  duesOwed: number;
  duesPaid: number;
  outstandingBalance: number;
}

export default function MembersPage() {
  const [members, setMembers] = useState<Member[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phoneNumber: '',
    pledgeClass: '',
    status: 'ACTIVE',
    duesOwed: 0,
  });

  useEffect(() => {
    fetchMembers();
    fetchStats();
  }, []);

  const fetchMembers = async () => {
    try {
      const response = await axios.get('/api/members');
      setMembers(response.data);
    } catch (error) {
      toast.error('Failed to fetch members');
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await axios.get('/api/members/stats/summary');
      setStats(response.data);
    } catch (error) {
      console.error('Failed to fetch stats');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await axios.post('/api/members', {
        ...formData,
        duesOwed: parseFloat(formData.duesOwed.toString()),
        outstandingBalance: parseFloat(formData.duesOwed.toString()),
      });
      toast.success('Member added successfully!');
      setShowModal(false);
      fetchMembers();
      fetchStats();
      setFormData({
        firstName: '',
        lastName: '',
        email: '',
        phoneNumber: '',
        pledgeClass: '',
        status: 'ACTIVE',
        duesOwed: 0,
      });
    } catch (error) {
      toast.error('Failed to add member');
    }
  };

  const getStatusColor = (member: Member) => {
    if (member.outstandingBalance === 0) return 'bg-green-100 text-green-800';
    if (member.duesPaid > 0) return 'bg-yellow-100 text-yellow-800';
    return 'bg-red-100 text-red-800';
  };

  const getStatusText = (member: Member) => {
    if (member.outstandingBalance === 0) return 'Paid';
    if (member.duesPaid > 0) return 'Partial';
    return 'Overdue';
  };

  if (loading) {
    return <div className="p-8">Loading...</div>;
  }

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Members & Dues</h1>
        <button onClick={() => setShowModal(true)} className="btn-primary">
          + Add Member
        </button>
      </div>

      {/* Summary Stats */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="card">
            <h3 className="text-sm text-gray-500">Total Members</h3>
            <p className="text-2xl font-bold">{stats.totalMembers}</p>
          </div>
          <div className="card">
            <h3 className="text-sm text-gray-500">Total Expected</h3>
            <p className="text-2xl font-bold">${stats.totalDuesExpected.toLocaleString()}</p>
          </div>
          <div className="card">
            <h3 className="text-sm text-gray-500">Total Collected</h3>
            <p className="text-2xl font-bold text-green-600">
              ${stats.totalCollected.toLocaleString()}
            </p>
            <p className="text-sm text-gray-500">{stats.collectionPercentage.toFixed(1)}%</p>
          </div>
          <div className="card">
            <h3 className="text-sm text-gray-500">Outstanding</h3>
            <p className="text-2xl font-bold text-red-600">
              ${stats.totalOutstanding.toLocaleString()}
            </p>
          </div>
        </div>
      )}

      {/* Members Table */}
      <div className="card">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Pledge Class</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Dues Owed</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Paid</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Outstanding</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {members.map((member) => (
                <tr key={member.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="font-medium text-gray-900">
                      {member.firstName} {member.lastName}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {member.email}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {member.pledgeClass}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    ${member.duesOwed.toFixed(2)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-green-600">
                    ${member.duesPaid.toFixed(2)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-red-600">
                    ${member.outstandingBalance.toFixed(2)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`badge ${getStatusColor(member)}`}>
                      {getStatusText(member)}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Member Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-8 max-w-md w-full">
            <h2 className="text-2xl font-bold mb-4">Add New Member</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="label">First Name</label>
                <input
                  type="text"
                  className="input"
                  value={formData.firstName}
                  onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                  required
                />
              </div>
              <div>
                <label className="label">Last Name</label>
                <input
                  type="text"
                  className="input"
                  value={formData.lastName}
                  onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                  required
                />
              </div>
              <div>
                <label className="label">Email</label>
                <input
                  type="email"
                  className="input"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                />
              </div>
              <div>
                <label className="label">Phone Number</label>
                <input
                  type="tel"
                  className="input"
                  value={formData.phoneNumber}
                  onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                />
              </div>
              <div>
                <label className="label">Pledge Class</label>
                <input
                  type="text"
                  className="input"
                  value={formData.pledgeClass}
                  onChange={(e) => setFormData({ ...formData, pledgeClass: e.target.value })}
                  required
                />
              </div>
              <div>
                <label className="label">Dues Owed</label>
                <input
                  type="number"
                  step="0.01"
                  className="input"
                  value={formData.duesOwed}
                  onChange={(e) => setFormData({ ...formData, duesOwed: parseFloat(e.target.value) })}
                  required
                />
              </div>
              <div className="flex gap-4 mt-6">
                <button type="submit" className="btn-primary flex-1">
                  Add Member
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

