import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axiosInstance from '../api/axios';
import { Table, THead, TBody, TR, TH, TD } from '../components/ui/Table';
import Badge from '../components/ui/Badge';
import Button from '../components/ui/Button';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/Card';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import EmptyState from '../components/ui/EmptyState';
import { Calendar } from 'lucide-react';
import { toast } from 'react-hot-toast';

const PatientAppointments = () => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAppointments = async () => {
      try {
        const res = await axiosInstance.get('/appointments/list');
        if (res.data.success) {
          setAppointments(res.data.data);
        }
      } catch (err) {
        toast.error('Failed to load appointments roster');
      } finally {
        setLoading(false);
      }
    };
    fetchAppointments();
  }, []);

  if (loading) return <LoadingSpinner size="lg" />;

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-3">
        <div>
          <CardTitle>My Scheduled Appointments</CardTitle>
          <p className="text-xs text-slate-500 mt-1">Review status updates and approvals for your clinic visits.</p>
        </div>
        <Link to="/patient/book" className="inline-flex items-center justify-center px-3 py-1.5 text-xs font-semibold rounded-md bg-teal-700 text-white hover:bg-teal-800 transition-colors">
          Book Appointment
        </Link>
      </CardHeader>
      <CardContent>
        {appointments.length > 0 ? (
          <Table>
            <THead>
              <TR>
                <TH>Date & Time</TH>
                <TH>Assigned Physician</TH>
                <TH>Symptoms Concern</TH>
                <TH>Status</TH>
                <TH>Details / Notes</TH>
              </TR>
            </THead>
            <TBody>
              {appointments.map((apt) => (
                <TR key={apt._id}>
                  <TD className="font-semibold text-slate-900">
                    {new Date(apt.preferredDate).toLocaleDateString(undefined, {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </TD>
                  <TD className="text-slate-650">
                    {apt.doctor ? (
                      <div>
                        <p className="font-medium text-slate-800">{apt.doctor.name}</p>
                        <p className="text-[10px] text-slate-400">Phone: {apt.doctor.phone}</p>
                      </div>
                    ) : (
                      <span className="text-slate-400 italic text-xs">Awaiting Assignment</span>
                    )}
                  </TD>
                  <TD className="max-w-xs truncate text-slate-600 text-xs">
                    {apt.symptoms}
                  </TD>
                  <TD>
                    <Badge status={apt.status}>{apt.status.replace('_', ' ')}</Badge>
                  </TD>
                  <TD className="text-xs">
                    {apt.status === 'rejected' && (
                      <div className="bg-red-50 text-red-800 p-2 rounded-md border border-red-100 max-w-xs">
                        <span className="font-semibold block text-[10px] uppercase">Reason for rejection:</span>
                        {apt.rejectionReason}
                      </div>
                    )}
                    {apt.status === 'completed' && (
                      <Link to="/patient/timeline" className="text-teal-700 font-semibold hover:text-teal-900 hover:underline">
                        View Consultation Record
                      </Link>
                    )}
                    {apt.status === 'approved' && (
                      <span className="text-slate-400 italic text-xs">Awaiting consultation visit</span>
                    )}
                    {(apt.status === 'pending_approval' || apt.status === 'pending_assignment') && (
                      <span className="text-slate-400 italic text-xs">Verification in progress</span>
                    )}
                  </TD>
                </TR>
              ))}
            </TBody>
          </Table>
        ) : (
          <EmptyState
            message="No appointments recorded"
            description="Schedule a new consultation to get started with clinic visits."
            icon={Calendar}
          />
        )}
      </CardContent>
    </Card>
  );
};

export default PatientAppointments;
