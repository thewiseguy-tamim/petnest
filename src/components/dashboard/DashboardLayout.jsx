// src/components/dashboard/DashboardLayout.jsx 
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
  ChevronDown,
  CheckSquare,
  DollarSign,
  Shield,
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
    { path: '/dashboard/moderator/reports', label: 'User Reports', icon: Shield },
    { path: '/dashboard/moderator/analytics', label: 'Analytics', icon: BarChart3 },
  ];

  const clientMenuItems = [
    { path: '/dashboard/client', label: 'My Profile', icon: LayoutDashboard },
    { path: '/dashboard/client/posts', label: 'My Posts', icon: FileText },
    { path: '/dashboard/client/messages', label: 'Messages', icon: Users },
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
    <div className="min-h-screen bg-gray-50 flex">
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
            <Link to="/" className="text-2xl font-bold text-gray-800" style={{ fontFamily: 'serif' }}>
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
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors ${
                      isActive(item.path)
                        ? 'bg-gray-100 text-gray-900'
                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                    }`}
                  >
                    <Icon className="mr-3 h-5 w-5" />
                    {item.label}
                  </Link>
                );
              })}
            </div>
          </nav>

          <div className="p-4 border-t">
            <button
              onClick={handleLogout}
              className="flex items-center w-full px-4 py-3 text-sm font-medium text-gray-600 rounded-lg hover:bg-gray-50 hover:text-gray-900 transition-colors"
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
        <div className="sticky top-0 z-40 bg-white shadow-sm">
          <div className="flex items-center justify-between h-16 px-4 sm:px-6 lg:px-8">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden text-gray-500 hover:text-gray-700"
            >
              <Menu size={24} />
            </button>

            <div className="flex items-center space-x-4 ml-auto">
              <span className="text-sm text-gray-600">Welcome back,</span>
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                  <User size={16} className="text-gray-600" />
                </div>
                <span className="text-sm font-medium text-gray-900">{user?.username}</span>
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