import React, { useState } from 'react';
import { Mail, Lock, Eye, EyeOff } from 'lucide-react';

const Login = () => {
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    rememberMe: false,
  });
  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value,
    });
    // Clear error for this field
    if (errors[name]) {
      setErrors({ ...errors, [name]: '' });
    }
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
    // Simulate login
    setTimeout(() => {
      setLoading(false);
      alert('Login successful!');
    }, 2000);
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
      {/* Subtle background shapes using secondary */}
      <div className="pointer-events-none absolute -top-8 -left-8 w-36 h-36 bg-[var(--secondary)] rounded-xl rotate-12 opacity-70" />
      <div className="pointer-events-none absolute bottom-16 right-12 w-20 h-20 bg-[var(--secondary)] rounded-lg rotate-6 blur-[2px] opacity-70" />
      <div className="pointer-events-none absolute top-1/3 left-1/2 w-14 h-14 bg-[var(--secondary)] rounded-md rotate-12 opacity-70" />

      {/* Main container card */}
      <div className="relative mx-auto max-w-6xl p-4 md:p-6">
        <div className="grid lg:grid-cols-2 rounded-[28px] overflow-hidden bg-white shadow-[0_20px_60px_rgba(63,61,86,0.15)]">
          {/* Left Side - Login Form (UI only changed, text/logic untouched) */}
          <div className="flex items-center justify-center px-8 py-12">
            <div className="w-full max-w-md">
              {/* Logo */}
              <div className="mb-8">
                <h1 className="text-2xl font-bold mb-2">
                  Pet<span className="text-[var(--primary)]">Nest</span>
                </h1>
                <div className="w-8 h-0.5 bg-[var(--primary)]"></div>
              </div>

              {/* Welcome Text */}
              <div className="mb-8">
                <h2 className="text-3xl font-light mb-3">Welcome!</h2>
                <p className="text-sm leading-relaxed opacity-70">
                  Connect with fellow pet lovers and discover<br />
                  amazing stories from our community.
                </p>
              </div>

              {/* Form (structure preserved as in original) */}
              <div className="space-y-6">
                {/* Email Field */}
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

                {/* Password Field */}
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

                {/* Remember Me & Forgot Password */}
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
                  <a href="#" className="text-[var(--primary)] hover:opacity-80 transition-colors">
                    Forgot password?
                  </a>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={loading}
                  onClick={handleSubmit}
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

                {/* Quick Login Buttons */}
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, email: 'admin@gmail.com', password: '1234' })}
                    className="flex-1 h-10 bg-[var(--primary)] text-white rounded-lg text-sm font-medium hover:opacity-90 transition-all duration-200"
                  >
                    Admin
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, email: 'test@gmail.com', password: '12345678' })}
                    className="flex-1 h-10 bg-[var(--primary)] text-white rounded-lg text-sm font-medium hover:opacity-90 transition-all duration-200"
                  >
                    Moderator
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, email: 'nottamimislam@gmail.com', password: '12345678' })}
                    className="flex-1 h-10 bg-[var(--primary)] text-white rounded-lg text-sm font-medium hover:opacity-90 transition-all duration-200"
                  >
                    User
                  </button>
                </div>
              </div>

              {/* Sign Up Link */}
              <p className="text-center mt-8 text-sm opacity-80">
                Don't have an account?{' '}
                <button 
                  onClick={() => window.location.href = '/register'} 
                  className="text-[var(--primary)] hover:opacity-80 font-medium transition-colors"
                >
                  Create account here
                </button>
              </p>
            </div>
          </div>

          {/* Right Side - Hero Image with glass overlay (texts unchanged) */}
          <div className="relative hidden lg:block">
            <img
              src="https://images.unsplash.com/photo-1601758228041-f3b2795255f1?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1600&q=80"
              alt="Happy pets"
              className="absolute inset-0 w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-br from-black/10 to-black/0" />

            {/* Glass card */}
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

            {/* Floating accents */}
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