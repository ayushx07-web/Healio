import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Activity, FileText, Save } from 'lucide-react';
import api from '../../api/axios';

export default function ConsultationForm() {
  const { bookingId } = useParams();
  const navigate = useNavigate();
  const [healthSummary, setHealthSummary] = useState(null);
  const [diagnosisNotes, setDiagnosisNotes] = useState('');
  const [prescription, setPrescription] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [saveError, setSaveError] = useState('');
  const [rawNotes, setRawNotes] = useState('');
  const [aiLoading, setAiLoading] = useState(false);
  const [aiResult, setAiResult] = useState(null);
  const [aiError, setAiError] = useState('');

  const handleAiFormat = async () => {
    if (!rawNotes.trim()) return;
    setAiLoading(true);
    setAiError('');
    setAiResult(null);
    try {
      const { data } = await api.post('/api/ai/format-prescription', { rawNotes });
      setAiResult(data);
      
      // Auto-populate the traditional fields for review & customization
      setDiagnosisNotes(data.diagnosis || '');
      
      const formattedPresc = `Medications:
${data.medications?.map(m => `- ${m.name} | Dosage: ${m.dosage} | Freq: ${m.frequency} | Dur: ${m.duration}`).join('\n')}

Advice:
${data.advice || 'None'}

Follow Up:
${data.followUp || 'None'}

Patient Summary:
${data.patientFriendlySummary || 'None'}`;

      setPrescription(formattedPresc);
    } catch (e) {
      console.error(e);
      setAiError('Could not format. Please save notes manually.');
    } finally {
      setAiLoading(false);
    }
  };

  useEffect(() => {
    const fetchDetails = async () => {
      setLoading(true);
      try {
        const hsRes = await api.get(`/api/patient/health-summary/by-booking/${bookingId}`);
        setHealthSummary(hsRes.data);

        try {
          const consRes = await api.get(`/api/consultations/${bookingId}`);
          if (consRes.data) {
            setDiagnosisNotes(consRes.data.diagnosisNotes || '');
            setPrescription(consRes.data.prescription || '');
          }
        } catch (err) {
          // No consultation created yet
        }
      } catch (e) {
        console.error('Error fetching consultation details:', e);
      } finally {
        setLoading(false);
      }
    };

    fetchDetails();
  }, [bookingId]);

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setSuccess(false);
    setSaveError('');
    try {
      await api.post(`/api/consultations/${bookingId}`, {
        diagnosisNotes,
        prescription
      });
      setSuccess(true);
      setTimeout(() => {
        navigate('/doctor/dashboard');
      }, 1500);
    } catch (err) {
      console.error('Error saving consultation:', err);
      const msg = err.response?.data?.message || err.response?.data || 'Failed to save. Please try again.';
      setSaveError(typeof msg === 'string' ? msg : 'Failed to save. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="text-center py-12 text-zinc-500 font-semibold">Loading consultation room...</div>;

  return (
    <div className="space-y-6 max-w-4xl mx-auto animate-in fade-in duration-300">
      <div className="flex items-center gap-4">
        <button
          onClick={() => navigate('/doctor/dashboard')}
          className="p-2.5 border border-zinc-800 rounded-xl hover:bg-zinc-800 text-zinc-400 hover:text-white transition shadow-md"
        >
          <ArrowLeft size={18} />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-zinc-100 tracking-tight">Consultation Room</h1>
          <p className="text-zinc-400 text-sm font-medium">Write clinical notes and view patient health history</p>
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        {/* Patient Health History */}
        <div className="bg-[#1c1c1e] border border-zinc-850 rounded-3xl p-6 space-y-6 shadow-lg h-fit">
          <h3 className="font-bold text-zinc-200 text-base border-b border-zinc-800 pb-3 flex items-center gap-2">
            <Activity size={18} className="text-emerald-400" />
            <span>Patient Health History</span>
          </h3>

          {healthSummary && (healthSummary.bloodGroup || healthSummary.knownConditions || healthSummary.currentMedications) ? (
            <div className="space-y-4 text-sm">
              <div>
                <div className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Blood Group</div>
                <div className="font-black text-red-400 text-xl mt-1">
                  {healthSummary.bloodGroup || 'Not Specified'}
                </div>
              </div>
              <div>
                <div className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Known Conditions</div>
                <p className="text-zinc-300 mt-1.5 leading-relaxed bg-[#242426] p-4 rounded-xl border border-zinc-850 min-h-[50px] font-medium">
                  {healthSummary.knownConditions || 'None reported'}
                </p>
              </div>
              <div>
                <div className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Current Medications</div>
                <p className="text-zinc-300 mt-1.5 leading-relaxed bg-[#242426] p-4 rounded-xl border border-zinc-850 min-h-[50px] font-medium">
                  {healthSummary.currentMedications || 'None reported'}
                </p>
              </div>
            </div>
          ) : (
            <div className="text-zinc-500 text-sm font-medium">No medical records available for this patient.</div>
          )}
        </div>

        {/* Consultation Notes Form */}
        <form onSubmit={handleSave} className="md:col-span-2 bg-[#1c1c1e] border border-zinc-850 rounded-3xl p-6 md:p-8 space-y-6 shadow-lg">
          <h3 className="font-bold text-zinc-200 text-base border-b border-zinc-800 pb-3 flex items-center gap-2">
            <FileText size={18} className="text-emerald-400" />
            <span>Consultation Notes</span>
          </h3>

          <div className="space-y-4">
            <div>
              <label className="block text-[11px] font-bold text-zinc-500 uppercase tracking-widest mb-2">
                Raw Consultation Notes / Dictation (AI Input)
              </label>
              <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-start mb-4">
                <textarea
                  rows="4"
                  value={rawNotes}
                  onChange={(e) => setRawNotes(e.target.value)}
                  placeholder="e.g. patient has viral fever, give paracetamol 500mg twice daily for 5 days, rest, fluids, follow up in a week"
                  className="flex-1 px-4 py-3 bg-[#242426] border border-zinc-805 rounded-xl text-sm text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition duration-200"
                />
                <button
                  type="button"
                  onClick={handleAiFormat}
                  disabled={aiLoading || !rawNotes.trim()}
                  className="bg-emerald-500 text-zinc-950 font-bold px-5 py-4 rounded-xl text-sm flex items-center justify-center gap-2 transition hover:bg-emerald-400 disabled:opacity-50 whitespace-nowrap shadow-md min-h-[50px] self-end sm:self-auto"
                >
                  {aiLoading ? (
                    <span className="w-4 h-4 border-2 border-zinc-950 border-t-transparent rounded-full animate-spin"></span>
                  ) : (
                    <span>✨ Format with AI</span>
                  )}
                </button>
              </div>
            </div>

            {aiError && (
              <div className="text-red-400 text-xs font-semibold bg-red-950/20 border border-red-900/40 p-3.5 rounded-xl">
                ⚠️ {aiError}
              </div>
            )}

            {/* AI Formatted Preview Card */}
            {aiResult && (
              <div className="bg-[#121212]/40 border border-emerald-950/60 rounded-2xl p-5 space-y-4 animate-in fade-in duration-300">
                <div className="text-xs font-bold text-emerald-400 tracking-wider uppercase flex items-center gap-1.5">
                  <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span>
                  <span>AI Formatted Prescription Preview</span>
                </div>
                
                <div>
                  <div className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Diagnosis</div>
                  <div className="text-sm font-semibold text-zinc-200 mt-1">{aiResult.diagnosis}</div>
                </div>

                <div>
                  <div className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-2">Medications</div>
                  <div className="overflow-x-auto border border-zinc-850 rounded-xl">
                    <table className="w-full text-xs text-left text-zinc-300">
                      <thead className="bg-[#242426] text-[10px] font-bold text-zinc-400 uppercase tracking-wider">
                        <tr>
                          <th className="px-4 py-2.5">Medicine</th>
                          <th className="px-4 py-2.5">Dosage</th>
                          <th className="px-4 py-2.5">Frequency</th>
                          <th className="px-4 py-2.5">Duration</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-zinc-850">
                        {aiResult.medications?.map((med, idx) => (
                          <tr key={idx} className="hover:bg-zinc-800/20">
                            <td className="px-4 py-2.5 font-bold text-zinc-200">{med.name}</td>
                            <td className="px-4 py-2.5">{med.dosage}</td>
                            <td className="px-4 py-2.5">{med.frequency}</td>
                            <td className="px-4 py-2.5">{med.duration}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Advice</div>
                    <div className="text-xs font-medium text-zinc-300 mt-1">{aiResult.advice}</div>
                  </div>
                  <div>
                    <div className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Follow Up</div>
                    <div className="text-xs font-medium text-zinc-300 mt-1">{aiResult.followUp}</div>
                  </div>
                </div>

                <div className="bg-emerald-950/10 border border-emerald-900/20 p-4 rounded-xl space-y-1">
                  <div className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest">Patient-Friendly Summary</div>
                  <p className="text-xs font-medium text-zinc-300 leading-relaxed italic">
                    "{aiResult.patientFriendlySummary}"
                  </p>
                </div>
              </div>
            )}

            <div>
              <label className="block text-[11px] font-bold text-zinc-500 uppercase tracking-widest mb-2">
                Diagnosis / Clinical Notes
              </label>
              <textarea
                rows="5"
                required
                value={diagnosisNotes}
                onChange={(e) => setDiagnosisNotes(e.target.value)}
                placeholder="Enter diagnosis, symptoms, and clinical observations..."
                className="w-full px-4 py-3 bg-[#242426] border border-zinc-805 rounded-xl text-sm text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition duration-200"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-zinc-500 uppercase tracking-widest mb-2">
                Prescription / Medications & Advice
              </label>
              <textarea
                rows="5"
                required
                value={prescription}
                onChange={(e) => setPrescription(e.target.value)}
                placeholder="List medications, dosage details, and follow-up instructions..."
                className="w-full px-4 py-3 bg-[#242426] border border-zinc-805 rounded-xl text-sm text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition duration-200"
              />
            </div>
          </div>

          {success && (
            <div className="bg-emerald-950/20 text-emerald-400 text-sm p-4 rounded-xl border border-emerald-900/40 font-semibold animate-in fade-in duration-300">
              Consultation saved successfully! Redirecting...
            </div>
          )}

          {saveError && (
            <div className="bg-red-950/20 text-red-400 text-sm p-4 rounded-xl border border-red-900/40 font-semibold animate-in fade-in duration-300">
              ⚠️ {saveError}
            </div>
          )}

          <div className="flex justify-end gap-3 pt-4 border-t border-zinc-800/60">
            <button
              type="button"
              onClick={() => navigate('/doctor/dashboard')}
              className="px-5 py-3 border border-zinc-800 rounded-xl text-sm font-semibold hover:bg-zinc-800 text-zinc-300 hover:text-white transition duration-200"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="bg-[#0e4d38] hover:bg-[#0b3b2b] text-white px-6 py-3 rounded-xl text-sm font-bold flex items-center gap-2 transition disabled:bg-zinc-850 disabled:text-zinc-600 shadow-md hover:shadow-lg"
            >
              <Save size={16} />
              <span>{saving ? 'Saving...' : 'Save Consultation'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
