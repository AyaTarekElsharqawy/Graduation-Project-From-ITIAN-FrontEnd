import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchJobs } from '../../store/jobsSlice';
import axios from 'axios';
import LoaderOverlay from '../../components/LoaderOverlay';
import JobDetailsModal from './JobDetailsModal';
import StatCard from '../../components/StatCard';
import Pagination from '../../components/Pagination';
import { BriefcaseIcon, CheckCircleIcon, ClockIcon } from '@heroicons/react/24/outline';
import Swal from 'sweetalert2';
import { deleteJob } from '../../store/jobsSlice';

const Jobs = () => {
  const dispatch = useDispatch();
  const jobs = useSelector((state) => state.jobs.jobs);
  const loading = useSelector((state) => state.jobs.loading);

  // Filter state
  const [statusFilters, setStatusFilters] = useState([]);
  const [locationFilters, setLocationFilters] = useState([]);
  const [typeFilters, setTypeFilters] = useState([]);
  const [selectedJobId, setSelectedJobId] = useState(null);
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 9;

  useEffect(() => {
    dispatch(fetchJobs());
  }, [dispatch]);

  const handleStatusChange = async (jobId, newStatus) => {
    try {
      const token = localStorage.getItem('access-token');
      await axios.patch(
        `http://127.0.0.1:8000/api/jobs/${jobId}/status`, 
        { status: newStatus }, 
        { headers: { Authorization: `Bearer ${token}` } }
      );
      dispatch(fetchJobs());
    } catch (error) {
      console.error('Failed to update job status:', error);
      alert('Failed to update job status.');
    }
  };

  const jobsArray = jobs?.data || [];

  // Unique values for filters
  const allStatuses = [...new Set(jobsArray.map(j => j.status))];
  const allLocations = [...new Set(jobsArray.map(j => j.job_location))];
  const allTypes = [...new Set(jobsArray.map(j => j.job_type))];

  // Job statistics
  const totalJobs = jobsArray.length;
  const openJobs = jobsArray.filter(j => j.status === 'Open').length;
  const closedJobs = jobsArray.filter(j => j.status === 'Closed').length;
  const pendingJobs = jobsArray.filter(j => j.status === 'Pending').length;

  // Filtering logic
  const filteredJobs = jobsArray.filter(job => {
    const statusMatch = statusFilters.length === 0 || statusFilters.includes(job.status);
    const locationMatch = locationFilters.length === 0 || locationFilters.includes(job.job_location);
    const typeMatch = typeFilters.length === 0 || typeFilters.includes(job.job_type);
    return statusMatch && locationMatch && typeMatch;
  });

  useEffect(() => {
    setCurrentPage(1);
  }, [statusFilters, locationFilters, typeFilters]);

  // Pagination
  const totalPages = Math.ceil(filteredJobs.length / itemsPerPage);
  const paginatedJobs = filteredJobs.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const goToPage = (page) => {
    if (page >= 1 && page <= totalPages) setCurrentPage(page);
  };

  const handleCheckboxChange = (filter, value, setFilter) => {
    setFilter(prev => 
      prev.includes(value) ? prev.filter(v => v !== value) : [...prev, value]
    );
  };

  // Delete job handler with confirmation
  const handleDeleteJob = (job) => {
    Swal.fire({
      title: `Delete job: ${job.job_title}?`,
      text: 'This action cannot be undone. Are you sure you want to delete this job?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#dc2626',
      cancelButtonColor: '#6b7280',
      confirmButtonText: 'Delete',
      cancelButtonText: 'Cancel',
    }).then((result) => {
      if (result.isConfirmed) {
        dispatch(deleteJob(job.id))
          .unwrap()
          .then(() => {
            Swal.fire({
              icon: 'success',
              title: 'Job Deleted',
              text: `${job.job_title} has been deleted.`,
              timer: 1800,
              showConfirmButton: false,
            });
          })
          .catch((err) => {
            Swal.fire({
              icon: 'error',
              title: 'Failed to delete job',
              text: err?.message || String(err),
            });
          });
      }
    });
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 pt-0">
      {/* Statistics Cards */}
      <div className="flex flex-wrap gap-3 sm:gap-4 mb-6">
        <StatCard 
          label="Total Jobs" 
          value={totalJobs} 
          className="min-w-[calc(50%-0.5rem)] sm:min-w-[200px]"
          icon={<BriefcaseIcon className="w-5 h-5 sm:w-6 sm:h-6" />} 
        />
        <StatCard 
          label="Open Jobs" 
          value={openJobs} 
          className="min-w-[calc(50%-0.5rem)] sm:min-w-[200px]"
          icon={<CheckCircleIcon className="w-5 h-5 sm:w-6 sm:h-6" />} 
          color="bg-green-100" 
          textColor="text-green-700" 
        />
        <StatCard 
          label="Closed Jobs" 
          value={closedJobs} 
          className="min-w-[calc(50%-0.5rem)] sm:min-w-[200px]"
          icon={<ClockIcon className="w-5 h-5 sm:w-6 sm:h-6" />} 
          color="bg-gray-100" 
          textColor="text-gray-700" 
        />
        <StatCard 
          label="Pending Jobs" 
          value={pendingJobs} 
          className="min-w-[calc(50%-0.5rem)] sm:min-w-[200px]"
          icon={<ClockIcon className="w-5 h-5 sm:w-6 sm:h-6" />} 
          color="bg-yellow-100" 
          textColor="text-yellow-700" 
        />
      </div>

      {/* Mobile Filter Toggle Button */}
      <button 
        className="lg:hidden mb-4 bg-red-600 text-white px-4 py-2 rounded flex items-center gap-2"
        onClick={() => setShowMobileFilters(!showMobileFilters)}
      >
        <span>{showMobileFilters ? 'Hide' : 'Show'} Filters</span>
        <svg 
          className={`w-4 h-4 transition-transform ${showMobileFilters ? 'rotate-180' : ''}`} 
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {loading && <LoaderOverlay text="Loading jobs..." />}

      {!loading && (
        <div className="flex flex-col lg:flex-row gap-4 mb-6">
          {/* Filter Sidebar */}
          <div className={`${showMobileFilters ? 'block' : 'hidden'} lg:block w-full lg:w-64 xl:w-72 bg-white rounded-lg shadow p-4 border border-gray-200 lg:sticky lg:top-4 lg:self-start`}>
            <div className="space-y-6">
              <div>
                <h3 className="font-semibold text-red-700 mb-2">Status</h3>
                <div className="space-y-2">
                  {allStatuses.map(status => (
                    <label key={status} className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        className="rounded border-gray-300 text-red-600 focus:ring-red-500"
                        checked={statusFilters.includes(status)}
                        onChange={() => handleCheckboxChange(statusFilters, status, setStatusFilters)}
                      />
                      <span className="text-sm sm:text-base">{status}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="font-semibold text-red-700 mb-2">Location</h3>
                <div className="space-y-2">
                  {allLocations.map(location => (
                    <label key={location} className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        className="rounded border-gray-300 text-red-600 focus:ring-red-500"
                        checked={locationFilters.includes(location)}
                        onChange={() => handleCheckboxChange(locationFilters, location, setLocationFilters)}
                      />
                      <span className="text-sm sm:text-base">{location}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="font-semibold text-red-700 mb-2">Job Type</h3>
                <div className="space-y-2">
                  {allTypes.map(type => (
                    <label key={type} className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        className="rounded border-gray-300 text-red-600 focus:ring-red-500"
                        checked={typeFilters.includes(type)}
                        onChange={() => handleCheckboxChange(typeFilters, type, setTypeFilters)}
                      />
                      <span className="text-sm sm:text-base">{type}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1 min-w-0">
            {/* Job Grid */}
            {filteredJobs.length > 0 ? (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-4">
                  {paginatedJobs.map((job) => (
                    <div 
                      key={job.id} 
                      className="bg-white rounded-lg shadow p-4 sm:p-6 hover:shadow-lg transition h-full flex flex-col border border-gray-100"
                    >
                      <div className="flex-1">
                        <h2 className="text-lg sm:text-xl font-semibold text-red-700 mb-2 line-clamp-2">
                          {job.job_title}
                        </h2>
                        <p className="text-sm sm:text-base text-gray-600 mb-2">
                          <span className="font-medium">Employer:</span> {job.employer?.name}
                        </p>
                        <p className="text-sm sm:text-base text-gray-500 mb-1">
                          <span className="font-medium">Location:</span> {job.job_location}
                        </p>
                        <p className="text-sm sm:text-base text-gray-500 mb-1">
                          <span className="font-medium">Type:</span> {job.job_type}
                        </p>
                        <p className="text-sm sm:text-base text-gray-500 mb-1">
                          <span className="font-medium">Posted:</span> {job.posted_date ? new Date(job.posted_date).toLocaleDateString() : 'N/A'}
                        </p>
                        <p className="text-sm sm:text-base text-gray-500 mb-3">
                          <span className="font-medium">Status:</span> 
                          <span className={`ml-1 font-semibold ${
                            job.status === 'Open' ? 'text-green-600' :
                            job.status === 'Closed' ? 'text-gray-600' :
                            'text-yellow-600'
                          }`}>
                            {job.status}
                          </span>
                        </p>
                        
                        <p className="text-sm sm:text-base text-gray-700 mt-2 line-clamp-3">
                          {job.description}
                        </p>
                      </div>

                      <div className="mt-4 space-y-2">
                        <div className="flex flex-wrap gap-2">
                          {['Open', 'Closed', 'Pending'].map((status) => (
                            <button
                              key={status}
                              className={`px-2 py-1 text-xs sm:text-sm rounded font-semibold transition ${
                                job.status === status 
                                  ? 'bg-red-600 text-white border-red-600' 
                                  : 'bg-gray-100 text-gray-700 border-gray-300 hover:bg-gray-200 border'
                              }`}
                              disabled={job.status === status}
                              onClick={() => handleStatusChange(job.id, status)}
                            >
                              {status}
                            </button>
                          ))}
                        </div>
                        <div className="flex gap-2 mt-3">
                          <button
                            className="flex-1 bg-blue-600 text-white px-3 py-2 text-sm sm:text-base rounded hover:bg-blue-700 transition"
                            onClick={() => setSelectedJobId(job.id)}
                          >
                            View Details
                          </button>
                          <button
                            className="flex-1 bg-red-600 text-white px-3 py-2 text-sm sm:text-base rounded hover:bg-red-700 transition"
                            onClick={() => handleDeleteJob(job)}
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="mt-6 flex justify-center">
                    <Pagination 
                      currentPage={currentPage}
                      totalPages={totalPages}
                      goToPage={goToPage}
                    />
                  </div>
                )}
              </>
            ) : (
              <div className="bg-white rounded-lg shadow p-8 text-center">
                <p className="text-gray-500 text-lg">No jobs found matching your filters.</p>
                <button 
                  className="mt-4 text-red-600 hover:text-red-800"
                  onClick={() => {
                    setStatusFilters([]);
                    setLocationFilters([]);
                    setTypeFilters([]);
                  }}
                >
                  Clear all filters
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Job Details Modal */}
      {selectedJobId && (
        <JobDetailsModal 
          jobId={selectedJobId} 
          onClose={() => setSelectedJobId(null)} 
        />
      )}
    </div>
  );
};

export default Jobs;