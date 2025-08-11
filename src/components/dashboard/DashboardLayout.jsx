import React, { useState } from 'react';
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
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';

const DashboardLayout = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const adminMenuItems = [
    { path: '/dashboard/admin', label: 'Overview', icon: LayoutDashboard },
    { path: '/dashboard/admin/users', label: 'User Management', icon: Users },
    { path: '/dashboard/admin/posts', label: 'Post Management', icon: FileText },
    { path: '/dashboard/admin/verification', label: 'Verification Requests', icon: CheckSquare },
    { path: '/dashboard/admin/analytics', label: 'Analytics', icon: BarChart3 },
    { path: '/dashboard/admin/revenue', label: 'Revenue Reports', icon: DollarSign },
    { path: '/dashboard/admin/settings', label: 'Settings', icon: Settings },
  ];

  const moderatorMenuItems = [
    { path: '/dashboard/moderator', label: 'Overview', icon: LayoutDashboard },
    { path: '/dashboard/moderator/posts', label: 'Post Moderation', icon: FileText },
    { path: '/dashboard/moderator/verification', label: 'Verification Requests', icon: CheckSquare },
    // Removed Reports and Analytics for moderators
  ];

  const clientMenuItems = [
    { path: '/dashboard/client', label: 'My Profile', icon: LayoutDashboard },
    { path: '/dashboard/client/posts', label: 'My Posts', icon: FileText },
    { path: '/dashboard/client/messages', label: 'Messages', icon: Users },
    { path: '/payments', label: 'Payments', icon: DollarSign }, // Links to Payment History page
    { path: '/dashboard/client/favorites', label: 'Favorites', icon: BarChart3 },
    { path: '/dashboard/client/settings', label: 'Settings', icon: Settings },
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

  return (
    <div className="min-h-screen flex" style={{ background: '#FAFAF5', color: '#0F0F0F' }}>
      {/* Mobile sidebar backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-gray-600 bg-opacity-75 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg transform ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0`}
      >
        <div className="flex flex-col h-full">
          <div className="flex items-center justify-between h-16 px-6 border-b">
            <Link
              to="/"
              className="text-2xl font-bold"
              style={{ color: '#3F3D56', fontFamily: 'serif' }}
            >
              PetNest
            </Link>
            <button
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden text-gray-500 hover:text-gray-700"
            >
              <X size={24} />
            </button>
          </div>

          <nav className="flex-1 px-4 py-6 overflow-y-auto">
            <div className="space-y-1">
              {menuItems.map((item) => {
                const Icon = item.icon;
                const active = isActive(item.path);
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    className="flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors"
                    style={{
                      background: active ? '#FFEFB5' : 'transparent',
                      color: active ? '#0F0F0F' : '#4B5563',
                    }}
                  >
                    <Icon className="mr-3 h-5 w-5" />
                    {item.label}
                  </Link>
                );
              })}
              {/* Removed "Make a Payment" quick action drawer button */}
            </div>
          </nav>

          <div className="p-4 border-t">
            <button
              onClick={handleLogout}
              className="flex items-center w-full px-4 py-3 text-sm font-medium rounded-lg transition-colors"
              style={{ color: '#3F3D56' }}
            >
              <LogOut className="mr-3 h-5 w-5" />
              Logout
            </button>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col">
        {/* Top bar */}
        <div className="sticky top-0 z-40 shadow-sm" style={{ background: '#FFFFFF' }}>
          <div className="flex items-center justify-between h-16 px-4 sm:px-6 lg:px-8">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden text-gray-500 hover:text-gray-700"
            >
              <Menu size={24} />
            </button>

            <div className="flex items-center space-x-4 ml-auto">
              <span className="text-sm" style={{ color: '#3F3D56' }}>Welcome back,</span>
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ background: '#FFEFB5' }}>
                  <User size={16} style={{ color: '#3F3D56' }} />
                </div>
                <span className="text-sm font-medium" style={{ color: '#0F0F0F' }}>{user?.username}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Page content */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8">{children}</main>
      </div>
    </div>
  );
};

export default DashboardLayout;