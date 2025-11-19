'use client';

import { useEffect, useState } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

export default function EventsPage() {
  const [events, setEvents] = useState<any[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    date: '',
    description: '',
    category: 'SOCIAL',
    plannedBudget: 0,
  });

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      const response = await axios.get('/api/events');
      setEvents(response.data);
    } catch (error) {
      toast.error('Failed to fetch events');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await axios.post('/api/events', {
        ...formData,
        date: new Date(formData.date),
        plannedBudget: parseFloat(formData.plannedBudget.toString()),
      });
      toast.success('Event created successfully!');
      setShowModal(false);
      fetchEvents();
      setFormData({ name: '', date: '', description: '', category: 'SOCIAL', plannedBudget: 0 });
    } catch (error) {
      toast.error('Failed to create event');
    }
  };

  // Prepare chart data
  const chartData = events.slice(0, 10).map(event => ({
    name: event.name.length > 15 ? event.name.substring(0, 15) + '...' : event.name,
    Planned: event.plannedBudget,
    Actual: event.actualSpent,
  }));

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Event Budget Planner</h1>
        <button onClick={() => setShowModal(true)} className="btn-primary">
          + Create Event
        </button>
      </div>

      {/* Budget Comparison Chart */}
      {events.length > 0 && (
        <div className="card mb-8">
          <h2 className="text-xl font-semibold mb-4">Planned vs Actual Spending</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip formatter={(value: any) => `$${value.toFixed(2)}`} />
              <Legend />
              <Bar dataKey="Planned" fill="#0ea5e9" />
              <Bar dataKey="Actual" fill="#10b981" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Events Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {events.map((event) => {
          const variance = event.actualSpent - event.plannedBudget;
          const variancePercentage = event.plannedBudget > 0
            ? (variance / event.plannedBudget) * 100
            : 0;
          const isOverBudget = variance > 0;

          return (
            <div key={event.id} className="card hover:shadow-lg transition-shadow">
              <div className="flex justify-between items-start mb-3">
                <h3 className="font-bold text-lg">{event.name}</h3>
                <span className="badge badge-info">{event.category}</span>
              </div>
              
              <p className="text-sm text-gray-600 mb-3">
                {new Date(event.date).toLocaleDateString()}
              </p>
              
              {event.description && (
                <p className="text-sm text-gray-700 mb-4">{event.description}</p>
              )}
              
              <div className="space-y-2 mb-4">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Planned Budget:</span>
                  <span className="font-semibold">${event.plannedBudget.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Actual Spent:</span>
                  <span className="font-semibold text-red-600">
                    ${event.actualSpent.toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Variance:</span>
                  <span className={`font-semibold ${isOverBudget ? 'text-red-600' : 'text-green-600'}`}>
                    {isOverBudget ? '+' : ''}{variance.toFixed(2)} ({variancePercentage.toFixed(1)}%)
                  </span>
                </div>
              </div>
              
              {/* Progress bar */}
              <div className="w-full bg-gray-200 rounded-full h-2.5 mb-2">
                <div
                  className={`h-2.5 rounded-full ${
                    isOverBudget ? 'bg-red-600' : 'bg-green-600'
                  }`}
                  style={{ 
                    width: `${Math.min((event.actualSpent / event.plannedBudget) * 100, 100)}%` 
                  }}
                ></div>
              </div>
              
              <span className={`badge ${
                event.status === 'COMPLETED' ? 'badge-success' :
                event.status === 'IN_PROGRESS' ? 'badge-warning' :
                event.status === 'CANCELLED' ? 'badge-danger' :
                'badge-info'
              }`}>
                {event.status}
              </span>
            </div>
          );
        })}
      </div>

      {events.length === 0 && (
        <div className="card text-center py-12">
          <p className="text-gray-500 text-lg">No events yet. Create your first event!</p>
        </div>
      )}

      {/* Create Event Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-8 max-w-md w-full">
            <h2 className="text-2xl font-bold mb-4">Create Event</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="label">Event Name</label>
                <input
                  type="text"
                  className="input"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>
              <div>
                <label className="label">Date</label>
                <input
                  type="date"
                  className="input"
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
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
                <label className="label">Planned Budget</label>
                <input
                  type="number"
                  step="0.01"
                  className="input"
                  value={formData.plannedBudget}
                  onChange={(e) => setFormData({ ...formData, plannedBudget: parseFloat(e.target.value) })}
                  required
                />
              </div>
              <div>
                <label className="label">Description (Optional)</label>
                <textarea
                  className="input"
                  rows={3}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                />
              </div>
              <div className="flex gap-4 mt-6">
                <button type="submit" className="btn-primary flex-1">
                  Create Event
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

