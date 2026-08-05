import React, { useState, useEffect } from 'react';
import axiosInstance from '../api/axios';
import { Table, THead, TBody, TR, TH, TD } from '../components/ui/Table';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Select from '../components/ui/Select';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/Card';
import Modal from '../components/ui/Modal';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import EmptyState from '../components/ui/EmptyState';
import { Shield, Plus, Trash2, UserPlus, RefreshCw } from 'lucide-react';
import { toast } from 'react-hot-toast';

const AdminStaff = () => {
  const [staff, setStaff] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Add Staff Modal States
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [errors, setErrors] = useState({});
  const [newStaff, setNewStaff] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
    role: 'doctor',
    specialization: '',
    qualifications: '',
    licenseNumber: '',
    experienceYears: '',
    availability: []
  });
  const [shifts, setShifts] = useState([{ day: 'Monday', startTime: '09:00', endTime: '15:00' }]);

  const fetchStaff = async () => {
    try {
      const res = await axiosInstance.get('/users/staff');
      if (res.data.success) {
        setStaff(res.data.data);
      }
    } catch (err) {
      toast.error('Failed to load clinic staff roster');
    }
  };

  useEffect(() => {
    const init = async () => {
      setLoading(true);
      await fetchStaff();
      setLoading(false);
    };
    init();
  }, []);

  const handleChange = (e) => {
    const { id, value } = e.target;
    setNewStaff(prev => ({
      ...prev,
      [id]: value
    }));
  };

  const validate = () => {
    const tempErrors = {};
    if (!newStaff.name.trim()) tempErrors.name = 'Name is required';
    if (!newStaff.email.trim()) {
      tempErrors.email = 'Email address is required';
    } else if (!/\S+@\S+\.\S+/.test(newStaff.email)) {
      tempErrors.email = 'Enter a valid email address';
    }
    if (!newStaff.phone.trim()) tempErrors.phone = 'Phone number is required';
    if (!newStaff.password) {
      tempErrors.password = 'Password is required';
    } else if (newStaff.password.length < 6) {
      tempErrors.password = 'Password must be at least 6 characters';
    }

    if (newStaff.role === 'doctor') {
      if (!newStaff.specialization.trim()) tempErrors.specialization = 'Specialization is required for doctors';
      if (!newStaff.qualifications.trim()) tempErrors.qualifications = 'Qualifications are required for doctors';
      if (!newStaff.licenseNumber.trim()) tempErrors.licenseNumber = 'License number is required for doctors';
    }

    setErrors(tempErrors);
    return Object.keys(tempErrors).length === 0;
  };

  const handleAddSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) {
      toast.error('Please resolve form validation errors.');
      return;
    }

    setSubmitting(true);
    const toastId = toast.loading('Registering staff account...');
    try {
      const payload = { ...newStaff };
      if (payload.role !== 'doctor') {
        delete payload.specialization;
        delete payload.qualifications;
        delete payload.availability;
        delete payload.licenseNumber;
        delete payload.experienceYears;
      } else {
        payload.availability = shifts;
      }

      const res = await axiosInstance.post('/users/staff', payload);
      if (res.data.success) {
        toast.success('Staff account registered successfully!', { id: toastId });
        setAddModalOpen(false);
        setNewStaff({
          name: '',
          email: '',
          password: '',
          phone: '',
          role: 'doctor',
          specialization: '',
          qualifications: '',
          licenseNumber: '',
          experienceYears: '',
          availability: []
        });
        setShifts([{ day: 'Monday', startTime: '09:00', endTime: '15:00' }]);
        fetchStaff();
      } else {
        toast.error(res.data.message || 'Action failed', { id: toastId });
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error creating account', { id: toastId });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteStaff = async (id, name) => {
    if (!window.confirm(`Are you sure you want to delete staff account: ${name}?`)) return;

    const toastId = toast.loading('Deleting staff account...');
    try {
      const res = await axiosInstance.delete(`/users/staff/${id}`);
      if (res.data.success) {
        toast.success('Account deleted successfully!', { id: toastId });
        fetchStaff();
      } else {
        toast.error(res.data.message || 'Action failed', { id: toastId });
      }
    } catch (err) {
      toast.error('Failed to delete staff account', { id: toastId });
    }
  };

  if (loading) return <LoadingSpinner size="lg" />;

  return (
    <div className="space-y-6">
      {/* Header panel */}
      <Card>
        <CardContent className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4">
          <div>
            <h2 className="text-base font-bold text-slate-900">Clinic Staff Management</h2>
            <p className="text-[11px] text-slate-500 mt-0.5">Register, update and delete staff logins for doctors, coordinate staff, lab and pharmacy.</p>
          </div>
          <div className="flex gap-2">
            <Button variant="secondary" onClick={fetchStaff} className="cursor-pointer">
              <RefreshCw className="h-4 w-4 mr-2" /> Refresh List
            </Button>
            <Button variant="primary" onClick={() => setAddModalOpen(true)} className="cursor-pointer">
              <UserPlus className="h-4 w-4 mr-2" /> Register Staff
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Roster Table */}
      <Card>
        <CardHeader>
          <CardTitle>Registered Attending Staff Directory</CardTitle>
        </CardHeader>
        <CardContent>
          {staff.length > 0 ? (
            <Table>
              <THead>
                <TR>
                  <TH>Attending Name</TH>
                  <TH>Role</TH>
                  <TH>Specialization / Qual.</TH>
                  <TH>Weekly Availability</TH>
                  <TH>Contact Information</TH>
                  <TH className="text-right">Actions</TH>
                </TR>
              </THead>
              <TBody>
                {staff.map((member) => (
                  <TR key={member._id}>
                    <TD className="font-semibold text-slate-900 text-xs">{member.name}</TD>
                    <TD className="text-xs">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded text-[10px] font-semibold bg-slate-100 text-slate-800 border border-slate-200 uppercase">
                        {member.role}
                      </span>
                    </TD>
                    <TD className="text-xs">
                      {member.role === 'doctor' ? (
                        <div>
                          <p className="font-semibold text-teal-850">{member.specialization}</p>
                           <p className="text-[10px] text-slate-450">{member.qualifications}</p>
                           {member.licenseNumber && (
                             <p className="text-[9px] text-slate-500 font-mono mt-0.5">License: {member.licenseNumber}</p>
                           )}
                           {member.experienceYears !== undefined && (
                             <p className="text-[9px] text-slate-400 font-semibold">{member.experienceYears} Years Exp.</p>
                           )}
                        </div>
                      ) : (
                        <span className="text-slate-400 italic text-[11px]">N/A</span>
                      )}
                    </TD>
                    <TD className="text-xs text-slate-700 font-medium">
                      {member.role === 'doctor' ? (
                        <div className="flex flex-wrap gap-1 max-w-xs">
                          {Array.isArray(member.availability) && member.availability.length > 0 ? (
                            member.availability.map((s, idx) => (
                              <span key={idx} className="inline-block bg-teal-50 text-teal-800 border border-teal-100 rounded px-1.5 py-0.5 text-[10px] whitespace-nowrap">
                                {s.day.substring(0,3)} {s.startTime}-{s.endTime}
                              </span>
                            ))
                          ) : (
                            <span className="text-slate-400 italic text-[10px]">No shifts configured</span>
                          )}
                        </div>
                      ) : (
                        <span className="text-slate-400 italic text-[11px]">Shift schedule</span>
                      )}
                    </TD>
                    <TD className="text-[11px] text-slate-500">
                      <p>Phone: {member.phone}</p>
                      <p>Email: {member.email}</p>
                    </TD>
                    <TD className="text-right">
                      <button
                        onClick={() => handleDeleteStaff(member._id, member.name)}
                        className="inline-flex items-center justify-center p-1.5 rounded bg-red-50 text-red-700 border border-red-200 hover:bg-red-100 transition-colors cursor-pointer"
                        title="Delete staff account"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </TD>
                  </TR>
                ))}
              </TBody>
            </Table>
          ) : (
            <EmptyState
              message="No staff accounts found"
              description="Click Register Staff to initialize your medical department logins."
              icon={Shield}
            />
          )}
        </CardContent>
      </Card>

      {/* Add Staff Modal */}
      <Modal
        isOpen={addModalOpen}
        onClose={() => setAddModalOpen(false)}
        title="Register Attending Staff Account"
        footerActions={
          <>
            <Button variant="outline" onClick={() => setAddModalOpen(false)} disabled={submitting} className="cursor-pointer">
              Cancel
            </Button>
            <Button variant="primary" onClick={handleAddSubmit} disabled={submitting} className="cursor-pointer">
              {submitting ? 'Registering...' : 'Register Account'}
            </Button>
          </>
        }
      >
        <form onSubmit={handleAddSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Staff Full Name"
              id="name"
              type="text"
              placeholder="e.g. Dr. Emily Carter"
              value={newStaff.name}
              onChange={handleChange}
              error={errors.name}
              disabled={submitting}
              required
            />
            <Input
              label="Email Address"
              id="email"
              type="email"
              placeholder="e.g. emily.carter@hms.com"
              value={newStaff.email}
              onChange={handleChange}
              error={errors.email}
              disabled={submitting}
              required
            />
            <Input
              label="Contact Phone"
              id="phone"
              type="text"
              placeholder="e.g. 555-0188"
              value={newStaff.phone}
              onChange={handleChange}
              error={errors.phone}
              disabled={submitting}
              required
            />
            <Input
              label="Portal Password"
              id="password"
              type="password"
              placeholder="At least 6 characters"
              value={newStaff.password}
              onChange={handleChange}
              error={errors.password}
              disabled={submitting}
              required
            />
          </div>

          <Select
            label="System Access Role"
            id="role"
            value={newStaff.role}
            onChange={handleChange}
            disabled={submitting}
          >
            <option value="doctor">Doctor</option>
            <option value="assistant">Assistant (Front-desk)</option>
            <option value="lab">Laboratory Staff</option>
            <option value="pharmacy">Pharmacy Staff</option>
          </Select>

          {/* Conditional Doctor Fields */}
          {newStaff.role === 'doctor' && (
            <div className="bg-slate-50 p-4 border border-slate-200 rounded-md space-y-4">
              <span className="text-[10px] font-bold text-teal-800 uppercase tracking-wider block border-b border-slate-200 pb-1">Attending Doctor Settings</span>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="Department Specialization"
                  id="specialization"
                  type="text"
                  placeholder="e.g. Cardiology, Pediatrics"
                  value={newStaff.specialization}
                  onChange={handleChange}
                  error={errors.specialization}
                  disabled={submitting}
                />
                <Input
                  label="Qualifications / Degrees"
                  id="qualifications"
                  type="text"
                  placeholder="e.g. MD, FACS, DCH"
                  value={newStaff.qualifications}
                  onChange={handleChange}
                  error={errors.qualifications}
                  disabled={submitting}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="Doctor License Number"
                  id="licenseNumber"
                  type="text"
                  placeholder="e.g. LIC-102938-MD"
                  value={newStaff.licenseNumber}
                  onChange={handleChange}
                  error={errors.licenseNumber}
                  disabled={submitting}
                />
                <Input
                  label="Attending Experience (Years)"
                  id="experienceYears"
                  type="number"
                  placeholder="e.g. 10"
                  value={newStaff.experienceYears}
                  onChange={handleChange}
                  disabled={submitting}
                />
              </div>

              {/* Shifts list editor */}
              <div className="space-y-2">
                <div className="flex justify-between items-center border-b border-slate-200 pb-1">
                  <span className="text-xs font-semibold text-slate-700">Weekly Shift Schedule</span>
                  <button
                    type="button"
                    onClick={() => setShifts(prev => [...prev, { day: 'Monday', startTime: '09:00', endTime: '15:00' }])}
                    className="text-xs text-teal-750 font-semibold hover:text-teal-900 cursor-pointer"
                  >
                    + Add Shift Slot
                  </button>
                </div>
                <div className="space-y-2">
                  {shifts.map((shift, idx) => (
                    <div key={idx} className="flex gap-2 items-center bg-white p-2 rounded border border-slate-200">
                      <Select
                        id={`shift-day-${idx}`}
                        value={shift.day}
                        onChange={(e) => {
                          const updated = [...shifts];
                          updated[idx].day = e.target.value;
                          setShifts(updated);
                        }}
                        className="flex-1"
                      >
                        {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map(d => (
                          <option key={d} value={d}>{d}</option>
                        ))}
                      </Select>
                      <input
                        type="time"
                        value={shift.startTime}
                        onChange={(e) => {
                          const updated = [...shifts];
                          updated[idx].startTime = e.target.value;
                          setShifts(updated);
                        }}
                        className="px-2 py-1.5 border border-slate-350 rounded text-xs focus:ring-1 focus:ring-teal-600 focus:outline-none"
                      />
                      <span className="text-xs text-slate-400">-</span>
                      <input
                        type="time"
                        value={shift.endTime}
                        onChange={(e) => {
                          const updated = [...shifts];
                          updated[idx].endTime = e.target.value;
                          setShifts(updated);
                        }}
                        className="px-2 py-1.5 border border-slate-350 rounded text-xs focus:ring-1 focus:ring-teal-600 focus:outline-none"
                      />
                      <button
                        type="button"
                        onClick={() => setShifts(prev => prev.filter((_, i) => i !== idx))}
                        className="text-slate-400 hover:text-red-650 font-bold p-1 cursor-pointer"
                        disabled={shifts.length <= 1}
                      >
                        &times;
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </form>
      </Modal>
    </div>
  );
};

export default AdminStaff;
