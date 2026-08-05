import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/Card';
import { toast } from 'react-hot-toast';
import { HeartPulse } from 'lucide-react';

const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const validate = () => {
    const tempErrors = {};
    if (!email) {
      tempErrors.email = 'Email address is required';
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      tempErrors.email = 'Please enter a valid email address';
    }
    if (!password) {
      tempErrors.password = 'Password is required';
    } else if (password.length < 6) {
      tempErrors.password = 'Password must be at least 6 characters';
    }
    setErrors(tempErrors);
    return Object.keys(tempErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    const toastId = toast.loading('Verifying credentials...');
    
    try {
      const res = await login(email, password);
      if (res.success) {
        toast.success(`Welcome back, ${res.user.name}`, { id: toastId });
        // Redirect based on role
        const dashboards = {
          patient: '/patient',
          assistant: '/assistant',
          doctor: '/doctor',
          lab: '/lab',
          pharmacy: '/pharmacy',
          admin: '/admin'
        };
        navigate(dashboards[res.user.role] || '/');
      } else {
        toast.error(res.message || 'Verification failed', { id: toastId });
      }
    } catch (err) {
      toast.error('An error occurred during authentication', { id: toastId });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6">
      <div className="flex items-center gap-2 mb-6">
        <HeartPulse className="h-6 w-6 text-teal-700" />
        <span className="text-teal-700 font-bold tracking-wider uppercase text-sm">ST. JUDE HOSPITAL PORTAL</span>
      </div>

      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle>Sign In to Account</CardTitle>
          <p className="text-xs text-slate-500 mt-1">Enter your clinical credentials to access your dashboard</p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Email Address"
              id="email"
              type="email"
              placeholder="e.g. john.doe@hms.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              error={errors.email}
              disabled={loading}
              autoComplete="email"
            />
            <Input
              label="Password"
              id="password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              error={errors.password}
              disabled={loading}
              autoComplete="current-password"
            />
            
            <Button
              type="submit"
              variant="primary"
              className="w-full mt-2 cursor-pointer"
              disabled={loading}
            >
              {loading ? 'Verifying...' : 'Sign In'}
            </Button>
          </form>

          <div className="text-center mt-6 border-t border-slate-100 pt-4">
            <span className="text-xs text-slate-500">New patient? </span>
            <Link to="/register" className="text-xs font-semibold text-teal-700 hover:text-teal-900 hover:underline">
              Create a new account
            </Link>
          </div>
        </CardContent>
      </Card>
      
      <div className="mt-8 text-center bg-white border border-slate-200 rounded-md p-4 max-w-sm text-[11px] text-slate-500 leading-normal">
        <p className="font-semibold text-slate-700 mb-1">Demo Access Credentials:</p>
        <ul className="list-disc pl-4 text-left space-y-1">
          <li>Admin: <code className="bg-slate-50 px-1 py-0.5 rounded font-mono">admin@hms.com</code> (Password123)</li>
          <li>Doctor: <code className="bg-slate-50 px-1 py-0.5 rounded font-mono">doctor.smith@hms.com</code> (Password123)</li>
          <li>Assistant: <code className="bg-slate-50 px-1 py-0.5 rounded font-mono">assistant@hms.com</code> (Password123)</li>
          <li>Lab Tech: <code className="bg-slate-50 px-1 py-0.5 rounded font-mono">lab@hms.com</code> (Password123)</li>
          <li>Pharmacy: <code className="bg-slate-50 px-1 py-0.5 rounded font-mono">pharmacy@hms.com</code> (Password123)</li>
          <li>Patient: <code className="bg-slate-50 px-1 py-0.5 rounded font-mono">patient.doe@hms.com</code> (Password123)</li>
        </ul>
      </div>
    </div>
  );
};

export default Login;
