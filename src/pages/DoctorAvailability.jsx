import React, { useState, useEffect } from 'react';
import axiosInstance from '../api/axios';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/Card';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import { toast } from 'react-hot-toast';

const DoctorAvailability = () => {
  const [availability, setAvailability] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await axiosInstance.get('/auth/me');
        if (res.data.success && res.data.profile) {
          setAvailability(res.data.profile.availability || '');
        }
      } catch (err) {
        toast.error('Failed to load profile availability');
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!availability.trim()) {
      toast.error('Availability schedule text cannot be blank');
      return;
    }

    setSubmitting(true);
    const toastId = toast.loading('Saving availability schedule...');

    try {
      const res = await axiosInstance.put('/doctors/availability', { availability });
      if (res.data.success) {
        toast.success('Availability updated successfully!', { id: toastId });
      } else {
        toast.error(res.data.message || 'Save failed', { id: toastId });
      }
    } catch (err) {
      toast.error('Failed to update doctor availability settings', { id: toastId });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <LoadingSpinner size="lg" />;

  return (
    <div className="max-w-md mx-auto">
      <Card>
        <CardHeader>
          <CardTitle>Attending Availability Settings</CardTitle>
          <p className="text-xs text-slate-500 mt-1">Configure your weekly operating hours and shifts for front-desk scheduling.</p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Availability Schedule"
              id="availability"
              type="text"
              placeholder="e.g. Mon-Wed-Fri 9:00 AM - 3:00 PM"
              value={availability}
              onChange={(e) => setAvailability(e.target.value)}
              disabled={submitting}
              required
            />
            
            <Button
              type="submit"
              variant="primary"
              className="w-full mt-2 cursor-pointer"
              disabled={submitting}
            >
              {submitting ? 'Saving settings...' : 'Update Schedule'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default DoctorAvailability;
