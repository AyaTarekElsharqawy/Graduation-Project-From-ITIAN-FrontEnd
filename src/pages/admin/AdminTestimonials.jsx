import React, { useState } from 'react';
import {
  CheckCircle,
  XCircle,
  Clock,
  Search,
  ChevronLeft,
  ChevronRight,
  User,
  Star,
  Trash2,
  Eye
} from 'lucide-react';
import { useGetAdminTestimonialsQuery, useUpdateTestimonialStatusMutation, useDeleteTestimonialMutation } from '../../api/testimonialsApi';

const AdminTestimonials = () => {
const { data: response = {}, isLoading, refetch } = useGetAdminTestimonialsQuery();
const testimonials = response.data || [];
  const [updateStatus] = useUpdateTestimonialStatusMutation();
  const [deleteTestimonial] = useDeleteTestimonialMutation();
  
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(8);
  const [filters, setFilters] = useState({
    status: 'all',
    search: '',
  });
  const [selectedTestimonial, setSelectedTestimonial] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setCurrentPage(1);
  };

  const handleSearch = (e) => {
    if (e.key === 'Enter') {
      handleFilterChange('search', e.target.value);
    }
  };

 const filteredTestimonials = (Array.isArray(testimonials) ? testimonials : []).filter(testimonial => {
    const matchesStatus = filters.status === 'all' || testimonial.status === filters.status;
    const matchesSearch = filters.search === '' ||
      (testimonial.content?.toLowerCase().includes(filters.search.toLowerCase()) ||
       testimonial.name?.toLowerCase().includes(filters.search.toLowerCase()));
    return matchesStatus && matchesSearch;
  });

  const getPaginatedData = (data, page = 1) => {
    const startIndex = (page - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return data.slice(startIndex, endIndex);
  };

  const getTotalPages = (dataLength) => Math.ceil(dataLength / itemsPerPage);

  const handleApprove = async (id) => {
    try {
      setActionLoading(true);
      await updateStatus({ id, status: 'approved' }).unwrap();
      refetch();
      setShowDetailsModal(false);
    } finally {
      setActionLoading(false);
    }
  };

  const handleReject = async (id) => {
    try {
      setActionLoading(true);
      await updateStatus({ id, status: 'rejected' }).unwrap();
      refetch();
      setShowDetailsModal(false);
    } finally {
      setActionLoading(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      setActionLoading(true);
      await deleteTestimonial(id).unwrap();
      refetch();
      if (showDetailsModal && selectedTestimonial?.id === id) {
        setShowDetailsModal(false);
      }
    } finally {
      setActionLoading(false);
    }
  };

  const viewTestimonialDetails = (testimonial) => {
    setSelectedTestimonial(testimonial);
    setShowDetailsModal(true);
  };

  const getStatusBadge = (status) => ({
    'pending': 'bg-yellow-100 text-yellow-800 border-yellow-200',
    'approved': 'bg-green-100 text-green-800 border-green-200',
    'rejected': 'bg-red-100 text-red-800 border-red-200',
  }[status] || 'bg-gray-100 text-gray-800 border-gray-200');

  const getStatusIcon = (status) => ({
    'pending': <Clock className="w-4 h-4" />,
    'approved': <CheckCircle className="w-4 h-4" />,
    'rejected': <XCircle className="w-4 h-4" />,
  }[status] || <Clock className="w-4 h-4" />);

  const Pagination = ({ currentPage, totalPages, onPageChange }) => {
    if (totalPages <= 1) return null;
    
    const getVisiblePages = () => {
      const pages = [];
      const maxVisible = 5;
      if (totalPages <= maxVisible) {
        for (let i = 1; i <= totalPages; i++) pages.push(i);
      } else if (currentPage <= 3) {
        pages.push(1, 2, 3, 4, '...', totalPages);
      } else if (currentPage >= totalPages - 2) {
        pages.push(1, '...', totalPages - 3, totalPages - 2, totalPages - 1, totalPages);
      } else {
        pages.push(1, '...', currentPage - 1, currentPage, currentPage + 1, '...', totalPages);
      }
      return pages;
    };

    return (
      <div className="flex items-center justify-center space-x-2 mt-8">
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="flex items-center px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 hover:text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <ChevronLeft className="w-4 h-4 mr-1" />
          Previous
        </button>
        {getVisiblePages().map((page, index) => (
          <button
            key={index}
            onClick={() => typeof page === 'number' && onPageChange(page)}
            className={`px-3 py-2 text-sm font-medium rounded-lg ${
              page === currentPage
                ? 'bg-[#d0443c] text-white'
                : typeof page === 'number'
                ? 'text-gray-700 bg-white border border-gray-300 hover:bg-gray-50'
                : 'text-gray-400 cursor-default'
            }`}
            disabled={typeof page !== 'number'}
          >
            {page}
          </button>
        ))}
        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="flex items-center px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 hover:text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Next
          <ChevronRight className="w-4 h-4 ml-1" />
        </button>
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="relative">
          <div className="w-20 h-20 border-4 border-red-200 border-t-red-600 rounded-full animate-spin"></div>
          <div className="absolute inset-0 w-20 h-20 border-4 border-transparent border-t-red-500 rounded-full animate-spin animation-delay-150"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          {/* <h1 className="text-3xl font-bold text-gray-900 mb-2">Testimonials Management</h1>
          <p className="text-gray-600">Review and manage user testimonials</p> */}
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                  <User className="w-5 h-5 text-[#d0443c]" />
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Testimonials</p>
                <p className="text-2xl font-bold text-gray-900">{filteredTestimonials.length}</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
                  <Clock className="w-5 h-5 text-yellow-600" />
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Pending</p>
                <p className="text-2xl font-bold text-gray-900">
                  {filteredTestimonials.filter(t => t.status === 'pending').length}
                </p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Approved</p>
                <p className="text-2xl font-bold text-gray-900">
                  {filteredTestimonials.filter(t => t.status === 'approved').length}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex flex-col md:flex-row md:items-center gap-4">
            <div className="flex gap-2 flex-wrap md:flex-nowrap md:gap-2 md:mr-4">
              <button
                className={`px-4 py-2 rounded-lg font-medium border ${filters.status === 'all' ? 'bg-[#d0443c] text-white' : 'bg-white text-[#d0443c] border-[#d0443c]'} transition`}
                onClick={() => handleFilterChange('status', 'all')}
              >
                All
              </button>
              <button
                className={`px-4 py-2 rounded-lg font-medium border ${filters.status === 'pending' ? 'bg-[#d0443c] text-white' : 'bg-white text-[#d0443c] border-[#d0443c]'} transition`}
                onClick={() => handleFilterChange('status', 'pending')}
              >
                Pending
              </button>
              <button
                className={`px-4 py-2 rounded-lg font-medium border ${filters.status === 'approved' ? 'bg-[#d0443c] text-white' : 'bg-white text-[#d0443c] border-[#d0443c]'} transition`}
                onClick={() => handleFilterChange('status', 'approved')}
              >
                Approved
              </button>
              <button
                className={`px-4 py-2 rounded-lg font-medium border ${filters.status === 'rejected' ? 'bg-[#d0443c] text-white' : 'bg-white text-[#d0443c] border-[#d0443c]'} transition`}
                onClick={() => handleFilterChange('status', 'rejected')}
              >
                Rejected
              </button>
            </div>
            <div className="flex-1">
              <input
                type="text"
                placeholder="Search by content or name..."
                className="border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#d0443c] w-full"
                onKeyPress={handleSearch}
                defaultValue={filters.search}
              />
            </div>
          </div>
          <p className="text-gray-600 mt-2 text-sm">
            Found {filteredTestimonials.length} {filteredTestimonials.length === 1 ? 'testimonial' : 'testimonials'}
          </p>
        </div>

        {filteredTestimonials.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-12 text-center">
            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <User className="w-12 h-12 text-gray-400" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">No Testimonials Found</h3>
            <p className="text-gray-600">No testimonials match the search or filter criteria</p>
          </div>
        ) : (
          <div className="mb-10">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900">
                {filters.status === 'pending' ? 'Pending Testimonials' :
                 filters.status === 'approved' ? 'Approved Testimonials' :
                 filters.status === 'rejected' ? 'Rejected Testimonials' :
                 filters.search ? 'Search Results' : 'All Testimonials'}
              </h2>
              <div className="text-sm text-gray-600">
                Page {currentPage} of {getTotalPages(filteredTestimonials.length)}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {getPaginatedData(filteredTestimonials, currentPage).map((testimonial, index) => (
                <div
                  key={testimonial.id}
                  className="bg-white rounded-lg shadow-md hover:shadow-lg transition-all duration-200 overflow-hidden flex flex-col"
                >
                  <div className="p-4 pb-2 flex justify-between items-start">
                    <div className="w-8 h-8 bg-[#d0443c] rounded-full flex items-center justify-center">
                      <span className="text-white text-sm font-bold">{(currentPage - 1) * itemsPerPage + index + 1}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      {getStatusIcon(testimonial.status)}
                    </div>
                  </div>
                  <div className="px-4 pb-4 text-center flex-grow">
                    <div className="w-16 h-16 rounded-full mx-auto mb-3 bg-gray-200 flex items-center justify-center">
                      <User className="w-8 h-8 text-gray-600" />
                    </div>
                    <h3 className="text-lg font-bold text-gray-900 mb-1 flex items-center justify-center gap-2">
                      {testimonial.name}
                      <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${getStatusBadge(testimonial.status)}`}>
                        {testimonial.status}
                      </span>
                    </h3>
                    <p className="text-gray-600 text-sm mb-1">
                      {testimonial.role || 'User'}
                    </p>
                    <div className="flex items-center justify-center gap-1 mb-4">
                      {[...Array(testimonial.rating || 0)].map((_, i) => (
                        <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                      ))}
                    </div>
                    <p className="text-gray-500 text-xs mb-4 line-clamp-2">
                      "{testimonial.content || testimonial.message}"
                    </p>
                    <div className="flex gap-2 mt-auto">
                      <button
                        className="flex-1 flex items-center justify-center bg-[#d0443c] text-white rounded-lg px-3 py-2 text-sm font-medium hover:bg-[#a0302c] transition-colors"
                        onClick={() => viewTestimonialDetails(testimonial)}
                      >
                        <Eye className="w-4 h-4 mr-1" />
                        View
                      </button>
                      {/* {testimonial.status === 'pending' && (
                        <>
                          <button
                            className="flex-1 flex items-center justify-center bg-green-600 text-white rounded-lg px-3 py-2 text-sm font-medium hover:bg-green-700 transition-colors"
                            onClick={() => handleApprove(testimonial.id)}
                            disabled={actionLoading}
                          >
                            <CheckCircle className="w-4 h-4 mr-1" />
                            Approve
                          </button>
                          <button
                            className="flex-1 flex items-center justify-center bg-red-600 text-white rounded-lg px-3 py-2 text-sm font-medium hover:bg-red-700 transition-colors"
                            onClick={() => handleReject(testimonial.id)}
                            disabled={actionLoading}
                          >
                            <XCircle className="w-4 h-4 mr-1" />
                            Reject
                          </button>
                        </>
                      )} */}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <Pagination
              currentPage={currentPage}
              totalPages={getTotalPages(filteredTestimonials.length)}
              onPageChange={setCurrentPage}
            />
          </div>
        )}

       {/* Testimonial Details Modal */}
        {showDetailsModal && selectedTestimonial && (
        <div className="fixed inset-0 bg-opacity-60 backdrop-blur-sm overflow-y-auto h-full w-full z-50 p-4 mt-10">
            <div className="relative w-full max-w-2xl mx-auto my-8">
            <div className="bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden min-h-0">
                {/* Header */}
                <div className="bg-gradient-to-r from-red-600 to-red-600 px-6 py-4">
                <div className="flex items-center justify-between">
                    <h3 className="text-xl font-bold text-white">Testimonial Details</h3>
                    <button
                    onClick={() => setShowDetailsModal(false)}
                    className="text-white hover:text-gray-200 transition-colors duration-200"
                    >
                    <XCircle className="w-6 h-6" />
                    </button>
                </div>
                </div>

                <div className="p-6 space-y-6">
                {/* User Information Card */}
                <div className="bg-gradient-to-br from-gray-50 to-gray-100 p-6 rounded-xl border border-gray-200">
                    <h4 className="text-sm font-semibold text-gray-800 mb-4">User Information</h4>
                    <div className="flex items-start space-x-4">
                    <div className="flex-shrink-0">
                        <div className="h-16 w-16 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-lg">
                        <User className="h-8 w-8 text-white" />
                        </div>
                    </div>
                    <div className="flex-1 min-w-0">
                        <div className="text-lg font-semibold text-gray-900 mb-1">
                        {selectedTestimonial.name}
                        </div>
                        <div className="text-sm text-gray-600 mb-1">
                        {selectedTestimonial.email}
                        </div>
                        <div className="text-sm text-gray-600">
                        {selectedTestimonial.role || 'User'}
                        </div>
                    </div>
                    </div>
                </div>

                {/* Rating and Status Row */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Rating */}
                    <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
                      <h4 className="text-sm font-semibold text-gray-800 mb-3">Rating</h4>
                      <div className="flex items-center gap-1">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={`w-6 h-6 transition-colors ${
                                i < (selectedTestimonial.rating || 0) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'
                              }`}
                            />
                          ))}
                        <span className="ml-2 text-sm font-medium text-gray-700">{selectedTestimonial.rating || 0}/5</span>
                      </div>
                    </div>

                    {/* Status */}
                    <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
                    <h4 className="text-sm font-semibold text-gray-800 mb-3">Current Status</h4>
                    <span className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium border ${getStatusBadge(selectedTestimonial.status)}`}>
                        {getStatusIcon(selectedTestimonial.status)}
                        <span className="capitalize">
                        {selectedTestimonial.status}
                        </span>
                    </span>
                    </div>
                </div>

                {/* Testimonial Content */}
                <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                    <h4 className="text-sm font-semibold text-gray-800 mb-4">Testimonial Content</h4>
                    <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-5 rounded-lg border border-blue-100">
                    <div className="text-4xl text-blue-400 mb-2">"</div>
                    <p className="text-gray-800 leading-relaxed italic text-base whitespace-pre-wrap">
                        {selectedTestimonial.content || selectedTestimonial.message}
                    </p>
                    <div className="text-4xl text-blue-400 text-right mt-2">"</div>
                    </div>
                </div>

                {/* Submission Date */}
                <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
                    <h4 className="text-sm font-semibold text-gray-800 mb-2">Submitted At</h4>
                    <p className="text-gray-600 text-sm">
                    {new Date(selectedTestimonial.createdAt).toLocaleString()}
                    </p>
                </div>

                {/* Action Buttons */}
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 pt-6 border-t border-gray-200">
                    <div className="flex gap-3 flex-wrap">
                      <button
                        onClick={() => handleDelete(selectedTestimonial.id)}
                        disabled={actionLoading}
                        className="inline-flex items-center px-5 py-2.5 border border-red-200 text-sm font-medium rounded-lg text-red-600 bg-red-50 hover:bg-red-100 hover:border-red-300 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
                      >
                        {actionLoading ? 'Deleting...' : (
                          <>
                            <Trash2 className="w-4 h-4 mr-2" />
                            Delete
                          </>
                        )}
                      </button>

                    </div>

                    {selectedTestimonial.status === 'pending' && (
                      <div className="flex gap-3 flex-wrap">
                        <button
                          onClick={() => handleApprove(selectedTestimonial.id)}
                          disabled={actionLoading}
                          className="inline-flex items-center px-5 py-2.5 border border-green-200 text-sm font-medium rounded-lg text-green-600 bg-green-50 hover:bg-green-100 hover:border-green-300 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
                        >
                          {actionLoading ? 'Processing...' : (
                            <>
                              <CheckCircle className="w-4 h-4 mr-2" />
                              Approve
                            </>
                          )}
                        </button>
                        <button
                          onClick={() => handleReject(selectedTestimonial.id)}
                          disabled={actionLoading}
                          className="inline-flex items-center px-5 py-2.5 border border-red-200 text-sm font-medium rounded-lg text-red-600 bg-red-50 hover:bg-red-100 hover:border-red-300 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
                        >
                          {actionLoading ? 'Processing...' : (
                            <>
                              <XCircle className="w-4 h-4 mr-2" />
                              Reject
                            </>
                          )}
                        </button>
                      </div>
                    )}
                  </div>
                </div>
            </div>
            </div>
        </div>
        )}
      </div>
    </div>
  );
};

export default AdminTestimonials;