import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  FileText,
  BarChart3,
  Settings,
  LogOut,
  Menu,
  X,
  CheckSquare,
  DollarSign,
  User,
  PawPrint,
  ChevronDown,
  Home,
  Bell,
  Search,
  Plus,
  ArrowLeft,
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';

const DashboardLayout = ({ children }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const adminMenuItems = [
    { path: '/dashboard/admin', label: 'Overview', icon: LayoutDashboard, description: 'Platform statistics' },
    { path: '/dashboard/admin/users', label: 'Users', icon: Users, description: 'Manage users' },
    { path: '/dashboard/admin/posts', label: 'Posts', icon: FileText, description: 'Manage posts' },
    { path: '/dashboard/admin/verification', label: 'Verification', icon: CheckSquare, description: 'Review requests' },
    { path: '/dashboard/admin/analytics', label: 'Analytics', icon: BarChart3, description: 'View insights' },
    { path: '/dashboard/admin/revenue', label: 'Revenue', icon: DollarSign, description: 'Financial reports' },
    { path: '/dashboard/admin/settings', label: 'Settings', icon: Settings, description: 'System settings' },
  ];

  const moderatorMenuItems = [
    { path: '/dashboard/moderator', label: 'Overview', icon: LayoutDashboard, description: 'Your dashboard' },
    { path: '/dashboard/moderator/posts', label: 'Posts', icon: FileText, description: 'Moderate content' },
    { path: '/dashboard/moderator/verification', label: 'Verification', icon: CheckSquare, description: 'Review requests' },
  ];

  const clientMenuItems = [
    { path: '/dashboard/client', label: 'Profile', icon: LayoutDashboard, description: 'Your profile' },
    { path: '/dashboard/client/posts', label: 'My Posts', icon: FileText, description: 'Manage posts' },
    { path: '/dashboard/client/messages', label: 'Messages', icon: Users, description: 'View messages' },
    { path: '/payments', label: 'Payments', icon: DollarSign, description: 'Payment history' },
    { path: '/dashboard/client/settings', label: 'Settings', icon: Settings, description: 'Account settings' },
  ];

  const menuItems = user?.role === 'admin'
    ? adminMenuItems
    : user?.role === 'moderator'
    ? moderatorMenuItems
    : clientMenuItems;

  const isActive = (path) => location.pathname === path;

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  // Close menus when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!event.target.closest('.user-menu')) {
        setUserMenuOpen(false);
      }
    };
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  // Get current page
  const currentPageItem = menuItems.find(item => isActive(item.path));

  // Quick actions based on role
  const quickActions = user?.role === 'admin' 
    ? [
        { label: 'Add User', icon: Plus, action: () => navigate('/dashboard/admin/users') },
        { label: 'View Reports', icon: BarChart3, action: () => navigate('/dashboard/admin/analytics') },
      ]
    : user?.role === 'client'
    ? [
        { label: 'Create Post', icon: Plus, action: () => navigate('/pets/create') },
      ]
    : [];

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#fafaf5' }}>
      {/* Top Navigation Bar */}
      <header className="sticky top-0 z-40 backdrop-blur-xl bg-white/70 border-b border-gray-200/50">
        <div className="px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Left Section */}
            <div className="flex items-center space-x-4">
              {/* Logo */}
              <Link to="/" className="flex items-center space-x-2 group">
                <div className="bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-xl p-2 group-hover:scale-110 transition-all duration-300 shadow-md">
                  <PawPrint className="w-5 h-5 text-white" />
                </div>
                <span className="text-xl font-bold  text-black">
                  PetNest
                </span>
              </Link>

              {/* Separator */}
              <div className="hidden lg:block h-8 w-px bg-gray-200" />

              {/* Back to Home */}
              <Link
                to="/"
                className="hidden lg:flex items-center space-x-2 px-3 py-1.5 text-sm text-gray-600 hover:text-gray-900 rounded-lg hover:bg-gray-100/50 transition-all"
              >
                <Home size={16} />
                <span>Home</span>
              </Link>
            </div>

            {/* Center Section - Search */}
            <div className="hidden lg:block flex-1 max-w-xl mx-8">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input
                  type="text"
                  placeholder="Search..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                />
              </div>
            </div>

            {/* Right Section */}
            <div className="flex items-center space-x-3">
              {/* Notifications */}
              <button className="relative p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100/50 rounded-lg transition-all">
                <Bell size={20} />
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
              </button>

              {/* User Menu */}
              <div className="relative user-menu">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setUserMenuOpen(!userMenuOpen);
                  }}
                  className="flex items-center space-x-2 px-3 py-2 text-sm font-medium text-gray-700 rounded-xl hover:bg-gray-100/50 transition-all"
                >
                  <div className="w-8 h-8 bg-gradient-to-br from-emerald-100 to-emerald-200 rounded-lg flex items-center justify-center">
                    <User size={16} className="text-emerald-700" />
                  </div>
                  <span className="hidden sm:block">{user?.username}</span>
                  <ChevronDown size={16} className={`text-gray-500 transition-transform ${userMenuOpen ? 'rotate-180' : ''}`} />
                </button>

                {userMenuOpen && (
                  <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-xl border border-gray-100 py-2 z-20">
                    <div className="px-4 py-3 border-b border-gray-100">
                      <p className="text-sm font-semibold text-gray-900">{user?.username}</p>
                      <p className="text-xs text-gray-500 mt-0.5">
                        {user?.email}
                      </p>
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-700 mt-2 capitalize">
                        {user?.role}
                      </span>
                    </div>
                    <div className="py-2">
                      <Link
                        to="/profile/settings"
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                        onClick={() => setUserMenuOpen(false)}
                      >
                        Profile Settings
                      </Link>
                      <Link
                        to="/"
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                        onClick={() => setUserMenuOpen(false)}
                      >
                        Back to Home
                      </Link>
                    </div>
                    <div className="border-t border-gray-100 pt-2">
                      <button
                        onClick={handleLogout}
                        className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center transition-colors"
                      >
                        <LogOut size={14} className="mr-2" />
                        Logout
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Mobile menu button */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="lg:hidden p-2 rounded-lg hover:bg-gray-100/50 text-gray-600"
              >
                {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Sub Navigation */}
      <div className="bg-white border-b border-gray-200/50">
        <div className="px-4 sm:px-6 lg:px-8">
          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center space-x-1 py-3">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.path);
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`
                    relative flex items-center px-4 py-2.5 text-sm font-medium rounded-lg
                    transition-all duration-200
                    ${active 
                      ? 'bg-emerald-50 text-emerald-700' 
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                    }
                  `}
                >
                  <Icon size={16} className="mr-2" />
                  {item.label}
                  {active && (
                    <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-8 h-0.5 bg-emerald-600 rounded-full" />
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Mobile Navigation */}
          {mobileMenuOpen && (
            <nav className="lg:hidden py-3 space-y-1">
              {menuItems.map((item) => {
                const Icon = item.icon;
                const active = isActive(item.path);
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`
                      flex items-center px-3 py-2.5 text-sm font-medium rounded-lg
                      transition-all duration-200
                      ${active 
                        ? 'bg-emerald-50 text-emerald-700' 
                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                      }
                    `}
                  >
                    <Icon size={16} className="mr-3" />
                    <div>
                      <div>{item.label}</div>
                      <div className="text-xs text-gray-500 mt-0.5">{item.description}</div>
                    </div>
                  </Link>
                );
              })}
            </nav>
          )}
        </div>
      </div>

      {/* Page Header with Breadcrumb */}
      <div className="bg-gradient-to-b from-white to-transparent">
        <div className="px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center space-x-2 text-sm text-gray-500 mb-2">
                <Link to="/" className="hover:text-gray-700">Home</Link>
                <span>/</span>
                <span className="text-gray-900 font-medium">{currentPageItem?.label || 'Dashboard'}</span>
              </div>
              <h1 className="text-3xl font-bold text-gray-900">
                {currentPageItem?.label || 'Dashboard'}
              </h1>
              <p className="text-gray-600 mt-1">
                {currentPageItem?.description || `Welcome back, ${user?.username}`}
              </p>
            </div>

            {/* Quick Actions */}
            {quickActions.length > 0 && (
              <div className="hidden sm:flex items-center space-x-2">
                {quickActions.map((action, index) => {
                  const Icon = action.icon;
                  return (
                    <button
                      key={index}
                      onClick={action.action}
                      className="flex items-center space-x-2 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors shadow-sm"
                    >
                      <Icon size={16} />
                      <span className="text-sm font-medium">{action.label}</span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main Content - Full Screen */}
      <main className="flex-1 px-4 sm:px-6 lg:px-8 py-6">
        <div className="h-full">
          {children}
        </div>
      </main>
    </div>
  );
};

export default DashboardLayout;