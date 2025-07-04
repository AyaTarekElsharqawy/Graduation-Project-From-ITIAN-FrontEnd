import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Provider, useSelector, useDispatch } from "react-redux";
import { useEffect } from "react";
import store from "./store";
import "./App.css";
import useAuthInit from "./hooks/useAuthInit";

// Layouts
import NoLayout from "./pages/layouts/NoLayout";
import ItianLayout from "./pages/layouts/ItianLayout";
import EmployerLayout from "./pages/layouts/EmployerLayout";
import AdminLayout from "./pages/layouts/AdminLayout";
import WithoutLoginLayout from "./pages/layouts/layoutWithoutLogin";

// Route Protectors
import PrivateRoute from "./components/auth/PrivateRoute";
import PublicRoute from "./components/auth/PublicRoute";
import AdminRoute from "./components/auth/AdminRoute";
import ItianRoute from "./components/auth/ItianRoute";
import EmployerRoute from "./components/auth/EmployerRoute";

// Components
import LoaderOverlay from "./components/LoaderOverlay";
import Unauthorized from "./pages/Unauthorized";
import NotFoundPage from "./components/NotFoundPage";

// Auth Pages
import Register from "./pages/Register";
import Login from "./pages/Login";
import ResetPassword from "./pages/ResetPassword";

// Admin
import adminRoutes from "./pages/admin/adminRoutes";
import AdminRagPage from "./pages/admin/AdminRagPage";

// Employer Pages
import PostJob from "./pages/Employer/pages/PostJob";
import JobList from "./pages/Employer/pages/DisplayJob";
import TrashPage from "./pages/Employer/pages/TrashPage";
import JobDetails from "./pages/Employer/pages/JobDetails";
import JobApplications from "./pages/Employer/pages/JobApplications";
import ChatApp from "./pages/Employer/pages/ChatApp";

// Itian Pages
import JobsPage from "./pages/Itian/JobsPage";
import JobDetailsPublic from "./pages/Itian/JobDetails";
import ApplyForm from "./pages/Itian/ApplyForm";
import MyApplications from "./pages/Itian/MyApplications";
import ProposalDetails from "./pages/Itian/ProposalDetails";

// Profile Pages
import CreateEmployerProfile from "./pages/profiles/CreateEmployerProfile";
import EmployerProfile from "./pages/profiles/EmployerProfile";
import CreateItianProfile from "./pages/profiles/CreateItianProfile";
import ItianProfile from "./pages/profiles/ItianProfile";
import ViewItianProfile from "./pages/profiles/ViewItianProfile";
import ViewEmployerProfile from "./pages/profiles/ViewEmployerProfile";

// Redux Actions for Profiles
import { fetchItianProfile } from "./store/itianProfileSlice";
import { fetchEmployerProfile } from "./store/employerProfileSlice";
// Other Pages
import LandingPageContent from "./pages/homePage/app/page";
import PaymentPage from "./pages/PaymentPage";
import PostsList from "./Posts/components/posts/PostList";
import MyPostsPage from "./Posts/components/posts/MyPostsPage";
import RagChat from "./AI Chat/RagChat";
import ChatbotButton from "./AI Chat/ChatbotButton";
import CreateReportPage from "./pages/CreateReportPage";
import MyReportsPage from "./pages/MyReportsPage";
import EmailVerifiedSuccess from "./pages/EmailVerifiedSuccess";
import EmailVerificationFailed from "./pages/EmailVerificationFailed";

function AppContent() {
  useAuthInit();
  const user = useSelector((state) => state.user.user);
  const dispatch = useDispatch();

  // Fetch user-specific profile data after login
  useEffect(() => {
    if (user && user.id) {
      if (user.role === "itian") {
        dispatch(fetchItianProfile(user.id));
      } else if (user.role === "employer") {
        dispatch(fetchEmployerProfile(user.id));
      }
    }
  }, [user, dispatch]);


  return (
    <Router>
      <Routes>
        {/* Public Routes (No auth required) */}
        <Route element={<PublicRoute />}>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/reset-password" element={<ResetPassword />} />
        </Route>
        {/* Add these two new routes for email verification */}
        <Route
          path="/email-verified-successfully"
          element={<EmailVerifiedSuccess />}
        />
        <Route
          path="/email-verification-failed"
          element={<EmailVerificationFailed />}
        />

        {/* Public Landing Page */}
        <Route path="/" element={<WithoutLoginLayout />}>
          <Route index element={<LandingPageContent />} />

          {/* Public Profile Views */}
          <Route path="/itian-profile/:userId" element={<ViewItianProfile />} />
          <Route
            path="/employer-profile/:userId"
            element={<ViewEmployerProfile />}
          />
        </Route>

        {/* Admin Routes */}
        <Route path="/admin" element={<AdminRoute />}>
          <Route element={<AdminLayout />}>
            {adminRoutes}
            <Route path="/admin/rag-tools" element={<AdminRagPage />} />
          </Route>
        </Route>

        {/* Itian Routes */}
        <Route element={<ItianRoute />}>
          <Route element={<ItianLayout />}>
            <Route path="/itian" element={<LandingPageContent />} />
            <Route path="/jobs" element={<JobsPage />} />
            <Route path="/jobs/:id" element={<JobDetailsPublic />} />
            <Route path="/apply/:id" element={<ApplyForm />} />
            <Route path="/my-applications" element={<MyApplications />} />
            <Route path="/my-applications/:id" element={<ProposalDetails />} />
            <Route path="/posts" element={<PostsList />} />
            <Route path="/my-posts" element={<MyPostsPage />} />
            <Route path="/itian-profile" element={<ItianProfile />} />
            <Route
              path="/create-itian-profile"
              element={<CreateItianProfile />}
            />
            <Route path="/itian/mychat" element={<ChatApp />} />
            <Route
              path="/itian/reports/create"
              element={<CreateReportPage />}
            />
            <Route path="/itian/my-reports" element={<MyReportsPage />} />
            {/* Allow Itian to view employer profiles */}
            <Route
              path="/employer-profile/:userId"
              element={<ViewEmployerProfile />}
            />
          </Route>
        </Route>

        {/* Employer Routes */}
        <Route element={<EmployerRoute />}>
          <Route element={<EmployerLayout />}>
            <Route path="/employer" element={<LandingPageContent />} />
            <Route path="/employer/post-job" element={<PostJob />} />
            <Route path="/employer/jobs" element={<JobList />} />
            <Route path="/employer/trash" element={<TrashPage />} />
            <Route path="/employer/job/:id" element={<JobDetails />} />
            <Route
              path="/employer/job/:id/applications"
              element={<JobApplications />}
            />
            <Route path="/employer/mychat" element={<ChatApp />} />
            <Route path="/payment" element={<PaymentPage />} />
            <Route path="/employer-profile" element={<EmployerProfile />} />
            <Route
              path="/create-employer-profile"
              element={<CreateEmployerProfile />}
            />
            <Route
              path="/employer/reports/create"
              element={<CreateReportPage />}
            />
            <Route path="/employer/my-reports" element={<MyReportsPage />} />
            {/* Allow Employer to view itian profiles */}
            <Route
              path="/itian-profile/:userId"
              element={<ViewItianProfile />}
            />
          </Route>
        </Route>

        {/* AI Chat Route (for any authenticated user) */}
        <Route element={<PrivateRoute />}>
          <Route path="/rag" element={<RagChat />} />
        </Route>

        {/* Error Pages */}
        <Route path="/unauthorized" element={<Unauthorized />} />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>

      {/* Chatbot Button (shown when authenticated) */}
      {user && user.id && <ChatbotButton />}
    </Router>
  );
}

function App() {
  return (
    <Provider store={store}>
      <AppContent />
    </Provider>
  );
}

export default App;
