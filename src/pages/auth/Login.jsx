// src/pages/auth/Login.jsx
import React, { useState } from 'react';
import { Mail, Lock, Eye, EyeOff } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

const Login = () => {
  const navigate = useNavigate();
  const { login } = useAuth(); // use the working hook
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    rememberMe: false, // UI only
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
    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }
    if (!formData.password) {
      newErrors.password = 'Password is required';
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
      await login({
        email: formData.email.trim(),
        password: formData.password,
        // rememberMe is UI-only here; your auth/axios uses localStorage
      });
      navigate('/');
    } catch (err) {
      // Show a friendly error; useAuth typically throws with a response or message
      const data = err?.response?.data || {};
      const message =
        data?.detail ||
        data?.non_field_errors?.[0] ||
        err?.message ||
        'Invalid email or password';
      setApiError(message);
      setErrors((prev) => ({ ...prev, password: 'Invalid email or password' }));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen bg-[var(--background)] text-[var(--text)] relative overflow-hidden pt-18"
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
          <div className="flex items-center justify-center px-8 py-12">
            <div className="w-full max-w-md">
              <div className="mb-8">
                <h1 className="text-2xl font-bold mb-2">
                  Pet<span className="text-[var(--primary)]">Nest</span>
                </h1>
                <div className="w-8 h-0.5 bg-[var(--primary)]"></div>
              </div>

              <div className="mb-8">
                <h2 className="text-3xl font-light mb-3">Welcome!</h2>
                <p className="text-sm leading-relaxed opacity-70">
                  Connect with fellow pet lovers and discover<br />
                  amazing stories from our community.
                </p>
              </div>

              <form className="space-y-6" onSubmit={handleSubmit}>
                {apiError && (
                  <div className="p-3 rounded-lg bg-red-50 text-red-600 text-sm">
                    {apiError}
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium mb-2">
                    Email address
                  </label>
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

                <div>
                  <label className="block text-sm font-medium mb-2">
                    Password
                  </label>
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
                      placeholder="Enter your password"
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

                <div className="flex items-center justify-between text-sm">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      name="rememberMe"
                      checked={formData.rememberMe}
                      onChange={handleChange}
                      className="w-4 h-4 text-[var(--primary)] border-gray-300 rounded focus:ring-[var(--primary)]"
                    />
                    <span className="ml-2 opacity-80">Remember me</span>
                  </label>
                  <Link to="/forgot-password" className="text-[var(--primary)] hover:opacity-80 transition-colors">
                    Forgot password?
                  </Link>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full h-12 bg-[var(--accent)] text-white rounded-xl font-medium hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-[var(--accent)] focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                >
                  {loading ? (
                    <div className="flex items-center justify-center">
                      <div className="w-5 h-5 border-2 border-white/70 border-t-transparent rounded-full animate-spin mr-2"></div>
                      Signing in...
                    </div>
                  ) : (
                    'Sign In'
                  )}
                </button>

                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() =>
                      setFormData({ ...formData, email: 'admin@gmail.com', password: '1234' })
                    }
                    className="flex-1 h-10 bg-[var(--primary)] text-white rounded-lg text-sm font-medium hover:opacity-90 transition-all duration-200"
                  >
                    Admin
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      setFormData({ ...formData, email: 'test@gmail.com', password: '12345678' })
                    }
                    className="flex-1 h-10 bg-[var(--primary)] text-white rounded-lg text-sm font-medium hover:opacity-90 transition-all duration-200"
                  >
                    Moderator
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      setFormData({
                        ...formData,
                        email: 'nottherealtamim@gmail.com',
                        password: '12345678',
                      })
                    }
                    className="flex-1 h-10 bg-[var(--primary)] text-white rounded-lg text-sm font-medium hover:opacity-90 transition-all duration-200"
                  >
                    User
                  </button>
                </div>

                <p className="text-center mt-8 text-sm opacity-80">
                  Don't have an account?{' '}
                  <Link
                    to="/register"
                    className="text-[var(--primary)] hover:opacity-80 font-medium transition-colors"
                  >
                    Create account here
                  </Link>
                </p>
              </form>
            </div>
          </div>

          <div className="relative hidden lg:block">
            <img
              src="https://images.unsplash.com/photo-1601758228041-f3b2795255f1?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1600&q=80"
              alt="Happy pets"
              className="absolute inset-0 w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-br from-black/10 to-black/0" />
            <div className="absolute bottom-10 left-10 right-10">
              <div className="max-w-md bg-white/60 backdrop-blur-md rounded-2xl p-6 shadow-lg">
                <h3 className="text-2xl font-light mb-4 leading-tight">
                  Find your perfect<br />
                  <span className="font-medium text-[var(--primary)]">pet companion</span>
                </h3>
                <p className="text-sm leading-relaxed opacity-80">
                  Discover amazing pets, connect with loving owners,<br />
                  and share unforgettable moments in our<br />
                  growing community.
                </p>
              </div>
            </div>

            <div className="absolute top-1/4 left-1/4 w-2 h-2 bg-[var(--primary)] rounded-full animate-pulse"></div>
            <div className="absolute top-3/4 left-1/3 w-1 h-1 bg-[var(--accent)] rounded-full animate-pulse delay-1000"></div>
            <div className="absolute top-1/2 right-1/4 w-3 h-3 bg-[var(--primary)]/70 rounded-full animate-pulse delay-500"></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;