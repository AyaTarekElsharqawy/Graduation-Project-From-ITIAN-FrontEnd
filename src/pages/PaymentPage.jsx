import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { Sparkles, Search } from 'lucide-react'; 
function PaymentPage() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [hasUnusedPayment, setHasUnusedPayment] = useState(false);

  useEffect(() => {
    const checkPaymentStatus = async () => {
      try {
        const token = localStorage.getItem('access-token');
        const response = await axios.get('http://localhost:8000/api/has-unused-payment', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        setHasUnusedPayment(response.data.has_payment); // true لو عنده دفعة مش مستخدمة
      } catch (error) {
        console.error('Error checking payment status:', error);
      } finally {
        setIsLoading(false);
      }
    };

    checkPaymentStatus();
  }, []);

  const handlePostJobClick = async () => {
    const token = localStorage.getItem('access-token');

    if (hasUnusedPayment) {
      navigate('/employer/post-job');
    } else {
      try {
        const response = await axios.post(
          'http://localhost:8000/api/create-checkout-session',
          {},
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        window.location.href = response.data.url;
      } catch (error) {
        console.error('Error creating checkout session:', error);
        alert('حدث خطأ أثناء إنشاء الدفع');
      }
    }
  };

  if (isLoading) return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="relative">
          <div className="w-20 h-20 border-4 border-red-200 border-t-red-600 rounded-full animate-spin"></div>
          <div className="absolute inset-0 w-20 h-20 border-4 border-transparent border-t-red-500 rounded-full animate-spin animation-delay-150"></div>
          <Sparkles className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-red-600 w-8 h-8 animate-pulse" />
        </div>
        <p className="ml-6 text-gray-800 text-xl font-medium animate-pulse">Loading...</p>
      </div>
  );

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 to-white">
      <div className="bg-white rounded-2xl shadow-xl border-2 border-[#e35d5b] p-8 max-w-md w-full flex flex-col items-center">
        <div className="w-full mb-6">
          <div className="flex items-center gap-2 bg-[#fef2f2] border border-[#e35d5b] text-[#b53c35] px-4 py-3 rounded-lg text-base font-semibold">
            <svg className="w-5 h-5 text-[#e35d5b]" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M12 20a8 8 0 100-16 8 8 0 000 16z" /></svg>
            <span>You should pay before posting a job.</span>
          </div>
        </div>
        <h2 className="text-2xl font-bold text-[#e35d5b] mb-2">Job Posting Payment</h2>
        <p className="text-[#b53c35] mb-6 text-center">To post a job, you must pay the job posting fee. If you have already paid and not used your payment, you can proceed to post your job directly.</p>
        <button
          onClick={handlePostJobClick}
          className="w-full bg-[#e35d5b] text-white py-3 rounded-lg font-bold text-lg shadow-md hover:bg-[#b53c35] transition-colors duration-150 mb-2"
        >
          Post Job
        </button>
        {hasUnusedPayment ? (
          <div className="w-full mt-2 text-green-700 bg-green-50 border border-green-200 px-4 py-2 rounded text-center text-sm font-medium">
            You have an unused payment. Click 'Post Job' to continue.
          </div>
        ) : (
          <div className="w-full mt-2 text-[#b53c35] bg-[#fef2f2] border border-[#e35d5b] px-4 py-2 rounded text-center text-sm font-medium">
            You will be redirected to payment if you have not paid yet.
          </div>
        )}
      </div>
    </div>
  );
}

export default PaymentPage;