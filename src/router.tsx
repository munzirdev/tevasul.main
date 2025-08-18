import React from 'react';
import { createBrowserRouter, Navigate, Outlet } from 'react-router-dom';
import App from './App';
import { servicesData } from './data/services';
import EmailVerification from './components/EmailVerification';
import ResetPasswordPage from './components/ResetPasswordPage';
import { AuthCallback } from './components/AuthCallback';
import ThemeToggleTest from './components/ThemeToggleTest';
import NotFoundPage from './components/NotFoundPage';
import AboutPage from './components/AboutPage';
import ServicesPage from './components/ServicesPage';
import ContactPage from './components/ContactPage';
import LoginPage from './components/LoginPage';

// Layout component that wraps all pages
const Layout = () => {
  return <App />;
};

export const router = createBrowserRouter([
  {
    path: '/',
    element: <Layout />,
    children: [
      {
        index: true,
        element: <Navigate to="/" replace />
      },
      {
        path: 'home',
        element: <Outlet />
      },
      {
        path: 'services',
        element: <ServicesPage isDarkMode={false} />
      },
      {
        path: 'about',
        element: <AboutPage isDarkMode={false} />
      },
      {
        path: 'contact',
        element: <ContactPage isDarkMode={false} />
      },
      {
        path: 'login',
        element: <LoginPage isDarkMode={false} />
      },
      {
        path: 'signup',
        element: <Outlet />
      },
      {
        path: 'account',
        element: <Outlet />
      },
      {
        path: 'profile',
        element: <Outlet />
      },
      {
        path: 'help',
        element: <Outlet />
      },
      {
        path: 'admin',
        element: <Outlet />
      },
      {
        path: 'admin/dashboard',
        element: <Outlet />
      },
      {
        path: 'admin/service-requests',
        element: <Outlet />
      },
      {
        path: 'admin/support-messages',
        element: <Outlet />
      },
      {
        path: 'admin/ready-forms',
        element: <Outlet />
      },
      {
        path: 'admin/faq',
        element: <Outlet />
      },
      {
        path: 'admin/analytics',
        element: <Outlet />
      },
      {
        path: 'admin/moderators',
        element: <Outlet />
      },
      {
        path: 'admin/health-insurance',
        element: <Outlet />
      },

      {
        path: 'admin/webhooks',
        element: <Outlet />
      },
      {
        path: 'admin/telegram-settings',
        element: <Outlet />
      },
      {
        path: 'auth/verify-email',
        element: <EmailVerification isDarkMode={false} />
      },
      {
        path: 'auth/callback',
        element: <AuthCallback />
      },
      {
        path: 'reset-password',
        element: <ResetPasswordPage />
      },
      {
        path: 'voluntary-return',
        element: <Outlet />
      },
      {
        path: 'theme-test',
        element: <ThemeToggleTest />
      },
      // Service routes
      ...servicesData.map(service => ({
        path: `services/${service.id}`,
        element: <Outlet />
      })),
      // 404 route - must be last
      {
        path: '*',
        element: <NotFoundPage isDarkMode={false} />
      }
    ]
  }
]);
