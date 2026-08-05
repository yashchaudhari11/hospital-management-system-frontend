import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Layout from './components/Layout';

// Public Pages
import Landing from './pages/Landing';
import Login from './pages/Login';
import Register from './pages/Register';

// Patient Pages
import PatientOverview from './pages/PatientOverview';
import BookAppointment from './pages/BookAppointment';
import PatientAppointments from './pages/PatientAppointments';
import MedicalTimeline from './pages/MedicalTimeline';
import PatientProfile from './pages/PatientProfile';

// Assistant Pages
import AssistantAppointments from './pages/AssistantAppointments';
import AssistantPatients from './pages/AssistantPatients';
import AssistantDoctors from './pages/AssistantDoctors';

// Doctor Pages
import DoctorAppointments from './pages/DoctorAppointments';
import DoctorConsultation from './pages/DoctorConsultation';
import DoctorPastConsults from './pages/DoctorPastConsults';
import DoctorAvailability from './pages/DoctorAvailability';

// Lab Pages
import LabDashboard from './pages/LabDashboard';

// Pharmacy Pages
import PharmacyPrescriptions from './pages/PharmacyPrescriptions';
import PharmacyInventory from './pages/PharmacyInventory';

// Admin Pages
import AdminStats from './pages/AdminStats';
import AdminStaff from './pages/AdminStaff';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="flex flex-col min-h-screen">
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<Landing />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />

            {/* Patient Protected Routes */}
            <Route
              path="/patient"
              element={
                <ProtectedRoute allowedRoles={['patient']}>
                  <Layout>
                    <PatientOverview />
                  </Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/patient/book"
              element={
                <ProtectedRoute allowedRoles={['patient']}>
                  <Layout>
                    <BookAppointment />
                  </Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/patient/appointments"
              element={
                <ProtectedRoute allowedRoles={['patient']}>
                  <Layout>
                    <PatientAppointments />
                  </Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/patient/timeline"
              element={
                <ProtectedRoute allowedRoles={['patient']}>
                  <Layout>
                    <MedicalTimeline />
                  </Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/patient/profile"
              element={
                <ProtectedRoute allowedRoles={['patient']}>
                  <Layout>
                    <PatientProfile />
                  </Layout>
                </ProtectedRoute>
              }
            />

            {/* Assistant Protected Routes */}
            <Route
              path="/assistant"
              element={
                <ProtectedRoute allowedRoles={['assistant']}>
                  <Layout>
                    <AssistantAppointments />
                  </Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/assistant/patients"
              element={
                <ProtectedRoute allowedRoles={['assistant']}>
                  <Layout>
                    <AssistantPatients />
                  </Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/assistant/patients/:patientId"
              element={
                <ProtectedRoute allowedRoles={['assistant']}>
                  <Layout>
                    <MedicalTimeline />
                  </Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/assistant/doctors"
              element={
                <ProtectedRoute allowedRoles={['assistant']}>
                  <Layout>
                    <AssistantDoctors />
                  </Layout>
                </ProtectedRoute>
              }
            />

            {/* Doctor Protected Routes */}
            <Route
              path="/doctor"
              element={
                <ProtectedRoute allowedRoles={['doctor']}>
                  <Layout>
                    <DoctorAppointments />
                  </Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/doctor/consult/:appointmentId"
              element={
                <ProtectedRoute allowedRoles={['doctor']}>
                  <Layout>
                    <DoctorConsultation />
                  </Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/doctor/history"
              element={
                <ProtectedRoute allowedRoles={['doctor']}>
                  <Layout>
                    <DoctorPastConsults />
                  </Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/doctor/patients/:patientId"
              element={
                <ProtectedRoute allowedRoles={['doctor']}>
                  <Layout>
                    <MedicalTimeline />
                  </Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/doctor/availability"
              element={
                <ProtectedRoute allowedRoles={['doctor']}>
                  <Layout>
                    <DoctorAvailability />
                  </Layout>
                </ProtectedRoute>
              }
            />

            {/* Lab Protected Routes */}
            <Route
              path="/lab"
              element={
                <ProtectedRoute allowedRoles={['lab']}>
                  <Layout>
                    <LabDashboard />
                  </Layout>
                </ProtectedRoute>
              }
            />

            {/* Pharmacy Protected Routes */}
            <Route
              path="/pharmacy"
              element={
                <ProtectedRoute allowedRoles={['pharmacy']}>
                  <Layout>
                    <PharmacyPrescriptions />
                  </Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/pharmacy/inventory"
              element={
                <ProtectedRoute allowedRoles={['pharmacy']}>
                  <Layout>
                    <PharmacyInventory />
                  </Layout>
                </ProtectedRoute>
              }
            />

            {/* Admin Protected Routes */}
            <Route
              path="/admin"
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <Layout>
                    <AdminStats />
                  </Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/staff"
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <Layout>
                    <AdminStaff />
                  </Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/patients"
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <Layout>
                    <AssistantPatients />
                  </Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/patients/:patientId"
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <Layout>
                    <MedicalTimeline />
                  </Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/inventory"
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <Layout>
                    <PharmacyInventory />
                  </Layout>
                </ProtectedRoute>
              }
            />

            {/* Fallback */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 4000,
              style: {
                background: '#fff',
                color: '#334155',
                border: '1px solid #e2e8f0',
                fontSize: '13px',
                fontFamily: 'Inter, sans-serif'
              }
            }}
          />
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
