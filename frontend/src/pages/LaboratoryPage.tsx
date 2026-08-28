import { useState } from 'react';
import { useLabSamples, useUpdateSampleResult } from '../hooks/useCases';

const STATUS_TABS = ['ALL', 'COLLECTED', 'IN_TRANSIT', 'RECEIVED', 'TESTING', 'COMPLETED'];

export default function LaboratoryPage() {
  const [activeTab, setActiveTab] = useState('ALL');
  const [selectedSample, setSelectedSample] = useState<number | null>(null);
  const [resultForm, setResultForm] = useState({ result: 'POSITIVE', diseaseDetected: '' });

  const params: Record<string, string> = {};
  if (activeTab !== 'ALL') params.status = activeTab;

  const { data: samples, isLoading } = useLabSamples(Object.keys(params).length ? params : undefined);
  const updateResult = useUpdateSampleResult();

  const handleSubmitResult = async (sampleId: number) => {
    await updateResult.mutateAsync({
      id: sampleId,
      result: resultForm.result,
      diseaseDetected: resultForm.diseaseDetected,
    });
    setSelectedSample(null);
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900">Laboratory Management</h2>

      <div className="flex gap-1 rounded-lg bg-gray-100 p-1">
        {STATUS_TABS.map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`flex-1 rounded-md px-4 py-2 text-sm font-medium transition-colors ${
              activeTab === tab ? 'bg-white text-indigo-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      <div className="rounded-xl border border-gray-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="border-b bg-gray-50">
              <tr>
                <th className="px-4 py-3 font-medium text-gray-500">Sample #</th>
                <th className="px-4 py-3 font-medium text-gray-500">Case</th>
                <th className="px-4 py-3 font-medium text-gray-500">Type</th>
                <th className="px-4 py-3 font-medium text-gray-500">Status</th>
                <th className="px-4 py-3 font-medium text-gray-500">Result</th>
                <th className="px-4 py-3 font-medium text-gray-500">Collected At</th>
                <th className="px-4 py-3 font-medium text-gray-500">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {isLoading ? (
                <tr><td colSpan={7} className="px-4 py-8 text-center text-gray-500">Loading samples...</td></tr>
              ) : !samples || samples.length === 0 ? (
                <tr><td colSpan={7} className="px-4 py-8 text-center text-gray-500">No samples found.</td></tr>
              ) : (
                samples.map(sample => (
                  <tr key={sample.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 font-medium">{sample.sampleNumber}</td>
                    <td className="px-4 py-3">{sample.case?.caseNumber || `#${sample.caseId}`}</td>
                    <td className="px-4 py-3">{sample.sampleType}</td>
                    <td className="px-4 py-3">
                      <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                        sample.status === 'COMPLETED' ? 'bg-green-100 text-green-700' :
                        sample.status === 'TESTING' ? 'bg-yellow-100 text-yellow-700' :
                        'bg-blue-100 text-blue-700'
                      }`}>
                        {sample.status}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      {sample.result ? (
                        <span className={`font-medium ${
                          sample.result === 'POSITIVE' ? 'text-red-600' :
                          sample.result === 'NEGATIVE' ? 'text-green-600' :
                          'text-yellow-600'
                        }`}>
                          {sample.result}
                        </span>
                      ) : (
                        <span className="text-gray-400">Pending</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-gray-500">{new Date(sample.collectedAt).toLocaleDateString()}</td>
                    <td className="px-4 py-3">
                      {sample.status === 'TESTING' && (
                        <button
                          onClick={() => setSelectedSample(sample.id)}
                          className="rounded bg-indigo-50 px-3 py-1 text-xs font-medium text-indigo-600 hover:bg-indigo-100"
                        >
                          Enter Result
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {selectedSample && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl">
            <h3 className="mb-4 text-lg font-semibold text-gray-900">Enter Lab Result</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Result</label>
                <select
                  value={resultForm.result}
                  onChange={(e) => setResultForm({ ...resultForm, result: e.target.value })}
                  className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2"
                >
                  <option value="POSITIVE">Positive</option>
                  <option value="NEGATIVE">Negative</option>
                  <option value="INCONCLUSIVE">Inconclusive</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Disease Detected</label>
                <input
                  type="text"
                  value={resultForm.diseaseDetected}
                  onChange={(e) => setResultForm({ ...resultForm, diseaseDetected: e.target.value })}
                  className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2"
                  placeholder="e.g., Foot and Mouth Disease"
                />
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => setSelectedSample(null)}
                  className="flex-1 rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleSubmitResult(selectedSample)}
                  disabled={updateResult.isPending}
                  className="flex-1 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-50"
                >
                  {updateResult.isPending ? 'Saving...' : 'Save Result'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
