import { useState } from 'react';
import apiClient from '../api/client';

const SYMPTOM_OPTIONS = [
  'Fever', 'Cough', 'Diarrhea', 'Loss of appetite', 'Nasal discharge',
  'Lameness', 'Swelling', 'Skin lesions', 'Difficulty breathing', 'Vomiting',
  'Excessive salivation', 'Eye discharge', 'Weight loss', 'Milk reduction', 'Abortion',
];

export default function ReportDiseasePage() {
  const [form, setForm] = useState({
    farmId: '',
    animalId: '',
    symptoms: [] as string[],
    description: '',
    severity: 'MEDIUM' as string,
    latitude: '',
    longitude: '',
    village: '',
    block: '',
    district: '',
  });
  const [photo, setPhoto] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [aiDetection, setAiDetection] = useState<{prediction: string; confidence: number; recommendations: string[]; description?: string} | null>(null);
  const [detecting, setDetecting] = useState(false);
  const [detectError, setDetectError] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const toggleSymptom = (symptom: string) => {
    setForm(prev => ({
      ...prev,
      symptoms: prev.symptoms.includes(symptom)
        ? prev.symptoms.filter(s => s !== symptom)
        : [...prev.symptoms, symptom],
    }));
  };

  const handlePhotoChange = async (file: File | null) => {
    setPhoto(file);
    setAiDetection(null);
    if (!file) return;

    setDetecting(true);
    setDetectError(null);
    try {
      const formData = new FormData();
      formData.append('file', file);
      const res = await apiClient.post('/detect/image', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      const data = res.data;
      setAiDetection(data);
      // Auto-suggest severity from AI prediction
      if (data.prediction && data.prediction !== 'Healthy') {
        const conf = data.confidence || 0;
        if (conf >= 0.8) setForm(prev => ({ ...prev, severity: 'HIGH' }));
        else if (conf >= 0.6) setForm(prev => ({ ...prev, severity: 'MEDIUM' }));
      }
    } catch {
      // Detection is optional, but tell the user it didn't run so they don't wait on it.
      setDetectError('Image analysis unavailable. You can still submit the report manually.');
    } finally {
      setDetecting(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    const formData = new FormData();
    formData.append('farmId', form.farmId);
    formData.append('animalId', form.animalId);
    formData.append('symptoms', JSON.stringify(form.symptoms));
    formData.append('description', form.description);
    formData.append('severity', form.severity);
    formData.append('latitude', form.latitude);
    formData.append('longitude', form.longitude);
    formData.append('village', form.village);
    formData.append('block', form.block);
    formData.append('district', form.district);
    if (photo) formData.append('photo', photo);

    setSubmitError(null);
    try {
      await apiClient.post('/cases', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch {
      // Never claim success on failure — a farmer must know the report didn't file.
      setSubmitError('Could not submit the report. Check your connection and try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <h2 className="text-2xl font-bold text-gray-900">Report Disease</h2>

      {success && (
        <div className="rounded-lg bg-green-50 p-4 text-green-800">
          Disease case reported successfully!
        </div>
      )}

      {submitError && (
        <div className="rounded-lg bg-red-50 p-4 text-sm text-red-800">
          {submitError}
        </div>
      )}

      {detectError && (
        <div className="rounded-lg bg-amber-50 p-3 text-sm text-amber-800">
          {detectError}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6 rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className="block text-sm font-medium text-gray-700">Farm ID</label>
            <input
              type="text"
              value={form.farmId}
              onChange={(e) => setForm({ ...form, farmId: e.target.value })}
              className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Animal ID</label>
            <input
              type="text"
              value={form.animalId}
              onChange={(e) => setForm({ ...form, animalId: e.target.value })}
              className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              required
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Symptoms</label>
          <div className="flex flex-wrap gap-2">
            {SYMPTOM_OPTIONS.map(symptom => (
              <button
                key={symptom}
                type="button"
                onClick={() => toggleSymptom(symptom)}
                className={`rounded-full px-3 py-1.5 text-sm font-medium transition-colors ${
                  form.symptoms.includes(symptom)
                    ? 'bg-indigo-100 text-indigo-700 ring-2 ring-indigo-500'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {symptom}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Description</label>
          <textarea
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            rows={4}
            className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            placeholder="Describe the symptoms and condition in detail..."
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Severity</label>
          <select
            value={form.severity}
            onChange={(e) => setForm({ ...form, severity: e.target.value })}
            className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="LOW">Low</option>
            <option value="MEDIUM">Medium</option>
            <option value="HIGH">High</option>
            <option value="CRITICAL">Critical</option>
          </select>
        </div>

        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="block text-sm font-medium text-gray-700">Location</label>
            <button
              type="button"
              onClick={() => {
                if (!navigator.geolocation) return;
                navigator.geolocation.getCurrentPosition(
                  (pos) => setForm({ ...form, latitude: pos.coords.latitude.toString(), longitude: pos.coords.longitude.toString() }),
                  () => {},
                  { enableHighAccuracy: true, timeout: 10000 }
                );
              }}
              className="flex items-center gap-1 rounded-lg bg-indigo-50 px-3 py-1.5 text-xs font-medium text-indigo-700 hover:bg-indigo-100 transition"
            >
              📍 Auto-detect GPS
            </button>
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div>
              <input
                type="number"
                step="any"
                value={form.latitude}
                onChange={(e) => setForm({ ...form, latitude: e.target.value })}
                placeholder="Latitude"
                className="block w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div>
              <input
                type="number"
                step="any"
                value={form.longitude}
                onChange={(e) => setForm({ ...form, longitude: e.target.value })}
                placeholder="Longitude"
                className="block w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div>
              <input
                type="text"
                value={form.district}
                onChange={(e) => setForm({ ...form, district: e.target.value })}
                placeholder="District"
                className="block w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                required
              />
            </div>
          </div>
          {form.latitude && form.longitude && (
            <p className="mt-1 text-xs text-green-600">📍 Location captured: {Number(form.latitude).toFixed(4)}, {Number(form.longitude).toFixed(4)}</p>
          )}
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className="block text-sm font-medium text-gray-700">Village</label>
            <input
              type="text"
              value={form.village}
              onChange={(e) => setForm({ ...form, village: e.target.value })}
              className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Block</label>
            <input
              type="text"
              value={form.block}
              onChange={(e) => setForm({ ...form, block: e.target.value })}
              className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              required
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Photo</label>
          <div className="rounded-lg border-2 border-dashed border-gray-300 p-6 text-center hover:border-indigo-400">
            <input
              type="file"
              accept="image/*"
              onChange={(e) => handlePhotoChange(e.target.files?.[0] || null)}
              className="hidden"
              id="photo-upload"
            />
            <label htmlFor="photo-upload" className="cursor-pointer">
              <span className="text-3xl">📷</span>
              <p className="mt-2 text-sm text-gray-500">
                {photo ? photo.name : 'Click to upload or drag and drop'}
              </p>
              <p className="mt-1 text-xs text-gray-400">PNG, JPG up to 10MB</p>
            </label>
          </div>
          {detecting && (
            <div className="mt-3 flex items-center gap-2 text-sm text-indigo-600">
              <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" className="opacity-25"/><path d="M4 12a8 8 0 018-8" stroke="currentColor" strokeWidth="4" strokeLinecap="round" className="opacity-75"/></svg>
              Analyzing image with AI...
            </div>
          )}
          {aiDetection && !detecting && (
            <div className={`mt-3 rounded-lg border p-4 ${aiDetection.prediction === 'Healthy' ? 'border-green-200 bg-green-50' : 'border-orange-200 bg-orange-50'}`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-lg">{aiDetection.prediction === 'Healthy' ? '✅' : '⚠️'}</span>
                  <span className="font-semibold text-gray-900">{aiDetection.prediction}</span>
                </div>
                <span className={`rounded-full px-2 py-0.5 text-xs font-bold ${aiDetection.confidence >= 0.8 ? 'bg-red-100 text-red-800' : aiDetection.confidence >= 0.6 ? 'bg-orange-100 text-orange-800' : 'bg-yellow-100 text-yellow-800'}`}>
                  {Math.round(aiDetection.confidence * 100)}% confidence
                </span>
              </div>
              {aiDetection.description && (
                <p className="mt-1 text-xs text-gray-600">{aiDetection.description}</p>
              )}
              {aiDetection.recommendations && aiDetection.recommendations.length > 0 && (
                <div className="mt-2 space-y-1">
                  {aiDetection.recommendations.slice(0, 3).map((r, i) => (
                    <p key={i} className="text-xs text-gray-700">• {r}</p>
                  ))}
                </div>
              )}
              <p className="mt-2 text-[10px] text-gray-400 italic">AI analysis — confirm with veterinary examination</p>
            </div>
          )}
        </div>

        <button
          type="submit"
          disabled={submitting}
          className="w-full rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700 disabled:opacity-50"
        >
          {submitting ? 'Submitting...' : 'Report Disease Case'}
        </button>
      </form>
    </div>
  );
}
