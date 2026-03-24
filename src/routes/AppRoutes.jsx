import { Routes, Route } from 'react-router-dom';
import { useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/common/Navbar';
import ProtectedRoute from '../components/common/ProtectedRoute';

// Auth Pages
import Login from "../pages/auth/Login";
import Register from "../pages/auth/Register";

// Landing Page
import Landing from "../pages/public/Landing";

// Dashboard Pages - Admin
import AdminDashboard from "../pages/dashboard/admin/AdminDashboard";
import AdminUsers from "../pages/dashboard/admin/AdminUsers";
import AdminVerifications from "../pages/dashboard/admin/AdminVerifications";

// Dashboard Pages - School
import SchoolDashboard from "../pages/dashboard/school/SchoolDashboard";
import SchoolProfile from "../pages/dashboard/school/SchoolProfile";
import SchoolNeeds from "../pages/dashboard/school/SchoolNeeds";
import SchoolDonations from "../pages/dashboard/school/SchoolDonations";
import SchoolTracking from "../pages/dashboard/school/SchoolTracking";
import SchoolMessages from "../pages/dashboard/school/SchoolMessages";
import SchoolAnalytics from "../pages/dashboard/school/SchoolAnalytics";

// Dashboard Pages - Donor
import DonorDashboard from "../pages/dashboard/donor/DonorDashboard";
import DonorProfile from "../pages/dashboard/donor/DonorProfile";
import DonationHistory from "../pages/dashboard/donor/DonationHistory";
import DonationTracking from "../pages/dashboard/donor/DonationTracking";
import BrowseSchools from "../pages/dashboard/donor/BrowseSchools";
import SchoolDetails from "../pages/dashboard/donor/SchoolDetails";
import DonorMessages from "../pages/dashboard/donor/DonorMessages";
import DonationCart from "../pages/dashboard/donor/DonationCart";
import DonorImpact from "../pages/dashboard/donor/DonorImpact";
import DonorCampaigns from "../pages/dashboard/donor/DonorCampaigns";
import CampaignDetails from "../pages/dashboard/donor/CampaignDetails";

// Dashboard Pages - Campaign
import CampaignDashboard from "../pages/dashboard/campaign/CampaignDashboard";
import CampaignProfile from "../pages/dashboard/campaign/CampaignProfile";
import CreateCampaign from "../pages/dashboard/campaign/CreateCampaign";
import CampaignTracking from "../pages/dashboard/campaign/CampaignTracking";
import CampaignMessages from "../pages/dashboard/campaign/CampaignMessages";

const AppRoutes = () => {
  const { user } = useAuth();
  
  useEffect(() => {
    console.log('🧭 AppRoutes - Current user:', user);
    console.log('🧭 AppRoutes - LocalStorage:', {
      user: localStorage.getItem('user'),
      token: localStorage.getItem('token')
    });
  }, [user]);

  return (
    <>
      <Navbar />
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* ========== Admin Routes ========== */}
        <Route path="/admin/dashboard" element={
          <ProtectedRoute allowedRoles={['admin']}>
            <AdminDashboard />
          </ProtectedRoute>
        } />
        <Route path="/admin/users" element={
          <ProtectedRoute allowedRoles={['admin']}>
            <AdminUsers />
          </ProtectedRoute>
        } />
        <Route path="/admin/verifications" element={
          <ProtectedRoute allowedRoles={['admin']}>
            <AdminVerifications />
          </ProtectedRoute>
        } />

        {/* ========== School Routes ========== */}
        <Route path="/school/dashboard" element={
          <ProtectedRoute allowedRoles={['school']}>
            <SchoolDashboard />
          </ProtectedRoute>
        } />
        <Route path="/school/profile" element={
          <ProtectedRoute allowedRoles={['school']}>
            <SchoolProfile />
          </ProtectedRoute>
        } />
        <Route path="/school/needs" element={
          <ProtectedRoute allowedRoles={['school']}>
            <SchoolNeeds />
          </ProtectedRoute>
        } />
        <Route path="/school/donations" element={
          <ProtectedRoute allowedRoles={['school']}>
            <SchoolDonations />
          </ProtectedRoute>
        } />
        <Route path="/school/tracking/:donationId" element={
          <ProtectedRoute allowedRoles={['school']}>
            <SchoolTracking />
          </ProtectedRoute>
        } />
        <Route path="/school/messages" element={
          <ProtectedRoute allowedRoles={['school']}>
            <SchoolMessages />
          </ProtectedRoute>
        } />
        <Route path="/school/messages/:donorId" element={
          <ProtectedRoute allowedRoles={['school']}>
            <SchoolMessages />
          </ProtectedRoute>
        } />
        <Route path="/school/analytics" element={
          <ProtectedRoute allowedRoles={['school']}>
            <SchoolAnalytics />
          </ProtectedRoute>
        } />

        {/* ========== Donor Routes ========== */}
        <Route path="/donor/dashboard" element={
          <ProtectedRoute allowedRoles={['donor']}>
            <DonorDashboard />
          </ProtectedRoute>
        } />
        <Route path="/donor/profile" element={
          <ProtectedRoute allowedRoles={['donor']}>
            <DonorProfile />
          </ProtectedRoute>
        } />
        <Route path="/donor/history" element={
          <ProtectedRoute allowedRoles={['donor']}>
            <DonationHistory />
          </ProtectedRoute>
        } />
        <Route path="/donor/tracking/:donationId" element={
          <ProtectedRoute allowedRoles={['donor']}>
            <DonationTracking />
          </ProtectedRoute>
        } />
        <Route path="/donor/browse" element={
          <ProtectedRoute allowedRoles={['donor']}>
            <BrowseSchools />
          </ProtectedRoute>
        } />
        <Route path="/school/:schoolId" element={
          <ProtectedRoute allowedRoles={['donor', 'campaign']}>
            <SchoolDetails />
          </ProtectedRoute>
        } />
        <Route path="/donor/messages" element={
          <ProtectedRoute allowedRoles={['donor']}>
            <DonorMessages />
          </ProtectedRoute>
        } />
        <Route path="/donor/messages/:schoolId" element={
          <ProtectedRoute allowedRoles={['donor']}>
            <DonorMessages />
          </ProtectedRoute>
        } />
        <Route path="/donor/cart" element={
          <ProtectedRoute allowedRoles={['donor']}>
            <DonationCart />
          </ProtectedRoute>
        } />
        <Route path="/donor/impact" element={
          <ProtectedRoute allowedRoles={['donor']}>
            <DonorImpact />
          </ProtectedRoute>
        } />
        <Route path="/donor/campaigns" element={
          <ProtectedRoute allowedRoles={['donor']}>
            <DonorCampaigns />
          </ProtectedRoute>
        } />
        <Route path="/donor/campaign/:campaignId" element={
          <ProtectedRoute allowedRoles={['donor']}>
            <CampaignDetails />
          </ProtectedRoute>
        } />

        {/* ========== Campaign Routes ========== */}
        <Route path="/campaign/dashboard" element={
          <ProtectedRoute allowedRoles={['campaign']}>
            <CampaignDashboard />
          </ProtectedRoute>
        } />
        <Route path="/campaign/profile" element={
          <ProtectedRoute allowedRoles={['campaign']}>
            <CampaignProfile />
          </ProtectedRoute>
        } />
        <Route path="/campaign/create" element={
          <ProtectedRoute allowedRoles={['campaign']}>
            <CreateCampaign />
          </ProtectedRoute>
        } />
        <Route path="/campaign/tracking/:campaignId" element={
          <ProtectedRoute allowedRoles={['campaign']}>
            <CampaignTracking />
          </ProtectedRoute>
        } />
        <Route path="/campaign/messages" element={
          <ProtectedRoute allowedRoles={['campaign']}>
            <CampaignMessages />
          </ProtectedRoute>
        } />
        <Route path="/campaign/messages/:schoolId" element={
          <ProtectedRoute allowedRoles={['campaign']}>
            <CampaignMessages />
          </ProtectedRoute>
        } />
      </Routes>
    </>
  );
};

export default AppRoutes;