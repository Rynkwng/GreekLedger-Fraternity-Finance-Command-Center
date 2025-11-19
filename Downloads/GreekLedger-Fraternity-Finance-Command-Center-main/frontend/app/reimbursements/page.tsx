'use client';

import { useEffect, useState } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';

export default function ReimbursementsPage() {
  const [reimbursements, setReimbursements] = useState<any[]>([]);
  const [members, setMembers] = useState<any[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    memberId: '',
    amount: 0,
    description: '',
    event: '',
    category: 'SOCIAL',
  });
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  useEffect(() => {
    fetchReimbursements();
    fetchMembers();
    fetchStats();
  }, []);

  const fetchReimbursements = async () => {
    try {
      const response = await axios.get('/api/reimbursements');
      setReimbursements(response.data);
    } catch (error) {
      toast.error('Failed to fetch reimbursements');
    }
  };

  const fetchMembers = async () => {
    try {
      const response = await axios.get('/api/members');
      setMembers(response.data);
    } catch (error) {
      toast.error('Failed to fetch members');
    }
  };

  const fetchStats = async () => {
    try {
      const response = await axios.get('/api/reimbursements/stats/summary');
      setStats(response.data);
    } catch (error) {
      console.error('Failed to fetch stats');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const formDataToSend = new FormData();
      formDataToSend.append('memberId', formData.memberId);
      formDataToSend.append('amount', formData.amount.toString());
      formDataToSend.append('description', formData.description);
      formDataToSend.append('event', formData.event);
      formDataToSend.append('category', formData.category);
      
      if (selectedFile) {
        formDataToSend.append('receipt', selectedFile);
      }

      await axios.post('/api/reimbursements', formDataToSend, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      
      toast.success('Reimbursement submitted successfully!');
      setShowModal(false);
      fetchReimbursements();
      fetchStats();
      setFormData({ memberId: '', amount: 0, description: '', event: '', category: 'SOCIAL' });
      setSelectedFile(null);
    } catch (error) {
      toast.error('Failed to submit reimbursement');
    }
  };

  const handleStatusUpdate = async (id: string, status: string) => {
    try {
      await axios.patch(`/api/reimbursements/${id}/status`, { status });
      toast.success(`Reimbursement ${status.toLowerCase()}!`);
      fetchReimbursements();
      fetchStats();
    } catch (error) {
      toast.error('Failed to update status');
    }
  };

  const getStatusBadge = (status: string) => {
    const badges: Record<string, string> = {
      PENDING: 'badge-warning',
      APPROVED: 'badge-info',
      DENIED: 'badge-danger',
      PAID: 'badge-success',
    };
    return badges[status] || 'badge-info';
  };

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Reimbursements</h1>
        <button onClick={() => setShowModal(true)} className="btn-primary">
          + Submit Reimbursement
        </button>
      </div>

      {/* Stats */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="card">
            <h3 className="text-sm text-gray-500">Pending</h3>
            <p className="text-2xl font-bold text-yellow-600">{stats.counts.pending}</p>
            <p className="text-sm text-gray-600">${stats.amounts.pending.toLocaleString()}</p>
          </div>
          <div className="card">
            <h3 className="text-sm text-gray-500">Approved</h3>
            <p className="text-2xl font-bold text-blue-600">{stats.counts.approved}</p>
            <p className="text-sm text-gray-600">${stats.amounts.approved.toLocaleString()}</p>
          </div>
          <div className="card">
            <h3 className="text-sm text-gray-500">Paid</h3>
            <p className="text-2xl font-bold text-green-600">{stats.counts.paid}</p>
            <p className="text-sm text-gray-600">${stats.amounts.paid.toLocaleString()}</p>
          </div>
        </div>
      )}

      {/* Reimbursements List */}
      <div className="card">
        <div className="space-y-4">
          {reimbursements.map((reimbursement) => (
            <div
              key={reimbursement.id}
              className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50"
            >
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="font-semibold text-lg">{reimbursement.event}</h3>
                    <span className={`badge ${getStatusBadge(reimbursement.status)}`}>
                      {reimbursement.status}
                    </span>
                    <span className="badge badge-info">{reimbursement.category}</span>
                  </div>
                  <p className="text-gray-600 mb-2">{reimbursement.description}</p>
                  <div className="flex items-center gap-4 text-sm text-gray-500">
                    <span>
                      👤 {reimbursement.member.firstName} {reimbursement.member.lastName}
                    </span>
                    <span>
                      📅 {new Date(reimbursement.submittedAt).toLocaleDateString()}
                    </span>
                    {reimbursement.receiptPath && (
                      <a
                        href={`http://localhost:3001${reimbursement.receiptPath}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary-600 hover:underline"
                      >
                        📎 View Receipt
                      </a>
                    )}
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-red-600">
                    ${reimbursement.amount.toFixed(2)}
                  </p>
                  {reimbursement.status === 'PENDING' && (
                    <div className="flex gap-2 mt-3">
                      <button
                        onClick={() => handleStatusUpdate(reimbursement.id, 'APPROVED')}
                        className="btn-success text-xs py-1 px-3"
                      >
                        Approve
                      </button>
                      <button
                        onClick={() => handleStatusUpdate(reimbursement.id, 'DENIED')}
                        className="btn-danger text-xs py-1 px-3"
                      >
                        Deny
                      </button>
                    </div>
                  )}
                  {reimbursement.status === 'APPROVED' && (
                    <button
                      onClick={() => handleStatusUpdate(reimbursement.id, 'PAID')}
                      className="btn-success text-xs py-1 px-3 mt-3"
                    >
                      Mark as Paid
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
          {reimbursements.length === 0 && (
            <p className="text-center text-gray-500 py-8">No reimbursements yet</p>
          )}
        </div>
      </div>

      {/* Submit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-8 max-w-md w-full max-h-[90vh] overflow-y-auto">
            <h2 className="text-2xl font-bold mb-4">Submit Reimbursement</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="label">Member</label>
                <select
                  className="input"
                  value={formData.memberId}
                  onChange={(e) => setFormData({ ...formData, memberId: e.target.value })}
                  required
                >
                  <option value="">Select a member</option>
                  {members.map((member) => (
                    <option key={member.id} value={member.id}>
                      {member.firstName} {member.lastName}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="label">Event Name</label>
                <input
                  type="text"
                  className="input"
                  value={formData.event}
                  onChange={(e) => setFormData({ ...formData, event: e.target.value })}
                  required
                />
              </div>
              <div>
                <label className="label">Category</label>
                <select
                  className="input"
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  required
                >
                  <option value="SOCIAL">Social</option>
                  <option value="PHILANTHROPY">Philanthropy</option>
                  <option value="OPERATIONS">Operations</option>
                  <option value="RECRUITMENT">Recruitment</option>
                  <option value="NATIONALS">Nationals</option>
                  <option value="HOUSING">Housing</option>
                  <option value="ATHLETICS">Athletics</option>
                  <option value="ACADEMIC">Academic</option>
                  <option value="OTHER">Other</option>
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
                <label className="label">Description</label>
                <textarea
                  className="input"
                  rows={3}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  required
                />
              </div>
              <div>
                <label className="label">Receipt (Optional)</label>
                <input
                  type="file"
                  className="input"
                  accept="image/*,.pdf"
                  onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                />
              </div>
              <div className="flex gap-4 mt-6">
                <button type="submit" className="btn-primary flex-1">
                  Submit
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

