import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Menu, X, Bell, User, LogOut, LayoutDashboard, PawPrint } from 'lucide-react';
import NotificationDropdown from '../components/ui/NotificationDropdown';
import { useNotifications } from '../context/NotificationContext';
import { useAuth } from '../hooks/useAuth';
import { motion, AnimatePresence, useScroll, useMotionValueEvent } from 'framer-motion';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { unreadCount, addNotification } = useNotifications();
  const { user, isAuthenticated, logout } = useAuth();
  const ref = useRef(null);
  const { scrollY } = useScroll({ target: ref });
  const [visible, setVisible] = useState(false);

  const navLinks = [
    { path: '/', name: 'Home', link: '#home' },
    { path: '/pets', name: 'Find Pets', link: '/pets' },
    { path: '/', name: 'About', link: '#about' },
    { path: '/', name: 'Contact', link: '#contact' },
  ];

  useMotionValueEvent(scrollY, 'change', (latest) => {
    if (latest > 50) {
      setVisible(true);
    } else {
      setVisible(false);
    }
  });

  const handleNavClick = (link, path) => {
    if (link.startsWith('#')) {
      const sectionId = link.replace('#', '');
      if (location.pathname !== '/') {
        navigate(`/${link}`);
        setTimeout(() => {
          const element = document.getElementById(sectionId);
          if (element) {
            const offset = 80;
            const elementPosition = element.offsetTop - offset;
            window.scrollTo({
              top: elementPosition,
              behavior: 'smooth',
            });
          }
        }, 100);
      } else {
        const element = document.getElementById(sectionId);
        if (element) {
          const offset = 80;
          const elementPosition = element.offsetTop - offset;
          window.scrollTo({
            top: elementPosition,
            behavior: 'smooth',
          });
        }
      }
    } else {
      navigate(link);
    }
    setIsOpen(false);
    setShowUserMenu(false);
  };

  const isActive = (path, link) => {
    if (path === '/' && location.pathname === '/') {
      // If no hash and on home page, highlight "Home" link
      if (!location.hash && link === '#home') {
        return true;
      }
      // Highlight "About" or "Contact" if their hash matches
      return location.hash === link;
    }
    return location.pathname === path;
  };

  const handleDashboardClick = () => {
    if (user?.role === 'admin') {
      navigate('/dashboard/admin');
    } else if (user?.role === 'moderator') {
      navigate('/dashboard/moderator');
    } else {
      navigate('/dashboard/client');
    }
    setShowUserMenu(false);
  };

  const handleLogout = () => {
    logout();
    addNotification({
      type: 'info',
      title: 'Logged Out',
      message: 'You have been logged out successfully.',
    });
    navigate('/');
    setShowUserMenu(false);
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!event.target.closest('.user-menu-container')) {
        setShowUserMenu(false);
      }
      if (!event.target.closest('.notification-container')) {
        setShowNotifications(false);
      }
    };

    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  return (
    <motion.div
      ref={ref}
      className="fixed inset-x-0 top-0 z-50 w-full"
    >
      <motion.div
        animate={{
          backdropFilter: visible ? 'blur(16px)' : 'none',
          backgroundColor: visible ? 'rgba(250, 250, 245, 0.8)' : 'transparent',
          boxShadow: visible ? '0 4px 20px rgba(0, 0, 0, 0.1)' : 'none',
        }}
        transition={{ duration: 0.3, ease: 'easeInOut' }}
        className="hidden lg:flex w-full max-w-5xl mx-auto items-center justify-between px-6 py-4 rounded-full mt-4"
      >
        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
          <Link to="/" className="flex items-center space-x-3">
            <motion.div
              className="bg-emerald-100 rounded-full p-3"
              whileHover={{ rotate: 360 }}
              transition={{ duration: 0.5 }}
            >
              <PawPrint className="w-8 h-8 text-emerald-600" />
            </motion.div>
            <span className="text-2xl font-bold text-gray-900">PetNest</span>
          </Link>
        </motion.div>

        <div className="flex items-center space-x-1">
          {navLinks.map((link, idx) => (
            <button
              key={`link-${idx}`}
              onClick={() => handleNavClick(link.link, link.path)}
              className={`relative px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                isActive(link.path, link.link)
                  ? 'text-emerald-600 bg-emerald-50'
                  : 'text-gray-700 hover:text-emerald-600 hover:bg-gray-50'
              }`}
            >
              <span className="relative z-10">{link.name}</span>
            </button>
          ))}
        </div>

        {isAuthenticated ? (
          <div className="flex items-center space-x-4">
            <motion.div
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.95 }}
              transition={{ type: 'spring', stiffness: 400, damping: 17 }}
            >
              <Link
                to="/pets/create"
                className="bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-3 rounded-full font-semibold transition-colors shadow-md hover:shadow-lg"
              >
                Post a Pet
              </Link>
            </motion.div>

            <motion.div className="relative notification-container" whileHover={{ scale: 1.1 }}>
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                className="relative p-2 text-gray-600 hover:text-gray-900 transition-colors"
              >
                <Bell size={24} />
                {unreadCount > 0 && (
                  <motion.span
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-medium"
                  >
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </motion.span>
                )}
              </button>
              <AnimatePresence>
                {showNotifications && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.2 }}
                  >
                    <NotificationDropdown onClose={() => setShowNotifications(false)} />
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>

            <div className="relative user-menu-container">
              <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="flex items-center space-x-2 text-gray-700 hover:text-gray-900 p-2 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <div className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center">
                  <User size={20} className="text-emerald-600" />
                </div>
              </button>

              {showUserMenu && (
                <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-lg border border-gray-200 py-2">
                  <div className="px-4 py-3 border-b border-gray-200">
                    <p className="text-sm font-semibold text-gray-900">{user?.username}</p>
                    <p className="text-xs text-gray-500 mt-1">{user?.email}</p>
                  </div>
                  <button
                    onClick={handleDashboardClick}
                    className="w-full text-left px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 flex items-center space-x-3 transition-colors"
                  >
                    <LayoutDashboard size={18} />
                    <span>Dashboard</span>
                  </button>
                  <Link
                    to="/profile/settings"
                    className="block px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 flex items-center space-x-3 transition-colors"
                    onClick={() => setShowUserMenu(false)}
                  >
                    <User size={18} />
                    <span>Profile Settings</span>
                  </Link>
                  <Link
                    to="/favorites"
                    className="block px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                    onClick={() => setShowUserMenu(false)}
                  >
                    My Favorites
                  </Link>
                  <Link
                    to="/messages"
                    className="block px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                    onClick={() => setShowUserMenu(false)}
                  >
                    Messages
                  </Link>
                  <div className="border-t border-gray-200 mt-2 pt-2">
                    <button
                      onClick={handleLogout}
                      className="w-full text-left px-4 py-3 text-sm text-red-600 hover:bg-red-50 flex items-center space-x-3 transition-colors"
                    >
                      <LogOut size={18} />
                      <span>Logout</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="flex items-center space-x-4">
            <Link
              to="/login"
              className="text-gray-700 hover:text-emerald-600 font-medium transition-colors"
            >
              Sign In
            </Link>
            <Link
              to="/register"
              className="bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-3 rounded-full font-semibold transition-colors"
            >
              Get Started
            </Link>
          </div>
        )}
      </motion.div>

      <motion.div
        animate={{
          backdropFilter: visible ? 'blur(16px)' : 'none',
          backgroundColor: visible ? 'rgba(250, 250, 245, 0.8)' : 'transparent',
        }}
        transition={{ duration: 0.3, ease: 'easeInOut' }}
        className="lg:hidden w-full h-16 border-b border-gray-200/50"
      >
        <div className="w-full h-full mx-auto px-3 sm:px-4 flex items-center justify-between">
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Link to="/" className="flex items-center space-x-3">
              <motion.div
                className="bg-emerald-100 rounded-full p-3"
                whileHover={{ rotate: 360 }}
                transition={{ duration: 0.5 }}
              >
                <PawPrint className="w-8 h-8 text-emerald-600" />
              </motion.div>
              <span className="text-2xl font-bold text-gray-900">PetNest</span>
            </Link>
          </motion.div>

          <div className="flex items-center">
            {isAuthenticated && (
              <motion.div className="relative notification-container mr-2" whileHover={{ scale: 1.1 }}>
                <button
                  onClick={() => setShowNotifications(!showNotifications)}
                  className="relative p-2 text-gray-600 hover:text-gray-900 transition-colors"
                >
                  <Bell size={20} />
                  {unreadCount > 0 && (
                    <motion.span
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center text-[10px]"
                    >
                      {unreadCount > 9 ? '9+' : unreadCount}
                    </motion.span>
                  )}
                </button>
                <AnimatePresence>
                  {showNotifications && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.2 }}
                    >
                      <NotificationDropdown onClose={() => setShowNotifications(false)} />
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            )}
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="p-2 rounded-lg hover:bg-gray-100/10 transition-colors"
              aria-label="Toggle menu"
            >
              {isOpen ? <X className="h-6 w-6 text-gray-900" /> : <Menu className="h-6 w-6 text-gray-900" />}
            </button>
          </div>
        </div>
      </motion.div>

      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40"
              onClick={() => setIsOpen(false)}
            />
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.2, ease: 'easeOut' }}
              className="fixed top-16 left-0 right-0 bg-white/5 backdrop-blur-xl border-b border-gray-200/50 shadow-xl z-50"
            >
              <div className="w-full mx-auto px-3 sm:px-4 py-4 max-h-[calc(100vh-4rem)] overflow-y-auto">
                {navLinks.map((link) => (
                  <button
                    key={link.path + link.link}
                    onClick={() => handleNavClick(link.link, link.path)}
                    className={`block w-full text-left px-4 py-3 text-base font-medium rounded-lg ${
                      isActive(link.path, link.link)
                        ? 'text-emerald-600 bg-emerald-50'
                        : 'text-gray-700 hover:text-emerald-600 hover:bg-gray-50'
                    }`}
                  >
                    {link.name}
                  </button>
                ))}
                {isAuthenticated ? (
                  <>
                    <Link
                      to="/pets/create"
                      className="block mx-4 my-3 bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-3 rounded-full font-semibold text-center transition-colors"
                      onClick={() => setIsOpen(false)}
                    >
                      Post a Pet
                    </Link>
                    <div className="border-t border-gray-200 pt-3 mt-3">
                      <div className="px-4 py-3">
                        <p className="text-base font-semibold text-gray-900">{user?.username}</p>
                        <p className="text-sm text-gray-500">{user?.email}</p>
                      </div>
                      <button
                        onClick={() => {
                          handleDashboardClick();
                          setIsOpen(false);
                        }}
                        className="w-full text-left px-4 py-3 text-base font-medium text-gray-700 hover:text-emerald-600 hover:bg-gray-50 rounded-lg"
                      >
                        Dashboard
                      </button>
                      <Link
                        to="/profile/settings"
                        className="block px-4 py-3 text-base font-medium text-gray-700 hover:text-emerald-600 hover:bg-gray-50 rounded-lg"
                        onClick={() => setIsOpen(false)}
                      >
                        Profile Settings
                      </Link>
                      <Link
                        to="/favorites"
                        className="block px-4 py-3 text-base font-medium text-gray-700 hover:text-emerald-600 hover:bg-gray-50 rounded-lg"
                        onClick={() => setIsOpen(false)}
                      >
                        My Favorites
                      </Link>
                      <Link
                        to="/messages"
                        className="block px-4 py-3 text-base font-medium text-gray-700 hover:text-emerald-600 hover:bg-gray-50 rounded-lg"
                        onClick={() => setIsOpen(false)}
                      >
                        Messages
                      </Link>
                      <button
                        onClick={() => {
                          handleLogout();
                          setIsOpen(false);
                        }}
                        className="w-full text-left px-4 py-3 text-base font-medium text-red-600 hover:bg-red-50 rounded-lg mt-2"
                      >
                        Logout
                      </button>
                    </div>
                  </>
                ) : (
                  <div className="space-y-2 px-4 pt-3">
                    <Link
                      to="/login"
                      className="block w-full text-center text-gray-700 hover:text-emerald-600 px-4 py-3 rounded-lg font-medium border border-gray-300 hover:border-emerald-300"
                      onClick={() => setIsOpen(false)}
                    >
                      Sign In
                    </Link>
                    <Link
                      to="/register"
                      className="block w-full text-center bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-3 rounded-full font-semibold transition-colors"
                      onClick={() => setIsOpen(false)}
                    >
                      Get Started
                    </Link>
                  </div>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default Navbar;