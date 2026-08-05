import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../api/axios';
import { Table, THead, TBody, TR, TH, TD } from '../components/ui/Table';
import Button from '../components/ui/Button';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/Card';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import EmptyState from '../components/ui/EmptyState';
import { Users, FileSymlink } from 'lucide-react';
import { toast } from 'react-hot-toast';

const AssistantPatients = () => {
  const navigate = useNavigate();
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPatients = async () => {
      try {
        const res = await axiosInstance.get('/patients/list');
        if (res.data.success) {
          setPatients(res.data.data);
        }
      } catch (err) {
        toast.error('Failed to load clinic patient list');
      } finally {
        setLoading(false);
      }
    };
    fetchPatients();
  }, []);

  if (loading) return <LoadingSpinner size="lg" />;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Clinic Patient Database Directory</CardTitle>
        <p className="text-xs text-slate-500 mt-1">Search patients and view aggregated medical charts and historical timelines.</p>
      </CardHeader>
      <CardContent>
        {patients.length > 0 ? (
          <Table>
            <THead>
              <TR>
                <TH>Patient Name</TH>
                <TH>Date of Birth</TH>
                <TH>Gender</TH>
                <TH>Blood Group</TH>
                <TH>Emergency Contact</TH>
                <TH className="text-right">Action</TH>
              </TR>
            </THead>
            <TBody>
              {patients.map((pat) => (
                <TR key={pat._id}>
                  <TD>
                    <p className="font-semibold text-slate-900 text-xs">{pat.name}</p>
                    <p className="text-[10px] text-slate-400">{pat.email} | {pat.phone}</p>
                  </TD>
                  <TD className="text-xs">
                    {pat.profile?.dob ? new Date(pat.profile.dob).toLocaleDateString() : 'N/A'}
                  </TD>
                  <TD className="text-xs capitalize">{pat.profile?.gender || 'N/A'}</TD>
                  <TD className="text-xs font-semibold text-teal-800">{pat.profile?.bloodGroup || 'N/A'}</TD>
                  <TD className="text-xs">
                    {pat.profile?.emergencyContact ? (
                      <div>
                        <p className="font-medium text-slate-800">{pat.profile.emergencyContact.name}</p>
                        <p className="text-[10px] text-slate-400">({pat.profile.emergencyContact.relationship}) - {pat.profile.emergencyContact.phone}</p>
                      </div>
                    ) : (
                      <span className="text-slate-450 italic text-[11px]">None configured</span>
                    )}
                  </TD>
                  <TD className="text-right">
                    <Button
                      variant="secondary"
                      onClick={() => navigate(`/assistant/patients/${pat._id}`)}
                      className="px-2.5 py-1.5 text-xs font-semibold cursor-pointer"
                    >
                      <FileSymlink className="h-3.5 w-3.5 mr-1" />
                      View Timeline
                    </Button>
                  </TD>
                </TR>
              ))}
            </TBody>
          </Table>
        ) : (
          <EmptyState
            message="No patients found"
            description="Patients register themselves via the register portal page."
            icon={Users}
          />
        )}
      </CardContent>
    </Card>
  );
};

export default AssistantPatients;
