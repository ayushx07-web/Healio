import { useState } from 'react';
import { format, parseISO } from 'date-fns';

export default function SlotPicker({ slots, selectedSlot, onSelectSlot }) {
  // Group slots by day
  const groupedSlots = slots.reduce((acc, slot) => {
    const dateStr = format(parseISO(slot.startTime), 'yyyy-MM-dd');
    if (!acc[dateStr]) acc[dateStr] = [];
    acc[dateStr].push(slot);
    return acc;
  }, {});

  const dates = Object.keys(groupedSlots).sort();
  const [selectedDate, setSelectedDate] = useState(dates[0] || '');

  // Keep selected date aligned if slots refresh
  if (selectedDate && !dates.includes(selectedDate) && dates.length > 0) {
    setSelectedDate(dates[0]);
  } else if (!selectedDate && dates.length > 0) {
    setSelectedDate(dates[0]);
  }

  if (slots.length === 0) {
    return <div className="text-zinc-500 text-sm py-4">No available slots for the next 7 days.</div>;
  }

  return (
    <div className="space-y-4">
      {/* Date selection tabs */}
      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none">
        {dates.map(date => {
          const parsedDate = parseISO(date + 'T00:00:00');
          const isActive = selectedDate === date;
          return (
            <button
              key={date}
              type="button"
              onClick={() => setSelectedDate(date)}
              className={`flex-shrink-0 px-4 py-3.5 rounded-2xl text-xs font-bold border transition duration-200 ${
                isActive
                  ? 'bg-[#0e4d38] border-[#0e4d38] text-white shadow-md'
                  : 'bg-[#242426] border-zinc-800 text-zinc-300 hover:border-zinc-700'
              }`}
            >
              <div className="uppercase tracking-wider opacity-80">{format(parsedDate, 'EEE')}</div>
              <div className="text-sm font-extrabold mt-1">{format(parsedDate, 'MMM d')}</div>
            </button>
          );
        })}
      </div>

      {/* Time slots for selected date */}
      {selectedDate && (
        <div className="grid grid-cols-3 sm:grid-cols-4 gap-2.5 pt-4">
          {groupedSlots[selectedDate]?.map(slot => {
            const isSelected = selectedSlot?.id === slot.id;
            return (
              <button
                key={slot.id}
                type="button"
                onClick={() => onSelectSlot(slot)}
                className={`py-3 px-3 text-xs font-semibold rounded-xl border text-center transition duration-150 ${
                  isSelected
                    ? 'bg-emerald-500/10 border-emerald-500 text-emerald-400 shadow-sm'
                    : 'bg-[#242426] border-zinc-800 text-zinc-300 hover:bg-zinc-800 hover:border-zinc-750'
                }`}
              >
                {format(parseISO(slot.startTime), 'h:mm a')}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
