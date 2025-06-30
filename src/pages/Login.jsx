import React, { useState } from "react";
import "./Register.css";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch } from 'react-redux';
import apiClient from '../api/axios';
import { setUser } from '../store/userSlice';
import LoaderOverlay from '../components/LoaderOverlay';

const Login = () => {
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [errors, setErrors] = useState({});
  const [generalError, setGeneralError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    // Clear error when user types
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateUserData = (userData) => {
    const errors = {};
    const trimmedEmail = userData.email ? userData.email.trim() : '';
    if (!trimmedEmail) {
      errors.email = 'Email is required.';
    } else if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(trimmedEmail)) {
      errors.email = 'Please enter a valid email address.';
    }
    if (!userData.password) {
      errors.password = 'Password is required.';
    } else if (userData.password.length < 6) {
      errors.password = 'Password must be at least 6 characters.';
    }
    return errors;
  };

  const handleLoginSuccess = async (user, token) => {
    const { role } = user;

    if (role === 'admin') {
      navigate('/admin/approvals', { replace: true });
      return;
    }

    if (role === 'itian' || role === 'employer') {
      // Use relative paths. The apiClient will handle the base URL.
      const profileCheckUrl = role === 'itian' ? '/api/itian-profile' : '/api/employer-profile';

      const successUrl = role === 'itian' ? '/itian-profile' : '/employer-profile';
      const createProfileUrl = role === 'itian' ? '/create-itian-profile' : '/create-employer-profile';

      try {
        // The apiClient interceptor adds the token header automatically.
        await apiClient.get(profileCheckUrl);
        navigate(successUrl, { replace: true });
      } catch (err) {
        if (err.response?.status === 404) {
          navigate(createProfileUrl, { replace: true });
        } else {
          setGeneralError('Could not verify your profile information. Please try again.');
          setIsSubmitting(false); // Allow user to try again
        }
      }
    } else {
      // Fallback for any other role
      navigate('/', { replace: true });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setGeneralError("");

    const dataToSubmit = {
      ...formData,
      email: formData.email.trim(),
    };

    const validationErrors = validateUserData(dataToSubmit);
    setErrors(validationErrors);

    if (Object.keys(validationErrors).length > 0) {
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await apiClient.post('/api/login', dataToSubmit);
      const { access_token, user } = response.data;

      localStorage.setItem('access-token', access_token);
      localStorage.setItem('user-id', JSON.stringify(user.id));
      dispatch(setUser(user));

      await handleLoginSuccess(user, access_token);
    } catch (error) {
      setIsSubmitting(false);
      handleLoginError(error);
    }
  };

  const handleLoginError = (error) => {
    if (error.response) {
      if (error.response.data?.errors) {
        setErrors(error.response.data.errors);
      } else if (error.response.data?.message) {
        setGeneralError(error.response.data.message);
      } else {
        setGeneralError('Login failed. Please check your credentials.');
      }
    } else {
      setGeneralError('Network error. Please try again later.');
    }
  };


  return (
    isSubmitting ? <LoaderOverlay text="Logging in..." /> : (
      <div className="register-root">
        <div className="register-left">
          <div className="register-container">
            <div className="register-header">
              <h2 className="register-title">Login</h2>
            </div>
            {generalError && <div className="input-error" style={{textAlign: 'center', marginBottom: '1rem'}}>{generalError}</div>}
            <form onSubmit={handleSubmit} method="post">
              <div className="register-field">
                <label htmlFor="email" className="register-label">Email</label>
                <input type="text" id="email" name="email" className="register-input" placeholder="Email" onChange={handleInputChange} />
                {errors.email && <div className="input-error">{errors.email}</div>}
              </div>
              <div className="register-field">
                <label htmlFor="password" className="register-label">Password</label>
                <input type="password" id="password" name="password" className="register-input" placeholder="Password" onChange={handleInputChange} />
                {errors.password && <div className="input-error">{errors.password}</div>}
              </div>
              <button type="submit" className="register-button" disabled={isSubmitting}>Login</button>
            </form>
            <div style={{display: 'flex', justifyContent: 'space-between', marginTop: '1rem'}}>
              <Link to="/register" style={{color: '#e35d5b', fontWeight: 600}}>Don't have an account? Register</Link>
              <button
                type="button"
                className="register-link"
                style={{background: 'none', border: 'none', color: '#e35d5b', cursor: 'pointer', fontWeight: 600, padding: 0}}
                onClick={handleForgotPassword}
              >
                Forgot password?
              </button>
            </div>
          </div>
        </div>
        <div className="register-hero">
          <div className="register-hero-bg1" />
          <div className="register-hero-bg2" />
          <div className="register-hero-content">
            <h1 className="register-hero-title">Welcome Back to the Community!</h1>
            <p className="register-hero-desc">Log in to connect with companies and students through our powerful platform.</p>
            <div className="register-hero-people">
              <div className="register-hero-person">👨‍💼</div>
              <div className="register-hero-person">👩‍💻</div>
              <div className="register-hero-person">👨‍🎓</div>
            </div>
          </div>
        </div>
      </div>
    )
  );
  async function handleForgotPassword() {
    if (!formData.email) {
      setErrors(prev => ({ ...prev, email: 'Please enter your email to reset password.' }));
      return;
    }
    try {
      // Consider adding a loading state for this action
      await apiClient.post('/api/forgot-password', { email: formData.email.trim() });
      setGeneralError('Password reset link sent to your email.');
    } catch {
      setGeneralError('Failed to send reset link. Please try again.');
    }
  }
};

export default Login;