import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';

export default function CompleteProfile() {
  const [bloodGroup, setBloodGroup] = useState('');
  const [knownConditions, setKnownConditions] = useState('');
  const [currentMedications, setCurrentMedications] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();

  const handleSave = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await api.put('/api/patient/health-summary', {
        bloodGroup: bloodGroup || null,
        knownConditions: knownConditions.trim() || null,
        currentMedications: currentMedications.trim() || null
      });
      setSuccess(true);
      setTimeout(() => {
        navigate('/');
      }, 1500);
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'Failed to save health profile. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-[520px] mx-auto bg-[#1c1c1e] border border-zinc-850 rounded-3xl shadow-xl p-8 mt-12 animate-in fade-in duration-300">
      {/* Onboarding Progress Indicator */}
      <div className="text-center mb-6">
        <span className="text-[10px] font-bold tracking-[0.2em] text-emerald-400 uppercase bg-emerald-500/10 px-3 py-1.5 rounded-full">
          Step 2 of 2 — Health Profile
        </span>
      </div>

      <div className="text-center mb-8">
        <h1 className="text-2xl font-bold text-zinc-100 tracking-tight">Complete your health profile</h1>
        <p className="text-zinc-400 text-sm mt-2 font-medium leading-relaxed">
          This helps your doctor prepare before your consultation. You can update this anytime from your profile.
        </p>
      </div>

      {success && (
        <div className="mb-6 bg-emerald-950/20 border border-emerald-900/40 text-emerald-400 p-4 rounded-xl text-xs font-semibold text-center animate-pulse">
          ✨ Health profile saved successfully! Redirecting...
        </div>
      )}

      {error && (
        <div className="mb-6 bg-red-950/20 border border-red-900/40 text-red-400 p-4 rounded-xl text-xs font-semibold text-center">
          ⚠️ {error}
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-6">
        <div>
          <label className="block text-[11px] font-bold text-zinc-500 uppercase tracking-widest mb-2">
            Blood Group
          </label>
          <select
            value={bloodGroup}
            onChange={(e) => setBloodGroup(e.target.value)}
            className="w-full px-4 py-3 bg-[#242426] border border-zinc-805 rounded-xl text-sm text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition duration-200"
          >
            <option value="">Select blood group</option>
            <option value="A+">A+</option>
            <option value="A-">A-</option>
            <option value="B+">B+</option>
            <option value="B-">B-</option>
            <option value="O+">O+</option>
            <option value="O-">O-</option>
            <option value="AB+">AB+</option>
            <option value="AB-">AB-</option>
            <option value="Unknown">Unknown</option>
          </select>
        </div>

        <div>
          <label className="block text-[11px] font-bold text-zinc-500 uppercase tracking-widest mb-2">
            Known Medical Conditions
          </label>
          <textarea
            value={knownConditions}
            onChange={(e) => setKnownConditions(e.target.value)}
            placeholder="e.g. Type 2 Diabetes, Hypertension, Asthma (or leave blank)"
            rows={3}
            className="w-full px-4 py-3 bg-[#242426] border border-zinc-805 rounded-xl text-sm text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition duration-200 resize-none"
          />
        </div>

        <div>
          <label className="block text-[11px] font-bold text-zinc-500 uppercase tracking-widest mb-2">
            Current Medications
          </label>
          <textarea
            value={currentMedications}
            onChange={(e) => setCurrentMedications(e.target.value)}
            placeholder="e.g. Metformin 500mg, Amlodipine 5mg (or leave blank)"
            rows={3}
            className="w-full px-4 py-3 bg-[#242426] border border-zinc-805 rounded-xl text-sm text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition duration-200 resize-none"
          />
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
          <button
            type="submit"
            disabled={loading || success}
            className="w-full sm:flex-1 bg-[#0e4d38] text-white py-4 rounded-xl font-bold hover:bg-[#0b3b2b] transition duration-200 disabled:bg-zinc-800 disabled:text-zinc-600 disabled:cursor-not-allowed shadow-md hover:shadow-lg flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                <span>Saving...</span>
              </>
            ) : (
              <span>Save and continue</span>
            )}
          </button>
          
          <button
            type="button"
            onClick={() => navigate('/')}
            disabled={loading || success}
            className="w-full sm:w-auto px-6 py-4 border border-zinc-800 text-zinc-400 hover:text-zinc-200 font-bold rounded-xl hover:bg-zinc-800/20 transition duration-200 text-center text-sm"
          >
            Skip for now
          </button>
        </div>
      </form>
    </div>
  );
}
