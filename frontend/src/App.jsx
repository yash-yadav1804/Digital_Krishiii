import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { AuthProvider, useAuth } from './context/AuthContext'
import ProtectedRoute from './components/ProtectedRoute'
import Navbar from './components/Navbar'
import Spinner from './components/Spinner'

import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import DashboardPage from './pages/DashboardPage'
import LandsPage from './pages/LandsPage'
import CropsPage from './pages/CropsPage'
import ContractsPage from './pages/ContractsPage'
import ContractDetailPage from './pages/ContractDetailPage'
import EquipmentPage from './pages/EquipmentPage'
import SupportPage from './pages/SupportPage'
import LandListingsPage from './pages/LandListingsPage'
import LeaseMarketplacePage from './pages/LeaseMarketplacePage'
import MarketplacePage from './pages/MarketplacePage'
import MyBidsPage from './pages/MyBidsPage'
import BuyerContractsPage from './pages/BuyerContractsPage'
import MyLeaseRequestsPage from './pages/MyLeaseRequestsPage'
import EquipmentRequestsPage from './pages/EquipmentRequestsPage'
import ReviewsPage from './pages/ReviewsPage'
import ProfilePage from './pages/ProfilePage'
import NotificationsPage from './pages/NotificationsPage'
import AdminPage from './pages/AdminPage'
import AdminProfilesPage from './pages/AdminProfilesPage'
import UnauthorizedPage from './pages/UnauthorizedPage'

function Layout() {
  return (
    <div className="app-shell">
      <Navbar />
      <main className="app-main">
        <Outlet />
      </main>
    </div>
  )
}

function AppRoutes() {
  const { loading } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Spinner size="lg" />
      </div>
    )
  }

  return (
    <Routes>
      {/* Public routes */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/unauthorized" element={<UnauthorizedPage />} />
      <Route path="/" element={<Navigate to="/dashboard" replace />} />

      {/* Protected routes with Navbar layout */}
      <Route element={<Layout />}>
        <Route path="/dashboard" element={
          <ProtectedRoute><DashboardPage /></ProtectedRoute>
        } />
        <Route path="/profile" element={
          <ProtectedRoute><ProfilePage /></ProtectedRoute>
        } />
        <Route path="/notifications" element={
          <ProtectedRoute><NotificationsPage /></ProtectedRoute>
        } />
        <Route path="/equipment" element={
          <ProtectedRoute><EquipmentPage /></ProtectedRoute>
        } />
        <Route path="/support" element={
          <ProtectedRoute><SupportPage /></ProtectedRoute>
        } />
        <Route path="/marketplace" element={
          <ProtectedRoute><MarketplacePage /></ProtectedRoute>
        } />

        {/* Farmer-only routes */}
        <Route path="/lands" element={
          <ProtectedRoute role="farmer"><LandsPage /></ProtectedRoute>
        } />
        <Route path="/crops" element={
          <ProtectedRoute role="farmer"><CropsPage /></ProtectedRoute>
        } />
        <Route path="/contracts" element={
          <ProtectedRoute role="farmer"><ContractsPage /></ProtectedRoute>
        } />
        <Route path="/contracts/:contractId" element={
          <ProtectedRoute><ContractDetailPage /></ProtectedRoute>
        } />
        <Route path="/land-listings" element={
          <ProtectedRoute role="farmer"><LandListingsPage /></ProtectedRoute>
        } />

        {/* Buyer-only routes */}
        <Route path="/lease-marketplace" element={
          <ProtectedRoute role="buyer"><LeaseMarketplacePage /></ProtectedRoute>
        } />
        <Route path="/my-bids" element={
          <ProtectedRoute role="buyer"><MyBidsPage /></ProtectedRoute>
        } />
        <Route path="/my-contracts" element={
          <ProtectedRoute role="buyer"><BuyerContractsPage /></ProtectedRoute>
        } />
        <Route path="/my-lease-requests" element={
          <ProtectedRoute role="buyer"><MyLeaseRequestsPage /></ProtectedRoute>
        } />

        {/* Equipment provider-only routes */}
        <Route path="/equipment-requests" element={
          <ProtectedRoute role="equipment_provider"><EquipmentRequestsPage /></ProtectedRoute>
        } />

        {/* Cross-role reputation */}
        <Route path="/reviews" element={
          <ProtectedRoute><ReviewsPage /></ProtectedRoute>
        } />

        {/* Admin-only routes */}
        <Route path="/admin" element={
          <ProtectedRoute role="admin"><AdminPage /></ProtectedRoute>
        } />
        <Route path="/admin/profiles" element={
          <ProtectedRoute role="admin"><AdminProfilesPage /></ProtectedRoute>
        } />
      </Route>

      {/* Catch-all */}
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: { borderRadius: '10px', fontSize: '14px' },
          }}
        />
      </AuthProvider>
    </BrowserRouter>
  )
}
