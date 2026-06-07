import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { format, parseISO } from 'date-fns';
import { Calendar, Phone, RefreshCw, CalendarX } from 'lucide-react';
import api from '../../api/axios';
import { useAuth } from '../../context/AuthContext';

export default function Dashboard() {
  const { user } = useAuth();
  const [appointments, setAppointments] = useState([]);
  const [slots, setSlots] = useState([]);
  const [doctorProfile, setDoctorProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('appointments');
  const [dateFilter, setDateFilter] = useState('today');

  const [healthSummaries, setHealthSummaries] = useState({});
  const [loadingSummaryId, setLoadingSummaryId] = useState(null);
  const [expandedAptId, setExpandedAptId] = useState(null);

  const fetchData = async () => {
    setLoading(true);
    try {
      // 1. Get appointments matching range filter
      const aptRes = await api.get(`/api/doctors/dashboard/appointments?range=${dateFilter}`);
      setAppointments(aptRes.data);

      // 2. Find doctor profile from list to get doctor.id
      const docListRes = await api.get('/api/doctors');
      const myProfile = docListRes.data.find(d => d.user?.email === user.email);
      if (myProfile) {
        setDoctorProfile(myProfile);
        // 3. Fetch doctor's slots
        const slotsRes = await api.get(`/api/doctors/${myProfile.id}/slots`);
        setSlots(slotsRes.data);
      }
    } catch (e) {
      console.error('Error fetching dashboard data:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?.email) {
      fetchData();
    }
  }, [user?.email, dateFilter]);

  const handleBlockToggle = async (slotId, isBlocked) => {
    try {
      if (isBlocked) {
        await api.post(`/api/doctors/slots/${slotId}/unblock`);
      } else {
        await api.post(`/api/doctors/slots/${slotId}/block`);
      }
      fetchData();
    } catch (e) {
      console.error('Error toggling block slot:', e);
    }
  };

  const toggleHealthSummary = async (aptId) => {
    if (expandedAptId === aptId) {
      setExpandedAptId(null);
      return;
    }
    
    setExpandedAptId(aptId);
    
    // Fetch if not already loaded
    if (!healthSummaries[aptId]) {
      setLoadingSummaryId(aptId);
      try {
        const { data } = await api.get(`/api/patient/health-summary/by-booking/${aptId}`);
        setHealthSummaries(prev => ({
          ...prev,
          [aptId]: data || null
        }));
      } catch (err) {
        console.error('Error fetching health summary:', err);
        setHealthSummaries(prev => ({
          ...prev,
          [aptId]: null
        }));
      } finally {
        setLoadingSummaryId(null);
      }
    }
  };

  // Compute stats based on current loaded appointments
  const todayStr = format(new Date(), 'yyyy-MM-dd');
  const todaysCount = appointments.filter(apt => {
    const aptDate = apt.slot?.startTime ? format(parseISO(apt.slot.startTime), 'yyyy-MM-dd') : '';
    return aptDate === todayStr;
  }).length;
  const confirmedCount = appointments.filter(apt => apt.status === 'CONFIRMED').length;
  const completedCount = appointments.filter(apt => apt.status === 'COMPLETED').length;

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="bg-[#1c1c1e] border border-zinc-850 rounded-3xl p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 shadow-lg">
        <div>
          <h1 className="text-2xl font-bold text-zinc-100 tracking-tight">Welcome, {user?.name}</h1>
          <p className="text-zinc-400 text-sm mt-0.5 font-medium">Manage your daily appointments and consultations</p>
        </div>
        <button
          onClick={fetchData}
          className="flex items-center gap-1.5 text-xs font-bold bg-zinc-800 hover:bg-zinc-700 px-4.5 py-2.5 rounded-xl text-zinc-300 hover:text-white transition duration-200"
        >
          <RefreshCw size={14} />
          <span>Refresh</span>
        </button>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-[#1c1c1e] border border-zinc-850 rounded-2xl p-4 text-center">
          <div className="text-2xl font-extrabold text-emerald-400">{todaysCount}</div>
          <div className="text-xs text-zinc-500 font-medium mt-1">Today's Appointments</div>
        </div>
        <div className="bg-[#1c1c1e] border border-zinc-850 rounded-2xl p-4 text-center">
          <div className="text-2xl font-extrabold text-emerald-400">{confirmedCount}</div>
          <div className="text-xs text-zinc-500 font-medium mt-1">Confirmed</div>
        </div>
        <div className="bg-[#1c1c1e] border border-zinc-850 rounded-2xl p-4 text-center">
          <div className="text-2xl font-extrabold text-emerald-400">{completedCount}</div>
          <div className="text-xs text-zinc-500 font-medium mt-1">Completed</div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex border-b border-zinc-800">
        <button
          onClick={() => setActiveTab('appointments')}
          className={`px-4 py-3.5 text-sm font-bold border-b-2 transition duration-200 ${
            activeTab === 'appointments'
              ? 'border-emerald-500 text-emerald-400'
              : 'border-transparent text-zinc-500 hover:text-zinc-300'
          }`}
        >
          Appointments List
        </button>
        <button
          onClick={() => setActiveTab('slots')}
          className={`px-4 py-3.5 text-sm font-bold border-b-2 transition duration-200 ${
            activeTab === 'slots'
              ? 'border-emerald-500 text-emerald-400'
              : 'border-transparent text-zinc-500 hover:text-zinc-300'
          }`}
        >
          Manage Slots
        </button>
      </div>

      {loading ? (
        <div className="text-center py-12 text-zinc-500 font-semibold">Loading dashboard data...</div>
      ) : activeTab === 'appointments' ? (
        <div className="space-y-5">
          {/* Secondary Date Filter Pill Selector */}
          <div className="flex gap-1.5 bg-[#121212] p-1 border border-zinc-800/80 rounded-2xl w-fit">
            {[
              { id: 'today', label: "Today" },
              { id: 'tomorrow', label: 'Tomorrow' },
              { id: 'upcoming', label: 'All Upcoming' }
            ].map(tab => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setDateFilter(tab.id)}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition duration-200 ${
                  dateFilter === tab.id
                    ? 'bg-[#0e4d38] text-white shadow-md'
                    : 'text-zinc-500 hover:text-zinc-300'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {appointments.length === 0 ? (
            <div className="bg-[#1c1c1e] border border-zinc-850 rounded-3xl p-12 flex flex-col items-center justify-center text-center space-y-3 shadow-lg">
              <div className="w-12 h-12 bg-emerald-500/10 text-emerald-500 rounded-full flex items-center justify-center">
                <CalendarX size={24} />
              </div>
              <h3 className="text-zinc-200 font-semibold text-base">No appointments for this day</h3>
              <p className="text-zinc-500 text-xs font-medium max-w-xs">When patients book slots, they will appear here.</p>
            </div>
          ) : (
            <div className="space-y-4 animate-in fade-in duration-300">
              {appointments.map(apt => (
                <div key={apt.id} className="bg-[#1c1c1e] border border-zinc-850 rounded-3xl p-6 hover:border-zinc-800 transition w-full">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Left Column: patient details */}
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 bg-emerald-500/10 text-emerald-400 rounded-full flex items-center justify-center font-bold text-lg shrink-0">
                        {apt.patientName.charAt(0)}
                      </div>
                      <div className="space-y-1.5">
                        <h4 className="font-semibold text-zinc-100 text-base">{apt.patientName}</h4>
                        <p className="text-xs text-zinc-500 font-medium">Age: {apt.patientAge} | Ref: {apt.bookingRef}</p>
                        <div className="space-y-1 text-xs text-zinc-400 pt-1">
                          <div className="flex items-center gap-2">
                            <Calendar size={14} className="text-zinc-600" />
                            <span>
                              {apt.slot?.startTime ? format(parseISO(apt.slot.startTime), 'h:mm a') : format(parseISO(apt.slotStart), 'h:mm a')} 
                              {apt.slot?.endTime && ` - ${format(parseISO(apt.slot.endTime), 'h:mm a')}`}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Phone size={14} className="text-zinc-600" />
                            <span>{apt.patientPhone}</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Right Column: status, health summary, actions */}
                    <div className="flex flex-col md:items-end justify-between space-y-4 md:space-y-0">
                      {/* Status Badge */}
                      <div className="flex items-center gap-1.5 md:self-end">
                        <span className="text-xs font-bold bg-emerald-500/10 text-emerald-400 px-2.5 py-1 rounded-full uppercase tracking-wider">
                          {apt.status}
                        </span>
                        {dateFilter === 'upcoming' && apt.slot?.startTime && (
                          <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest bg-zinc-900/80 px-2 py-0.5 rounded-lg">
                            {format(parseISO(apt.slot.startTime), 'MMM d')}
                          </span>
                        )}
                      </div>

                      {/* Collapsible Health Summary */}
                      <div className="w-full md:text-right py-2">
                        <button
                          onClick={() => toggleHealthSummary(apt.id)}
                          className="text-xs font-bold text-emerald-400 hover:text-emerald-350 transition flex items-center gap-1 md:ml-auto"
                        >
                          <span>{expandedAptId === apt.id ? 'Hide Health Summary ▲' : 'View Health Summary ▼'}</span>
                        </button>

                        <div className={`transition-all duration-300 overflow-hidden ${expandedAptId === apt.id ? 'max-h-64 opacity-100 mt-3' : 'max-h-0 opacity-0'}`}>
                          {loadingSummaryId === apt.id ? (
                            <div className="text-zinc-500 text-[11px] italic">Loading health summary...</div>
                          ) : healthSummaries[apt.id] ? (
                            (() => {
                              const summary = healthSummaries[apt.id];
                              const hasSummary = summary && (summary.bloodGroup || summary.knownConditions || summary.currentMedications);
                              if (!hasSummary) {
                                return <div className="text-zinc-500 text-[11px] italic">Patient has not filled health summary yet.</div>;
                              }
                              return (
                                <div className="bg-[#121212]/50 border border-zinc-800/80 p-3.5 rounded-xl text-left text-xs space-y-1.5 max-w-sm md:ml-auto">
                                  <div><span className="text-zinc-500 font-bold">Blood Group:</span> <span className="text-zinc-300 font-medium">{summary.bloodGroup || 'Not provided'}</span></div>
                                  <div><span className="text-zinc-500 font-bold">Conditions:</span> <span className="text-zinc-300 font-medium">{summary.knownConditions || 'None reported'}</span></div>
                                  <div><span className="text-zinc-500 font-bold">Medications:</span> <span className="text-zinc-300 font-medium">{summary.currentMedications || 'None reported'}</span></div>
                                </div>
                              );
                            })()
                          ) : (
                            <div className="text-zinc-500 text-[11px] italic">Patient has not filled health summary yet.</div>
                          )}
                        </div>
                      </div>

                      {/* Start Consultation Button */}
                      <div className="md:self-end w-full md:w-auto">
                        <Link
                          to={`/doctor/consultation/${apt.id}`}
                          className="bg-[#0e4d38] hover:bg-[#0b3b2b] text-white text-xs font-bold px-5 py-3 rounded-xl transition duration-200 shadow-md hover:shadow-lg inline-block w-full md:w-auto text-center"
                        >
                          Start Consultation
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : (
        <div className="bg-[#1c1c1e] border border-zinc-850 rounded-3xl p-6 md:p-8 shadow-lg animate-in fade-in duration-300">
          <h3 className="font-bold text-zinc-200 text-base mb-6">Your Upcoming Slots</h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {slots.map(slot => {
              const isBlocked = slot.isBlocked;
              return (
                <div
                  key={slot.id}
                  className={`p-4 rounded-2xl border flex flex-col justify-between items-center text-center gap-3 transition duration-200 ${
                    isBlocked
                      ? 'bg-red-950/20 border-red-900/30 text-red-400'
                      : 'bg-[#242426] border-zinc-850 text-zinc-200 hover:border-zinc-800'
                  }`}
                >
                  <div>
                    <div className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">
                      {format(parseISO(slot.startTime), 'EEE, MMM d')}
                    </div>
                    <div className="text-sm font-extrabold mt-1">{format(parseISO(slot.startTime), 'h:mm a')}</div>
                  </div>
                  <button
                    onClick={() => handleBlockToggle(slot.id, isBlocked)}
                    className={`text-[10px] font-bold px-3 py-2 rounded-xl transition duration-150 ${
                      isBlocked
                        ? 'bg-red-900 hover:bg-red-800 text-white shadow-sm'
                        : 'bg-zinc-800 hover:bg-zinc-700 text-zinc-300'
                    }`}
                  >
                    {isBlocked ? 'Blocked' : 'Block Slot'}
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
