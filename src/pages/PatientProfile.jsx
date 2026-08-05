import React, { useState, useEffect } from 'react';
import axiosInstance from '../api/axios';
import Input from '../components/ui/Input';
import Select from '../components/ui/Select';
import Button from '../components/ui/Button';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/Card';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import { toast } from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';

const PatientProfile = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState({});

  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    dob: '',
    gender: 'male',
    address: '',
    bloodGroup: '',
    allergies: '',
    emergencyName: '',
    emergencyRelation: '',
    emergencyPhone: ''
  });

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await axiosInstance.get('/patients/history');
        if (res.data.success) {
          const profile = res.data.profile || {};
          const pat = res.data.patient || {};
          
          setFormData({
            name: pat.name || '',
            phone: pat.phone || '',
            dob: profile.dob ? new Date(profile.dob).toISOString().split('T')[0] : '',
            gender: profile.gender || 'male',
            address: profile.address || '',
            bloodGroup: profile.bloodGroup || '',
            allergies: profile.allergies || '',
            emergencyName: profile.emergencyContact?.name || '',
            emergencyRelation: profile.emergencyContact?.relationship || '',
            emergencyPhone: profile.emergencyContact?.phone || ''
          });
        }
      } catch (err) {
        toast.error('Failed to load profile details');
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  const handleChange = (e) => {
    const { id, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [id]: value
    }));
  };

  const validate = () => {
    const tempErrors = {};
    if (!formData.name) tempErrors.name = 'Full name is required';
    if (!formData.phone) tempErrors.phone = 'Phone number is required';
    if (!formData.dob) tempErrors.dob = 'Date of birth is required';
    if (!formData.address) tempErrors.address = 'Residential address is required';
    
    // Emergency contact
    if (!formData.emergencyName) tempErrors.emergencyName = 'Emergency contact name is required';
    if (!formData.emergencyRelation) tempErrors.emergencyRelation = 'Relationship is required';
    if (!formData.emergencyPhone) tempErrors.emergencyPhone = 'Emergency phone is required';

    setErrors(tempErrors);
    return Object.keys(tempErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) {
      toast.error('Please correct the validation errors in the form.');
      return;
    }

    setSubmitting(true);
    const toastId = toast.loading('Saving profile changes...');

    const payload = {
      name: formData.name,
      phone: formData.phone,
      dob: formData.dob,
      gender: formData.gender,
      address: formData.address,
      bloodGroup: formData.bloodGroup,
      allergies: formData.allergies,
      emergencyContact: {
        name: formData.emergencyName,
        relationship: formData.emergencyRelation,
        phone: formData.emergencyPhone
      }
    };

    try {
      const res = await axiosInstance.put('/patients/profile', payload);
      if (res.data.success) {
        toast.success('Profile saved successfully!', { id: toastId });
        // Update user name in local storage/context if needed
        const savedUser = localStorage.getItem('user');
        if (savedUser) {
          const parsed = JSON.parse(savedUser);
          parsed.name = formData.name;
          parsed.phone = formData.phone;
          localStorage.setItem('user', JSON.stringify(parsed));
        }
      } else {
        toast.error(res.data.message || 'Profile save failed', { id: toastId });
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update profile details', { id: toastId });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <LoadingSpinner size="lg" />;

  return (
    <div className="max-w-2xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle>Manage Personal & Clinical Profile</CardTitle>
          <p className="text-xs text-slate-500 mt-1">Keep your demographic and clinical information accurate for medical staff review.</p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            
            {/* Credentials info */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold text-teal-800 uppercase tracking-wider border-b border-slate-100 pb-1">Contact Settings</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="Full Name"
                  id="name"
                  type="text"
                  value={formData.name}
                  onChange={handleChange}
                  error={errors.name}
                  disabled={submitting}
                />
                <Input
                  label="Phone Number"
                  id="phone"
                  type="text"
                  value={formData.phone}
                  onChange={handleChange}
                  error={errors.phone}
                  disabled={submitting}
                />
              </div>
            </div>

            {/* Demographics / Personal Details */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold text-teal-800 uppercase tracking-wider border-b border-slate-100 pb-1">Clinical Information</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Input
                  label="Date of Birth"
                  id="dob"
                  type="date"
                  value={formData.dob}
                  onChange={handleChange}
                  error={errors.dob}
                  disabled={submitting}
                />
                <Select
                  label="Gender"
                  id="gender"
                  value={formData.gender}
                  onChange={handleChange}
                  disabled={submitting}
                >
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                </Select>
                <Input
                  label="Blood Group"
                  id="bloodGroup"
                  type="text"
                  placeholder="e.g. O+, B-"
                  value={formData.bloodGroup}
                  onChange={handleChange}
                  disabled={submitting}
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="Residential Address"
                  id="address"
                  type="text"
                  value={formData.address}
                  onChange={handleChange}
                  error={errors.address}
                  disabled={submitting}
                />
                <Input
                  label="Allergy Flags"
                  id="allergies"
                  type="text"
                  placeholder="e.g. Penicillin"
                  value={formData.allergies}
                  onChange={handleChange}
                  disabled={submitting}
                />
              </div>
            </div>

            {/* Emergency Contact */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold text-teal-800 uppercase tracking-wider border-b border-slate-100 pb-1">Emergency Contact</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Input
                  label="Contact Name"
                  id="emergencyName"
                  type="text"
                  value={formData.emergencyName}
                  onChange={handleChange}
                  error={errors.emergencyName}
                  disabled={submitting}
                />
                <Input
                  label="Relationship"
                  id="emergencyRelation"
                  type="text"
                  value={formData.emergencyRelation}
                  onChange={handleChange}
                  error={errors.emergencyRelation}
                  disabled={submitting}
                />
                <Input
                  label="Emergency Phone"
                  id="emergencyPhone"
                  type="text"
                  value={formData.emergencyPhone}
                  onChange={handleChange}
                  error={errors.emergencyPhone}
                  disabled={submitting}
                />
              </div>
            </div>

            <Button
              type="submit"
              variant="primary"
              className="w-full mt-4 cursor-pointer"
              disabled={submitting}
            >
              {submitting ? 'Saving Details...' : 'Save Profile Changes'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default PatientProfile;
