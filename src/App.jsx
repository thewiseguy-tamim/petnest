import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import NotificationSystem from './components/common/NotificationSystem';

// Layout
import MainLayout from './layouts/MainLayout';

// Public Pages
import Home from './pages/Home';
import Pets from './pages/Pets';
import PetDetails from './pages/PetDetails';
import About from './pages/About';
import Contact from './pages/Contact';
import Messages from './pages/Messages';
import Terms from './pages/Terms';
import Privacy from './pages/Privacy';
import NotFound from './pages/NotFound';

// Pet Management
import CreatePet from './pages/CreatePet';
import EditPet from './pages/EditPet';

// Auth Pages
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import ForgotPassword from './pages/auth/ForgotPassword';

// Dashboard Pages
import AdminDashboard from './pages/dashboards/AdminDashboard';
import ModeratorDashboard from './pages/dashboards/ModeratorDashboard';
import ClientDashboard from './pages/dashboards/ClientDashboard';

// Admin Pages
import UserManagement from './pages/admin/UserManagement';
import PostManagement from './pages/admin/PostManagement';
import VerificationRequests from './pages/admin/VerificationRequests';

// Additional Pages
import ProfileSettings from './pages/ProfileSettings';
import Verification from './pages/Verification';
import Favorites from './pages/Favorites';
import PaymentHistory from './pages/PaymentHistory';

// Messaging Components
import ConversationDetail from './components/messaging/ConversationDetail';

// Protected Route
import ProtectedRoute from './components/auth/ProtectedRoute';

function App() {
  return (
    <BrowserRouter>
      <NotificationSystem />
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: '#363636',
            color: '#fff',
          },
          success: {
            duration: 3000,
            iconTheme: {
              primary: '#10B981',
              secondary: '#fff',
            },
          },
          error: {
            duration: 4000,
            iconTheme: {
              primary: '#EF4444',
              secondary: '#fff',
            },
          },
        }}
      />
      <Routes>
        {/* Auth Routes - Outside MainLayout */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />

        {/* Public and Protected Routes - Inside MainLayout */}
        <Route path="/" element={<MainLayout />}>
          <Route index element={<Home />} />
          <Route path="pets" element={<Pets />} />
          <Route path="pets/:id" element={<PetDetails />} />
          <Route path="about" element={<About />} />
          <Route path="contact" element={<Contact />} />
          <Route path="terms" element={<Terms />} />
          <Route path="privacy" element={<Privacy />} />
          
          {/* Protected Routes */}
          <Route
            path="messages"
            element={
              <ProtectedRoute>
                <Messages />
              </ProtectedRoute>
            }
          />
          <Route
            path="messages/:userId/:petId"
            element={
              <ProtectedRoute>
                <Messages />
              </ProtectedRoute>
            }
          />
          <Route
            path="pets/create"
            element={
              <ProtectedRoute>
                <CreatePet />
              </ProtectedRoute>
            }
          />
          <Route
            path="pets/:id/edit"
            element={
              <ProtectedRoute>
                <EditPet />
              </ProtectedRoute>
            }
          />
          <Route
            path="profile/settings"
            element={
              <ProtectedRoute>
                <ProfileSettings />
              </ProtectedRoute>
            }
          />
          <Route
            path="verification"
            element={
              <ProtectedRoute>
                <Verification />
              </ProtectedRoute>
            }
          />
          <Route
            path="favorites"
            element={
              <ProtectedRoute>
                <Favorites />
              </ProtectedRoute>
            }
          />
          <Route
            path="payments"
            element={
              <ProtectedRoute>
                <PaymentHistory />
              </ProtectedRoute>
            }
          />
        </Route>

        {/* Protected Dashboard Routes */}
        <Route
          path="/dashboard/admin"
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <AdminDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard/admin/users"
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <UserManagement />
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard/admin/posts"
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <PostManagement />
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard/admin/verification"
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <VerificationRequests />
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard/admin/analytics"
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <AdminDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard/admin/revenue"
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <AdminDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard/admin/settings"
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <ProfileSettings />
            </ProtectedRoute>
          }
        />

        {/* Moderator Routes */}
        <Route
          path="/dashboard/moderator"
          element={
            <ProtectedRoute allowedRoles={['moderator']}>
              <ModeratorDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard/moderator/posts"
          element={
            <ProtectedRoute allowedRoles={['moderator']}>
              <PostManagement />
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard/moderator/verification"
          element={
            <ProtectedRoute allowedRoles={['moderator']}>
              <VerificationRequests />
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard/moderator/reports"
          element={
            <ProtectedRoute allowedRoles={['moderator']}>
              <ModeratorDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard/moderator/analytics"
          element={
            <ProtectedRoute allowedRoles={['moderator']}>
              <ModeratorDashboard />
            </ProtectedRoute>
          }
        />

        {/* Client Routes */}
        <Route
          path="/dashboard/client"
          element={
            <ProtectedRoute allowedRoles={['client']}>
              <ClientDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard/client/posts"
          element={
            <ProtectedRoute allowedRoles={['client']}>
              <ClientDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard/client/messages"
          element={
            <ProtectedRoute allowedRoles={['client']}>
              <Messages />
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard/client/favorites"
          element={
            <ProtectedRoute allowedRoles={['client']}>
              <Favorites />
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard/client/settings"
          element={
            <ProtectedRoute allowedRoles={['client']}>
              <ProfileSettings />
            </ProtectedRoute>
          }
        />

        {/* 404 Route */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;