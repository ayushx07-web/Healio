import { useLocation, Link } from 'react-router-dom';
import { CheckCircle, Calendar, User, HeartPulse, ArrowRight } from 'lucide-react';
import { format, parseISO } from 'date-fns';

export default function BookingConfirm() {
  const { state } = useLocation();
  const booking = state?.booking;

  if (!booking) {
    return (
      <div className="text-center py-12">
        <h2 className="text-xl font-bold text-zinc-300">No Booking Found</h2>
        <Link to="/" className="text-emerald-400 mt-2 hover:underline inline-block font-medium">Go Home</Link>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto bg-[#1c1c1e] border border-zinc-850 rounded-3xl shadow-xl overflow-hidden mt-6 animate-in fade-in zoom-in-95 duration-300">
      <div className="bg-[#0e4d38] p-8 text-center text-white">
        <div className="mx-auto w-16 h-16 bg-white/10 rounded-full flex items-center justify-center mb-4">
          <CheckCircle size={36} className="text-white fill-white/5" />
        </div>
        <h1 className="text-2xl font-bold tracking-tight">Booking Confirmed!</h1>
        <p className="text-emerald-100 text-xs mt-1 font-medium">Your appointment reference is secure.</p>
      </div>

      <div className="p-6 space-y-6">
        <div className="text-center pb-4 border-b border-zinc-800/60">
          <div className="text-[11px] font-bold text-zinc-500 uppercase tracking-widest">Booking Reference</div>
          <div className="text-2xl font-extrabold text-zinc-100 tracking-wider mt-1">{booking.bookingRef}</div>
        </div>

        <div className="space-y-5">
          <div className="flex gap-3.5">
            <HeartPulse className="text-emerald-400 flex-shrink-0" size={20} />
            <div>
              <div className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Doctor</div>
              <div className="font-semibold text-zinc-200 mt-0.5">{booking.doctorName}</div>
              <div className="text-xs text-zinc-400 font-medium">{booking.specialization}</div>
            </div>
          </div>

          <div className="flex gap-3.5">
            <Calendar className="text-emerald-400 flex-shrink-0" size={20} />
            <div>
              <div className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Date & Time</div>
              <div className="font-semibold text-zinc-200 mt-0.5">
                {format(parseISO(booking.slotStart), 'EEEE, MMMM d')}
              </div>
              <div className="text-xs text-zinc-400 font-medium mt-0.5">
                {format(parseISO(booking.slotStart), 'h:mm a')}
              </div>
            </div>
          </div>

          <div className="flex gap-3.5">
            <User className="text-emerald-400 flex-shrink-0" size={20} />
            <div>
              <div className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Patient</div>
              <div className="font-semibold text-zinc-200 mt-0.5">{booking.patientName}</div>
            </div>
          </div>
        </div>

        <div className="pt-5 border-t border-zinc-800/60 flex flex-col gap-2">
          <Link
            to="/"
            className="w-full bg-zinc-800 hover:bg-zinc-700 text-white text-center py-3.5 rounded-xl font-semibold transition text-sm flex items-center justify-center gap-1.5 shadow-md"
          >
            <span>Back to Home</span>
            <ArrowRight size={16} />
          </Link>
        </div>
      </div>
    </div>
  );
}
