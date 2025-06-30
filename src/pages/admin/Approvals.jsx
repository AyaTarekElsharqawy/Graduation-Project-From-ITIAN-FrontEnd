import React, { useEffect, useState, useCallback } from 'react';
import axios from 'axios';
import Swal from 'sweetalert2';
import LoaderOverlay from '../../components/LoaderOverlay';

const Approvals = () => {
  const [requests, setRequests] = useState([]);
  const [employerRequests, setEmployerRequests] = useState([]);
  const [actionLoading, setActionLoading] = useState(false);
  const [imageModal, setImageModal] = useState({ open: false, src: '' });
  const [briefModal, setBriefModal] = useState({ open: false, content: '', title: '' });
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('itian');
  // ITIAN tab state
  const [itianSearch, setItianSearch] = useState('');
  const [itianPage, setItianPage] = useState(1);
  // Employer tab state
  const [employerSearch, setEmployerSearch] = useState('');
  const [employerPage, setEmployerPage] = useState(1);
  // Shared items per page
  const itemsPerPage = 15;

  const fetchRequests = useCallback(async () => {
    try {
      const token = localStorage.getItem('access-token');
      const response = await axios.get('http://127.0.0.1:8000/api/itian-registration-requests', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setRequests(response.data);
    } catch (error) {
      console.error('Failed to fetch ITIAN registration requests:', error);
    }
  }, []);

  // Fetch unapproved employers
  const fetchEmployers = useCallback(async () => {
    try {
      const token = localStorage.getItem('access-token');
      const empResponse = await axios.get('http://127.0.0.1:8000/api/users/unapproved-employers', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setEmployerRequests(empResponse.data);
            console.log('Employer Data:', empResponse.data);

    } catch (error) {
      console.error('Failed to fetch unapproved employers:', error);
    }
  }, []);

  useEffect(() => {
    setLoading(true);
    Promise.all([
      fetchRequests().finally(() => setLoading(false)),
      fetchEmployers().finally(() => setLoading(false)),
    ]);
  }, [fetchRequests, fetchEmployers]);

  const handleApprove = async (id) => {
    const result = await Swal.fire({
      title: 'Approve Request?',
      text: 'Are you sure you want to approve this ITIAN registration request?',
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#16a34a',
      cancelButtonColor: '#e35d5b',
      confirmButtonText: 'Yes, approve',
    });
    if (result.isConfirmed) {
      setActionLoading(true);
      try {
        const token = localStorage.getItem('access-token');
        await axios.put(`http://localhost:8000/api/itian-registration-requests/${id}/review`, {
          status: 'Approved',
        }, {
          headers: { Authorization: `Bearer ${token}` },
        });
        Swal.fire('Approved!', 'The request has been approved.', 'success');
        fetchRequests();
      } catch (error) {
        console.error('Failed to approve request:', error);
        Swal.fire('Error!', 'Failed to approve the request. Please try again.', 'error');
      } finally {
        setActionLoading(false);
      }
    }
  };

  const handleReject = async (id) => {
    const result = await Swal.fire({
      title: 'Reject Request?',
      text: 'Are you sure you want to reject this ITIAN registration request?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#e35d5b',
      cancelButtonColor: '#6b7280',
      confirmButtonText: 'Yes, reject',
    });
    if (result.isConfirmed) {
      setActionLoading(true);
      try {
        const token = localStorage.getItem('access-token');
        await axios.put(`http://localhost:8000/api/itian-registration-requests/${id}/review`, {
          status: 'Rejected',
        }, {
          headers: { Authorization: `Bearer ${token}` },
        });
        Swal.fire('Rejected!', 'The request has been rejected.', 'success');
        fetchRequests();
      } catch (error) {
        console.error('Failed to reject request:', error);
        Swal.fire('Error!', 'Failed to reject the request. Please try again.', 'error');
      } finally {
        setActionLoading(false);
      }
    }
  };

  // ITIAN search & pagination
  const filteredRequests = requests.filter(req => {
    const name = (req.user?.name || '').toLowerCase();
    const email = (req.user?.email || '').toLowerCase();
    const searchTerm = itianSearch.toLowerCase();
    return name.includes(searchTerm) || email.includes(searchTerm);
  });
  const itianTotalPages = Math.ceil(filteredRequests.length / itemsPerPage);
  const paginatedRequests = filteredRequests.slice((itianPage - 1) * itemsPerPage, itianPage * itemsPerPage);

  // Employer search & pagination
  const filteredEmployers = employerRequests.filter(emp => {
    const name = (emp.user?.name || '').toLowerCase();
    const email = (emp.user?.email || '').toLowerCase();
    const searchTerm = employerSearch.toLowerCase();
    return name.includes(searchTerm) || email.includes(searchTerm);
  });
  const employerTotalPages = Math.ceil(filteredEmployers.length / itemsPerPage);
  const paginatedEmployers = filteredEmployers.slice((employerPage - 1) * itemsPerPage, employerPage * itemsPerPage);

  // Reset page to 1 on search change
  useEffect(() => { setItianPage(1); }, [itianSearch]);
  useEffect(() => { setEmployerPage(1); }, [employerSearch]);

  return (
    <div className="p-6 pt-0">
      {loading && <LoaderOverlay text="Loading approvals..." />}
      {!loading && (
        <>
          {/* <h1 className="text-2xl font-bold mb-2">Approvals</h1>
          <p className="mb-4">Approve ITIANs and Employers requests to join the platform.</p> */}
          {/* Tab Navigation */}
          <div className="flex gap-2 mb-6">
            <button
              className={`px-4 py-2 rounded-t-lg font-semibold border-b-2 transition-all duration-150 ${activeTab === 'itian' ? 'border-red-600 text-red-700 bg-white' : 'border-transparent text-gray-500 bg-gray-100 hover:text-red-600'}`}
              onClick={() => setActiveTab('itian')}
            >
              ITIAN Approvals
            </button>
            <button
              className={`px-4 py-2 rounded-t-lg font-semibold border-b-2 transition-all duration-150 ${activeTab === 'employer' ? 'border-red-600 text-red-700 bg-white' : 'border-transparent text-gray-500 bg-gray-100 hover:text-red-600'}`}
              onClick={() => setActiveTab('employer')}
            >
              Employer Approvals
            </button>
          </div>

          {/* ITIAN Approvals Section */}
          {activeTab === 'itian' && (
            <div>
              <h2 className="text-xl font-semibold text-red-700 mb-2 mt-2">ITIAN Approvals</h2>
              <div className="flex flex-col md:flex-row gap-4 mb-6">
                <input
                  type="text"
                  placeholder="Search by name or email..."
                  className="border-2 border-red-400 focus:border-red-600 rounded px-3 py-2 w-full md:w-1/3 shadow-sm focus:outline-none transition"
                  value={itianSearch}
                  onChange={e => setItianSearch(e.target.value)}
                />
              </div>
              <div className="overflow-x-auto mb-4">
                <table className="min-w-full bg-white rounded-lg shadow">
                  <thead>
                    <tr className="bg-red-600 text-white">
                      <th className="py-2 px-4">Name</th>
                      <th className="py-2 px-4">Email</th>
                      <th className="py-2 px-4">Status</th>
                      <th className="py-2 px-4">Certificate</th>
                      <th className="py-2 px-4 text-center">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedRequests.map((req) => (
                      <tr key={req.id} className="border-b hover:bg-gray-50">
                        <td className="py-2 px-4">{req.user?.name}</td>
                        <td className="py-2 px-4">{req.user?.email}</td>
                        <td className="py-2 px-4">{req.status}</td>
                        <td className="py-2 px-4">
                          {req.certificate && (req.certificate.toLowerCase().endsWith('.pdf') ? (
                            <a
                              href={`http://127.0.0.1:8000/storage/${req.certificate}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-600 underline"
                            >
                              View Certificate 
                            </a>
                          ) : (
                            <button
                              className="text-blue-600 underline cursor-pointer bg-transparent border-none p-0"
                              onClick={() => setImageModal({ open: true, src: `http://127.0.0.1:8000/storage/${req.certificate}` })}
                            >
                              View Certificate
                            </button>
                          ))}
                        </td>
                        <td className="py-2 px-4 flex justify-center gap-2">
                          <button
                            className="bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700 transition"
                            onClick={() => handleApprove(req.id)}
                            disabled={req.status.toLowerCase() === 'approved'}
                          >
                            Approve
                          </button>
                          <button
                            className="bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700 transition"
                            onClick={() => handleReject(req.id)}
                            disabled={req.status.toLowerCase() === 'rejected'}
                          >
                            Reject
                          </button>
                        </td>
                      </tr>
                    ))}
                    {paginatedRequests.length === 0 && (
                      <tr>
                        <td colSpan={5} className="text-center py-4 text-gray-500">
                          No requests found.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
              {/* Pagination for ITIANs */}
              {itianTotalPages > 1 && (
                <div className="flex justify-center mt-2">
                  <button
                    className="px-3 py-1 mx-1 rounded border border-gray-300 bg-gray-100 hover:bg-gray-200 disabled:opacity-50"
                    onClick={() => setItianPage(itianPage - 1)}
                    disabled={itianPage === 1}
                  >
                    Prev
                  </button>
                  <span className="px-2 py-1">Page {itianPage} of {itianTotalPages}</span>
                  <button
                    className="px-3 py-1 mx-1 rounded border border-gray-300 bg-gray-100 hover:bg-gray-200 disabled:opacity-50"
                    onClick={() => setItianPage(itianPage + 1)}
                    disabled={itianPage === itianTotalPages}
                  >
                    Next
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Employer Approvals Section */}
          {activeTab === 'employer' && (
            <div>
              <h2 className="text-xl font-semibold text-red-700 mb-2 mt-2">Employer Approvals</h2>
              <div className="flex flex-col md:flex-row gap-4 mb-6">
                <input
                  type="text"
                  placeholder="Search by name or email..."
                  className="border-2 border-red-400 focus:border-red-600 rounded px-3 py-2 w-full md:w-1/3 shadow-sm focus:outline-none transition"
                  value={employerSearch}
                  onChange={e => setEmployerSearch(e.target.value)}
                />
              </div>
              <div className="overflow-x-auto mb-4">
                <table className="min-w-full bg-white rounded-lg shadow">
                  <thead>
                    <tr className="bg-red-600 text-white">
                      <th className="py-2 px-4">Name</th>
                      <th className="py-2 px-4">Email</th>
                      <th className="py-2 px-4">Company Brief</th>
                      <th className="py-2 px-4">Status</th>
                      <th className="py-2 px-4 text-center">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedEmployers.length > 0 ? paginatedEmployers.map((emp) => (
                      <tr key={emp.id} className="border-b hover:bg-gray-50">
                        <td className="py-2 px-4">{emp.user?.name}</td>
                        <td className="py-2 px-4">{emp.user?.email}</td>
                        <td className="py-2 px-4 max-w-sm">
                          <p className="truncate" title={emp.company_brief}>
                            {emp.company_brief || 'N/A'}
                          </p>
                          {emp.company_brief && (
                            <button
                              className="text-blue-600 text-sm hover:underline"
                              onClick={() => setBriefModal({ open: true, content: emp.company_brief, title: emp.user?.name })}
                            >
                              View Full Brief
                            </button>
                          )}
                        </td>
                        <td className="py-2 px-4">{emp.user?.is_active ? 'Active' : 'Inactive'}</td>
                        <td className="py-2 px-4 flex justify-center gap-2">
                          <button
                            className="bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700 transition"
                            onClick={async () => {
                              setActionLoading(true);
                              try {
                                const token = localStorage.getItem('access-token');
                                console.log(`Approving employer with user ID: ${emp.user.id}`);
                                await axios.post(`http://127.0.0.1:8000/api/users/${emp.user.id}/approve-employer`, {}, {
                                  headers: { Authorization: `Bearer ${token}` },
                                });
                                Swal.fire('Approved!', 'The employer has been approved.', 'success');
                                fetchEmployers();
                              } catch (error) {
                                console.error('Failed to approve employer:', error);
                                Swal.fire('Error!', 'Failed to approve the employer. Please try again.', 'error');
                              } finally {
                                setActionLoading(false);
                              }
                            }}
                            disabled={emp.user?.is_active}
                          >
                            Approve
                          </button>
                          <button
                            className="bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700 transition"
                            onClick={async () => {
                              setActionLoading(true);
                              try {
                                const token = localStorage.getItem('access-token');
                                await axios.post(`http://127.0.0.1:8000/api/users/${emp.user.id}/reject-employer`, {}, {
                                  headers: { Authorization: `Bearer ${token}` },
                                });
                                Swal.fire('Rejected!', 'The employer has been rejected.', 'success');
                                fetchEmployers();
                              } catch (error) {
                                console.error('Failed to reject employer:', error);
                                Swal.fire('Error!', 'Failed to reject the employer. Please try again.', 'error');
                              } finally {
                                setActionLoading(false);
                              }
                            }}
                            disabled={emp.user?.is_active}
                          >
                            Reject
                          </button>
                        </td>
                      </tr>
                    )) : (
                      <tr>
                        <td colSpan={5} className="text-center py-4 text-gray-500">
                          No unapproved employers found.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
              {/* Pagination for Employers */}
              {employerTotalPages > 1 && (
                <div className="flex justify-center mt-2">
                  <button
                    className="px-3 py-1 mx-1 rounded border border-gray-300 bg-gray-100 hover:bg-gray-200 disabled:opacity-50"
                    onClick={() => setEmployerPage(employerPage - 1)}
                    disabled={employerPage === 1}
                  >
                    Prev
                  </button>
                  <span className="px-2 py-1">Page {employerPage} of {employerTotalPages}</span>
                  <button
                    className="px-3 py-1 mx-1 rounded border border-gray-300 bg-gray-100 hover:bg-gray-200 disabled:opacity-50"
                    onClick={() => setEmployerPage(employerPage + 1)}
                    disabled={employerPage === employerTotalPages}
                  >
                    Next
                  </button>
                </div>
              )}
            </div>
          )}
        </>
      )}
      {actionLoading && <LoaderOverlay text="Processing..." />}
      {imageModal.open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-80" onClick={() => setImageModal({ open: false, src: '' })}>
          <div className="relative max-w-3xl w-full flex flex-col items-center" onClick={e => e.stopPropagation()}>
            <button
              className="absolute top-2 right-2 text-white bg-black bg-opacity-60 rounded-full p-2 hover:bg-opacity-90 focus:outline-none"
              onClick={() => setImageModal({ open: false, src: '' })}
              aria-label="Close image modal"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            <img
              src={imageModal.src}
              alt="Certificate"
              className="max-h-[80vh] max-w-full rounded shadow-lg border-4 border-white"
            />
          </div>
        </div>
      )}
      {briefModal.open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-80" onClick={() => setBriefModal({ open: false, content: '', title: '' })}>
          <div className="relative max-w-2xl w-full bg-white rounded-lg shadow-xl m-4" onClick={e => e.stopPropagation()}>
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold text-gray-800">Company Brief for {briefModal.title}</h3>
                <button
                  className="text-gray-400 hover:text-gray-600"
                  onClick={() => setBriefModal({ open: false, content: '', title: '' })}
                  aria-label="Close modal"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <div className="max-h-[60vh] overflow-y-auto pr-2">
                <p className="text-gray-700 whitespace-pre-wrap">{briefModal.content}</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Approvals;
