import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { format, parseISO } from 'date-fns';
import { MapPin, Star, Clock } from 'lucide-react';
import api from '../api/axios';
import SlotPicker from '../components/SlotPicker';
import { useAuth } from '../context/AuthContext';

export default function DoctorProfile() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [doctor, setDoctor] = useState(null);
  const [slots, setSlots] = useState([]);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [form, setForm] = useState({ patientName: '', patientAge: '', patientPhone: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    api.get(`/api/doctors/${id}`).then(r => setDoctor(r.data));
    api.get(`/api/doctors/${id}/slots`).then(r => setSlots(r.data));
  }, [id]);

  useEffect(() => {
    if (user && user.role === 'PATIENT') {
      setForm(prev => ({
        ...prev,
        patientName: user.name || '',
        patientPhone: user.phone || '',
      }));
    }
  }, [user]);

  const handleBook = async () => {
    if (!selectedSlot) return;
    setLoading(true);
    setError('');
    try {
      const { data } = await api.post('/api/bookings', {
        slotId: selectedSlot.id,
        patientName: form.patientName,
        patientAge: parseInt(form.patientAge),
        patientPhone: form.patientPhone,
      });
      navigate('/booking/confirm', { state: { booking: data } });
    } catch (e) {
      if (e.response?.data?.error === 'SLOT_TAKEN') {
        const next = e.response.data;
        setError(`That slot was just booked! Next available: ${next.nextAvailableSlotTime ? format(parseISO(next.nextAvailableSlotTime), 'EEE, MMM d • h:mm a') : 'None found'}`);
        if (next.nextAvailableSlotId) {
          const nextSlot = slots.find(s => s.id === next.nextAvailableSlotId);
          if (nextSlot) setSelectedSlot(nextSlot);
        }
      } else {
        setError('Booking failed. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  if (!doctor) return <div className="text-center py-12 text-zinc-500 font-medium">Loading profile...</div>;

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Doctor Info Card */}
      <div className="bg-[#1c1c1e] rounded-3xl border border-zinc-850 p-6 md:p-8 shadow-lg">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold text-zinc-100">{doctor.user?.name}</h1>
            <div className="text-emerald-400 text-xs font-bold mt-1 tracking-wider uppercase">{doctor.specialization}</div>
            <div className="flex items-center gap-1.5 text-zinc-400 text-sm mt-3">
              <MapPin size={14} className="text-zinc-500" /> <span>{doctor.location}</span>
            </div>
          </div>
          <div className="text-right">
            <div className="flex items-center gap-1 text-amber-500 text-sm font-bold justify-end">
              <Star size={14} fill="currentColor" /> <span>{doctor.rating}</span>
            </div>
            <div className="text-zinc-200 font-extrabold text-xl mt-1">₹{doctor.consultationFee}</div>
          </div>
        </div>
        {doctor.bio && (
          <div className="mt-6 pt-5 border-t border-zinc-800/60">
            <h3 className="font-bold text-zinc-300 text-xs uppercase tracking-wider mb-2">About Doctor</h3>
            <p className="text-zinc-400 text-sm leading-relaxed">{doctor.bio}</p>
          </div>
        )}
        <div className="mt-5 pt-4 border-t border-zinc-800/60 flex items-center justify-between text-xs text-zinc-500 font-medium">
          <span>{doctor.experienceYears} years of experience</span>
        </div>
      </div>

      {/* Date & Time Picker */}
      <div className="bg-[#1c1c1e] rounded-3xl border border-zinc-850 p-6 md:p-8 shadow-lg">
        <h2 className="text-lg font-bold text-zinc-200 mb-6 flex items-center gap-2">
          <Clock size={18} className="text-[#0e7452]" />
          <span>Select Date & Time</span>
        </h2>
        <SlotPicker
          slots={slots}
          selectedSlot={selectedSlot}
          onSelectSlot={setSelectedSlot}
        />
      </div>

      {/* Patient details Form / Authentication Prompt */}
      {selectedSlot && (
        <div className="bg-[#1c1c1e] rounded-3xl border border-zinc-850 p-6 md:p-8 shadow-lg animate-in fade-in slide-in-from-bottom-4 duration-300">
          {user ? (
            user.role === 'PATIENT' ? (
              <>
                <h2 className="text-lg font-bold text-zinc-200 mb-2">Patient Information</h2>
                <p className="text-emerald-400 text-xs font-semibold bg-emerald-950/10 p-3 rounded-xl border border-emerald-900/20 mb-4 animate-in fade-in duration-300">
                  ✓ Logged in as <span className="font-bold">{user.name}</span>. Your health summary is linked to this appointment.
                </p>
                <form onSubmit={(e) => { e.preventDefault(); handleBook(); }} className="space-y-5">
                  <div>
                    <label className="block text-[11px] font-bold text-zinc-500 uppercase tracking-widest mb-2">
                      Patient Name
                    </label>
                    <input
                      type="text"
                      required
                      value={form.patientName}
                      onChange={(e) => setForm({ ...form, patientName: e.target.value })}
                      placeholder="Enter full name"
                      className="w-full px-4 py-3 bg-[#242426] border border-zinc-805 rounded-xl text-sm text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition duration-200"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[11px] font-bold text-zinc-500 uppercase tracking-widest mb-2">
                        Patient Age
                      </label>
                      <input
                        type="number"
                        required
                        min="1"
                        max="120"
                        value={form.patientAge}
                        onChange={(e) => setForm({ ...form, patientAge: e.target.value })}
                        placeholder="Age"
                        className="w-full px-4 py-3 bg-[#242426] border border-zinc-805 rounded-xl text-sm text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition duration-200"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-zinc-500 uppercase tracking-widest mb-2">
                        Mobile Number
                      </label>
                      <input
                        type="text"
                        required
                        pattern="^[6-9]\d{9}$"
                        title="Enter a valid 10-digit Indian mobile number"
                        value={form.patientPhone}
                        onChange={(e) => setForm({ ...form, patientPhone: e.target.value })}
                        placeholder="Indian Mobile Number"
                        className="w-full px-4 py-3 bg-[#242426] border border-zinc-805 rounded-xl text-sm text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition duration-200"
                      />
                    </div>
                  </div>

                  {error && (
                    <div className="bg-red-950/20 text-red-400 text-sm p-4 rounded-xl border border-red-900/40 font-semibold animate-shake">
                      {error}
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-[#0e4d38] text-white py-4 rounded-xl font-bold hover:bg-[#0b3b2b] transition duration-200 disabled:bg-zinc-800 disabled:text-zinc-600 disabled:cursor-not-allowed shadow-md hover:shadow-lg"
                  >
                    {loading ? 'Booking...' : `Confirm Booking — ₹${doctor.consultationFee}`}
                  </button>
                </form>
              </>
            ) : (
              <div className="text-center py-6 space-y-3 animate-in fade-in duration-300">
                <h2 className="text-lg font-bold text-zinc-200">Booking Unavailable</h2>
                <p className="text-red-400 text-sm font-semibold bg-red-950/10 p-3.5 rounded-xl border border-red-900/20 max-w-md mx-auto">
                  Doctor accounts can't book appointments.
                </p>
              </div>
            )
          ) : (
            <div className="text-center py-6 space-y-4">
              <h2 className="text-lg font-bold text-zinc-200">Sign in to book appointment</h2>
              <p className="text-zinc-400 text-sm max-w-sm mx-auto leading-relaxed">
                You must be logged in as a patient to book a consultation slot and link your personal health summary.
              </p>
              <button
                onClick={() => navigate('/login', { state: { from: `/doctor/${id}` } })}
                className="inline-flex items-center justify-center bg-[#0e4d38] hover:bg-[#0b3b2b] text-white px-6 py-3 rounded-xl text-sm font-bold transition shadow-md hover:shadow-lg"
              >
                Sign In / Register to Book
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
