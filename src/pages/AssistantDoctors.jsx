import React, { useState, useEffect } from 'react';
import axiosInstance from '../api/axios';
import { Table, THead, TBody, TR, TH, TD } from '../components/ui/Table';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/Card';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import EmptyState from '../components/ui/EmptyState';
import { Stethoscope } from 'lucide-react';
import { toast } from 'react-hot-toast';

const AssistantDoctors = () => {
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        const res = await axiosInstance.get('/doctors/list');
        if (res.data.success) {
          setDoctors(res.data.data);
        }
      } catch (err) {
        toast.error('Failed to load clinic doctors');
      } finally {
        setLoading(false);
      }
    };
    fetchDoctors();
  }, []);

  if (loading) return <LoadingSpinner size="lg" />;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Clinic Doctor Roster & Availability</CardTitle>
        <p className="text-xs text-slate-500 mt-1">Directory of attending medical staff and schedules for clinical coordination.</p>
      </CardHeader>
      <CardContent>
        {doctors.length > 0 ? (
          <Table>
            <THead>
              <TR>
                <TH>Physician Name</TH>
                <TH>Department Specialization</TH>
                <TH>Qualifications</TH>
                <TH>Availability Schedule</TH>
                <TH>Contact Details</TH>
              </TR>
            </THead>
            <TBody>
              {doctors.map((doc) => (
                <TR key={doc._id}>
                  <TD className="font-semibold text-slate-900 text-xs">{doc.name}</TD>
                  <TD className="text-xs">
                    <span className="bg-teal-50 text-teal-800 border border-teal-150 px-2.5 py-0.5 rounded-full font-medium">
                      {doc.profile?.specialization}
                    </span>
                  </TD>
                  <TD className="text-xs text-slate-650">{doc.profile?.qualifications}</TD>
                  <TD className="text-xs text-slate-700 font-medium">{doc.profile?.availability}</TD>
                  <TD className="text-xs text-slate-500">
                    <p>Phone: {doc.phone}</p>
                    <p>Email: {doc.email}</p>
                  </TD>
                </TR>
              ))}
            </TBody>
          </Table>
        ) : (
          <EmptyState
            message="No doctors registered"
            description="Staff accounts are managed by system administrators."
            icon={Stethoscope}
          />
        )}
      </CardContent>
    </Card>
  );
};

export default AssistantDoctors;
