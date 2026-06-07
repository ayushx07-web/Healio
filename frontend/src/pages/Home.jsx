import { useState, useRef, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Search, Clock, Check, MapPin, ArrowDown, Calendar, Sparkles, CalendarCheck, CheckCircle, X } from 'lucide-react';
import api from '../api/axios';
import DoctorCard from '../components/DoctorCard';
import { useAuth } from '../context/AuthContext';

export default function Home() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const resultRef = useRef(null);
  const [symptoms, setSymptoms] = useState('');
  const [aiResult, setAiResult] = useState(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState('');
  const [doctors, setDoctors] = useState([]);
  const [showBanner, setShowBanner] = useState(false);

  useEffect(() => {
    const checkProfileStatus = async () => {
      if (user && user.role === 'PATIENT') {
        const dismissed = sessionStorage.getItem('dismissHealthBanner');
        if (dismissed === 'true') {
          setShowBanner(false);
          return;
        }

        try {
          const { data } = await api.get('/api/patient/health-summary');
          const hasFilled = data && (data.bloodGroup || data.knownConditions || data.currentMedications);
          setShowBanner(!hasFilled);
        } catch (err) {
          console.error('Failed to fetch health summary for banner:', err);
          // If we fail because no summary exists, backend throws user not found or similar?
          // Actually getByEmail returns default empty HealthSummary (fields are null), so it shouldn't fail unless network error or 404.
          setShowBanner(true);
        }
      } else {
        setShowBanner(false);
      }
    };
    checkProfileStatus();
  }, [user]);

  const handleDismissBanner = () => {
    sessionStorage.setItem('dismissHealthBanner', 'true');
    setShowBanner(false);
  };

  const specializations = [
    { name: 'Cardiologist', count: 12 },
    { name: 'Dermatologist', count: 8 },
    { name: 'Orthopedic', count: 15 },
    { name: 'Pediatrician', count: 10 },
    { name: 'General Physician', count: 20 },
    { name: 'Neurologist', count: 6 }
  ];

  const isMatch = (specName) => {
    if (!aiResult) return false;
    let aiSpec = aiResult.specialization;
    if (aiSpec === 'Orthopedist') aiSpec = 'Orthopedic';
    return aiSpec.toLowerCase() === specName.toLowerCase();
  };

  const handleAiSuggest = async () => {
    if (!symptoms.trim()) return;
    setAiLoading(true);
    setAiError('');
    setAiResult(null);
    setDoctors([]);
    try {
      const { data } = await api.post('/api/ai/suggest-specialist', { symptoms });
      setAiResult(data);
      
      // Normalize 'Orthopedist' to 'Orthopedic' to match DB seeds
      let specQuery = data.specialization;
      if (specQuery === 'Orthopedist') {
        specQuery = 'Orthopedic';
      }
      
      const docsRes = await api.get('/api/doctors', {
        params: { specialization: specQuery }
      });
      setDoctors(docsRes.data);

      setTimeout(() => {
        resultRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }, 100);
    } catch (e) {
      console.error(e);
      setAiError('Could not analyse symptoms. Please search manually.');
    } finally {
      setAiLoading(false);
    }
  };

  return (
    <div className="space-y-12">
      {/* Health Profile Incomplete Banner */}
      {showBanner && (
        <div className="bg-emerald-950/20 border border-emerald-900/30 text-emerald-400 px-5 py-4 rounded-3xl flex items-center justify-between text-xs font-bold gap-3 animate-in fade-in duration-300">
          <div className="flex items-center gap-2.5">
            <span className="text-sm">⚕</span>
            <span>
              Your health profile is incomplete. Doctors can prepare better when they know your history.
              <Link to="/complete-profile" className="underline hover:text-emerald-300 transition ml-1 inline-flex items-center">
                Complete now &rarr;
              </Link>
            </span>
          </div>
          <button 
            onClick={handleDismissBanner}
            className="text-emerald-500/60 hover:text-emerald-400 transition cursor-pointer p-1 shrink-0"
          >
            <X size={14} className="stroke-[3]" />
          </button>
        </div>
      )}

      {/* Premium Cohesive Dark Hero Section */}
      <div className="bg-[#161b18] rounded-[2.5rem] p-8 md:p-16 border border-emerald-950/60 shadow-2xl relative overflow-hidden transition-all duration-300 hover:border-emerald-900/50">
        <span className="text-[11px] font-bold tracking-[0.2em] text-emerald-400 uppercase block mb-4">
          HEALTHCARE, SIMPLIFIED
        </span>

        <h1 className="text-4xl md:text-6xl font-bold leading-[1.1] tracking-tight mb-6">
          <span className="text-zinc-100 block">Find a doctor.</span>
          <span className="text-emerald-400 block mt-1">Book in minutes.</span>
        </h1>

        <p className="text-zinc-400 text-sm md:text-base max-w-xl font-medium leading-relaxed mb-8">
          Search verified doctors by specialization or location, pick a slot that works for you, and get a confirmed booking — no calls, no waiting.
        </p>

        {/* AI Symptom Finder */}
        <div className="bg-[#1c211e]/80 border border-zinc-800/80 rounded-3xl p-6 max-w-2xl mb-8 space-y-4 shadow-xl backdrop-blur-md">
          <h3 className="text-xs font-bold text-emerald-400 tracking-widest uppercase flex items-center gap-2">
            <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span>
            <span>✨ AI Symptom Finder</span>
          </h3>
          <p className="text-xs text-zinc-400 font-medium leading-relaxed">
            Tell us how you are feeling in plain English (e.g., "headache and high fever for two days"). Our AI will analyze your symptoms, suggest the right specialist, and show matches instantly.
          </p>
          <div className="flex flex-col sm:flex-row gap-3">
            <input
              type="text"
              value={symptoms}
              onChange={(e) => setSymptoms(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') handleAiSuggest(); }}
              placeholder="Describe your symptoms... (e.g. skin rash and itching)"
              className="flex-1 px-4 py-3 bg-[#242426] border border-zinc-805 rounded-xl text-sm text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition duration-200"
            />
            <button
              onClick={handleAiSuggest}
              disabled={aiLoading || !symptoms.trim()}
              className="bg-emerald-500 text-zinc-950 font-bold px-6 py-3 rounded-xl hover:bg-emerald-400 transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-sm whitespace-nowrap shadow-md"
            >
              {aiLoading ? (
                <>
                  <span className="w-3.5 h-3.5 border-2 border-zinc-950 border-t-transparent rounded-full animate-spin"></span>
                  <span>Analysing...</span>
                </>
              ) : (
                <span>Find the right doctor</span>
              )}
            </button>
          </div>

          {aiError && (
            <div className="text-red-400 text-xs font-semibold bg-red-950/20 border border-red-900/40 p-3.5 rounded-xl">
              ⚠️ {aiError}
            </div>
          )}

          {aiResult && (
            <div ref={resultRef} className="bg-[#121212]/50 border border-emerald-950/60 p-5 rounded-2xl space-y-2.5 animate-in fade-in slide-in-from-bottom-2 duration-300">
              <div className="text-zinc-200 text-xs font-bold uppercase tracking-wider flex items-center gap-1.5">
                <span>We suggest seeing a:</span>
                <span className="text-emerald-400 font-extrabold text-sm px-2 py-0.5 bg-emerald-500/10 rounded">{aiResult.specialization}</span>
              </div>
              <p className="text-zinc-400 text-xs font-medium leading-relaxed italic border-l-2 border-emerald-500/50 pl-3">
                "{aiResult.reason}"
              </p>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-5 mb-10">
          <button
            onClick={() => navigate('/search')}
            className="bg-[#1c1c1e] border border-zinc-800 text-zinc-200 font-bold text-sm px-6 py-3.5 rounded-full flex items-center gap-2 hover:bg-zinc-800 transition duration-200"
          >
            <Search size={14} />
            <span>Search manually</span>
          </button>
        </div>

        {/* Cohesive Dark Pills / Indicators */}
        <div className="flex flex-wrap gap-4 mt-8 border-t border-zinc-800/80 pt-8">
          <div className="bg-[#1c211e]/90 border border-zinc-800/80 rounded-full px-5 py-3.5 flex items-center gap-3 shadow-md">
            <div className="w-5 h-5 bg-emerald-500/10 text-emerald-400 rounded-full flex items-center justify-center">
              <Check size={12} className="stroke-[3]" />
            </div>
            <span className="text-xs font-bold text-zinc-300">Verified Doctors</span>
          </div>

          <div className="bg-[#1c211e]/90 border border-zinc-800/80 rounded-full px-5 py-3.5 flex items-center gap-3 shadow-md">
            <div className="w-5 h-5 bg-emerald-500/10 text-emerald-400 rounded-full flex items-center justify-center">
              <Clock size={12} className="stroke-[3]" />
            </div>
            <span className="text-xs font-bold text-zinc-300">Book in Minutes</span>
          </div>

          <div className="bg-[#1c211e]/90 border border-zinc-800/80 rounded-full px-5 py-3.5 flex items-center gap-3 shadow-md">
            <div className="w-5 h-5 bg-emerald-500/10 text-emerald-400 rounded-full flex items-center justify-center">
              <MapPin size={12} className="stroke-[3]" />
            </div>
            <span className="text-xs font-bold text-zinc-300">Delhi & NCR</span>
          </div>
        </div>
      </div>

      {/* AI Recommendation Doctors List */}
      {doctors.length > 0 && (
        <div className="space-y-6 animate-in fade-in duration-300">
          <h2 className="text-xl md:text-2xl font-semibold text-white tracking-tight flex items-center gap-2">
            <span>Verified {aiResult?.specialization}s near you</span>
            <span className="text-xs font-bold bg-emerald-500/10 text-emerald-400 px-2.5 py-1 rounded-full">{doctors.length} Found</span>
          </h2>
          <div className="grid gap-4 md:grid-cols-2">
            {doctors.map(doc => (
              <DoctorCard key={doc.id} doctor={doc} />
            ))}
          </div>
        </div>
      )}

      {/* Specialization Section (Dark Themed) */}
      <div>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl md:text-2xl font-semibold text-white tracking-tight">
            Browse by specialization
          </h2>
          <button 
            onClick={() => {
              const specSection = document.getElementById('spec-grid');
              specSection?.scrollIntoView({ behavior: 'smooth' });
            }}
            className="w-10 h-10 border border-zinc-800 rounded-full flex items-center justify-center text-zinc-400 hover:text-white hover:border-zinc-700 transition cursor-pointer"
          >
            <ArrowDown size={16} />
          </button>
        </div>

        <div id="spec-grid" className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5">
          {specializations.map(s => (
            <button
              key={s.name}
              onClick={() => navigate(`/search?specialization=${s.name}`)}
              className={`bg-[#1c1c1e] border rounded-[1.5rem] p-6 text-left hover-card-effect transition duration-300 group ${isMatch(s.name) ? 'border-emerald-500 bg-emerald-950/10 shadow-lg shadow-emerald-500/5' : 'border-zinc-850 hover:border-zinc-700/80'}`}
            >
              <div className={`font-semibold transition text-base ${isMatch(s.name) ? 'text-emerald-400 font-extrabold' : 'text-zinc-100 group-hover:text-emerald-400'}`}>
                {s.name}
              </div>
              <div className="text-xs text-zinc-500 mt-2 font-medium flex items-center gap-1 group-hover:text-zinc-400 transition">
                <span>View verified doctors</span>
                <span className="transform group-hover:translate-x-1 transition duration-200">→</span>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* How Healio Works Section */}
      <div className="pt-8 border-t border-zinc-900/60">
        <div className="text-center max-w-xl mx-auto mb-12">
          <h2 className="text-2xl md:text-3xl font-bold text-white tracking-tight">
            How Healio works
          </h2>
          <p className="text-zinc-400 text-xs md:text-sm mt-2 font-medium">
            From symptoms to confirmed booking in under 2 minutes.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative">
          {/* Connecting Line for Desktop */}
          <div className="hidden md:block absolute top-14 left-[15%] right-[15%] h-[1px] border-t border-dashed border-emerald-500/10 z-0 pointer-events-none" />

          {[
            {
              icon: Sparkles,
              number: '01',
              title: 'Describe your symptoms',
              desc: "Type how you're feeling in plain English. Our AI instantly suggests the right specialist for you."
            },
            {
              icon: CalendarCheck,
              number: '02',
              title: 'Pick a doctor & slot',
              desc: 'Browse verified doctors, check availability for the next 7 days, and choose a time that works for you.'
            },
            {
              icon: CheckCircle,
              number: '03',
              title: 'Get confirmed instantly',
              desc: 'Receive a unique Booking ID immediately. No calls, no waiting, no paper registers.'
            }
          ].map(({ icon: Icon, number, title, desc }) => (
            <div
              key={number}
              className="bg-[rgba(255,255,255,0.03)] rounded-3xl p-8 border border-[rgba(255,255,255,0.08)] relative overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:border-[rgba(255,255,255,0.15)] shadow-md group z-10"
            >
              {/* Large Muted Green Step Number */}
              <div className="absolute top-4 right-4 text-7xl font-black text-emerald-500/10 select-none pointer-events-none group-hover:text-emerald-500/20 transition-colors duration-300">
                {number}
              </div>

              {/* Icon Container */}
              <div className="w-12 h-12 bg-zinc-950/80 text-emerald-400 rounded-2xl flex items-center justify-center mb-6 border border-zinc-800/40">
                <Icon size={22} className="stroke-[2]" />
              </div>

              <h3 className="font-semibold text-zinc-100 text-lg mb-2 relative z-10">{title}</h3>
              <p className="text-sm text-zinc-400 leading-relaxed font-medium relative z-10">{desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
