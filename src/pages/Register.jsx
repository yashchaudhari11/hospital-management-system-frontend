import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Input from '../components/ui/Input';
import Select from '../components/ui/Select';
import Button from '../components/ui/Button';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/Card';
import { toast } from 'react-hot-toast';
import { HeartPulse } from 'lucide-react';

const Register = () => {
  const { registerPatient } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    dob: '',
    gender: 'male',
    address: '',
    bloodGroup: '',
    allergies: '',
    emergencyName: '',
    emergencyRelation: '',
    emergencyPhone: ''
  });

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
    if (!formData.email) {
      tempErrors.email = 'Email address is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      tempErrors.email = 'Please enter a valid email address';
    }
    if (!formData.phone) tempErrors.phone = 'Phone number is required';
    if (!formData.password) {
      tempErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      tempErrors.password = 'Password must be at least 6 characters';
    }
    if (!formData.dob) tempErrors.dob = 'Date of birth is required';
    if (!formData.address) tempErrors.address = 'Residential address is required';
    
    // Emergency contact
    if (!formData.emergencyName) tempErrors.emergencyName = 'Emergency contact name is required';
    if (!formData.emergencyRelation) tempErrors.emergencyRelation = 'Relationship is required';
    if (!formData.emergencyPhone) tempErrors.emergencyPhone = 'Emergency phone number is required';

    setErrors(tempErrors);
    return Object.keys(tempErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) {
      toast.error('Please correct the validation errors in the form.');
      return;
    }

    setLoading(true);
    const toastId = toast.loading('Registering account...');
    
    const registrationPayload = {
      name: formData.name,
      email: formData.email,
      phone: formData.phone,
      password: formData.password,
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
      const res = await registerPatient(registrationPayload);
      if (res.success) {
        toast.success('Registration successful. Welcome to your portal!', { id: toastId });
        navigate('/patient');
      } else {
        toast.error(res.message || 'Registration failed', { id: toastId });
      }
    } catch (err) {
      toast.error('An error occurred during registration', { id: toastId });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 py-12">
      <div className="flex items-center gap-2 mb-6">
        <HeartPulse className="h-6 w-6 text-teal-700" />
        <span className="text-teal-700 font-bold tracking-wider uppercase text-sm">ST. JUDE HOSPITAL</span>
      </div>

      <Card className="w-full max-w-2xl">
        <CardHeader className="text-center">
          <CardTitle>Create Patient Portal Account</CardTitle>
          <p className="text-xs text-slate-500 mt-1">Register to schedule consultations, access prescriptions, and view diagnostic records</p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            
            {/* Base Credentials */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold text-teal-800 uppercase tracking-wider border-b border-slate-100 pb-1">Portal Account Credentials</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="Full Name"
                  id="name"
                  type="text"
                  placeholder="e.g. John Doe"
                  value={formData.name}
                  onChange={handleChange}
                  error={errors.name}
                  disabled={loading}
                />
                <Input
                  label="Email Address"
                  id="email"
                  type="email"
                  placeholder="e.g. john.doe@mail.com"
                  value={formData.email}
                  onChange={handleChange}
                  error={errors.email}
                  disabled={loading}
                />
                <Input
                  label="Contact Phone"
                  id="phone"
                  type="text"
                  placeholder="e.g. 555-0199"
                  value={formData.phone}
                  onChange={handleChange}
                  error={errors.phone}
                  disabled={loading}
                />
                <Input
                  label="Password"
                  id="password"
                  type="password"
                  placeholder="At least 6 characters"
                  value={formData.password}
                  onChange={handleChange}
                  error={errors.password}
                  disabled={loading}
                />
              </div>
            </div>

            {/* Demographics / Personal Details */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold text-teal-800 uppercase tracking-wider border-b border-slate-100 pb-1">Personal & Medical Details</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Input
                  label="Date of Birth"
                  id="dob"
                  type="date"
                  value={formData.dob}
                  onChange={handleChange}
                  error={errors.dob}
                  disabled={loading}
                />
                <Select
                  label="Gender"
                  id="gender"
                  value={formData.gender}
                  onChange={handleChange}
                  disabled={loading}
                >
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                </Select>
                <Input
                  label="Blood Group (Optional)"
                  id="bloodGroup"
                  type="text"
                  placeholder="e.g. O+, A-"
                  value={formData.bloodGroup}
                  onChange={handleChange}
                  disabled={loading}
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="Residential Address"
                  id="address"
                  type="text"
                  placeholder="123 Main St, Springfield"
                  value={formData.address}
                  onChange={handleChange}
                  error={errors.address}
                  disabled={loading}
                />
                <Input
                  label="Known Allergies (Optional)"
                  id="allergies"
                  type="text"
                  placeholder="e.g. Penicillin, Peanuts"
                  value={formData.allergies}
                  onChange={handleChange}
                  disabled={loading}
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
                  placeholder="Jane Doe"
                  value={formData.emergencyName}
                  onChange={handleChange}
                  error={errors.emergencyName}
                  disabled={loading}
                />
                <Input
                  label="Relationship"
                  id="emergencyRelation"
                  type="text"
                  placeholder="e.g. Spouse, Father"
                  value={formData.emergencyRelation}
                  onChange={handleChange}
                  error={errors.emergencyRelation}
                  disabled={loading}
                />
                <Input
                  label="Emergency Phone"
                  id="emergencyPhone"
                  type="text"
                  placeholder="e.g. 555-0100"
                  value={formData.emergencyPhone}
                  onChange={handleChange}
                  error={errors.emergencyPhone}
                  disabled={loading}
                />
              </div>
            </div>

            <Button
              type="submit"
              variant="primary"
              className="w-full mt-4 cursor-pointer"
              disabled={loading}
            >
              {loading ? 'Creating Account...' : 'Register Portal Account'}
            </Button>
          </form>

          <div className="text-center mt-6 border-t border-slate-100 pt-4">
            <span className="text-xs text-slate-500">Already registered? </span>
            <Link to="/login" className="text-xs font-semibold text-teal-700 hover:text-teal-900 hover:underline">
              Access sign-in page
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Register;
