import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { logout } from '../features/authSlice';
import { fetchEarnings } from '../features/earningsSlice';

const DriverEarnings = () => {
  const user = useSelector(state => state.auth.user);
  const isAuthReady = useSelector(state => state.auth.status !== 'idle');
  const { today, total, isLoading } = useSelector(state => state.earnings);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [usdtEarnings, setUsdtEarnings] = useState({ today: 0, total: 0 });

  useEffect(() => {
    if (isAuthReady && (!user || user.role !== 'driver')) navigate('/');
  }, [user, isAuthReady, navigate]);

  useEffect(() => {
    dispatch(fetchEarnings());
  }, [dispatch]);

  useEffect(() => {
    const conversionRate = 1.2;
    setUsdtEarnings({
      today: today * conversionRate,
      total: total * conversionRate
    });
  }, [today, total]);

  const handleLogout = () => { dispatch(logout()); navigate('/'); };
  const handleGoHome = () => navigate('/driver');
  const handleGoToProfile = () => navigate('/driver/profile');

  if (!user || user.role !== 'driver') return <p>Redirecting to login...</p>;

  return (
    <div className="min-h-screen bg-silver flex flex-col items-center p-4 font-modern">
      
      {/* Blue Header Rectangle */}
      <div style={{backgroundColor: '#1E40AF', width: '100%', padding: '0.75rem 1.5rem', marginBottom: '1.5rem'}}>
        <div style={{maxWidth: '28rem', margin: '0 auto', display: 'flex', justifyContent: 'space-between', gap: '0.5rem'}}>
          <button
            onClick={handleGoHome}
            style={{backgroundColor: '#ADD8E6', color: 'white', fontWeight: '600', padding: '0.5rem 1rem', borderRadius: '0.375rem', border: 'none', cursor: 'pointer', flex: 1}}
            onMouseOver={(e) => e.target.style.backgroundColor = '#1E3A8A'}
            onMouseOut={(e) => e.target.style.backgroundColor = '#ADD8E6'}
          >
            Home
          </button>
          <button
            onClick={() => navigate('/driver/earnings')}
            style={{backgroundColor: '#ADD8E6', color: 'white', fontWeight: '600', padding: '0.5rem 1rem', borderRadius: '0.375rem', border: 'none', cursor: 'pointer', flex: 1}}
            onMouseOver={(e) => e.target.style.backgroundColor = '#1E3A8A'}
            onMouseOut={(e) => e.target.style.backgroundColor = '#ADD8E6'}
          >
            Earnings
          </button>
          <button
            onClick={handleGoToProfile}
            style={{backgroundColor: '#ADD8E6', color: 'white', fontWeight: '600', padding: '0.5rem 1rem', borderRadius: '0.375rem', border: 'none', cursor: 'pointer', flex: 1}}
            onMouseOver={(e) => e.target.style.backgroundColor = '#1E3A8A'}
            onMouseOut={(e) => e.target.style.backgroundColor = '#ADD8E6'}
          >
            Profile
          </button>
          <button
            onClick={handleLogout}
            style={{backgroundColor: '#ADD8E6', color: 'white', fontWeight: '600', padding: '0.5rem 1rem', borderRadius: '0.375rem', border: 'none', cursor: 'pointer', flex: 1}}
            onMouseOver={(e) => e.target.style.backgroundColor = '#1E3A8A'}
            onMouseOut={(e) => e.target.style.backgroundColor = '#ADD8E6'}
          >
            Logout
          </button>
        </div>
      </div>

      {/* Main Content - Centered */}
      <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%'}}>
        <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-md text-center">
          
          <h2 className="text-2xl font-bold text-gray-800 mb-6">Earnings Dashboard</h2>

          {/* Today's Earnings */}
          <div className="mb-6 p-6 bg-blue-50 rounded-lg">
            <h3 className="text-lg font-semibold text-gray-700 mb-2">Today's Earnings</h3>
            <div className="text-3xl font-bold text-green-600 mb-1">£{today.toFixed(2)}</div>
            <div className="text-gray-600">≈ {usdtEarnings.today.toFixed(2)} USDT</div>
          </div>

          {/* Total Earnings */}
          <div className="mb-6 p-6 bg-green-50 rounded-lg">
            <h3 className="text-lg font-semibold text-gray-700 mb-2">Total Earnings</h3>
            <div className="text-3xl font-bold text-blue-600 mb-1">£{total.toFixed(2)}</div>
            <div className="text-gray-600">≈ {usdtEarnings.total.toFixed(2)} USDT</div>
          </div>

          {/* Earnings Summary */}
          <div className="p-6 bg-gray-50 rounded-lg">
            <h3 className="text-lg font-semibold text-gray-700 mb-4">Summary</h3>
            <div className="flex justify-between items-center mb-2">
              <span className="text-gray-600">Completed Rides Today:</span>
              <span className="font-semibold">{(today / 15).toFixed(0)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Average per Ride:</span>
              <span className="font-semibold">£{(today / (today / 15 || 1)).toFixed(2)}</span>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default DriverEarnings;