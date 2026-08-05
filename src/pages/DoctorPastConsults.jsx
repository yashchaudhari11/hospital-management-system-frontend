import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../api/axios';
import { Table, THead, TBody, TR, TH, TD } from '../components/ui/Table';
import Button from '../components/ui/Button';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/Card';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import EmptyState from '../components/ui/EmptyState';
import { ClipboardCheck } from 'lucide-react';
import { toast } from 'react-hot-toast';

const DoctorPastConsults = () => {
  const navigate = useNavigate();
  const [consultations, setConsultations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchConsults = async () => {
      try {
        const res = await axiosInstance.get('/consultations/history');
        if (res.data.success) {
          setConsultations(res.data.data);
        }
      } catch (err) {
        toast.error('Failed to load consultation logs');
      } finally {
        setLoading(false);
      }
    };
    fetchConsults();
  }, []);

  if (loading) return <LoadingSpinner size="lg" />;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Attended Consultation History Log</CardTitle>
        <p className="text-xs text-slate-500 mt-1">Review patient charts and clinical diagnostics you have submitted.</p>
      </CardHeader>
      <CardContent>
        {consultations.length > 0 ? (
          <Table>
            <THead>
              <TR>
                <TH>Date Conducted</TH>
                <TH>Patient Details</TH>
                <TH>Stated Concerns</TH>
                <TH>Clinical Diagnosis</TH>
                <TH>Attending Notes</TH>
                <TH className="text-right">Action</TH>
              </TR>
            </THead>
            <TBody>
              {consultations.map((con) => (
                <TR key={con._id}>
                  <TD className="font-medium text-slate-800 text-xs">
                    {new Date(con.createdAt).toLocaleDateString(undefined, {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </TD>
                  <TD>
                    <p className="font-semibold text-slate-900 text-xs">{con.patient?.name}</p>
                    <p className="text-[10px] text-slate-400">Phone: {con.patient?.phone}</p>
                  </TD>
                  <TD className="max-w-xs truncate text-xs text-slate-650">
                    "{con.appointment?.symptoms || 'N/A'}"
                  </TD>
                  <TD className="font-semibold text-slate-800 text-xs">
                    {con.diagnosis}
                  </TD>
                  <TD className="max-w-xs text-slate-600 text-xs whitespace-pre-line">
                    {con.notes}
                  </TD>
                  <TD className="text-right">
                    <Button
                      variant="secondary"
                      onClick={() => navigate(`/doctor/patients/${con.patient?._id}`)}
                      className="px-2.5 py-1.5 text-xs font-semibold cursor-pointer"
                    >
                      View Chart
                    </Button>
                  </TD>
                </TR>
              ))}
            </TBody>
          </Table>
        ) : (
          <EmptyState
            message="No consultation logs found"
            description="Approved appointments will appear here after you perform a consultation."
            icon={ClipboardCheck}
          />
        )}
      </CardContent>
    </Card>
  );
};

export default DoctorPastConsults;
