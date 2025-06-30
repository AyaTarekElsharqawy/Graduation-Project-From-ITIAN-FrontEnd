import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchEmployerData, editJob, deleteJob } from '../jobPostSlice';
import Modal from 'react-modal';
import Swal from 'sweetalert2';
import { Sparkles, ChevronLeft, ChevronRight, Building2, MapPin, Calendar, Users } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import '../style/jobList.css';

const JobList = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const jobPostState = useSelector(state => state.jobPost) || {};
  const {
    jobs = [],
    loading = false,
    error = null,
  } = jobPostState;

  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [editData, setEditData] = useState(null);
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('newest');
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const jobsPerPage = 5;

const checkAndUpdateExpiredJobs = async () => {
  const today = new Date();
  today.setHours(0, 0, 0, 0); // نحافظ عليه لو حابب تستخدمه لاحقًا

  const jobsArray = Array.isArray(jobs) ? jobs : [];

  for (const job of jobsArray) {
    if (!job.application_deadline) continue;

    const deadline = new Date(job.application_deadline);
    deadline.setHours(23, 59, 59, 999); // نخلي الجوب تفضل مفتوحة لحد نهاية اليوم

    const isOpen = job.status === 'Open';

    if (isOpen && today > deadline) {
      try {
        console.log(`⛔ Closing job ${job.id} with deadline ${job.application_deadline}`);

        const result = await dispatch(editJob({
          jobId: job.id,
          jobData: { status: 'Closed' }
        }));

        if (!result.error) {
          console.log(`✅ Job ${job.id} closed successfully`);
          dispatch(fetchEmployerData());
        } else {
          console.error(`❌ Failed to close job ${job.id}:`, result.error);
        }

      } catch (err) {
        console.error(`🚨 Error updating job ${job.id}:`, err);
      }
    }
  }
};


  useEffect(() => {
    dispatch(fetchEmployerData());
  }, [dispatch]);
useEffect(() => {
  console.log("Fetched jobs:", jobs);
}, [jobs]);

useEffect(() => {
  if (!loading && jobs.length > 0) {
    checkAndUpdateExpiredJobs();
  }
}, [jobs, loading]);


  useEffect(() => {
    const interval = setInterval(() => {
      if (jobs.length > 0) {
        checkAndUpdateExpiredJobs();
      }
    }, 5 * 60 * 1000); // 5 minutes

    return () => clearInterval(interval);
  }, [jobs, dispatch]);

  const jobsArray = Array.isArray(jobs) ? jobs : [];

const isJobExpired = (job) => {
  if (!job.application_deadline) return false;

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const deadline = new Date(job.application_deadline);
  deadline.setHours(23, 59, 59, 999); // تسيب الوظيفة مفتوحة لنهاية اليوم

  return today > deadline;
};


    const filteredJobs = jobsArray.filter(job => !job.deleted_at).filter(job => {
    const statusMatch = filter === 'all' || job.status === filter;
    const searchMatch = job.job_title.toLowerCase().includes(searchTerm.toLowerCase()) || 
      job.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (job.company_name && job.company_name.toLowerCase().includes(searchTerm.toLowerCase()));
    return statusMatch && searchMatch;
  }).sort((a, b) => {
    // Sort jobs
    switch (sortBy) {
      case 'newest':
        return new Date(b.created_at || b.posted_date) - new Date(a.created_at || a.posted_date);
      case 'oldest':
        return new Date(a.created_at || a.posted_date) - new Date(b.created_at || b.posted_date);
      case 'title':
        return (a.job_title || '').localeCompare(b.job_title || '');
      default:
        return 0;
    }
  });

  const totalPages = Math.ceil(filteredJobs.length / jobsPerPage);
  const startIndex = (currentPage - 1) * jobsPerPage;
  const endIndex = startIndex + jobsPerPage;
  const currentJobs = filteredJobs.slice(startIndex, endIndex);

  useEffect(() => {
    setCurrentPage(1);
  }, [filter, searchTerm, sortBy]);

  const handlePageChange = (page) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleEdit = (job) => {
    const deadline = job.application_deadline 
      ? new Date(job.application_deadline).toISOString().split('T')[0] 
      : '';
      
    setEditData({
      ...job,
      job_title: job.job_title || '',
      description: job.description || '',
      requirements: job.requirements || '',
      qualifications: job.qualifications || '',
      job_location: job.job_location || 'Remote',
      job_type: job.job_type || 'Full-time',
      salary_range_min: job.salary_range_min || '',
      salary_range_max: job.salary_range_max || '',
      currency: job.currency || 'EGP',
      application_deadline: deadline
    });
    setModalIsOpen(true);
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    await dispatch(editJob({ jobId: editData.id, jobData: editData })).unwrap();
    setModalIsOpen(false);
    dispatch(fetchEmployerData());
  };

  const handleDelete = (jobId) => {
    Swal.fire({
      title: 'Are you sure?',
      text: "This job will be moved to trash and deleted after 2 days.",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#b91c1c',
      cancelButtonColor: '#6b7280',
      confirmButtonText: 'Yes, move to trash!'
    }).then((result) => {
      if (result.isConfirmed) {
        dispatch(deleteJob(jobId));
        Swal.fire('Moved!', 'The job is now in trash.', 'success');
      }
    });
  };

  const formatTimeAgo = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now - date) / 1000);
    
    if (diffInSeconds < 60) return `${diffInSeconds} seconds ago`;
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} minutes ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`;
    if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)} days ago`;
    return date.toLocaleDateString();
  };

  const getJobInitials = (title) => {
    return title ? title.split(' ').map(word => word[0]).join('').substring(0, 2).toUpperCase() : 'JB';
  };

  // Function to format deadline and show expiry status
const formatDeadlineStatus = (job) => {
  if (!job.application_deadline) return null;

  const currentDate = new Date();
  currentDate.setHours(0, 0, 0, 0);

  const deadlineDate = new Date(job.application_deadline);
  deadlineDate.setHours(23, 59, 59, 999);

  const isExpired = currentDate > deadlineDate;

  const formattedDate = deadlineDate.toLocaleDateString('en-GB');

  if (isExpired) {
    return (
      <div style={{ color: '#dc2626', fontSize: '12px', fontWeight: '500' }}>
        Expired: {formattedDate}
      </div>
    );
  } else {
    const timeDiff = deadlineDate - currentDate;
    const daysLeft = Math.ceil(timeDiff / (1000 * 60 * 60 * 24));

    return (
      <div style={{
        color: daysLeft <= 3 ? '#dc2626' : '#059669',
        fontSize: '12px',
        fontWeight: '500'
      }}>
        Deadline: {formattedDate} ({daysLeft} days left)
      </div>
    );
  }
};


  // Pagination component
  const PaginationComponent = () => {
    if (totalPages <= 1) return null;

    const getPageNumbers = () => {
      const pages = [];
      const maxVisiblePages = 5;
      
      if (totalPages <= maxVisiblePages) {
        for (let i = 1; i <= totalPages; i++) {
          pages.push(i);
        }
      } else {
        if (currentPage <= 3) {
          for (let i = 1; i <= 4; i++) {
            pages.push(i);
          }
          pages.push('...');
          pages.push(totalPages);
        } else if (currentPage >= totalPages - 2) {
          pages.push(1);
          pages.push('...');
          for (let i = totalPages - 3; i <= totalPages; i++) {
            pages.push(i);
          }
        } else {
          pages.push(1);
          pages.push('...');
          for (let i = currentPage - 1; i <= currentPage + 1; i++) {
            pages.push(i);
          }
          pages.push('...');
          pages.push(totalPages);
        }
      }
      
      return pages;
    };

    return (
      <div className="pagination-container" style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        gap: '8px',
        marginTop: '32px',
        marginBottom: '32px'
      }}>
        <button
          onClick={() => handlePageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="pagination-btn"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
            padding: '8px 12px',
            border: '1px solid #e5e7eb',
            borderRadius: '6px',
            background: currentPage === 1 ? '#f9fafb' : '#ffffff',
            color: currentPage === 1 ? '#9ca3af' : '#374151',
            cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
            fontSize: '14px',
            transition: 'all 0.2s'
          }}
        >
          <ChevronLeft size={16} />
          Previous
        </button>
        
        {getPageNumbers().map((page, index) => (
          page === '...' ? (
            <span key={index} style={{ padding: '8px 4px', color: '#9ca3af' }}>...</span>
          ) : (
            <button
              key={index}
              onClick={() => handlePageChange(page)}
              className={`pagination-number ${currentPage === page ? 'active' : ''}`}
              style={{
                padding: '8px 12px',
                border: '1px solid #e5e7eb',
                borderRadius: '6px',
                background: currentPage === page ? '#dc2626' : '#ffffff',
                color: currentPage === page ? '#ffffff' : '#374151',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: currentPage === page ? '600' : '400',
                transition: 'all 0.2s',
                minWidth: '40px'
              }}
            >
              {page}
            </button>
          )
        ))}
        
        <button
          onClick={() => handlePageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="pagination-btn"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
            padding: '8px 12px',
            border: '1px solid #e5e7eb',
            borderRadius: '6px',
            background: currentPage === totalPages ? '#f9fafb' : '#ffffff',
            color: currentPage === totalPages ? '#9ca3af' : '#374151',
            cursor: currentPage === totalPages ? 'not-allowed' : 'pointer',
            fontSize: '14px',
            transition: 'all 0.2s'
          }}
        >
          Next
          <ChevronRight size={16} />
        </button>
      </div>
    );
  };

  if (loading) return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="relative">
          <div className="w-20 h-20 border-4 border-red-200 border-t-red-600 rounded-full animate-spin"></div>
          <div className="absolute inset-0 w-20 h-20 border-4 border-transparent border-t-red-500 rounded-full animate-spin animation-delay-150"></div>
          <Sparkles className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-red-600 w-8 h-8 animate-pulse" />
        </div>
        <p className="ml-6 text-gray-800 text-xl font-medium animate-pulse">Loading job details...</p>
    </div>
  );

  if (error) return (
    <div className="job-list-container">
      <div className="job-list-error">
        <svg className="job-list-error-icon" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
        </svg>
        <p>Error: {error.message}</p>
      </div>
    </div>
  );

return (
  <div className="list-container">
    <div className="list-header">
      <h1 className="list-title">Job Listings</h1>
      <div className="list-count">
        {filteredJobs.length} jobs found
        {totalPages > 1 && (
          <span style={{ marginLeft: '8px', color: '#6b7280' }}>
            (Page {currentPage} of {totalPages})
          </span>
        )}
      </div>
      <button
        className="go-to-trash-btn"
        style={{ marginLeft: '16px', background: '#991b1b', color: '#fff', padding: '8px 16px', borderRadius: '6px', border: 'none', cursor: 'pointer' }}
        onClick={() => navigate('/employer/trash')}
      >
        Go to Trash
      </button>
    </div>

    <div className="list-filters">
      <div className="list-filter-row">
        <div className="list-search-filter">
          <svg className="list-search-icon" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
          </svg>
          <input
            type="text"
            placeholder="Search jobs, companies..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <div className="list-filter-controls">
          <div className="list-status-filter">
            <select value={filter} onChange={(e) => setFilter(e.target.value)}>
              <option value="all">All Status</option>
              <option value="Open">Open</option>
              <option value="Closed">Closed</option>
              <option value="Pending">Pending</option>
            </select>
          </div>
          
          <div className="list-sort-filter">
            <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
              <option value="title">Title A-Z</option>
            </select>
          </div>
        </div>
      </div>
    </div>

    {filteredJobs.length === 0 ? (
      <div className="list-empty">
        <svg className="list-empty-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
          <circle cx="12" cy="12" r="10"/>
          <path d="m9 12 2 2 4-4"/>
        </svg>
        <h3>No jobs found</h3>
        <p>Try adjusting your search criteria or filters</p>
      </div>
    ) : (
      <>
       <Modal
  isOpen={modalIsOpen}
  onRequestClose={() => setModalIsOpen(false)}
  contentLabel="Edit Job"
  ariaHideApp={false}
  className="list-edit-modal"
  overlayClassName="list-edit-modal-overlay"
>
  {editData && (
    <form onSubmit={handleEditSubmit} className="list-edit-form">
      <h2 className="list-edit-title">Edit Job</h2>
      <div className="list-edit-field">
        <label>Job Title</label>
        <input
          type="text"
          value={editData.job_title}
          onChange={e => setEditData({ ...editData, job_title: e.target.value })}
          placeholder="Job Title"
          required
        />
      </div>
      <div className="list-edit-field">
        <label>Description</label>
        <textarea
          value={editData.description}
          onChange={e => setEditData({ ...editData, description: e.target.value })}
          placeholder="Description"
          required
        />
      </div>
      <div className="list-edit-field">
        <label>Requirements</label>
        <textarea
          value={editData.requirements}
          onChange={e => setEditData({ ...editData, requirements: e.target.value })}
          placeholder="Requirements"
        />
      </div>
      <div className="list-edit-field">
        <label>Qualifications</label>
        <textarea
          value={editData.qualifications}
          onChange={e => setEditData({ ...editData, qualifications: e.target.value })}
          placeholder="Qualifications"
        />
      </div>
      <div className="list-edit-field">
        <label>Location</label>
        <input
          type="text"
          value={editData.job_location}
          onChange={e => setEditData({ ...editData, job_location: e.target.value })}
          placeholder="Location"
        />
      </div>
      <div className="list-edit-field">
        <label>Job Type</label>
        <select
          value={editData.job_type}
          onChange={e => setEditData({ ...editData, job_type: e.target.value })}
        >
          <option value="Full-time">Full-time</option>
          <option value="Part-time">Part-time</option>
          <option value="Contract">Contract</option>
          <option value="Freelance">Freelance</option>
          <option value="Internship">Internship</option>
        </select>
      </div>
      <div className="list-edit-field">
        <label>Status</label>
        <select
          value={editData.status}
          onChange={e => setEditData({ ...editData, status: e.target.value })}
        >
          <option value="Open">Open</option>
          <option value="Closed">Closed</option>
          <option value="Pending">Pending</option>
        </select>
      </div>
      <div className="list-edit-field">
        <label>Minimum Salary</label>
        <input
          type="number"
          value={editData.salary_range_min}
          onChange={e => setEditData({ ...editData, salary_range_min: e.target.value })}
          placeholder="Min Salary"
        />
      </div>
      <div className="list-edit-field">
        <label>Maximum Salary</label>
        <input
          type="number"
          value={editData.salary_range_max}
          onChange={e => setEditData({ ...editData, salary_range_max: e.target.value })}
          placeholder="Max Salary"
        />
      </div>
      <div className="list-edit-field">
        <label>Currency</label>
        <select
          value={editData.currency}
          onChange={e => setEditData({ ...editData, currency: e.target.value })}
        >
          <option value="EGP">EGP</option>
          <option value="USD">USD</option>
          <option value="EUR">EUR</option>
          <option value="GBP">GBP</option>
        </select>
      </div>
      <div className="list-edit-field">
        <label>Application Deadline</label>
        <input
          type="date"
          value={editData.application_deadline}
          onChange={e => setEditData({ ...editData, application_deadline: e.target.value })}
        />
      </div>
      <div className="list-edit-actions">
        <button type="submit" className="list-edit-save">Save Changes</button>
        <button type="button" className="list-edit-cancel" onClick={() => setModalIsOpen(false)}>Cancel</button>
      </div>
    </form>
  )}
</Modal>
        
        <div className="list-grid">
          {currentJobs.map(job => (
            <div 
              className="list-card" 
              key={job.id}
              style={{
                opacity: isJobExpired(job) ? 0.7 : 1,
                borderLeft: isJobExpired(job) ? '4px solid #dc2626' : 'none'
              }}
            >
              <div className="list-card-header">
                <div className="list-avatar">
                  <div className="list-avatar-circle">
                    {getJobInitials(job.job_title)}
                  </div>
                </div>
                <div className="list-info">
                  <h3 className="list-title">{job.job_title || "No Title"}</h3>
                  <div className="list-location">{job.job_location || "Remote"}</div>
                  <div className="list-posted-time">
                    {formatTimeAgo(job.created_at || job.posted_date)}
                  </div>
                  {formatDeadlineStatus(job)}
                </div>
                <div className="list-actions">
                  <button className="list-action-btn list-view-btn" onClick={() => navigate(`/employer/job/${job.id}`)}>
                    View
                  </button>
                </div>
              </div>
              
              <div className="list-card-details">
                <div className="list-meta">
                  <div className="list-meta-item">
                    <span className="list-meta-label">Company Name:</span>
                    <span className="list-meta-value">{job.company_name || "IT Industry"}</span>
                  </div>
                  <div className="list-meta-item">
                    <span className="list-meta-label">Year founded:</span>
                    <span className="list-meta-value">{job.job_type || "2019"}</span>
                  </div>
                </div>
                <span className="bg-gray-100 text-gray-800 text-xs font-semibold px-2 py-1 rounded-full">
                  {job.applications_count ?? 0} Application{job.applications_count === 1 ? '' : 's'}
                </span>
                <div className="list-status-badge">
                  <span className={`list-status-badge ${
                    isJobExpired(job) ? 'closed' : job.status?.toLowerCase() || 'open'
                  }`}>
                    {isJobExpired(job) ? 'Closed (Expired)' : job.status || 'Open'}
                  </span>
                </div>
              </div>
              
              <div className="list-card-footer">
                <div className="list-salary">
                  {job.salary_range_min || job.salary_range_max 
                    ? `${job.salary_range_min || ''}${job.salary_range_min && job.salary_range_max ? ' - ' : ''}${job.salary_range_max || ''} ${job.currency || ''}`
                    : "Salary not disclosed"}
                </div>
                <div className="list-footer-actions">
                  <button className="list-edit-btn" onClick={() => handleEdit(job)}>
                    <svg viewBox="0 0 20 20" fill="currentColor">
                      <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z"/>
                    </svg>
                    Edit
                  </button>
                  <button className="list-delete-btn" onClick={() => handleDelete(job.id)}>
                    <svg viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9zM4 5a2 2 0 012-2h8a2 2 0 012 2v.007a.5.5 0 01-.5.5h-11a.5.5 0 01-.5-.5V5zM5.5 7.5a.5.5 0 01.5.5v8a2 2 0 002 2h4a2 2 0 002-2V8a.5.5 0 011 0v8a3 3 0 01-3 3H8a3 3 0 01-3-3V8a.5.5 0 01.5-.5z" clipRule="evenodd"/>
                    </svg>
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        <PaginationComponent />
      </>
    )}
  </div>
);
};

export default JobList;