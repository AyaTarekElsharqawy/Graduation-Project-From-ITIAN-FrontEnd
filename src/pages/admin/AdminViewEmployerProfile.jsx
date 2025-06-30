import React, { useState, useEffect } from "react";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";
import {
  Building2,
  MapPin,
  Mail,
  Phone,
  Globe,
  Users,
  User,
  Link,
  Sparkles,
  ChevronDown,
  ChevronUp,
  MessageSquare,
  FileText,
  Briefcase,
  Calendar,
  Star,
} from "lucide-react";

const ViewEmployerProfile = () => {
  const { userId } = useParams();
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [expandedSections, setExpandedSections] = useState({
    contact: true,
    company: true,
  });

  const BASE_URL = "http://localhost:8000";

  const toggleSection = (section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const fetchProfileData = async () => {
    if (!userId) {
      setError("User ID is required.");
      setLoading(false);
      return;
    }

    setLoading(true);
    setError("");

    try {
      const token = localStorage.getItem('access-token');
      if (!token) {
        setError("You must be logged in to view profiles.");
        setLoading(false);
        navigate('/login');
        return;
      }

      const response = await axios.get(`${BASE_URL}/api/employer-public-profile/${userId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Accept": "application/json",
        },
      });

      if (response.status === 200 && response.data) {
        const profileData = response.data.data;
        setProfile(profileData);
      } else {
        setError("No profile data available for this employer.");
      }
    } catch (err) {
      console.error("Fetch error:", err);

      if (err.response) {
        const status = err.response.status;
        const message = err.response.data?.message || err.message;

        if (status === 401 || status === 403) {
          setError("You are not authorized to view this profile. Please log in.");
          navigate('/login');
        } else if (status === 404) {
          setError("Employer profile not found for this user ID.");
        } else if (status === 500) {
          setError("Server error occurred. Please try again later.");
        } else {
          setError(`Error ${status}: ${message}`);
        }
      } else if (err.request) {
        setError("Network error. Please check your connection and try again.");
      } else {
        setError("An unexpected error occurred.");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfileData();
  }, [userId, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="relative">
          <div className="w-20 h-20 border-4 border-red-200 border-t-red-600 rounded-full animate-spin"></div>
          <div className="absolute inset-0 w-20 h-20 border-4 border-transparent border-t-red-500 rounded-full animate-spin animation-delay-150"></div>
          <Sparkles className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-red-600 w-8 h-8 animate-pulse" />
        </div>
        <p className="ml-6 text-gray-800 text-xl font-medium animate-pulse">Loading employer profile...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center h-screen bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="bg-white p-8 rounded-xl shadow-md text-center max-w-md">
          <p className="text-red-500 text-lg mb-4">{error}</p>
          {error.includes("log in") ? (
            <button
              onClick={() => navigate('/login')}
              className="px-6 py-3 bg-[#d0443c] text-white rounded-lg hover:bg-[#a0302c] transition duration-300 shadow-md"
            >
              Go to Login
            </button>
          ) : (
            <button
              onClick={fetchProfileData}
              className="px-6 py-3 bg-[#d0443c] text-white rounded-lg hover:bg-[#a0302c] transition duration-300 shadow-md"
            >
              Try Again
            </button>
          )}
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="flex justify-center items-center h-screen bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="bg-white p-8 rounded-xl shadow-md text-center max-w-md">
          <Sparkles className="h-12 w-12 text-[#d0443c] mx-auto mb-4" />
          <p className="text-gray-700 text-lg mb-4">No employer profile data available.</p>
          <p className="text-gray-600 mb-6">It seems this employer does not have a public profile yet.</p>
          <button
            onClick={() => navigate(-1)}
            className="px-6 py-3 bg-[#d0443c] text-white rounded-lg hover:bg-[#a0302c] transition duration-300 shadow-md"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        {/* Profile Card */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden mb-6">
          <div className="relative">
            {/* Cover Photo */}
            <div className="h-48 bg-gradient-to-r from-[#d0443c] to-[#a0302c]"></div>
            
            {/* Company Logo */}
            <div className="absolute -bottom-16 left-6">
              <div className="relative">
                <div className="w-36 h-36 rounded-full border-4 border-white bg-white shadow-lg overflow-hidden">
                  {profile.company_logo_url ? (
                    <img 
                      src={profile.company_logo_url} 
                      alt="Company Logo" 
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.target.style.display = 'none';
                        e.target.nextSibling.style.display = 'flex';
                      }}
                    />
                  ) : null}
                  <div className="w-full h-full bg-gray-200 flex items-center justify-center text-gray-500" style={{ display: profile.company_logo_url ? 'none' : 'flex' }}>
                    <Building2 size={72} />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Company Info */}
          <div className="pt-20 px-6 pb-6">
            <div className="flex justify-between items-start">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">
                  {profile.company_name}
                </h2>
                {profile.industry && (
                  <p className="text-gray-600 mt-1">{profile.industry}</p>
                )}
                <p className="text-gray-600 mt-2">{profile.company_description || "No company description provided"}</p>
                <div className="mt-4 flex gap-4">
                <button
                 onClick={() => navigate(`/itian/mychat`, { state: { user: profile.user_id, name: profile.company_name } })}
                 className="px-5 py-2 bg-[#d0443c] text-white rounded-lg hover:bg-[#a0302c] transition"
                 >
                  Message Employer
                </button>

                <button
                  onClick={() => navigate(`/jobs?employer_id=${profile.user_id}`)}
                  className="px-5 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition"
                >
                  View Jobs
                </button>
              </div>
              </div>
            </div>

            {/* Company Info Tags */}
            <div className="mt-6 flex flex-wrap gap-4">
              {profile.industry && (
                <div className="flex items-center bg-gray-50 px-4 py-2 rounded-lg">
                  <Building2 className="text-[#d0443c] mr-2" size={16} />
                  <span className="text-gray-700">{profile.industry}</span>
                </div>
              )}
              {profile.location && (
                <div className="flex items-center bg-gray-50 px-4 py-2 rounded-lg">
                  <MapPin className="text-[#d0443c] mr-2" size={16} />
                  <span className="text-gray-700">{profile.location}</span>
                </div>
              )}
              {profile.username && (
                <div className="flex items-center bg-gray-50 px-4 py-2 rounded-lg">
                  <User className="text-[#d0443c] mr-2" size={16} />
                  <span className="text-gray-700">@{profile.username}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Profile Sections */}
        <div className="space-y-6">
          {/* Contact Information Card */}
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div 
              className="flex justify-between items-center p-6 cursor-pointer border-b border-gray-200"
              onClick={() => toggleSection('contact')}
            >
              <h3 className="text-xl font-bold text-gray-900">
                Contact Information
              </h3>
              {expandedSections.contact ? <ChevronUp /> : <ChevronDown />}
            </div>
            
            {expandedSections.contact && (
              <div className="px-6 pb-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                {profile.contact_person_name && (
                  <div className="flex items-center">
                    <User className="text-[#d0443c] mr-3" size={20} />
                    <div>
                      <p className="text-gray-500 text-sm">Contact Person</p>
                      <p className="text-gray-900">{profile.contact_person_name}</p>
                    </div>
                  </div>
                )}
                {profile.contact_email && (
                  <div className="flex items-center">
                    <Mail className="text-[#d0443c] mr-3" size={20} />
                    <div>
                      <p className="text-gray-500 text-sm">Email</p>
                      <p className="text-gray-900">{profile.contact_email}</p>
                    </div>
                  </div>
                )}
                {profile.phone_number && (
                  <div className="flex items-center">
                    <Phone className="text-[#d0443c] mr-3" size={20} />
                    <div>
                      <p className="text-gray-500 text-sm">Phone</p>
                      <p className="text-gray-900">{profile.phone_number}</p>
                    </div>
                  </div>
                )}
                {profile.website_url && (
                  <div className="flex items-center">
                    <Globe className="text-[#d0443c] mr-3" size={20} />
                    <div>
                      <p className="text-gray-500 text-sm">Website</p>
                      <a 
                        href={profile.website_url} 
                        target="_blank" 
                        rel="noreferrer"
                        className="text-[#d0443c] hover:underline"
                      >
                        {profile.website_url}
                      </a>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ViewEmployerProfile;