import React, { useState, useEffect } from "react";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import {
  User,
  Mail,
  Globe,
  Calendar,
  Briefcase,
  MapPin,
  Github,
  Linkedin,
  Award,
  BookOpen,
  Star,
  X,
  ChevronDown,
  ChevronUp,
  MessageSquare,
  FileText,
  Sparkles,
  Link,
  Phone,
} from "lucide-react";

const ViewItianProfile = () => {
  const { userId } = useParams();
  const navigate = useNavigate();
  const currentUser = useSelector((state) => state.user.user);
  const [profile, setProfile] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [expandedSections, setExpandedSections] = useState({
    contact: true,
    professional: true,
    skills: true,
    projects: true,
  });

  const BASE_URL = "http://localhost:8000";

  const toggleSection = (section) => {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
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
      const token = localStorage.getItem("access-token");
      if (!token) {
        setError("You must be logged in to view profiles.");
        setLoading(false);
        navigate("/login");
        return;
      }

      const response = await axios.get(
        `${BASE_URL}/api/itian-profile/${userId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.status === 200 && response.data) {
        const profileData = response.data.data;
        setProfile(profileData);
      } else {
        setError("No profile data available for this user.");
      }
    } catch (err) {
      console.error("Fetch error:", err);

      if (err.response) {
        const status = err.response.status;
        const message = err.response.data?.message || err.message;

        if (status === 401 || status === 403) {
          setError(
            "You are not authorized to view this profile. Please log in."
          );
          navigate("/login");
        } else if (status === 404) {
          setError("Profile not found for this user ID.");
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
        <p className="ml-6 text-gray-800 text-xl font-medium animate-pulse">
          Loading profile...
        </p>
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
              onClick={() => navigate("/login")}
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
          <p className="text-gray-700 text-lg mb-4">
            No profile data available.
          </p>
          <p className="text-gray-600 mb-6">
            It seems this user does not have a public profile yet.
          </p>
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

            {/* Profile Picture */}
            <div className="absolute -bottom-16 left-6">
              <div className="relative">
                <div className="w-36 h-36 rounded-full border-4 border-white bg-white shadow-lg overflow-hidden">
                  {profile.profile_picture_url ? (
                    <img
                      src={profile.profile_picture_url}
                      alt="Profile"
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.target.style.display = "none";
                        e.target.nextSibling.style.display = "flex";
                      }}
                    />
                  ) : null}
                  <div
                    className="w-full h-full bg-gray-200 flex items-center justify-center text-gray-500"
                    style={{
                      display: profile.profile_picture_url ? "none" : "flex",
                    }}
                  >
                    <User size={72} />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Profile Info */}
          <div className="pt-20 px-6 pb-6">
            <div className="flex justify-between items-start">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">
                  {profile.first_name} {profile.last_name}
                </h2>
                {profile.current_job_title && (
                  <p className="text-gray-600 mt-1">
                    {profile.current_job_title}
                  </p>
                )}
                <p className="text-gray-600 mt-2">
                  {profile.bio || "No bio provided"}
                </p>
              </div>

              {/* Action Buttons (positioned where Edit button would be) */}
              <div className="flex gap-4">
                <button
                  onClick={() =>
                    navigate(`/my-posts?userId=${profile.user_id}`)
                  }
                  className="flex items-center gap-2 bg-[#d0443c] text-white px-4 py-2 rounded-lg hover:bg-[#a0302c] transition shadow-md"
                >
                  <FileText size={18} />
                  <span>View Posts</span>
                </button>
              {/* <button
                onClick={() => {
                  if (profile) {
                    const role = currentUser?.role;

                    const chatRoute =
                      role === 'employer' ? '/employer/mychat' :
                      role === 'itian' ? '/itian/mychat' :
                      '/login';

                    navigate(chatRoute, {
                      state: {
                        user: profile.user_id,
                        name: `${profile.first_name} ${profile.last_name}`,
                        avatar: profile.profile_picture_url,
                      },
                    });
                  }
                }}
                className="flex items-center gap-2 bg-[#d0443c] text-white px-4 py-2 rounded-lg hover:bg-[#a0302c] transition shadow-md"
              >
                <MessageSquare size={18} />
                <span>Chat</span>
              </button> */}

              </div>
            </div>

            {/* ITI Info */}
            <div className="mt-6 flex flex-wrap gap-4">
              <div className="flex items-center bg-gray-50 px-4 py-2 rounded-lg">
                <Briefcase className="text-[#d0443c] mr-2" size={16} />
                <span className="text-gray-700">
                  {profile.iti_track || "ITI Track"}
                </span>
              </div>
              <div className="flex items-center bg-gray-50 px-4 py-2 rounded-lg">
                <Calendar className="text-[#d0443c] mr-2" size={16} />
                <span className="text-gray-700">
                  Graduated {profile.graduation_year || "Year"}
                </span>
              </div>
              {profile.experience_years !== null && (
                <div className="flex items-center bg-gray-50 px-4 py-2 rounded-lg">
                  <Star className="text-[#d0443c] mr-2" size={16} />
                  <span className="text-gray-700">
                    {profile.experience_years} years experience
                  </span>
                </div>
              )}
              <div className="flex items-center bg-gray-50 px-4 py-2 rounded-lg">
                <Sparkles className="text-[#d0443c] mr-2" size={16} />
                <span className="text-gray-700">
                  {profile.is_open_to_work
                    ? "Open to work"
                    : "Not currently looking"}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Profile Sections */}
        <div className="space-y-6">
          {/* Contact Information Card */}
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div
              className="flex justify-between items-center p-6 cursor-pointer border-b border-gray-200"
              onClick={() => toggleSection("contact")}
            >
              <h3 className="text-xl font-bold text-gray-900">
                Contact Information
              </h3>
              {expandedSections.contact ? <ChevronUp /> : <ChevronDown />}
            </div>

            {expandedSections.contact && (
              <div className="px-6 pb-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                {profile.email && (
                  <div className="flex items-center">
                    <Mail className="text-[#d0443c] mr-3" size={20} />
                    <div>
                      <p className="text-gray-500 text-sm">Email</p>
                      <p className="text-gray-900">{profile.email}</p>
                    </div>
                  </div>
                )}
                {profile.number && (
                  <div className="flex items-center">
                    <Phone className="text-[#d0443c] mr-3" size={20} />
                    <div>
                      <p className="text-gray-500 text-sm">Phone</p>
                      <p className="text-gray-900">{profile.number}</p>
                    </div>
                  </div>
                )}
                {profile.portfolio_url && (
                  <div className="flex items-center">
                    <Globe className="text-[#d0443c] mr-3" size={20} />
                    <div>
                      <p className="text-gray-500 text-sm">Portfolio</p>
                      <a
                        href={profile.portfolio_url}
                        target="_blank"
                        rel="noreferrer"
                        className="text-[#d0443c] hover:underline"
                      >
                        {profile.portfolio_url}
                      </a>
                    </div>
                  </div>
                )}
                {profile.linkedin_profile_url && (
                  <div className="flex items-center">
                    <Linkedin className="text-[#d0443c] mr-3" size={20} />
                    <div>
                      <p className="text-gray-500 text-sm">LinkedIn</p>
                      <a
                        href={profile.linkedin_profile_url}
                        target="_blank"
                        rel="noreferrer"
                        className="text-[#d0443c] hover:underline"
                      >
                        {profile.linkedin_profile_url}
                      </a>
                    </div>
                  </div>
                )}
                {profile.github_profile_url && (
                  <div className="flex items-center">
                    <Github className="text-[#d0443c] mr-3" size={20} />
                    <div>
                      <p className="text-gray-500 text-sm">GitHub</p>
                      <a
                        href={profile.github_profile_url}
                        target="_blank"
                        rel="noreferrer"
                        className="text-[#d0443c] hover:underline"
                      >
                        {profile.github_profile_url}
                      </a>
                    </div>
                  </div>
                )}
                {profile.cv_url && (
                  <div className="flex items-center">
                    <FileText className="text-[#d0443c] mr-3" size={20} />
                    <div>
                      <p className="text-gray-500 text-sm">CV</p>
                      <a
                        href={profile.cv_url}
                        target="_blank"
                        rel="noreferrer"
                        className="text-[#d0443c] hover:underline"
                      >
                        View CV
                      </a>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Professional Details Card */}
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div
              className="flex justify-between items-center p-6 cursor-pointer border-b border-gray-200"
              onClick={() => toggleSection("professional")}
            >
              <h3 className="text-xl font-bold text-gray-900">
                Professional Details
              </h3>
              {expandedSections.professional ? <ChevronUp /> : <ChevronDown />}
            </div>

            {expandedSections.professional && (
              <div className="px-6 pb-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="flex items-center">
                  <Briefcase className="text-[#d0443c] mr-3" size={20} />
                  <div>
                    <p className="text-gray-500 text-sm">ITI Track</p>
                    <p className="text-gray-900">
                      {profile.iti_track || "Not provided"}
                    </p>
                  </div>
                </div>
                <div className="flex items-center">
                  <Calendar className="text-[#d0443c] mr-3" size={20} />
                  <div>
                    <p className="text-gray-500 text-sm">Graduation Year</p>
                    <p className="text-gray-900">
                      {profile.graduation_year || "Not provided"}
                    </p>
                  </div>
                </div>
                <div className="flex items-center">
                  <Star className="text-[#d0443c] mr-3" size={20} />
                  <div>
                    <p className="text-gray-500 text-sm">Experience</p>
                    <p className="text-gray-900">
                      {profile.experience_years !== null
                        ? `${profile.experience_years} years`
                        : "Not provided"}
                    </p>
                  </div>
                </div>
                {profile.current_job_title && (
                  <div className="flex items-center">
                    <Briefcase className="text-[#d0443c] mr-3" size={20} />
                    <div>
                      <p className="text-gray-500 text-sm">Current Position</p>
                      <p className="text-gray-900">
                        {profile.current_job_title}
                        {profile.current_company &&
                          ` at ${profile.current_company}`}
                      </p>
                    </div>
                  </div>
                )}
                {profile.preferred_job_locations && (
                  <div className="flex items-center">
                    <MapPin className="text-[#d0443c] mr-3" size={20} />
                    <div>
                      <p className="text-gray-500 text-sm">
                        Preferred Locations
                      </p>
                      <p className="text-gray-900">
                        {profile.preferred_job_locations}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Skills Card */}
          {profile.skills?.length > 0 && (
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              <div
                className="flex justify-between items-center p-6 cursor-pointer border-b border-gray-200"
                onClick={() => toggleSection("skills")}
              >
                <h3 className="text-xl font-bold text-gray-900">Skills</h3>
                {expandedSections.skills ? <ChevronUp /> : <ChevronDown />}
              </div>

              {expandedSections.skills && (
                <div className="px-6 pb-6">
                  <div className="flex flex-wrap gap-3">
                    {profile.skills.map((skill) => (
                      <span
                        key={skill.id}
                        className="bg-[#f0e6e6] text-[#d0443c] px-4 py-2 rounded-full text-sm font-medium"
                      >
                        {skill.skill_name}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Projects Card */}
          {profile.projects?.length > 0 && (
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              <div
                className="flex justify-between items-center p-6 cursor-pointer border-b border-gray-200"
                onClick={() => toggleSection("projects")}
              >
                <h3 className="text-xl font-bold text-gray-900">Projects</h3>
                {expandedSections.projects ? <ChevronUp /> : <ChevronDown />}
              </div>

              {expandedSections.projects && (
                <div className="px-6 pb-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {profile.projects.map((project) => (
                      <div
                        key={project.id}
                        className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition"
                      >
                        <h4 className="text-lg font-bold text-gray-900 mb-2">
                          {project.project_title}
                        </h4>
                        {project.description && (
                          <p className="text-gray-600 mb-4">
                            {project.description}
                          </p>
                        )}
                        {project.project_link && (
                          <a
                            href={project.project_link}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center text-[#d0443c] hover:underline"
                          >
                            <Link className="mr-1" size={16} />
                            View Project
                          </a>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ViewItianProfile;