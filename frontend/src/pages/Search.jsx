import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search as SearchIcon, MapPin } from 'lucide-react';
import api from '../api/axios';
import DoctorCard from '../components/DoctorCard';

export default function Search() {
  const [searchParams] = useSearchParams();
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(false);
  const [specialization, setSpecialization] = useState(searchParams.get('specialization') || '');
  const [location, setLocation] = useState('');

  const fetchDoctors = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/api/doctors', {
        params: { specialization: specialization || undefined, location: location || undefined }
      });
      setDoctors(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDoctors();
  }, []);

  return (
    <div className="space-y-6">
      {/* Dark Styled Search bar */}
      <div className="bg-[#1c1c1e] rounded-2xl shadow-lg border border-zinc-800/80 p-4 flex flex-col sm:flex-row gap-3">
        <div className="flex-1 relative">
          <SearchIcon size={18} className="absolute left-3.5 top-3.5 text-zinc-500" />
          <input
            type="text"
            placeholder="Specialization (e.g. Cardiologist)"
            value={specialization}
            onChange={e => setSpecialization(e.target.value)}
            className="w-full pl-10 pr-4 py-3 bg-[#242426] border border-zinc-805 rounded-xl text-sm text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition duration-200"
          />
        </div>
        <div className="flex-1 relative">
          <MapPin size={18} className="absolute left-3.5 top-3.5 text-zinc-500" />
          <input
            type="text"
            placeholder="Location (e.g. Delhi)"
            value={location}
            onChange={e => setLocation(e.target.value)}
            className="w-full pl-10 pr-4 py-3 bg-[#242426] border border-zinc-805 rounded-xl text-sm text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition duration-200"
          />
        </div>
        <button
          onClick={fetchDoctors}
          className="bg-[#0e4d38] hover:bg-[#0b3b2b] text-white px-7 py-3 rounded-xl font-semibold transition text-sm shadow-md hover:shadow-lg"
        >
          Search
        </button>
      </div>

      {/* Results Section */}
      <div>
        <h2 className="text-lg font-semibold text-zinc-200 mb-4">
          {loading ? 'Searching...' : `${doctors.length} Doctors Found`}
        </h2>

        {loading ? (
          <div className="text-center py-12 text-zinc-500 font-medium">Searching for doctors...</div>
        ) : doctors.length === 0 ? (
          <div className="bg-[#1c1c1e] border border-zinc-850 rounded-2xl p-12 text-center text-zinc-400 font-medium">
            No doctors found matching your criteria. Try adjusting your filters.
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {doctors.map(doc => (
              <DoctorCard key={doc.id} doctor={doc} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
