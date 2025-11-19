'use client';

import { useEffect, useState } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';

export default function ScenariosPage() {
  const [scenarios, setScenarios] = useState<any[]>([]);
  const [preview, setPreview] = useState<any>(null);
  const [formData, setFormData] = useState({
    name: '',
    memberCount: 50,
    duesAmount: 500,
    expectedExpenses: 20000,
  });

  useEffect(() => {
    fetchScenarios();
  }, []);

  const fetchScenarios = async () => {
    try {
      const response = await axios.get('/api/scenarios');
      setScenarios(response.data);
    } catch (error) {
      toast.error('Failed to fetch scenarios');
    }
  };

  const handleCalculate = async () => {
    try {
      const response = await axios.post('/api/scenarios/preview', formData);
      setPreview(response.data);
    } catch (error) {
      toast.error('Failed to calculate scenario');
    }
  };

  const handleSave = async () => {
    try {
      await axios.post('/api/scenarios/calculate', formData);
      toast.success('Scenario saved!');
      fetchScenarios();
      setPreview(null);
      setFormData({
        name: '',
        memberCount: 50,
        duesAmount: 500,
        expectedExpenses: 20000,
      });
    } catch (error) {
      toast.error('Failed to save scenario');
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('Delete this scenario?')) {
      try {
        await axios.delete(`/api/scenarios/${id}`);
        toast.success('Scenario deleted');
        fetchScenarios();
      } catch (error) {
        toast.error('Failed to delete scenario');
      }
    }
  };

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-8">Scenario Planner</h1>
      <p className="text-gray-600 mb-8">
        Model different scenarios to see how changes in dues or membership affect your budget.
      </p>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        {/* Input Form */}
        <div className="card">
          <h2 className="text-xl font-semibold mb-4">Create Scenario</h2>
          <div className="space-y-4">
            <div>
              <label className="label">Scenario Name (Optional)</label>
              <input
                type="text"
                className="input"
                placeholder="e.g., Fall 2024 - Increased Dues"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>
            
            <div>
              <label className="label">Member Count</label>
              <input
                type="number"
                className="input"
                value={formData.memberCount}
                onChange={(e) => setFormData({ ...formData, memberCount: parseInt(e.target.value) })}
              />
              <input
                type="range"
                min="10"
                max="200"
                value={formData.memberCount}
                onChange={(e) => setFormData({ ...formData, memberCount: parseInt(e.target.value) })}
                className="w-full mt-2"
              />
            </div>

            <div>
              <label className="label">Dues Per Member (per semester)</label>
              <input
                type="number"
                step="50"
                className="input"
                value={formData.duesAmount}
                onChange={(e) => setFormData({ ...formData, duesAmount: parseFloat(e.target.value) })}
              />
              <input
                type="range"
                min="0"
                max="2000"
                step="50"
                value={formData.duesAmount}
                onChange={(e) => setFormData({ ...formData, duesAmount: parseFloat(e.target.value) })}
                className="w-full mt-2"
              />
            </div>

            <div>
              <label className="label">Expected Expenses</label>
              <input
                type="number"
                step="1000"
                className="input"
                value={formData.expectedExpenses}
                onChange={(e) => setFormData({ ...formData, expectedExpenses: parseFloat(e.target.value) })}
              />
              <input
                type="range"
                min="0"
                max="50000"
                step="1000"
                value={formData.expectedExpenses}
                onChange={(e) => setFormData({ ...formData, expectedExpenses: parseFloat(e.target.value) })}
                className="w-full mt-2"
              />
            </div>

            <button onClick={handleCalculate} className="btn-primary w-full">
              Calculate Scenario
            </button>
          </div>
        </div>

        {/* Results */}
        <div className="card">
          <h2 className="text-xl font-semibold mb-4">Results</h2>
          {preview ? (
            <div className="space-y-6">
              <div>
                <h3 className="text-sm text-gray-500 mb-2">Total Dues Income</h3>
                <p className="text-3xl font-bold text-green-600">
                  ${preview.output.totalDuesIncome.toLocaleString()}
                </p>
              </div>

              <div>
                <h3 className="text-sm text-gray-500 mb-2">Expected Expenses</h3>
                <p className="text-3xl font-bold text-red-600">
                  ${preview.input.expectedExpenses.toLocaleString()}
                </p>
              </div>

              <div>
                <h3 className="text-sm text-gray-500 mb-2">Projected Surplus/Deficit</h3>
                <p className={`text-3xl font-bold ${
                  preview.output.projectedSurplus >= 0 ? 'text-green-600' : 'text-red-600'
                }`}>
                  ${preview.output.projectedSurplus.toLocaleString()}
                </p>
              </div>

              <div>
                <h3 className="text-sm text-gray-500 mb-2">Max Safe Event Budget</h3>
                <p className="text-3xl font-bold text-blue-600">
                  ${preview.output.maxEventBudget.toLocaleString()}
                </p>
                <p className="text-sm text-gray-600 mt-1">
                  (${preview.output.perMemberBudget.toFixed(2)} per member)
                </p>
              </div>

              {/* Comparison with Current */}
              <div className="border-t pt-4">
                <h3 className="font-semibold mb-2">Comparison with Current</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Member Count:</span>
                    <span className="font-semibold">
                      {preview.comparison.currentMembers} → {preview.input.memberCount}
                      <span className={`ml-2 ${
                        preview.comparison.memberCountDiff >= 0 ? 'text-green-600' : 'text-red-600'
                      }`}>
                        ({preview.comparison.memberCountDiff >= 0 ? '+' : ''}
                        {preview.comparison.memberCountDiff})
                      </span>
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Dues Amount:</span>
                    <span className="font-semibold">
                      ${preview.comparison.currentDues} → ${preview.input.duesAmount}
                      <span className={`ml-2 ${
                        preview.comparison.duesAmountDiff >= 0 ? 'text-green-600' : 'text-red-600'
                      }`}>
                        ({preview.comparison.duesAmountDiff >= 0 ? '+' : ''}
                        ${preview.comparison.duesAmountDiff})
                      </span>
                    </span>
                  </div>
                </div>
              </div>

              <button onClick={handleSave} className="btn-success w-full">
                Save This Scenario
              </button>
            </div>
          ) : (
            <p className="text-gray-500 text-center py-12">
              Enter values and click "Calculate Scenario" to see results
            </p>
          )}
        </div>
      </div>

      {/* Saved Scenarios */}
      <div className="card">
        <h2 className="text-xl font-semibold mb-4">Saved Scenarios</h2>
        <div className="space-y-3">
          {scenarios.map((scenario) => (
            <div key={scenario.id} className="border rounded-lg p-4 hover:bg-gray-50">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-semibold">{scenario.name}</h3>
                  <p className="text-sm text-gray-600 mt-1">
                    {scenario.memberCount} members × ${scenario.duesAmount} dues
                  </p>
                  <div className="flex gap-4 mt-2 text-sm">
                    <span>
                      Income: <span className="font-semibold text-green-600">
                        ${(scenario.memberCount * scenario.duesAmount).toLocaleString()}
                      </span>
                    </span>
                    <span>
                      Expenses: <span className="font-semibold text-red-600">
                        ${scenario.expectedExpenses.toLocaleString()}
                      </span>
                    </span>
                    <span>
                      Surplus: <span className={`font-semibold ${
                        scenario.projectedSurplus >= 0 ? 'text-green-600' : 'text-red-600'
                      }`}>
                        ${scenario.projectedSurplus.toLocaleString()}
                      </span>
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => handleDelete(scenario.id)}
                  className="text-red-600 hover:text-red-800"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
          {scenarios.length === 0 && (
            <p className="text-center text-gray-500 py-8">No saved scenarios yet</p>
          )}
        </div>
      </div>
    </div>
  );
}

