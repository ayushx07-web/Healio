import { useState, useEffect } from 'react';
import { Activity, Save, Edit2, X, User as UserIcon } from 'lucide-react';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';

export default function PatientProfile() {
  const { user } = useAuth();
  const [bloodGroup, setBloodGroup] = useState('');
  const [knownConditions, setKnownConditions] = useState('');
  const [currentMedications, setCurrentMedications] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const [isEditing, setIsEditing] = useState(false);
  const [tempBloodGroup, setTempBloodGroup] = useState('');
  const [tempKnownConditions, setTempKnownConditions] = useState('');
  const [tempCurrentMedications, setTempCurrentMedications] = useState('');

  useEffect(() => {
    const fetchSummary = async () => {
      try {
        const { data } = await api.get('/api/patient/health-summary');
        if (data) {
          setBloodGroup(data.bloodGroup || '');
          setKnownConditions(data.knownConditions || '');
          setCurrentMedications(data.currentMedications || '');
          
          setTempBloodGroup(data.bloodGroup || '');
          setTempKnownConditions(data.knownConditions || '');
          setTempCurrentMedications(data.currentMedications || '');
        }
      } catch (err) {
        console.error('Failed to load health summary:', err);
        setError('Could not load health summary. Please try refreshing.');
      } finally {
        setLoading(false);
      }
    };
    fetchSummary();
  }, []);

  const handleStartEdit = () => {
    setTempBloodGroup(bloodGroup);
    setTempKnownConditions(knownConditions);
    setTempCurrentMedications(currentMedications);
    setIsEditing(true);
    setError('');
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setError('');
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setSuccess(false);
    setError('');
    try {
      await api.put('/api/patient/health-summary', {
        bloodGroup: tempBloodGroup || null,
        knownConditions: tempKnownConditions.trim() || null,
        currentMedications: tempCurrentMedications.trim() || null,
      });
      setBloodGroup(tempBloodGroup);
      setKnownConditions(tempKnownConditions);
      setCurrentMedications(tempCurrentMedications);
      setSuccess(true);
      setIsEditing(false);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      console.error('Failed to update health summary:', err);
      setError('Failed to update medical details. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="text-center py-12 text-zinc-500 font-semibold">Loading health record...</div>;
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-in fade-in duration-300">
      {/* Patient Profile Card */}
      <div className="bg-[#1c1c1e] rounded-3xl border border-zinc-850 p-6 md:p-8 shadow-lg flex items-center gap-4">
        <div className="w-14 h-14 bg-emerald-500/10 text-emerald-400 rounded-full flex items-center justify-center border border-emerald-500/20">
          <UserIcon size={24} className="stroke-[2]" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-zinc-100">{user?.name || 'New Patient'}</h1>
          <p className="text-xs font-semibold text-zinc-500 mt-0.5 uppercase tracking-wider">{user?.email}</p>
        </div>
      </div>

      {/* Personal Health Summary Form/View */}
      <div className="bg-[#1c1c1e] rounded-3xl border border-zinc-850 p-6 md:p-8 shadow-lg space-y-6">
        <h2 className="text-lg font-bold text-zinc-200 border-b border-zinc-800/80 pb-4 flex items-center gap-2">
          <Activity size={18} className="text-emerald-400" />
          <span>Personal Health Summary</span>
        </h2>

        {error && (
          <div className="bg-red-950/20 text-red-400 text-sm p-4 rounded-xl border border-red-900/40 font-semibold">
            {error}
          </div>
        )}

        {success && (
          <div className="bg-emerald-950/20 text-emerald-400 text-sm p-4 rounded-xl border border-emerald-900/40 font-semibold animate-in fade-in duration-300">
            Health summary updated successfully!
          </div>
        )}

        {isEditing ? (
          <form onSubmit={handleSave} className="space-y-5">
            {/* Blood Group */}
            <div>
              <label className="block text-[11px] font-bold text-zinc-500 uppercase tracking-widest mb-2">
                Blood Group
              </label>
              <select
                value={tempBloodGroup}
                onChange={(e) => setTempBloodGroup(e.target.value)}
                className="w-full px-4 py-3 bg-[#242426] border border-zinc-805 rounded-xl text-sm text-zinc-100 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition duration-200"
              >
                <option value="">Select Blood Group</option>
                <option value="A+">A+</option>
                <option value="A-">A-</option>
                <option value="B+">B+</option>
                <option value="B-">B-</option>
                <option value="AB+">AB+</option>
                <option value="AB-">AB-</option>
                <option value="O+">O+</option>
                <option value="O-">O-</option>
                <option value="Unknown">Unknown</option>
              </select>
            </div>

            {/* Known Medical Conditions */}
            <div>
              <label className="block text-[11px] font-bold text-zinc-500 uppercase tracking-widest mb-2">
                Known Medical Conditions
              </label>
              <textarea
                rows="4"
                value={tempKnownConditions}
                onChange={(e) => setTempKnownConditions(e.target.value)}
                placeholder="e.g., Hypertension, Diabetes, Asthma..."
                className="w-full px-4 py-3 bg-[#242426] border border-zinc-805 rounded-xl text-sm text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition duration-200"
              />
            </div>

            {/* Current Medications */}
            <div>
              <label className="block text-[11px] font-bold text-zinc-500 uppercase tracking-widest mb-2">
                Current Medications
              </label>
              <textarea
                rows="4"
                value={tempCurrentMedications}
                onChange={(e) => setTempCurrentMedications(e.target.value)}
                placeholder="List daily medications, dosage amounts, and schedules..."
                className="w-full px-4 py-3 bg-[#242426] border border-zinc-805 rounded-xl text-sm text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition duration-200"
              />
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-zinc-800/60">
              <button
                type="button"
                onClick={handleCancelEdit}
                disabled={saving}
                className="px-5 py-3 border border-zinc-800 text-zinc-400 hover:text-zinc-200 font-bold rounded-xl hover:bg-zinc-800/20 transition duration-200 text-sm flex items-center gap-1.5"
              >
                <X size={16} />
                <span>Cancel</span>
              </button>
              
              <button
                type="submit"
                disabled={saving}
                className="bg-[#0e4d38] hover:bg-[#0b3b2b] text-white px-6 py-3.5 rounded-xl text-sm font-bold flex items-center gap-2 transition disabled:bg-zinc-850 disabled:text-zinc-600 shadow-md hover:shadow-lg"
              >
                <Save size={16} />
                <span>{saving ? 'Saving...' : 'Save changes'}</span>
              </button>
            </div>
          </form>
        ) : (
          <div className="space-y-6">
            <div className="space-y-4">
              <div>
                <label className="block text-[11px] font-bold text-zinc-500 uppercase tracking-widest mb-1.5">
                  Blood Group
                </label>
                <div className="text-sm font-medium text-zinc-200">
                  {bloodGroup || <span className="text-zinc-500 italic">Not provided</span>}
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-zinc-500 uppercase tracking-widest mb-1.5">
                  Known Medical Conditions
                </label>
                <div className="text-sm font-medium text-zinc-200 whitespace-pre-wrap">
                  {knownConditions || <span className="text-zinc-500 italic">Not provided</span>}
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-zinc-500 uppercase tracking-widest mb-1.5">
                  Current Medications
                </label>
                <div className="text-sm font-medium text-zinc-200 whitespace-pre-wrap">
                  {currentMedications || <span className="text-zinc-500 italic">Not provided</span>}
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-4 border-t border-zinc-800/60">
              <button
                type="button"
                onClick={handleStartEdit}
                className="bg-zinc-800 hover:bg-zinc-700 text-zinc-200 hover:text-white px-5 py-3 rounded-xl text-sm font-bold flex items-center gap-1.5 transition shadow-sm hover:shadow-md cursor-pointer"
              >
                <Edit2 size={16} />
                <span>Edit</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
