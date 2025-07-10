import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { useForm, useFieldArray } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as Yup from "yup";
import {
  User,
  Mail,
  Globe,
  Calendar,
  Briefcase,
  MapPin,
  Github,
  Linkedin,
  Upload,
  X,
  BookOpen,
  Sparkles,
} from "lucide-react";

// Yup validation schema
const schema = Yup.object().shape({
  first_name: Yup.string()
    .required("First name is required")
    .max(100, "First name must be at most 100 characters"),
  last_name: Yup.string()
    .required("Last name is required")
    .max(100, "Last name must be at most 100 characters"),
  bio: Yup.string().nullable(),
  iti_track: Yup.string()
    .required("ITI track is required")
    .max(100, "ITI track must be at most 100 characters"),
  graduation_year: Yup.number()
    .required("Graduation year is required")
    .typeError("Graduation year must be a number")
    .integer("Graduation year must be an integer"),
  experience_years: Yup.number()
    .nullable()
    .typeError("Experience years must be a number")
    .integer("Experience years must be an integer")
    .min(0, "Experience years cannot be negative"),
  is_open_to_work: Yup.mixed()
    .required("Open to work status is required")
    .test("is-boolean-or-string", "Invalid open to work value", (value) =>
      [true, false, "true", "false", "1", "0"].includes(value)
    ),
  portfolio_url: Yup.string()
    .nullable()
    .url("Portfolio URL must be a valid URL")
    .max(500, "Portfolio URL must be at most 500 characters"),
  preferred_job_locations: Yup.string()
    .nullable()
    .max(500, "Preferred job locations must be at most 500 characters"),
  linkedin_profile_url: Yup.string()
    .nullable()
    .url("LinkedIn URL must be a valid URL")
    .matches(
      /^(https?:\/\/)?(www\.)?linkedin\.com\/in\/[a-zA-Z0-9_-]+\/?$/,
      "Please enter a valid LinkedIn profile URL (e.g., https://www.linkedin.com/in/username)"
    )
    .max(500, "LinkedIn URL must be at most 500 characters"),
  github_profile_url: Yup.string()
    .nullable()
    .url("GitHub URL must be a valid URL")
    .matches(
      /^(https?:\/\/)?(www\.)?github\.com\/[a-zA-Z0-9_-]+\/?$/,
      "Please enter a valid GitHub profile URL (e.g., https://github.com/username)"
    )
    .max(500, "GitHub URL must be at most 500 characters"),
  current_job_title: Yup.string()
    .nullable()
    .max(255, "Current job title must be at most 255 characters"),
  current_company: Yup.string()
    .nullable()
    .max(255, "Current company must be at most 255 characters"),
  email: Yup.string()
    .nullable()
    .email("Email must be a valid email address")
    .max(255, "Email must be at most 255 characters"),
  skills: Yup.array()
    .of(
      Yup.object().shape({
        skill_name: Yup.string()
          .required("Skill name is required")
          .min(2, "Skill name must be at least 2 characters")
          .max(100, "Skill name must be at most 100 characters"),
      })
    )
    .min(1, "At least one skill is required"),
  projects: Yup.array()
    .of(
      Yup.object().shape({
        project_title: Yup.string()
          .required("Project title is required")
          .min(3, "Project title must be at least 3 characters")
          .max(255, "Project title must be at most 255 characters"),
        description: Yup.string()
          .nullable()
          .max(2000, "Description must be at most 2000 characters"),
        project_link: Yup.string()
          .nullable()
          .url("Project link must be a valid URL")
          .max(500, "Project link must be at most 500 characters"),
      })
    )
    .min(1, "At least one project is required"),
  cv: Yup.mixed()
    .test('fileType', 'CV must be a PDF, DOC, or DOCX file', (value) => {
      if (!value || value.length === 0) return true; // allow empty (nullable)
      const file = value[0];
      if (!file) return true;
      const allowedTypes = [
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      ];
      return allowedTypes.includes(file.type);
    }),
  profile_picture: Yup.mixed()
    .test('fileType', 'The profile picture field must be an image (jpg, png, gif, webp).', (value) => {
      if (!value || value.length === 0) return true; // allow empty (nullable)
      const file = value[0];
      if (!file) return true;
      const validImageTypes = [
        'image/jpeg',
        'image/png',
        'image/gif',
        'image/webp',
        'image/jpg',
      ];
      return validImageTypes.includes(file.type);
    }),
});

const CreateItianProfile = () => {
  const navigate = useNavigate();
  const { register, handleSubmit, control, formState: { errors }, watch, reset } = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      first_name: "",
      last_name: "",
      bio: "",
      iti_track: "",
      graduation_year: "",
      experience_years: "",
      is_open_to_work: false,
      portfolio_url: "",
      preferred_job_locations: "",
      linkedin_profile_url: "",
      github_profile_url: "",
      current_job_title: "",
      current_company: "",
      email: "",
      skills: [{ skill_name: "" }],
      projects: [{ project_title: "", description: "", project_link: "" }],
    },
  });
  const { fields: skillFields, append: appendSkill, remove: removeSkill } = useFieldArray({
    control,
    name: "skills",
  });
  const { fields: projectFields, append: appendProject, remove: removeProject } = useFieldArray({
    control,
    name: "projects",
  });
  const [previewImage, setPreviewImage] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  // Check for token on mount
  useEffect(() => {
    const token = localStorage.getItem("access-token");
    if (!token) {
      setError("Authentication required. Please log in.");
      setLoading(false);
    } else {
      setLoading(false);
    }
  }, []);

  // Preview profile picture
  const profilePictureFile = watch("profile_picture");
  useEffect(() => {
    if (profilePictureFile && profilePictureFile[0]) {
      setPreviewImage(URL.createObjectURL(profilePictureFile[0]));
    } else {
      setPreviewImage(null);
    }
  }, [profilePictureFile]);

  const onSubmit = async (data) => {
    setError("");
    setLoading(true);

    const token = localStorage.getItem("access-token");
    if (!token) {
      setError("Authentication required. Please log in.");
      setLoading(false);
      return;
    }

    // Check for client-side validation errors before sending
    if (Object.keys(errors).length > 0) {
      setLoading(false);
      return;
    }

    const formData = new FormData();
    Object.keys(data).forEach((key) => {
      if (key === "skills") {
        data[key].forEach((skill, index) => {
          if (skill.skill_name.trim() !== "") {
            formData.append(`skills[${index}][skill_name]`, skill.skill_name);
          }
        });
      } else if (key === "projects") {
        data[key].forEach((project, index) => {
          if (project.project_title.trim() !== "") {
            formData.append(`projects[${index}][project_title]`, project.project_title);
            formData.append(`projects[${index}][description]`, project.description || "");
            formData.append(`projects[${index}][project_link]`, project.project_link || "");
          }
        });
      } else if (key === "profile_picture" || key === "cv") {
        if (data[key] && data[key][0]) {
          formData.append(key, data[key][0]);
        }
      } else {
        formData.append(key, data[key]);
      }
    });

    try {
      const response = await axios.post("http://localhost:8000/api/itian-profile", formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });
      setLoading(false);
      localStorage.setItem("profileCreated", "true");
      reset(); // Reset form and errors before navigating
      navigate("/itian-profile");
    } catch (err) {
      let errorMsg = "Failed to create profile. Please try again.";
      if (err.response) {
        if (err.response.status === 409) {
          errorMsg = "Profile already exists.";
          localStorage.setItem("profileCreated", "true");
          navigate("/itian-profile");
        } else if (err.response.data?.message) {
          errorMsg = err.response.data.message;
        }
      }
      setError(errorMsg);
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="relative">
          <div className="w-20 h-20 border-4 border-red-200 border-t-red-600 rounded-full animate-spin"></div>
          <div className="absolute inset-0 w-20 h-20 border-4 border-transparent border-t-red-500 rounded-full animate-spin animation-delay-150"></div>
          <Sparkles className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-red-600 w-8 h-8 animate-pulse" />
        </div>
        <p className="ml-6 text-gray-800 text-xl font-medium animate-pulse">Loading profile...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div
        style={{
          minHeight: "100vh",
          background: "#FFFFFF",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <div
          style={{
            background: "#FFF5F5",
            borderLeft: "8px solid #E63946",
            padding: "2rem",
            borderRadius: "1rem",
            boxShadow: "0 10px 20px rgba(0, 0, 0, 0.1)",
            display: "flex",
            alignItems: "center",
          }}
        >
          <div
            style={{
              background: "#E63946",
              borderRadius: "50%",
              padding: "0.5rem",
              marginRight: "1rem",
            }}
          >
            <X style={{ width: "1.5rem", height: "1.5rem", color: "#FFFFFF" }} />
          </div>
          <div>
            <h3
              style={{
                color: "#E63946",
                fontWeight: "bold",
                fontSize: "1.125rem",
              }}
            >
              Error
            </h3>
            <p
              style={{
                color: "#E63946",
                marginTop: "0.25rem",
              }}
            >
              {error}
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#FFFFFF",
        padding: "3rem 1rem",
      }}
    >
      <div
        style={{
          maxWidth: "48rem",
          margin: "0 auto",
        }}
      >
        <div
          style={{
            background: "linear-gradient(135deg, #E63946, #A63946)",
            borderRadius: "1.5rem",
            boxShadow: "0 10px 20px rgba(0, 0, 0, 0.1)",
            marginBottom: "2.5rem",
            overflow: "hidden",
          }}
        >
          <div
            style={{
              padding: "2rem",
              display: "flex",
              alignItems: "center",
            }}
          >
            <User
              style={{
                width: "2rem",
                height: "2rem",
                color: "#FFFFFF",
                marginRight: "1rem",
              }}
            />
            <h1
              style={{
                fontSize: "2.5rem",
                fontWeight: "800",
                color: "#FFFFFF",
                letterSpacing: "0.5px",
              }}
            >
              Create ITIAN Profile
            </h1>
          </div>
        </div>

        <form
          onSubmit={handleSubmit(onSubmit)}
          style={{
            background: "#FFFFFF",
            borderRadius: "1.5rem",
            boxShadow: "0 10px 20px rgba(0, 0, 0, 0.1)",
            border: "1px solid #A8A8A8",
            padding: "2.5rem",
            gap: "2rem",
            display: "flex",
            flexDirection: "column",
          }}
        >
          {/* Personal Information */}
          <div>
            <h4
              style={{
                fontSize: "1.75rem",
                fontWeight: "bold",
                color: "#E63946",
                marginBottom: "1.5rem",
                display: "flex",
                alignItems: "center",
              }}
            >
              <User
                style={{
                  width: "1.5rem",
                  height: "1.5rem",
                  color: "#E63946",
                  marginRight: "0.75rem",
                }}
              />
              Personal Information
            </h4>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr",
                gap: "1.5rem",
              }}
            >
              {[
                { label: "First Name", name: "first_name", type: "text" },
                { label: "Last Name", name: "last_name", type: "text" },
                { label: "Bio", name: "bio", type: "textarea" },
                { label: "ITI Track", name: "iti_track", type: "text" },
                { label: "Graduation Year", name: "graduation_year", type: "text" },
                { label: "Years of Experience", name: "experience_years", type: "text" },
              ].map(({ label, name, type }) => (
                <div key={name}>
                  <label
                    style={{
                      display: "block",
                      fontSize: "0.875rem",
                      fontWeight: "bold",
                      color: "#A8A8A8",
                      marginBottom: "0.5rem",
                    }}
                  >
                    {label}
                  </label>
                  {type === "textarea" ? (
                    <textarea
                      {...register(name)}
                      style={{
                        width: "100%",
                        padding: "0.75rem",
                        border: "2px solid #A8A8A8",
                        borderRadius: "0.75rem",
                        fontSize: "1rem",
                        transition: "all 0.3s ease",
                        height: "6rem",
                      }}
                      placeholder={`Enter ${label.toLowerCase()}`}
                    />
                  ) : (
                    <input
                      type="text"
                      {...register(name)}
                      style={{
                        width: "100%",
                        padding: "0.75rem",
                        border: "2px solid #A8A8A8",
                        borderRadius: "0.75rem",
                        fontSize: "1rem",
                        transition: "all 0.3s ease",
                      }}
                      placeholder={`Enter ${label.toLowerCase()}`}
                    />
                  )}
                  {errors[name] && (
                    <p
                      style={{
                        color: "#E63946",
                        fontSize: "0.875rem",
                        marginTop: "0.25rem",
                      }}
                    >
                      {errors[name].message}
                    </p>
                  )}
                </div>
              ))}
              <div
                style={{
                  gridColumn: "1 / -1",
                }}
              >
                <label
                  style={{
                    display: "block",
                    fontSize: "0.875rem",
                    fontWeight: "bold",
                    color: "#A8A8A8",
                    marginBottom: "0.5rem",
                  }}
                >
                  Profile Picture
                </label>
                {previewImage && (
                  <div
                    style={{
                      marginBottom: "1rem",
                    }}
                  >
                    <img
                      src={previewImage}
                      alt="Image preview"
                      style={{
                        width: "8rem",
                        height: "8rem",
                        objectFit: "cover",
                        borderRadius: "0.75rem",
                        border: "4px solid #A8A8A8",
                      }}
                    />
                  </div>
                )}
                <input
                  type="file"
                  {...register("profile_picture")}
                  style={{
                    width: "100%",
                    padding: "0.75rem",
                    border: "2px solid #A8A8A8",
                    borderRadius: "0.75rem",
                    fontSize: "1rem",
                    transition: "all 0.3s ease",
                  }}
                />
                {errors.profile_picture && (
                  <p style={{ color: "#E63946", fontSize: "0.875rem", marginTop: "0.25rem" }}>{errors.profile_picture.message}</p>
                )}
              </div>
              <div>
                <label
                  style={{
                    display: "block",
                    fontSize: "0.875rem",
                    fontWeight: "bold",
                    color: "#A8A8A8",
                    marginBottom: "0.5rem",
                  }}
                >
                  Open to Work
                </label>
                <input
                  type="checkbox"
                  {...register("is_open_to_work")}
                  style={{
                    width: "1.25rem",
                    height: "1.25rem",
                    accentColor: "#E63946",
                    border: "2px solid #A8A8A8",
                    borderRadius: "0.25rem",
                  }}
                />
                {errors.is_open_to_work && (
                  <p
                    style={{
                      color: "#E63946",
                      fontSize: "0.875rem",
                      marginTop: "0.25rem",
                    }}
                  >
                    {errors.is_open_to_work.message}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Contact Information */}
          <div>
            <h4
              style={{
                fontSize: "1.75rem",
                fontWeight: "bold",
                color: "#E63946",
                marginBottom: "1.5rem",
                display: "flex",
                alignItems: "center",
              }}
            >
              <Mail
                style={{
                  width: "1.5rem",
                  height: "1.5rem",
                  color: "#E63946",
                  marginRight: "0.75rem",
                }}
              />
              Contact Information
            </h4>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr",
                gap: "1.5rem",
              }}
            >
              {[
                { label: "Email", name: "email", type: "text" },
                { label: "Portfolio URL", name: "portfolio_url", type: "text" },
                { label: "Preferred Job Locations", name: "preferred_job_locations", type: "text" },
                { label: "LinkedIn URL", name: "linkedin_profile_url", type: "text" },
                { label: "GitHub URL", name: "github_profile_url", type: "text" },
                { label: "Current Job Title", name: "current_job_title", type: "text" },
                { label: "Current Company", name: "current_company", type: "text" },
              ].map(({ label, name, type }) => (
                <div key={name}>
                  <label
                    style={{
                      display: "block",
                      fontSize: "0.875rem",
                      fontWeight: "bold",
                      color: "#A8A8A8",
                      marginBottom: "0.5rem",
                    }}
                  >
                    {label}
                  </label>
                  <input
                    type="text"
                    {...register(name)}
                    style={{
                      width: "100%",
                      padding: "0.75rem",
                      border: "2px solid #A8A8A8",
                      borderRadius: "0.75rem",
                      fontSize: "1rem",
                      transition: "all 0.3s ease",
                    }}
                    placeholder={`Enter ${label.toLowerCase()}`}
                  />
                  {errors[name] && (
                    <p
                      style={{
                        color: "#E63946",
                        fontSize: "0.875rem",
                        marginTop: "0.25rem",
                      }}
                    >
                      {errors[name].message}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Skills */}
          <div>
            <h4
              style={{
                fontSize: "1.75rem",
                fontWeight: "bold",
                color: "#E63946",
                marginBottom: "1.5rem",
                display: "flex",
                alignItems: "center",
              }}
            >
              <Briefcase
                style={{
                  width: "1.5rem",
                  height: "1.5rem",
                  color: "#E63946",
                  marginRight: "0.75rem",
                }}
              />
              Skills
            </h4>
            {skillFields.map((field, index) => (
              <div
                key={field.id}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "1rem",
                  marginBottom: "1rem",
                }}
              >
                <input
                  type="text"
                  {...register(`skills.${index}.skill_name`)}
                  style={{
                    width: "100%",
                    padding: "0.75rem",
                    border: "2px solid #A8A8A8",
                    borderRadius: "0.75rem",
                    fontSize: "1rem",
                    transition: "all 0.3s ease",
                  }}
                  placeholder="Enter skill"
                />
                {errors.skills?.[index]?.skill_name && (
                  <p
                    style={{
                      color: "#E63946",
                      fontSize: "0.875rem",
                      marginTop: "0.25rem",
                    }}
                  >
                    {errors.skills[index].skill_name.message}
                  </p>
                )}
                {skillFields.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeSkill(index)}
                    style={{
                      background: "#E63946",
                      color: "#FFFFFF",
                      padding: "0.5rem 1rem",
                      borderRadius: "0.5rem",
                      transition: "background 0.3s ease",
                    }}
                    onMouseOver={(e) => (e.target.style.background = "#A63946")}
                    onMouseOut={(e) => (e.target.style.background = "#E63946")}
                  >
                    Remove
                  </button>
                )}
              </div>
            ))}
            {errors.skills && (
              <p
                style={{
                  color: "#E63946",
                  fontSize: "0.875rem",
                  marginTop: "0.25rem",
                }}
              >
                {errors.skills.message}
              </p>
            )}
            <button
              type="button"
              onClick={() => appendSkill({ skill_name: "" })}
              style={{
                background: "#E63946",
                color: "#FFFFFF",
                padding: "0.5rem 1rem",
                borderRadius: "0.5rem",
                transition: "background 0.3s ease",
              }}
              onMouseOver={(e) => (e.target.style.background = "#A63946")}
              onMouseOut={(e) => (e.target.style.background = "#E63946")}
            >
              Add Skill
            </button>
          </div>

          <div>
            <h4
              style={{
                fontSize: "1.75rem",
                fontWeight: "bold",
                color: "#E63946",
                marginBottom: "1.5rem",
                display: "flex",
                alignItems: "center",
              }}
            >
              <BookOpen
                style={{
                  width: "1.5rem",
                  height: "1.5rem",
                  color: "#E63946",
                  marginRight: "0.75rem",
                }}
              />
              Projects
            </h4>
            {projectFields.map((field, index) => (
              <div
                key={field.id}
                style={{
                  gap: "1rem",
                  marginBottom: "1.5rem",
                }}
              >
                <div>
                  <label
                    style={{
                      display: "block",
                      fontSize: "0.875rem",
                      fontWeight: "bold",
                      color: "#A8A8A8",
                      marginBottom: "0.5rem",
                    }}
                  >
                    Project Title
                  </label>
                  <input
                    type="text"
                    {...register(`projects.${index}.project_title`)}
                    style={{
                      width: "100%",
                      padding: "0.75rem",
                      border: "2px solid #A8A8A8",
                      borderRadius: "0.75rem",
                      fontSize: "1rem",
                      transition: "all 0.3s ease",
                    }}
                    placeholder="Enter project title"
                  />
                  {errors.projects?.[index]?.project_title && (
                    <p
                      style={{
                        color: "#E63946",
                        fontSize: "0.875rem",
                        marginTop: "0.25rem",
                      }}
                    >
                      {errors.projects[index].project_title.message}
                    </p>
                  )}
                </div>
                <div>
                  <label
                    style={{
                      display: "block",
                      fontSize: "0.875rem",
                      fontWeight: "bold",
                      color: "#A8A8A8",
                      marginBottom: "0.5rem",
                    }}
                  >
                    Description
                  </label>
                  <textarea
                    {...register(`projects.${index}.description`)}
                    style={{
                      width: "100%",
                      padding: "0.75rem",
                      border: "2px solid #A8A8A8",
                      borderRadius: "0.75rem",
                      fontSize: "1rem",
                      transition: "all 0.3s ease",
                      height: "6rem",
                    }}
                    placeholder="Enter project description"
                  />
                  {errors.projects?.[index]?.description && (
                    <p
                      style={{
                        color: "#E63946",
                        fontSize: "0.875rem",
                        marginTop: "0.25rem",
                      }}
                    >
                      {errors.projects[index].description.message}
                    </p>
                  )}
                </div>
                <div>
                  <label
                    style={{
                      display: "block",
                      fontSize: "0.875rem",
                      fontWeight: "bold",
                      color: "#A8A8A8",
                      marginBottom: "0.5rem",
                    }}
                  >
                    Project Link
                  </label>
                  <input
                    type="text"
                    {...register(`projects.${index}.project_link`)}
                    style={{
                      width: "100%",
                      padding: "0.75rem",
                      border: "2px solid #A8A8A8",
                      borderRadius: "0.75rem",
                      fontSize: "1rem",
                      transition: "all 0.3s ease",
                    }}
                    placeholder="Enter project link"
                  />
                  {errors.projects?.[index]?.project_link && (
                    <p
                      style={{
                        color: "#E63946",
                        fontSize: "0.875rem",
                        marginTop: "0.25rem",
                      }}
                    >
                      {errors.projects[index].project_link.message}
                    </p>
                  )}
                </div>
                {projectFields.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeProject(index)}
                    style={{
                      background: "#E63946",
                      color: "#FFFFFF",
                      padding: "0.5rem 1rem",
                      borderRadius: "0.5rem",
                      transition: "background 0.3s ease",
                    }}
                    onMouseOver={(e) => (e.target.style.background = "#A63946")}
                    onMouseOut={(e) => (e.target.style.background = "#E63946")}
                  >
                    Remove Project
                  </button>
                )}
              </div>
            ))}
            {errors.projects && (
              <p
                style={{
                  color: "#E63946",
                  fontSize: "0.875rem",
                  marginTop: "0.25rem",
                }}
              >
                {errors.projects.message}
              </p>
            )}
            <button
              type="button"
              onClick={() => appendProject({ project_title: "", description: "", project_link: "" })}
              style={{
                background: "#E63946",
                color: "#FFFFFF",
                padding: "0.5rem 1rem",
                borderRadius: "0.5rem",
                transition: "background 0.3s ease",
              }}
              onMouseOver={(e) => (e.target.style.background = "#A63946")}
              onMouseOut={(e) => (e.target.style.background = "#E63946")}
            >
              Add Project
            </button>
          </div>

          {/* Upload CV */}
          <div>
            <h4
              style={{
                fontSize: "1.75rem",
                fontWeight: "bold",
                color: "#E63946",
                marginBottom: "1.5rem",
                display: "flex",
                alignItems: "center",
              }}
            >
              <Upload
                style={{
                  width: "1.5rem",
                  height: "1.5rem",
                  color: "#E63946",
                  marginRight: "0.75rem",
                }}
              />
              Upload CV
            </h4>
            <input
              type="file"
              {...register("cv")}
              style={{
                width: "100%",
                padding: "0.75rem",
                border: "2px solid #A8A8A8",
                borderRadius: "0.75rem",
                fontSize: "1rem",
                transition: "all 0.3s ease",
              }}
            />
            {errors.cv && (
              <p style={{ color: "#E63946", fontSize: "0.875rem", marginTop: "0.25rem" }}>
                {errors.cv.message}
              </p>
            )}
          </div>

          <div
            style={{
              display: "flex",
              justifyContent: "center",
              marginTop: "2rem",
            }}
          >
            <button
              type="submit"
              disabled={loading}
              style={{
                padding: "0.75rem 2rem",
                background: loading ? "#A8A8A8" : "#E63946",
                color: "#FFFFFF",
                borderRadius: "0.75rem",
                fontWeight: "bold",
                transition: "all 0.3s ease",
                display: "flex",
                alignItems: "center",
                gap: "0.5rem",
                cursor: loading ? "not-allowed" : "pointer",
              }}
              onMouseOver={(e) => !loading && (e.target.style.background = "#A63946")}
              onMouseOut={(e) => !loading && (e.target.style.background = "#E63946")}
            >
              {loading ? (
                <span
                  style={{
                    width: "1.25rem",
                    height: "1.25rem",
                    border: "2px solid #FFFFFF",
                    borderTopColor: "transparent",
                    borderRadius: "50%",
                    animation: "spin 1s linear infinite",
                  }}
                />
              ) : (
                <User style={{ width: "1.25rem", height: "1.25rem" }} />
              )}
              <span>{loading ? "Creating..." : "Create Profile"}</span>
            </button>
          </div>
        </form>
      </div>
      <style>
        {`
          @keyframes spin {
            to { transform: rotate(360deg); }
          }
          @keyframes pulse {
            0%, 100% { opacity: 1; }
            50% { opacity: 0.6; }
          }
          input:focus, textarea:focus {
            border-color: #E63946;
            box-shadow: 0 0 0 3px rgba(230, 57, 70, 0.2);
          }
          button:hover:not(:disabled) {
            transform: scale(1.05);
          }
        `}
      </style>
    </div>
  );
};

export default CreateItianProfile;