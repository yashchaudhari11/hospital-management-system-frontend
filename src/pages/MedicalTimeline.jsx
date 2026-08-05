import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axiosInstance from '../api/axios';
import { useAuth } from '../context/AuthContext';
import Badge from '../components/ui/Badge';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/Card';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import EmptyState from '../components/ui/EmptyState';
import Modal from '../components/ui/Modal';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';
import { Table, THead, TBody, TR, TH, TD } from '../components/ui/Table';
import { Calendar, FileText, CheckCircle, Activity, ClipboardList, ShieldAlert, Download, HeartPulse, Plus, Trash } from 'lucide-react';
import { toast } from 'react-hot-toast';

const MedicalTimeline = ({ patientId: propPatientId }) => {
  const { user } = useAuth();
  const { patientId: paramPatientId } = useParams();
  const targetPatientId = propPatientId || paramPatientId || '';
  
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  // Prescription modal state for Doctor
  const [rxModalOpen, setRxModalOpen] = useState(false);
  const [selectedLabReport, setSelectedLabReport] = useState(null);
  const [medicines, setMedicines] = useState([{ name: '', dosage: '', frequency: '', duration: '', instructions: '' }]);
  const [submittingRx, setSubmittingRx] = useState(false);

  const fetchHistory = async () => {
    try {
      const url = targetPatientId ? `/patients/history/${targetPatientId}` : '/patients/history';
      const res = await axiosInstance.get(url);
      if (res.data.success) {
        setData(res.data);
      }
    } catch (err) {
      toast.error('Failed to load medical history timeline');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, [targetPatientId]);

  const openPrescribeModal = (report) => {
    setSelectedLabReport(report);
    setMedicines([{ name: '', dosage: '', frequency: '', duration: '', instructions: '' }]);
    setRxModalOpen(true);
  };

  const addMedicineRow = () => {
    setMedicines(prev => [...prev, { name: '', dosage: '', frequency: '', duration: '', instructions: '' }]);
  };

  const removeMedicineRow = (index) => {
    setMedicines(prev => prev.filter((_, idx) => idx !== index));
  };

  const handleMedicineChange = (index, field, value) => {
    setMedicines(prev => {
      const updated = [...prev];
      updated[index][field] = value;
      return updated;
    });
  };

  const handlePrescriptionSubmit = async (e) => {
    e.preventDefault();
    for (const med of medicines) {
      if (!med.name.trim()) {
        toast.error('Please specify medicine name for all entries');
        return;
      }
    }

    setSubmittingRx(true);
    const toastId = toast.loading('Issuing post-lab prescription...');
    try {
      const payload = {
        patientId: data?.patient?._id,
        consultationId: selectedLabReport?.details?.consultationId || null,
        medicines: medicines.map(m => ({
          name: m.name.trim(),
          dosage: m.dosage.trim() || 'As directed',
          frequency: m.frequency.trim() || 'As directed',
          duration: m.duration.trim() || 'As directed',
          instructions: m.instructions.trim()
        }))
      };

      const res = await axiosInstance.post('/prescriptions', payload);
      if (res.data.success) {
        toast.success('Prescription successfully created and sent to pharmacy!', { id: toastId });
        setRxModalOpen(false);
        fetchHistory(); // Refresh timeline
      } else {
        toast.error(res.data.message || 'Failed to issue prescription', { id: toastId });
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error issuing prescription', { id: toastId });
    } finally {
      setSubmittingRx(false);
    }
  };

  if (loading) return <LoadingSpinner size="lg" />;

  const timeline = data?.timeline || [];

  return (
    <div className="space-y-6">
      {/* Patient Header Summary */}
      <Card className="bg-white border-l-4 border-l-teal-700">
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row justify-between gap-6">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <HeartPulse className="h-5 w-5 text-teal-700" />
                <h2 className="text-lg font-bold text-slate-900">{data?.patient?.name}</h2>
              </div>
              <p className="text-xs text-slate-500">Email: {data?.patient?.email} | Phone: {data?.patient?.phone}</p>
              <p className="text-xs text-slate-500">Residential Address: {data?.profile?.address}</p>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
              <div className="bg-slate-50 p-2.5 rounded border border-slate-100">
                <span className="text-slate-400 block font-medium">Date of Birth</span>
                <span className="font-semibold text-slate-800">
                  {data?.profile?.dob ? new Date(data.profile.dob).toLocaleDateString() : 'N/A'}
                </span>
              </div>
              <div className="bg-slate-50 p-2.5 rounded border border-slate-100">
                <span className="text-slate-400 block font-medium">Blood Group</span>
                <span className="font-semibold text-slate-800">{data?.profile?.bloodGroup || 'N/A'}</span>
              </div>
              <div className="bg-slate-50 p-2.5 rounded border border-slate-100">
                <span className="text-slate-400 block font-medium">Gender</span>
                <span className="font-semibold text-slate-850 capitalize">{data?.profile?.gender || 'N/A'}</span>
              </div>
              <div className="bg-slate-50 p-2.5 rounded border border-slate-100 col-span-2 md:col-span-1">
                <span className="text-slate-400 block font-medium">Allergies Info</span>
                <span className={`font-semibold ${data?.profile?.allergies ? 'text-red-600' : 'text-slate-800'}`}>
                  {data?.profile?.allergies || 'None'}
                </span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <h3 className="text-base font-bold text-slate-900 tracking-wide uppercase border-b border-slate-200 pb-2">Unified Chronological Medical Record</h3>

      {timeline.length > 0 ? (
        <div className="relative border-l-2 border-slate-200 ml-4 md:ml-6 space-y-8 py-2">
          {timeline.map((event) => {
            const date = new Date(event.date);
            const dateFormatted = date.toLocaleDateString(undefined, {
              month: 'long',
              day: 'numeric',
              year: 'numeric'
            });
            const timeFormatted = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

            return (
              <div key={event.id} className="relative pl-8 md:pl-10">
                {/* Timeline Icon Marker */}
                <span className="absolute -left-4 top-2 flex h-8 w-8 items-center justify-center rounded-full bg-white border-2 border-slate-300 ring-8 ring-slate-50">
                  {event.type === 'registration' && <CheckCircle className="h-4 w-4 text-emerald-600" />}
                  {event.type === 'appointment' && <Calendar className="h-4 w-4 text-amber-600" />}
                  {event.type === 'consultation' && <ClipboardList className="h-4 w-4 text-teal-700" />}
                  {event.type === 'prescription' && <FileText className="h-4 w-4 text-purple-600" />}
                  {event.type === 'lab_report' && <Activity className="h-4 w-4 text-blue-600" />}
                </span>

                {/* Event Card */}
                <Card className="bg-white hover:border-slate-300 transition-colors">
                  <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-slate-100 pb-3 mb-4 gap-2">
                    <div>
                      <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400">
                        {event.type.replace('_', ' ')}
                      </span>
                      <h4 className="text-sm font-bold text-slate-900 mt-0.5">{event.title}</h4>
                    </div>
                    <div className="text-left md:text-right text-[11px] text-slate-400">
                      <p className="font-medium">{dateFormatted}</p>
                      <p>{timeFormatted}</p>
                    </div>
                  </div>

                  <CardContent className="text-xs text-slate-700 space-y-3">
                    
                    {/* 1. Registration Detail */}
                    {event.type === 'registration' && (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <p><span className="font-semibold text-slate-600">Registered Name:</span> {event.details.name}</p>
                          <p className="mt-1"><span className="font-semibold text-slate-600">Contact Phone:</span> {event.details.phone}</p>
                          <p className="mt-1"><span className="font-semibold text-slate-600">Contact Email:</span> {event.details.email}</p>
                        </div>
                        <div>
                          <p><span className="font-semibold text-slate-600">Initial Blood Group:</span> {event.details.bloodGroup || 'Not entered'}</p>
                          <p className="mt-1"><span className="font-semibold text-slate-600">Initial Allergy Warnings:</span> {event.details.allergies || 'None'}</p>
                        </div>
                      </div>
                    )}

                    {/* 2. Appointment Detail */}
                    {event.type === 'appointment' && (
                      <div className="space-y-2">
                        <div className="flex items-center gap-3">
                          <span className="font-semibold text-slate-600">Physician:</span>
                          <span>{event.details.doctorName}</span>
                          <Badge className="ml-2" status={event.details.status}>{event.details.status.replace('_', ' ')}</Badge>
                        </div>
                        <p><span className="font-semibold text-slate-600">Stated Symptoms:</span> "{event.details.symptoms}"</p>
                        <p><span className="font-semibold text-slate-600">Scheduled slot:</span> {new Date(event.details.preferredDate).toLocaleString()}</p>
                        {event.details.rejectionReason && (
                          <div className="mt-2 bg-red-50 text-red-800 p-2.5 rounded border border-red-100 flex items-start gap-2">
                            <ShieldAlert className="h-4 w-4 shrink-0 mt-0.5" />
                            <div>
                              <span className="font-bold block text-[10px] uppercase">Rejection Reason</span>
                              {event.details.rejectionReason}
                            </div>
                          </div>
                        )}
                      </div>
                    )}

                    {/* 3. Consultation Detail */}
                    {event.type === 'consultation' && (
                      <div className="space-y-2">
                        <p><span className="font-semibold text-slate-600">Attending Doctor:</span> {event.details.doctorName}</p>
                        <div className="bg-slate-50 p-3 rounded border border-slate-200">
                          <span className="font-bold text-[10px] text-teal-800 uppercase block mb-1">Clinical Diagnosis</span>
                          <p className="font-medium text-slate-900 text-sm">{event.details.diagnosis}</p>
                          <span className="font-bold text-[10px] text-teal-800 uppercase block mt-3 mb-1">Clinical Assessment Notes</span>
                          <p className="text-slate-700 whitespace-pre-line leading-relaxed">{event.details.notes}</p>
                        </div>
                      </div>
                    )}

                    {/* 4. Prescription Detail */}
                    {event.type === 'prescription' && (
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <p><span className="font-semibold text-slate-600">Prescribing Doctor:</span> {event.details.doctorName}</p>
                          <Badge status={event.details.status === 'dispensed' ? 'dispensed' : 'pending'}>
                            {event.details.status.toUpperCase()}
                          </Badge>
                        </div>
                        
                        <Table>
                          <THead>
                            <TR>
                              <TH>Medicine Name</TH>
                              <TH>Dosage</TH>
                              <TH>Frequency</TH>
                              <TH>Duration</TH>
                              <TH>Instructions</TH>
                            </TR>
                          </THead>
                          <TBody>
                            {event.details.medicines.map((med, idx) => (
                              <TR key={idx}>
                                <TD className="font-medium text-slate-800">{med.name}</TD>
                                <TD>{med.dosage}</TD>
                                <TD>{med.frequency}</TD>
                                <TD>{med.duration}</TD>
                                <TD className="italic text-slate-555">{med.instructions || 'N/A'}</TD>
                              </TR>
                            ))}
                          </TBody>
                        </Table>

                        {event.details.status === 'dispensed' && (
                          <p className="text-[10px] text-slate-450 text-right italic mt-2">
                            Dispensed by pharmacy ({event.details.dispensedBy}) on {new Date(event.details.dispensedAt).toLocaleString()}
                          </p>
                        )}
                      </div>
                    )}

                    {/* 5. Lab Report Detail */}
                    {event.type === 'lab_report' && (
                      <div className="space-y-3">
                        <div className="flex justify-between items-start gap-2">
                          <div>
                            <p><span className="font-semibold text-slate-600">Requesting Doctor:</span> {event.details.doctorName}</p>
                            <p className="mt-1"><span className="font-semibold text-slate-600">Laboratory Attendant:</span> {event.details.uploadedBy}</p>
                          </div>
                          {event.details.fileUrl && (
                            <a
                              href={`http://localhost:5000${event.details.fileUrl}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 border border-slate-300 rounded text-slate-700 bg-white hover:bg-slate-50 font-semibold cursor-pointer shadow-xs"
                            >
                              <Download className="h-3.5 w-3.5" /> PDF/Attachment
                            </a>
                          )}
                        </div>

                        <div className="bg-slate-50 p-3 rounded border border-slate-200 space-y-3">
                          <div>
                            <span className="font-bold text-[10px] text-blue-800 uppercase block mb-1">Diagnostic Summary</span>
                            <p className="font-medium text-slate-900">{event.details.resultSummary}</p>
                          </div>
                          
                          {/* Structured Results Display */}
                          {Object.keys(event.details.structuredResults || {}).length > 0 && (
                            <div>
                              <span className="font-bold text-[10px] text-blue-800 uppercase block mb-1">Structured Lab Findings</span>
                              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                                {Object.entries(event.details.structuredResults).map(([key, val]) => (
                                  <div key={key} className="bg-white p-2 rounded border border-slate-100">
                                    <span className="text-[10px] text-slate-450 block font-medium uppercase">{key.replace('_', ' ')}</span>
                                    <span className="font-semibold text-slate-800">{String(val)}</span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>

                        {/* Doctor Action: Prescribe Medicines after reviewing Lab Report */}
                        {user?.role === 'doctor' && (
                          <div className="pt-2 flex justify-end">
                            <Button
                              variant="primary"
                              onClick={() => openPrescribeModal(event)}
                              className="px-3 py-1.5 text-xs font-semibold cursor-pointer"
                            >
                              <FileText className="h-3.5 w-3.5 mr-1" />
                              Issue Post-Lab Prescription
                            </Button>
                          </div>
                        )}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            );
          })}
        </div>
      ) : (
        <EmptyState
          message="No timeline history found"
          description="Schedule a visit or complete registrations to aggregate patient data."
        />
      )}

      {/* Prescription Issue Modal for Doctor */}
      <Modal
        isOpen={rxModalOpen}
        onClose={() => setRxModalOpen(false)}
        title="Issue Post-Lab Medicine Prescription"
        footerActions={
          <>
            <Button variant="outline" onClick={() => setRxModalOpen(false)} disabled={submittingRx} className="cursor-pointer">
              Cancel
            </Button>
            <Button variant="primary" onClick={handlePrescriptionSubmit} disabled={submittingRx} className="cursor-pointer">
              {submittingRx ? 'Submitting...' : 'Issue Prescription'}
            </Button>
          </>
        }
      >
        <form onSubmit={handlePrescriptionSubmit} className="space-y-4">
          <div className="bg-blue-50 p-3 rounded border border-blue-150 text-xs text-blue-900">
            <p className="font-bold text-[11px] uppercase">Lab Report Reference</p>
            <p className="mt-0.5"><span className="font-semibold">Test:</span> {selectedLabReport?.title}</p>
            <p><span className="font-semibold">Diagnostic Summary:</span> "{selectedLabReport?.details?.resultSummary}"</p>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between border-b border-slate-100 pb-1">
              <h4 className="text-xs font-bold text-teal-850 uppercase tracking-wider flex items-center gap-1.5">
                <FileText className="h-4 w-4" /> Prescribe Medicines
              </h4>
              <button
                type="button"
                onClick={addMedicineRow}
                disabled={submittingRx}
                className="inline-flex items-center gap-1 px-2 py-1 text-xs font-semibold rounded bg-teal-50 text-teal-700 hover:bg-teal-100 border border-teal-200 cursor-pointer"
              >
                <Plus className="h-3.5 w-3.5" /> Add Row
              </button>
            </div>

            {medicines.map((med, idx) => (
              <div key={idx} className="bg-slate-50 p-3 rounded border border-slate-200 relative space-y-3 text-xs">
                {medicines.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeMedicineRow(idx)}
                    className="absolute right-2 top-2 text-slate-400 hover:text-red-600 cursor-pointer"
                  >
                    <Trash className="h-4 w-4" />
                  </button>
                )}
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pr-6">
                  <Input
                    label="Medicine Name"
                    id={`modal-med-name-${idx}`}
                    type="text"
                    placeholder="e.g. Amoxicillin 250mg"
                    value={med.name}
                    onChange={(e) => handleMedicineChange(idx, 'name', e.target.value)}
                    disabled={submittingRx}
                    required
                  />
                  <Input
                    label="Dosage"
                    id={`modal-med-dosage-${idx}`}
                    type="text"
                    placeholder="e.g. 1 Tablet"
                    value={med.dosage}
                    onChange={(e) => handleMedicineChange(idx, 'dosage', e.target.value)}
                    disabled={submittingRx}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pr-6">
                  <Input
                    label="Frequency"
                    id={`modal-med-freq-${idx}`}
                    type="text"
                    placeholder="e.g. Twice daily"
                    value={med.frequency}
                    onChange={(e) => handleMedicineChange(idx, 'frequency', e.target.value)}
                    disabled={submittingRx}
                  />
                  <Input
                    label="Duration"
                    id={`modal-med-dur-${idx}`}
                    type="text"
                    placeholder="e.g. 5 days"
                    value={med.duration}
                    onChange={(e) => handleMedicineChange(idx, 'duration', e.target.value)}
                    disabled={submittingRx}
                  />
                  <Input
                    label="Instructions"
                    id={`modal-med-inst-${idx}`}
                    type="text"
                    placeholder="e.g. After food"
                    value={med.instructions}
                    onChange={(e) => handleMedicineChange(idx, 'instructions', e.target.value)}
                    disabled={submittingRx}
                  />
                </div>
              </div>
            ))}
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default MedicalTimeline;

