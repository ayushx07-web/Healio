import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Search from './pages/Search';
import DoctorProfile from './pages/DoctorProfile';
import BookingConfirm from './pages/BookingConfirm';
import DoctorLogin from './pages/doctor/Login';
import DoctorDashboard from './pages/doctor/Dashboard';
import ConsultationForm from './pages/doctor/ConsultationForm';
import ProtectedRoute from './components/ProtectedRoute';
import PatientAuth from './pages/PatientAuth';
import PatientProfile from './pages/PatientProfile';
import CompleteProfile from './pages/CompleteProfile';

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <div className="min-h-screen bg-[#121212] text-zinc-100">
          <Navbar />
          <main className="max-w-6xl mx-auto px-4 py-6">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/search" element={<Search />} />
              <Route path="/doctor/:id" element={<DoctorProfile />} />
              <Route path="/booking/confirm" element={<BookingConfirm />} />
              <Route path="/doctor/login" element={<DoctorLogin />} />
              <Route path="/login" element={<PatientAuth />} />
              <Route path="/profile" element={
                <ProtectedRoute allowedRoles={['PATIENT']}><PatientProfile /></ProtectedRoute>
              } />
              <Route path="/complete-profile" element={
                <ProtectedRoute allowedRoles={['PATIENT']}><CompleteProfile /></ProtectedRoute>
              } />
              <Route path="/doctor/dashboard" element={
                <ProtectedRoute allowedRoles={['DOCTOR']}><DoctorDashboard /></ProtectedRoute>
              } />
              <Route path="/doctor/consultation/:bookingId" element={
                <ProtectedRoute allowedRoles={['DOCTOR']}><ConsultationForm /></ProtectedRoute>
              } />
            </Routes>
          </main>
        </div>
      </BrowserRouter>
    </AuthProvider>
  );
}
