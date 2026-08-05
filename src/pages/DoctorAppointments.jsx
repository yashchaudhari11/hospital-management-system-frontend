import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../api/axios';
import { Table, THead, TBody, TR, TH, TD } from '../components/ui/Table';
import Badge from '../components/ui/Badge';
import Button from '../components/ui/Button';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/Card';
import Modal from '../components/ui/Modal';
import Input from '../components/ui/Input';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import EmptyState from '../components/ui/EmptyState';
import { Calendar, Check, X, FileEdit } from 'lucide-react';
import { toast } from 'react-hot-toast';

const DoctorAppointments = () => {
  const navigate = useNavigate();
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('all');

  // Reject Modal States
  const [rejectModalOpen, setRejectModalOpen] = useState(false);
  const [selectedApt, setSelectedApt] = useState(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [submittingResponse, setSubmittingResponse] = useState(false);

  const fetchAppointments = async () => {
    try {
      const res = await axiosInstance.get('/appointments/list');
      if (res.data.success) {
        setAppointments(res.data.data);
      }
    } catch (err) {
      toast.error('Failed to load doctor appointments');
    }
  };

  useEffect(() => {
    const init = async () => {
      setLoading(true);
      await fetchAppointments();
      setLoading(false);
    };
    init();
  }, []);

  const handleResponse = async (aptId, action, reason = '') => {
    setSubmittingResponse(true);
    const toastId = toast.loading(`${action === 'approve' ? 'Approving' : 'Rejecting'} appointment...`);
    try {
      const res = await axiosInstance.post('/appointments/respond', {
        appointmentId: aptId,
        action,
        rejectionReason: reason
      });
      if (res.data.success) {
        toast.success(`Appointment ${action === 'approve' ? 'approved' : 'rejected'} successfully`, { id: toastId });
        setRejectModalOpen(false);
        setRejectionReason('');
        fetchAppointments(); // Refresh
      } else {
        toast.error(res.data.message || 'Action failed', { id: toastId });
      }
    } catch (err) {
      toast.error('Error updating appointment response', { id: toastId });
    } finally {
      setSubmittingResponse(false);
    }
  };

  const openRejectModal = (apt) => {
    setSelectedApt(apt);
    setRejectionReason('');
    setRejectModalOpen(true);
  };

  const submitRejection = () => {
    if (!rejectionReason.trim()) {
      toast.error('Please specify a rejection reason');
      return;
    }
    handleResponse(selectedApt._id, 'reject', rejectionReason);
  };

  const filtered = appointments.filter(apt => {
    if (filterStatus === 'all') return true;
    return apt.status === filterStatus;
  });

  if (loading) return <LoadingSpinner size="lg" />;

  return (
    <div className="space-y-6">
      {/* Filters Card */}
      <Card>
        <CardContent className="flex flex-wrap gap-2 p-4">
          {[
            { label: 'All Assignments', value: 'all' },
            { label: 'Awaiting My Approval', value: 'pending_approval' },
            { label: 'Approved & Scheduled', value: 'approved' },
            { label: 'Completed Visits', value: 'completed' },
            { label: 'Rejected Calls', value: 'rejected' }
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
        </CardContent>
      </Card>

      {/* Main Table Card */}
      <Card>
        <CardHeader>
          <CardTitle>My Clinic Attending Queue</CardTitle>
          <p className="text-xs text-slate-500 mt-1">Review scheduled entries, check history charts, and log patient diagnostic visits.</p>
        </CardHeader>
        <CardContent>
          {filtered.length > 0 ? (
            <Table>
              <THead>
                <TR>
                  <TH>Date & Time</TH>
                  <TH>Patient</TH>
                  <TH>Symptoms Details</TH>
                  <TH>Status</TH>
                  <TH className="text-right">Actions</TH>
                </TR>
              </THead>
              <TBody>
                {filtered.map((apt) => (
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
                    <TD className="max-w-xs truncate text-xs text-slate-650">
                      "{apt.symptoms}"
                    </TD>
                    <TD>
                      <Badge status={apt.status}>{apt.status.replace('_', ' ')}</Badge>
                    </TD>
                    <TD className="text-right">
                      {apt.status === 'pending_approval' && (
                        <div className="inline-flex gap-2">
                          <button
                            onClick={() => handleResponse(apt._id, 'approve')}
                            disabled={submittingResponse}
                            className="inline-flex items-center justify-center p-1.5 rounded-md bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200 cursor-pointer"
                            title="Approve Visit"
                          >
                            <Check className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => openRejectModal(apt)}
                            disabled={submittingResponse}
                            className="inline-flex items-center justify-center p-1.5 rounded-md bg-red-50 text-red-700 hover:bg-red-100 border border-red-200 cursor-pointer"
                            title="Reject Visit"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        </div>
                      )}

                      {apt.status === 'approved' && (
                        <Button
                          variant="primary"
                          onClick={() => navigate(`/doctor/consult/${apt._id}`)}
                          className="px-2.5 py-1.5 text-xs font-semibold cursor-pointer"
                        >
                          <FileEdit className="h-3.5 w-3.5 mr-1" />
                          Consult
                        </Button>
                      )}
                      
                      {apt.status === 'completed' && (
                        <span className="text-emerald-700 text-xs font-semibold">Consulted</span>
                      )}

                      {apt.status === 'rejected' && (
                        <span className="text-red-700 text-xs font-semibold">Rejected</span>
                      )}
                    </TD>
                  </TR>
                ))}
              </TBody>
            </Table>
          ) : (
            <EmptyState
              message="Attending queue is empty"
              description="No appointment assignments matching this status filter."
              icon={Calendar}
            />
          )}
        </CardContent>
      </Card>

      {/* Reject Modal */}
      <Modal
        isOpen={rejectModalOpen}
        onClose={() => setRejectModalOpen(false)}
        title="Reject Appointment Request"
        footerActions={
          <>
            <Button variant="outline" onClick={() => setRejectModalOpen(false)} disabled={submittingResponse} className="cursor-pointer">
              Cancel
            </Button>
            <Button variant="danger" onClick={submitRejection} disabled={submittingResponse || !rejectionReason.trim()} className="cursor-pointer">
              {submittingResponse ? 'Rejecting...' : 'Reject Request'}
            </Button>
          </>
        }
      >
        {selectedApt && (
          <div className="space-y-4">
            <p className="text-xs text-slate-500">
              Please enter the clinical reason or conflict for rejecting the appointment from patient <strong className="text-slate-800">{selectedApt.patient?.name}</strong>.
            </p>
            <Input
              label="Rejection Reason"
              id="rejectionReason"
              type="text"
              placeholder="e.g. Schedule conflict, referral needed to cardiologist"
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              disabled={submittingResponse}
            />
          </div>
        )}
      </Modal>
    </div>
  );
};

export default DoctorAppointments;
