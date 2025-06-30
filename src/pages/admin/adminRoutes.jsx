import React from 'react';
import { Route } from 'react-router-dom';
// import AdminLayout from './AdminLayout.jsx';
// import AdminDashboard from './AdminDashboard.jsx';
import Approvals from './Approvals.jsx';
import Posts from './Posts.jsx';
import Users from './Users.jsx';
import Jobs from './Jobs.jsx';
import AdminReportPage from './AdminReportPage.jsx';
import AdminSetPricePage from './AdminSetPricePage.jsx';
import AdminSendEmail from './AdminSendEmailPage.jsx';
import AdminTestimonials from './AdminTestimonials.jsx';
import ViewItianProfile from '../profiles/ViewItianProfile.jsx';
import ViewEmployerProfile from '../profiles/ViewEmployerProfile.jsx';


const adminRoutes = [
  <Route key="admin-dashboard" index element={<AdminReportPage />} />,
  <Route key="approvals" path="approvals" element={<Approvals />} />,
  <Route key="posts" path="posts" element={<Posts />} />,
  <Route key="users" path="users" element={<Users />} />,
  <Route key="jobs" path="jobs" element={<Jobs />} />,
  <Route key="reports" path="reports" element={<AdminReportPage />} />,
  <Route key="set-price" path="set-price" element={<AdminSetPricePage />} />,
  <Route key="send-email" path="send-email" element={<AdminSendEmail />} />,
  <Route key="testimonials" path="testimonials" element={<AdminTestimonials />} />,
  <Route path="/admin/itian-profile/:userId" element={<ViewItianProfile />} />,
<Route path="/admin/employer-profile/:userId" element={<ViewEmployerProfile />} />

];

export default adminRoutes;