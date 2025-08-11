import React, { useState } from 'react';
import { Mail, Lock, User, Eye, EyeOff, ChevronDown } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../../services/api';

const Register = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'client', // UI only; not sent to backend
    agreeToTerms: false,
  });
  const [errors, setErrors] = useState({});
  const [apiError, setApiError] = useState('');

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value,
    });
    if (errors[name]) setErrors({ ...errors, [name]: '' });
    if (apiError) setApiError('');
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.username) {
      newErrors.username = 'Username is required';
    } else if (formData.username.length < 3) {
      newErrors.username = 'Username must be at least 3 characters';
    }
    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
    }
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }
    if (!formData.agreeToTerms) {
      newErrors.agreeToTerms = 'You must agree to the terms and conditions';
    }
    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const newErrors = validateForm();
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setLoading(true);
    setApiError('');

    try {
      // Register (backend expects only username, email, password)
      const registerRes = await api.post('users/register/', {
        username: formData.username.trim(),
        email: formData.email.trim(),
        password: formData.password,
      });

      if (registerRes.status !== 201 && registerRes.status !== 200) {
        setApiError('Unexpected response from server during registration.');
        return;
      }

      // Auto-login
      const loginRes = await api.post('users/login/', {
        email: formData.email.trim(),
        password: formData.password,
      });

      const { access, refresh } = loginRes.data || {};
      if (!access || !refresh) {
        setApiError('Unexpected response from server during login.');
        return;
      }

      localStorage.setItem('access_token', access);
      localStorage.setItem('refresh_token', refresh);
      localStorage.removeItem('access');
      localStorage.removeItem('refresh');

      // Optional: fetch user status
      try {
        const statusRes = await api.get('users/status/');
        if (statusRes?.data) {
          localStorage.setItem('user', JSON.stringify(statusRes.data));
        }
      } catch {
        // ignore
      }

      navigate('/');
    } catch (err) {
      const data = err?.response?.data || {};
      const mappedErrors = { ...errors };

      if (Array.isArray(data.username)) mappedErrors.username = data.username[0];
      if (Array.isArray(data.email)) mappedErrors.email = data.email[0];
      if (Array.isArray(data.password)) mappedErrors.password = data.password[0];

      const generic =
        data?.detail ||
        data?.non_field_errors?.[0] ||
        (typeof data === 'string' ? data : '');

      if (generic && !mappedErrors.username && !mappedErrors.email && !mappedErrors.password) {
        setApiError(generic);
      }

      setErrors(mappedErrors);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen bg-[var(--background)] text-[var(--text)] relative overflow-hidden"
      style={{
        '--text': '#0F0F0F',
        '--background': '#fafaf5',
        '--primary': '#009966',
        '--secondary': '#FFEFB5',
        '--accent': '#3F3D56',
      }}
    >
      <div className="pointer-events-none absolute -top-8 -left-8 w-36 h-36 bg-[var(--secondary)] rounded-xl rotate-12 opacity-70" />
      <div className="pointer-events-none absolute bottom-16 right-12 w-20 h-20 bg-[var(--secondary)] rounded-lg rotate-6 blur-[2px] opacity-70" />
      <div className="pointer-events-none absolute top-1/3 left-1/2 w-14 h-14 bg-[var(--secondary)] rounded-md rotate-12 opacity-70" />

      <div className="relative mx-auto max-w-6xl p-4 md:p-6">
        <div className="grid lg:grid-cols-2 rounded-[28px] overflow-hidden bg-white shadow-[0_20px_60px_rgba(63,61,86,0.15)]">
          <div className="relative hidden lg:block">
            <img
              src="https://images.unsplash.com/photo-1583337130417-3346a1be7dee?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1600&q=80"
              alt="Pet community"
              className="absolute inset-0 w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-br from-black/10 to-black/0" />

            <div className="absolute bottom-10 left-10 right-10">
              <div className="max-w-md bg-white/60 backdrop-blur-md rounded-2xl p-6 shadow-lg">
                <h3 className="text-2xl font-light mb-4 leading-tight">
                  Join our growing<br />
                  <span className="font-medium text-[var(--primary)]">pet community</span>
                </h3>
                <p className="text-sm leading-relaxed opacity-80 mb-6">
                  Share your pet's story, discover amazing companions,<br />
                  and connect with fellow pet enthusiasts from<br />
                  around the world.
                </p>
                <div className="space-y-3">
                  <div className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-[var(--primary)] rounded-full"></div>
                    <span className="text-sm">Find your perfect pet match</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-[var(--accent)] rounded-full"></div>
                    <span className="text-sm">Connect with verified sellers</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-[var(--primary)] rounded-full"></div>
                    <span className="text-sm">Access expert pet care tips</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-[var(--accent)] rounded-full"></div>
                    <span className="text-sm">Join local pet events</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="absolute top-1/4 right-1/4 w-2 h-2 bg-[var(--accent)] rounded-full animate-pulse"></div>
            <div className="absolute top-3/4 right-1/3 w-1 h-1 bg-[var(--primary)] rounded-full animate-pulse delay-1000"></div>
            <div className="absolute top-1/2 left-1/4 w-3 h-3 bg-[var(--primary)]/70 rounded-full animate-pulse delay-500"></div>
          </div>

          <div className="flex items-center justify-center px-8 py-12">
            <div className="w-full max-w-md">
              <div className="mb-8">
                <h1 className="text-2xl font-bold mb-2">
                  Pet<span className="text-[var(--primary)]">Nest</span>
                </h1>
                <div className="w-8 h-0.5 bg-[var(--primary)]"></div>
              </div>

              <div className="mb-8">
                <h2 className="text-3xl font-light mb-3">Create Account</h2>
                <p className="text-sm leading-relaxed opacity-70">
                  Start your journey with PetNest and discover<br />
                  amazing pet companions today.
                </p>
              </div>

              <form className="space-y-5" onSubmit={handleSubmit}>
                {apiError && (
                  <div className="p-3 rounded-lg bg-red-50 text-red-600 text-sm">
                    {apiError}
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium mb-2">Username</label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 opacity-60">
                      <User size={18} />
                    </span>
                    <input
                      type="text"
                      name="username"
                      value={formData.username}
                      onChange={handleChange}
                      className={`w-full h-12 pl-10 pr-4 rounded-xl bg-[var(--background)] text-[var(--text)] placeholder-black/40 border ${
                        errors.username ? 'border-red-300' : 'border-black/10'
                      } focus:outline-none focus:ring-2 focus:ring-[var(--primary)] transition-all duration-200`}
                      placeholder="Choose a username"
                    />
                    {errors.username && (
                      <p className="mt-2 text-sm text-red-600">{errors.username}</p>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Email address</label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 opacity-60">
                      <Mail size={18} />
                    </span>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      className={`w-full h-12 pl-10 pr-4 rounded-xl bg-[var(--background)] text-[var(--text)] placeholder-black/40 border ${
                        errors.email ? 'border-red-300' : 'border-black/10'
                      } focus:outline-none focus:ring-2 focus:ring-[var(--primary)] transition-all duration-200`}
                      placeholder="Enter your email"
                    />
                    {errors.email && (
                      <p className="mt-2 text-sm text-red-600">{errors.email}</p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Password</label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 opacity-60">
                        <Lock size={18} />
                      </span>
                      <input
                        type={showPassword ? 'text' : 'password'}
                        name="password"
                        value={formData.password}
                        onChange={handleChange}
                        className={`w-full h-12 pl-10 pr-12 rounded-xl bg-[var(--background)] text-[var(--text)] placeholder-black/40 border ${
                          errors.password ? 'border-red-300' : 'border-black/10'
                        } focus:outline-none focus:ring-2 focus:ring-[var(--primary)] transition-all duration-200`}
                        placeholder="Create password"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 opacity-60 hover:opacity-100"
                      >
                        {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                      </button>
                      {errors.password && (
                        <p className="mt-2 text-sm text-red-600">{errors.password}</p>
                      )}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Confirm Password</label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 opacity-60">
                        <Lock size={18} />
                      </span>
                      <input
                        type={showConfirmPassword ? 'text' : 'password'}
                        name="confirmPassword"
                        value={formData.confirmPassword}
                        onChange={handleChange}
                        className={`w-full h-12 pl-10 pr-12 rounded-xl bg-[var(--background)] text-[var(--text)] placeholder-black/40 border ${
                          errors.confirmPassword ? 'border-red-300' : 'border-black/10'
                        } focus:outline-none focus:ring-2 focus:ring-[var(--primary)] transition-all duration-200`}
                        placeholder="Confirm password"
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 opacity-60 hover:opacity-100"
                      >
                        {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                      </button>
                      {errors.confirmPassword && (
                        <p className="mt-2 text-sm text-red-600">{errors.confirmPassword}</p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Role selection is UI only; not sent to backend */}
                <div>
                  <label className="block text-sm font-medium mb-2">I want to</label>
                  <div className="relative">
                    <select
                      name="role"
                      value={formData.role}
                      onChange={handleChange}
                      className="w-full h-12 pl-4 pr-10 rounded-xl bg-white text-[var(--text)] border border-black/10 focus:outline-none focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent transition-all duration-200 appearance-none cursor-pointer"
                    >
                      <option value="client">Adopt or buy a pet</option>
                      <option value="moderator">Help moderate listings</option>
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 opacity-60 pointer-events-none" size={20} />
                  </div>
                </div>

                <div>
                  <label className="flex items-start space-x-3">
                    <input
                      type="checkbox"
                      name="agreeToTerms"
                      checked={formData.agreeToTerms}
                      onChange={handleChange}
                      className="w-5 h-5 text-[var(--primary)] border-gray-300 rounded focus:ring-[var(--primary)] mt-0.5 flex-shrink-0"
                    />
                    <span className="text-sm leading-relaxed opacity-80">
                      I agree to the{' '}
                      <a href="#" className="text-[var(--primary)] hover:opacity-80 font-medium transition-colors">
                        Terms and Conditions
                      </a>{' '}
                      and{' '}
                      <a href="#" className="text-[var(--primary)] hover:opacity-80 font-medium transition-colors">
                        Privacy Policy
                      </a>
                    </span>
                  </label>
                  {errors.agreeToTerms && (
                    <p className="mt-2 text-sm text-red-600">{errors.agreeToTerms}</p>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full h-12 bg-[var(--accent)] text-white rounded-xl font-medium hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-[var(--accent)] focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 mt-6"
                >
                  {loading ? (
                    <div className="flex items-center justify-center">
                      <div className="w-5 h-5 border-2 border-white/70 border-t-transparent rounded-full animate-spin mr-2"></div>
                      Creating account...
                    </div>
                  ) : (
                    'Create Account'
                  )}
                </button>

                <p className="text-center mt-8 text-sm opacity-80">
                  Already have an account?{' '}
                  <Link
                    to="/login"
                    className="text-[var(--primary)] hover:opacity-80 font-medium transition-colors"
                  >
                    Sign in here
                  </Link>
                </p>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;