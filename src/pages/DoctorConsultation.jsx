import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axiosInstance from '../api/axios';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/Card';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import MedicalTimeline from './MedicalTimeline';
import { toast } from 'react-hot-toast';
import { Plus, Trash, Activity, FileText } from 'lucide-react';

const DoctorConsultation = () => {
  const { appointmentId } = useParams();
  const navigate = useNavigate();

  const [appointment, setAppointment] = useState(null);
  const [loadingApt, setLoadingApt] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Form States
  const [diagnosis, setDiagnosis] = useState('');
  const [notes, setNotes] = useState('');
  
  // Medicines array: [{ name, dosage, frequency, duration, instructions }]
  const [medicines, setMedicines] = useState([]);
  
  // Lab tests: list of strings
  const [labTests, setLabTests] = useState([]);
  const [newLabTest, setNewLabTest] = useState('');

  useEffect(() => {
    const fetchAppointmentDetail = async () => {
      try {
        const res = await axiosInstance.get('/appointments/list');
        if (res.data.success) {
          const found = res.data.data.find(apt => apt._id === appointmentId);
          if (found) {
            setAppointment(found);
          } else {
            toast.error('Appointment not found');
            navigate('/doctor');
          }
        }
      } catch (err) {
        toast.error('Failed to load appointment details');
      } finally {
        setLoadingApt(false);
      }
    };
    fetchAppointmentDetail();
  }, [appointmentId, navigate]);

  const addMedicineRow = () => {
    setMedicines((prev) => [
      ...prev,
      { name: '', dosage: '', frequency: '', duration: '', instructions: '' }
    ]);
  };

  const removeMedicineRow = (index) => {
    setMedicines((prev) => prev.filter((_, idx) => idx !== index));
  };

  const handleMedicineChange = (index, field, value) => {
    setMedicines((prev) => {
      const updated = [...prev];
      updated[index][field] = value;
      return updated;
    });
  };

  const addLabTestItem = () => {
    if (!newLabTest.trim()) return;
    setLabTests((prev) => [...prev, newLabTest.trim()]);
    setNewLabTest('');
  };

  const removeLabTestItem = (index) => {
    setLabTests((prev) => prev.filter((_, idx) => idx !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!diagnosis.trim()) {
      toast.error('Please enter a clinical diagnosis');
      return;
    }
    if (!notes.trim()) {
      toast.error('Please enter consultation notes');
      return;
    }

    // Verify medicines don't have blank names
    for (const med of medicines) {
      if (!med.name.trim()) {
        toast.error('Medicine entries must have a name');
        return;
      }
    }

    setSubmitting(true);
    const toastId = toast.loading('Saving consultation records...');

    try {
      const payload = {
        appointmentId,
        diagnosis,
        notes,
        medicines: medicines.map(med => ({
          name: med.name.trim(),
          dosage: med.dosage.trim() || 'N/A',
          frequency: med.frequency.trim() || 'N/A',
          duration: med.duration.trim() || 'N/A',
          instructions: med.instructions.trim()
        })),
        labTests: labTests.filter(t => t.trim())
      };

      const res = await axiosInstance.post('/consultations/create', payload);
      if (res.data.success) {
        toast.success('Consultation logged and updated successfully!', { id: toastId });
        navigate('/doctor');
      } else {
        toast.error(res.data.message || 'Failed to save', { id: toastId });
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error occurred saving consultation', { id: toastId });
    } finally {
      setSubmitting(false);
    }
  };

  if (loadingApt) return <LoadingSpinner size="lg" />;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Consultation Assessment Session</h2>
          <p className="text-xs text-slate-500 mt-1">Patient: <strong className="text-slate-800">{appointment?.patient?.name}</strong> | Age: {appointment?.patient?.dob ? new Date().getFullYear() - new Date(appointment.patient.dob).getFullYear() : 'N/A'}</p>
        </div>
        <Button variant="outline" onClick={() => navigate('/doctor')} disabled={submitting} className="cursor-pointer">
          Back to List
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
        {/* Left column: Patient History Timeline */}
        <div className="space-y-4 max-h-[85vh] overflow-y-auto pr-2 border-r border-slate-200">
          <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider pb-1">Patient Historical Chart</h3>
          {appointment?.patient?._id && (
            <MedicalTimeline patientId={appointment.patient._id} />
          )}
        </div>

        {/* Right column: Form */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Log Clinical Findings</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                
                {/* Symptoms info */}
                <div className="bg-slate-50 p-3.5 border border-slate-200 rounded-md text-xs">
                  <span className="font-bold text-[10px] text-teal-800 uppercase block mb-1">Stated symptoms at booking</span>
                  <p className="italic text-slate-700">"{appointment?.symptoms}"</p>
                </div>

                {/* Diagnosis */}
                <Input
                  label="Clinical Diagnosis"
                  id="diagnosis"
                  type="text"
                  placeholder="e.g. Acute Pharyngitis, Type 2 Diabetes"
                  value={diagnosis}
                  onChange={(e) => setDiagnosis(e.target.value)}
                  disabled={submitting}
                  required
                />

                {/* Notes */}
                <div className="flex flex-col gap-1.5">
                  <label htmlFor="notes" className="text-xs font-semibold text-slate-700">
                    Clinical Assessment Notes
                  </label>
                  <textarea
                    id="notes"
                    rows={4}
                    className="px-3 py-2 border border-slate-300 rounded-md text-sm bg-white text-slate-850 focus:outline-none focus:ring-1 focus:ring-teal-600 focus:border-teal-600 shadow-sm placeholder-slate-400"
                    placeholder="Enter patient assessment notes and instructions..."
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    disabled={submitting}
                    required
                  />
                </div>

                {/* Prescriptions Dynamic Sub-form */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-1">
                    <h4 className="text-xs font-bold text-teal-850 uppercase tracking-wider flex items-center gap-1.5">
                      <FileText className="h-4 w-4" /> Prescribe Medicines
                    </h4>
                    <button
                      type="button"
                      onClick={addMedicineRow}
                      disabled={submitting}
                      className="inline-flex items-center justify-center gap-1 px-2.5 py-1.5 text-xs font-semibold rounded bg-teal-50 text-teal-700 hover:bg-teal-100 transition-colors border border-teal-200 cursor-pointer"
                    >
                      <Plus className="h-3.5 w-3.5" /> Add Medicine
                    </button>
                  </div>

                  {medicines.length > 0 ? (
                    <div className="space-y-4">
                      {medicines.map((med, idx) => (
                        <div key={idx} className="bg-slate-50 p-3 rounded border border-slate-200 relative space-y-3">
                          <button
                            type="button"
                            onClick={() => removeMedicineRow(idx)}
                            className="absolute right-2 top-2 text-slate-400 hover:text-red-600 cursor-pointer"
                          >
                            <Trash className="h-4 w-4" />
                          </button>
                          
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pr-6">
                            <Input
                              label="Medicine Name"
                              id={`med-name-${idx}`}
                              type="text"
                              placeholder="e.g. Paracetamol"
                              value={med.name}
                              onChange={(e) => handleMedicineChange(idx, 'name', e.target.value)}
                              disabled={submitting}
                            />
                            <Input
                              label="Dosage"
                              id={`med-dosage-${idx}`}
                              type="text"
                              placeholder="e.g. 500mg"
                              value={med.dosage}
                              onChange={(e) => handleMedicineChange(idx, 'dosage', e.target.value)}
                              disabled={submitting}
                            />
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pr-6">
                            <Input
                              label="Frequency"
                              id={`med-freq-${idx}`}
                              type="text"
                              placeholder="e.g. Twice daily"
                              value={med.frequency}
                              onChange={(e) => handleMedicineChange(idx, 'frequency', e.target.value)}
                              disabled={submitting}
                            />
                            <Input
                              label="Duration"
                              id={`med-dur-${idx}`}
                              type="text"
                              placeholder="e.g. 5 days"
                              value={med.duration}
                              onChange={(e) => handleMedicineChange(idx, 'duration', e.target.value)}
                              disabled={submitting}
                            />
                            <Input
                              label="Special Instructions"
                              id={`med-inst-${idx}`}
                              type="text"
                              placeholder="e.g. After food"
                              value={med.instructions}
                              onChange={(e) => handleMedicineChange(idx, 'instructions', e.target.value)}
                              disabled={submitting}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-[11px] text-slate-450 italic">No medicines prescribed for this consultation yet.</p>
                  )}
                </div>

                {/* Lab Recommendation Sub-form */}
                <div className="space-y-3">
                  <div className="border-b border-slate-100 pb-1">
                    <h4 className="text-xs font-bold text-teal-850 uppercase tracking-wider flex items-center gap-1.5">
                      <Activity className="h-4 w-4" /> Recommend Laboratory Tests
                    </h4>
                  </div>
                  
                  <div className="flex gap-2">
                    <Input
                      id="newLabTest"
                      type="text"
                      placeholder="e.g. CBC Blood Count, Lipid Profile"
                      value={newLabTest}
                      onChange={(e) => setNewLabTest(e.target.value)}
                      disabled={submitting}
                    />
                    <Button
                      type="button"
                      variant="secondary"
                      onClick={addLabTestItem}
                      disabled={submitting}
                      className="shrink-0 cursor-pointer"
                    >
                      Add Test
                    </Button>
                  </div>

                  {labTests.length > 0 ? (
                    <div className="flex flex-wrap gap-2 pt-1">
                      {labTests.map((test, idx) => (
                        <span
                          key={idx}
                          className="inline-flex items-center px-2.5 py-1 bg-blue-50 text-blue-800 rounded border border-blue-150 text-xs font-medium gap-1"
                        >
                          {test}
                          <button
                            type="button"
                            onClick={() => removeLabTestItem(idx)}
                            className="text-blue-400 hover:text-red-600 font-bold ml-1 cursor-pointer"
                          >
                            &times;
                          </button>
                        </span>
                      ))}
                    </div>
                  ) : (
                    <p className="text-[11px] text-slate-450 italic">No laboratory diagnostic tests recommended.</p>
                  )}
                </div>

                <Button
                  type="submit"
                  variant="primary"
                  className="w-full mt-6 cursor-pointer"
                  disabled={submitting}
                >
                  {submitting ? 'Saving Consult records...' : 'Complete Consultation & Log Records'}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default DoctorConsultation;
