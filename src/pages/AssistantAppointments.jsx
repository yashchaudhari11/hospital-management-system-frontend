import React, { useState, useEffect } from 'react';
import axiosInstance from '../api/axios';
import { Table, THead, TBody, TR, TH, TD } from '../components/ui/Table';
import Badge from '../components/ui/Badge';
import Button from '../components/ui/Button';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/Card';
import Modal from '../components/ui/Modal';
import Select from '../components/ui/Select';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import EmptyState from '../components/ui/EmptyState';
import { Calendar, UserCheck, RefreshCw } from 'lucide-react';
import { toast } from 'react-hot-toast';

const AssistantAppointments = () => {
  const [appointments, setAppointments] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('all');

  // Assign Modal States
  const [assignModalOpen, setAssignModalOpen] = useState(false);
  const [selectedApt, setSelectedApt] = useState(null);
  const [selectedDoctorId, setSelectedDoctorId] = useState('');
  const [specializations, setSpecializations] = useState([]);
  const [filterSpec, setFilterSpec] = useState('');
  const [assigning, setAssigning] = useState(false);

  const fetchAppointments = async () => {
    try {
      const res = await axiosInstance.get('/appointments/list');
      if (res.data.success) {
        setAppointments(res.data.data);
      }
    } catch (err) {
      toast.error('Failed to load clinic appointments');
    }
  };

  const fetchDoctors = async () => {
    try {
      const res = await axiosInstance.get('/doctors/list');
      if (res.data.success) {
        setDoctors(res.data.data);
        const specs = new Set(res.data.data.map(doc => doc.profile?.specialization).filter(Boolean));
        setSpecializations(Array.from(specs));
      }
    } catch (err) {
      toast.error('Failed to load doctor roster');
    }
  };

  useEffect(() => {
    const initData = async () => {
      setLoading(true);
      await Promise.all([fetchAppointments(), fetchDoctors()]);
      setLoading(false);
    };
    initData();
  }, []);

  const openAssignModal = (apt) => {
    setSelectedApt(apt);
    setSelectedDoctorId(apt.doctor?._id || '');
    setFilterSpec(apt.doctor?.profile?.specialization || '');
    setAssignModalOpen(true);
  };

  const handleAssignSubmit = async () => {
    if (!selectedDoctorId) {
      toast.error('Please select a physician to assign');
      return;
    }

    setAssigning(true);
    const toastId = toast.loading('Assigning physician to slot...');
    try {
      const res = await axiosInstance.post('/appointments/assign', {
        appointmentId: selectedApt._id,
        doctorId: selectedDoctorId
      });
      if (res.data.success) {
        toast.success('Physician assigned successfully!', { id: toastId });
        setAssignModalOpen(false);
        fetchAppointments(); // Refresh queue
      } else {
        toast.error(res.data.message || 'Assignment failed', { id: toastId });
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error occurred during assignment', { id: toastId });
    } finally {
      setAssigning(false);
    }
  };

  // Filter queue items
  const filteredAppointments = appointments.filter(apt => {
    if (filterStatus === 'all') return true;
    return apt.status === filterStatus;
  });

  // Filter doctor options in modal
  const filteredDoctors = doctors.filter(doc => {
    if (!filterSpec) return true;
    return doc.profile?.specialization === filterSpec;
  });

  if (loading) return <LoadingSpinner size="lg" />;

  return (
    <div className="space-y-6">
      {/* Filters Card */}
      <Card>
        <CardContent className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4">
          <div className="flex flex-wrap gap-2">
            {[
              { label: 'All Bookings', value: 'all' },
              { label: 'Pending Assignment', value: 'pending_assignment' },
              { label: 'Pending Approval', value: 'pending_approval' },
              { label: 'Approved Visit', value: 'approved' },
              { label: 'Consulted/Completed', value: 'completed' },
              { label: 'Rejected', value: 'rejected' }
            ].map(btn => (
              <button
                key={btn.value}
                onClick={() => setFilterStatus(btn.value)}
                className={`px-3 py-1.5 text-xs font-semibold rounded-md border transition-all cursor-pointer ${
                  filterStatus === btn.value
                    ? 'bg-teal-700 text-white border-teal-700'
                    : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                }`}
              >
                {btn.label}
              </button>
            ))}
          </div>

          <Button variant="secondary" onClick={fetchAppointments} className="cursor-pointer">
            <RefreshCw className="h-4 w-4 mr-2" /> Refresh Data
          </Button>
        </CardContent>
      </Card>

      {/* Main Table */}
      <Card>
        <CardHeader>
          <CardTitle>Appointments Management Board</CardTitle>
          <p className="text-xs text-slate-500 mt-1">Select and assign qualified doctors to pending patient requests.</p>
        </CardHeader>
        <CardContent>
          {filteredAppointments.length > 0 ? (
            <Table>
              <THead>
                <TR>
                  <TH>Scheduled Time</TH>
                  <TH>Patient Details</TH>
                  <TH>Symptoms Submitted</TH>
                  <TH>Assigned Physician</TH>
                  <TH>Status</TH>
                  <TH className="text-right">Coordinator Action</TH>
                </TR>
              </THead>
              <TBody>
                {filteredAppointments.map((apt) => (
                  <TR key={apt._id}>
                    <TD className="font-semibold text-slate-900 text-xs">
                      {new Date(apt.preferredDate).toLocaleString(undefined, {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </TD>
                    <TD>
                      <p className="font-semibold text-slate-800 text-xs">{apt.patient?.name}</p>
                      <p className="text-[10px] text-slate-400">Phone: {apt.patient?.phone}</p>
                    </TD>
                    <TD className="max-w-xs truncate text-xs text-slate-600">
                      "{apt.symptoms}"
                    </TD>
                    <TD>
                      {apt.doctor ? (
                        <div>
                          <p className="font-medium text-slate-800 text-xs">{apt.doctor.name}</p>
                          <p className="text-[10px] text-slate-450">{apt.doctor.profile?.specialization}</p>
                        </div>
                      ) : (
                        <span className="text-amber-700 italic text-[11px] font-medium bg-amber-50 px-2 py-0.5 rounded border border-amber-100">
                          Awaiting Doctor
                        </span>
                      )}
                    </TD>
                    <TD>
                      <Badge status={apt.status}>{apt.status.replace('_', ' ')}</Badge>
                    </TD>
                    <TD className="text-right">
                      {(apt.status === 'pending_assignment' || apt.status === 'pending_approval' || apt.status === 'approved') && (
                        <Button
                          variant={apt.doctor ? 'secondary' : 'primary'}
                          onClick={() => openAssignModal(apt)}
                          className="px-2.5 py-1.5 text-xs font-semibold cursor-pointer"
                        >
                          <UserCheck className="h-3.5 w-3.5 mr-1" />
                          {apt.doctor ? 'Reassign' : 'Assign'}
                        </Button>
                      )}
                    </TD>
                  </TR>
                ))}
              </TBody>
            </Table>
          ) : (
            <EmptyState
              message="No appointments in this category"
              description="No booking entries found matching this status filter."
              icon={Calendar}
            />
          )}
        </CardContent>
      </Card>

      {/* Doctor Assignment Modal */}
      <Modal
        isOpen={assignModalOpen}
        onClose={() => setAssignModalOpen(false)}
        title={selectedApt?.doctor ? 'Reassign Doctor' : 'Assign Doctor to Appointment'}
        footerActions={
          <>
            <Button variant="outline" onClick={() => setAssignModalOpen(false)} disabled={assigning} className="cursor-pointer">
              Cancel
            </Button>
            <Button variant="primary" onClick={handleAssignSubmit} disabled={assigning || !selectedDoctorId} className="cursor-pointer">
              {assigning ? 'Assigning...' : 'Confirm Assignment'}
            </Button>
          </>
        }
      >
        {selectedApt && (
          <div className="space-y-4">
            <div className="bg-slate-50 p-4 border border-slate-200 rounded-md text-xs space-y-1">
              <p><span className="font-semibold text-slate-600">Patient:</span> {selectedApt.patient?.name}</p>
              <p><span className="font-semibold text-slate-600">Preferred Date:</span> {new Date(selectedApt.preferredDate).toLocaleString()}</p>
              <p><span className="font-semibold text-slate-600">Reported Concerns:</span> "{selectedApt.symptoms}"</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Select
                label="Filter by Medical Department"
                id="filterSpec"
                value={filterSpec}
                onChange={(e) => setFilterSpec(e.target.value)}
              >
                <option value="">All Departments</option>
                {specializations.map(spec => (
                  <option key={spec} value={spec}>{spec}</option>
                ))}
              </Select>

              <Select
                label="Assign Physician"
                id="selectedDoctorId"
                value={selectedDoctorId}
                onChange={(e) => setSelectedDoctorId(e.target.value)}
              >
                <option value="">-- Choose Doctor --</option>
                {filteredDoctors.map(doc => (
                  <option key={doc._id} value={doc._id}>
                    {doc.name} ({doc.profile?.specialization} - {doc.profile?.availability})
                  </option>
                ))}
              </Select>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default AssistantAppointments;
