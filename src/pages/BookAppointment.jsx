import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../api/axios';
import Input from '../components/ui/Input';
import Select from '../components/ui/Select';
import Button from '../components/ui/Button';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/Card';
import { toast } from 'react-hot-toast';
import LoadingSpinner from '../components/ui/LoadingSpinner';

const BookAppointment = () => {
  const navigate = useNavigate();
  const [doctors, setDoctors] = useState([]);
  const [specializations, setSpecializations] = useState([]);
  const [selectedSpecialization, setSelectedSpecialization] = useState('');
  const [filteredDoctors, setFilteredDoctors] = useState([]);
  
  const [selectedDoctorId, setSelectedDoctorId] = useState('');
  const [symptoms, setSymptoms] = useState('');
  const [preferredDate, setPreferredDate] = useState('');
  const [loadingDoctors, setLoadingDoctors] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        const res = await axiosInstance.get('/doctors/list');
        if (res.data.success) {
          setDoctors(res.data.data);
          
          // Extract unique specializations
          const specs = new Set(res.data.data.map(doc => doc.profile?.specialization).filter(Boolean));
          setSpecializations(Array.from(specs));
        }
      } catch (err) {
        toast.error('Failed to load clinic doctor roster');
      } finally {
        setLoadingDoctors(false);
      }
    };
    fetchDoctors();
  }, []);

  // Filter doctors based on chosen specialization
  useEffect(() => {
    if (selectedSpecialization) {
      const filtered = doctors.filter(doc => doc.profile?.specialization === selectedSpecialization);
      setFilteredDoctors(filtered);
      // Reset selected doctor since list changed
      setSelectedDoctorId('');
    } else {
      setFilteredDoctors([]);
      setSelectedDoctorId('');
    }
  }, [selectedSpecialization, doctors]);

  const validate = () => {
    const tempErrors = {};
    if (!symptoms.trim()) {
      tempErrors.symptoms = 'Please describe your clinical symptoms';
    }
    if (!preferredDate) {
      tempErrors.preferredDate = 'Please select a preferred date and time';
    } else {
      const selected = new Date(preferredDate);
      if (selected < new Date()) {
        tempErrors.preferredDate = 'Appointment date cannot be in the past';
      }
    }
    setErrors(tempErrors);
    return Object.keys(tempErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setSubmitting(true);
    const toastId = toast.loading('Scheduling appointment request...');

    try {
      const payload = {
        symptoms,
        preferredDate,
        doctorId: selectedDoctorId || null
      };

      const res = await axiosInstance.post('/appointments/book', payload);
      if (res.data.success) {
        toast.success('Appointment scheduled successfully!', { id: toastId });
        navigate('/patient/appointments');
      } else {
        toast.error(res.data.message || 'Booking failed', { id: toastId });
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to submit booking', { id: toastId });
    } finally {
      setSubmitting(false);
    }
  };

  if (loadingDoctors) return <LoadingSpinner size="lg" />;

  return (
    <div className="max-w-2xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle>Schedule Consultation Visit</CardTitle>
          <p className="text-xs text-slate-500 mt-1">Please enter your health concerns and select a slot or a physician.</p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            
            {/* Specialization and Doctor Selector */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Select
                label="Department Specialization (Optional)"
                id="specialization"
                value={selectedSpecialization}
                onChange={(e) => setSelectedSpecialization(e.target.value)}
                disabled={submitting}
              >
                <option value="">No preference (All departments)</option>
                {specializations.map(spec => (
                  <option key={spec} value={spec}>{spec}</option>
                ))}
              </Select>

              <Select
                label="Select Physician (Optional)"
                id="doctorId"
                value={selectedDoctorId}
                onChange={(e) => setSelectedDoctorId(e.target.value)}
                disabled={submitting}
              >
                <option value="">Assign Automatically (Unassigned)</option>
                {selectedSpecialization ? (
                  filteredDoctors.map(doc => (
                    <option key={doc._id} value={doc._id}>
                      {doc.name} - ({doc.profile?.qualifications})
                    </option>
                  ))
                ) : (
                  doctors.map(doc => (
                    <option key={doc._id} value={doc._id}>
                      {doc.name} - {doc.profile?.specialization} ({doc.profile?.qualifications})
                    </option>
                  ))
                )}
              </Select>
            </div>

            {/* Date Picker */}
            <Input
              label="Preferred Date and Time"
              id="preferredDate"
              type="datetime-local"
              value={preferredDate}
              onChange={(e) => setPreferredDate(e.target.value)}
              error={errors.preferredDate}
              disabled={submitting}
            />

            {/* Symptoms Text Box */}
            <div className="flex flex-col gap-1.5">
              <label htmlFor="symptoms" className="text-xs font-semibold text-slate-700">
                Symptoms & Concerns
              </label>
              <textarea
                id="symptoms"
                rows={4}
                className="px-3 py-2 border border-slate-300 rounded-md text-sm bg-white text-slate-800 focus:outline-none focus:ring-1 focus:ring-teal-600 focus:border-teal-600 shadow-sm placeholder-slate-400 disabled:bg-slate-50 disabled:text-slate-450"
                placeholder="Describe current symptoms or reason for scheduling..."
                value={symptoms}
                onChange={(e) => setSymptoms(e.target.value)}
                disabled={submitting}
              />
              {errors.symptoms && <span className="text-xs text-red-600 mt-0.5">{errors.symptoms}</span>}
            </div>

            <Button
              type="submit"
              variant="primary"
              className="w-full mt-4 cursor-pointer"
              disabled={submitting}
            >
              {submitting ? 'Submitting Schedule Request...' : 'Confirm Appointment Request'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default BookAppointment;
