import { MapPin, Star } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function DoctorCard({ doctor }) {
  const navigate = useNavigate();

  return (
    <div
      onClick={() => navigate(`/doctor/${doctor.id}`)}
      className="bg-[#1c1c1e] rounded-[1.5rem] border border-zinc-850 p-6 cursor-pointer hover-card-effect transition duration-300 group"
    >
      <div className="flex items-start justify-between">
        <div>
          <h3 className="font-semibold text-zinc-100 text-lg group-hover:text-emerald-400 transition">{doctor.user?.name}</h3>
          <p className="text-emerald-400 text-xs font-semibold mt-1 tracking-wider uppercase">{doctor.specialization}</p>
          <div className="flex items-center gap-1.5 text-zinc-400 text-sm mt-3">
            <MapPin size={14} className="text-zinc-500" />
            <span>{doctor.location}</span>
          </div>
        </div>
        <div className="text-right">
          <div className="flex items-center gap-1 text-amber-500 text-sm font-bold justify-end">
            <Star size={14} fill="currentColor" />
            <span>{doctor.rating}</span>
          </div>
          <p className="text-zinc-200 font-extrabold text-lg mt-1">₹{doctor.consultationFee}</p>
        </div>
      </div>
      <div className="mt-5 pt-3 border-t border-zinc-800/60 flex justify-between items-center text-xs text-zinc-400">
        <span className="font-medium text-zinc-500">{doctor.experienceYears} years experience</span>
        <span className="text-emerald-400 font-bold group-hover:underline transition">Book Appointment →</span>
      </div>
    </div>
  );
}
