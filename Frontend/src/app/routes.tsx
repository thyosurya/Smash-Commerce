import { createBrowserRouter, Navigate } from 'react-router';
import { UserLayout } from './components/UserLayout';
import { AdminLayout } from './components/AdminLayout';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import ForgotPassword from './pages/auth/ForgotPassword';
import Home from './pages/user/Home';
import ProductDetail from './pages/user/ProductDetail';
import Cart from './pages/user/Cart';
import Checkout from './pages/user/Checkout';
import OrderSuccess from './pages/user/OrderSuccess';
import Profile from './pages/user/Profile';
import Orders from './pages/user/Orders';
import ActivityLog from './pages/user/ActivityLog';
import Dashboard from './pages/admin/Dashboard';
import SalesReport from './pages/admin/SalesReport';
import UserAnalytics from './pages/admin/UserAnalytics';
import ProductManagement from './pages/admin/ProductManagement';
import AuditLog from './pages/admin/AuditLog';
import CRMSettings from './pages/admin/CRMSettings';
import StringingService from './pages/user/StringingService';
import StringingServiceManagement from './pages/admin/StringingServiceManagement';

export const router = createBrowserRouter([
  // Auth (no layout)
  { path: '/login', Component: Login },
  { path: '/register', Component: Register },
  { path: '/forgot-password', Component: ForgotPassword },

  // User Layout
  {
    path: '/',
    Component: UserLayout,
    children: [
      { index: true, Component: Home },
      { path: 'product/:id', Component: ProductDetail },
      { path: 'cart', Component: Cart },
      { path: 'stringing-service', Component: StringingService },
      { path: 'checkout', Component: Checkout },
      { path: 'order-success', Component: OrderSuccess },
      { path: 'profile', Component: Profile },
      { path: 'orders', Component: Orders },
      { path: 'activity', Component: ActivityLog },
    ],
  },

  // Admin Layout
  {
    path: '/admin',
    Component: AdminLayout,
    children: [
      { index: true, Component: Dashboard },
      { path: 'reports', Component: SalesReport },
      { path: 'sales', element: <Navigate to="/admin/reports" replace /> },
      { path: 'users', Component: UserAnalytics },
      { path: 'products', Component: ProductManagement },
      { path: 'stringing-service', Component: StringingServiceManagement },
      { path: 'audit', Component: AuditLog },
      { path: 'crm', Component: CRMSettings },
    ],
  },

  // Fallback
  { path: '*', element: <Navigate to="/login" replace /> },
]);
