import { useState } from 'react';
import { useVaccinations } from '../hooks/useFacilities';
import apiClient from '../api/client';

export default function VaccinationsPage() {
  const { data: vaccinations, isLoading } = useVaccinations();
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    animalId: '',
    vaccineName: '',
    batchNumber: '',
    administeredBy: '',
    nextDoseDate: '',
  });
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await apiClient.post('/vaccinations', form);
      setShowForm(false);
      setForm({ animalId: '', vaccineName: '', batchNumber: '', administeredBy: '', nextDoseDate: '' });
      window.location.reload();
    } catch {
      // Handle error
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">Vaccination Records</h2>
        <button
          onClick={() => setShowForm(!showForm)}
          className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700"
        >
          {showForm ? 'Cancel' : 'Add Vaccination'}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <h3 className="mb-4 text-lg font-semibold text-gray-900">New Vaccination Record</h3>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <div>
              <label className="block text-sm font-medium text-gray-700">Animal ID</label>
              <input
                type="text"
                value={form.animalId}
                onChange={(e) => setForm({ ...form, animalId: e.target.value })}
                className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-indigo-500 focus:outline-none"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Vaccine Name</label>
              <input
                type="text"
                value={form.vaccineName}
                onChange={(e) => setForm({ ...form, vaccineName: e.target.value })}
                className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-indigo-500 focus:outline-none"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Batch Number</label>
              <input
                type="text"
                value={form.batchNumber}
                onChange={(e) => setForm({ ...form, batchNumber: e.target.value })}
                className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-indigo-500 focus:outline-none"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Administered By</label>
              <input
                type="text"
                value={form.administeredBy}
                onChange={(e) => setForm({ ...form, administeredBy: e.target.value })}
                className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-indigo-500 focus:outline-none"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Next Dose Date</label>
              <input
                type="date"
                value={form.nextDoseDate}
                onChange={(e) => setForm({ ...form, nextDoseDate: e.target.value })}
                className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-indigo-500 focus:outline-none"
              />
            </div>
          </div>
          <div className="mt-4">
            <button
              type="submit"
              disabled={submitting}
              className="rounded-lg bg-indigo-600 px-6 py-2 text-sm font-semibold text-white hover:bg-indigo-700 disabled:opacity-50"
            >
              {submitting ? 'Saving...' : 'Save Vaccination'}
            </button>
          </div>
        </form>
      )}

      <div className="rounded-xl border border-gray-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="border-b bg-gray-50">
              <tr>
                <th className="px-4 py-3 font-medium text-gray-500">Animal</th>
                <th className="px-4 py-3 font-medium text-gray-500">Vaccine</th>
                <th className="px-4 py-3 font-medium text-gray-500">Batch #</th>
                <th className="px-4 py-3 font-medium text-gray-500">Administered By</th>
                <th className="px-4 py-3 font-medium text-gray-500">Date</th>
                <th className="px-4 py-3 font-medium text-gray-500">Next Dose</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {isLoading ? (
                <tr><td colSpan={6} className="px-4 py-8 text-center text-gray-500">Loading vaccinations...</td></tr>
              ) : !vaccinations || vaccinations.length === 0 ? (
                <tr><td colSpan={6} className="px-4 py-8 text-center text-gray-500">No vaccination records found.</td></tr>
              ) : (
                vaccinations.map(v => (
                  <tr key={v.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">{v.animal?.tagNumber || `Animal #${v.animalId}`}</td>
                    <td className="px-4 py-3 font-medium">{v.vaccineName}</td>
                    <td className="px-4 py-3">{v.batchNumber}</td>
                    <td className="px-4 py-3">{v.administeredBy}</td>
                    <td className="px-4 py-3">{new Date(v.administeredAt).toLocaleDateString()}</td>
                    <td className="px-4 py-3">{v.nextDoseDate ? new Date(v.nextDoseDate).toLocaleDateString() : 'N/A'}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
