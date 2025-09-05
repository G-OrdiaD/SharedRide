import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { logout } from '../features/authSlice';
import { fetchRatings } from '../features/ratingsSlice';
import CustomAlertDialog from '../components/CustomAlertDialog';

const DriverProfile = () => {
  const user = useSelector(state => state.auth.user);
  const isAuthReady = useSelector(state => state.auth.status !== 'idle');
  const { averageRating, feedbackList, isLoading } = useSelector(state => state.ratings);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [alertMessage, setAlertMessage] = useState('');
  const [showAlert, setShowAlert] = useState(false);
  const [editableFields, setEditableFields] = useState({
    phone: '',
    homeAddress: ''
  });

  useEffect(() => {
    if (isAuthReady && (!user || user.role !== 'driver')) navigate('/');
  }, [user, isAuthReady, navigate]);

  useEffect(() => {
    if (user) {
      setEditableFields({
        phone: user.phone || '',
        homeAddress: user.homeAddress || ''
      });
    }
  }, [user]);

  const handleLogout = () => { dispatch(logout()); navigate('/'); };
  const handleGoHome = () => navigate('/driver');
  const handleGoToEarnings = () => navigate('/driver/earnings');

  const handleSave = async () => {
    try {
      // Add your profile update API call here
      setAlertMessage('Profile successfully updated');
      setShowAlert(true);
    } catch (error) {
      setAlertMessage('Failed to update profile');
      setShowAlert(true);
    }
  };

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
            onClick={handleGoToEarnings}
            style={{backgroundColor: '#ADD8E6', color: 'white', fontWeight: '600', padding: '0.5rem 1rem', borderRadius: '0.375rem', border: 'none', cursor: 'pointer', flex: 1}}
            onMouseOver={(e) => e.target.style.backgroundColor = '#1E3A8A'}
            onMouseOut={(e) => e.target.style.backgroundColor = '#ADD8E6'}
          >
            Earnings
          </button>
          <button
            onClick={() => navigate('/driver/profile')}
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
        <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-md">
          
          {/* Profile Header */}
          <div className="text-center mb-8">
            <div className="avatar-placeholder mx-auto mb-4" style={{width: '80px', height: '80px', borderRadius: '50%', backgroundColor: '#007AFF', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
              <div className="avatar-text text-white text-2xl font-bold">{user.name.charAt(0).toUpperCase()}</div>
            </div>
            <h2 className="text-2xl font-bold text-gray-800 mb-1">{user.name}</h2>
            <div className="text-gray-600">⭐ {averageRating.toFixed(1)} Rating</div>
            <button className="mt-2 text-blue-600 text-sm hover:underline">
              Upload Photo
            </button>
          </div>

          {/* Personal Information */}
          <div className="mb-6">
            <h3 className="text-xl font-semibold text-gray-800 mb-4 border-b pb-2">Personal Information</h3>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
              <div className="text-gray-900 font-medium">{user.name}</div>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
              <div className="text-gray-900">{user.email}</div>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
              <input
                type="tel"
                value={editableFields.phone}
                onChange={(e) => setEditableFields({ ...editableFields, phone: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">Home Address</label>
              <textarea
                value={editableFields.homeAddress}
                onChange={(e) => setEditableFields({ ...editableFields, homeAddress: e.target.value })}
                rows="3"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Driver Information */}
          <div className="mb-6">
            <h3 className="text-xl font-semibold text-gray-800 mb-4 border-b pb-2">Driver Information</h3>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">License Number</label>
              <div className="text-gray-900 font-medium">{user.licenseNumber}</div>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">Vehicle Make</label>
              <input
                type="text"
                defaultValue={user.vehicle?.make || ''}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">Vehicle Model</label>
              <input
                type="text"
                defaultValue={user.vehicle?.model || ''}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">License Plate</label>
              <input
                type="text"
                defaultValue={user.vehicle?.licensePlate || ''}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">Vehicle Color</label>
              <input
                type="text"
                defaultValue={user.vehicle?.color || ''}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Save Button */}
          <button
            onClick={handleSave}
            className="w-full bg-blue-600 text-white py-3 rounded-md hover:bg-blue-700 transition-colors font-semibold"
          >
            Save Changes
          </button>

          {/* Ratings Section */}
          <div className="mt-8 pt-6 border-t">
            <h3 className="text-xl font-semibold text-gray-800 mb-4">Ratings from Passengers</h3>
            {isLoading ? (
              <div className="text-center text-gray-600">Loading ratings...</div>
            ) : feedbackList.length > 0 ? (
              feedbackList.map((feedback, index) => (
                <div key={index} className="mb-4 p-3 bg-gray-50 rounded-md">
                  <div className="flex items-center mb-2">
                    <span className="text-yellow-500 mr-1">⭐</span>
                    <span className="font-semibold">{feedback.score}</span>
                  </div>
                  {feedback.feedback && (
                    <p className="text-gray-700 italic">"{feedback.feedback}"</p>
                  )}
                </div>
              ))
            ) : (
              <div className="text-center text-gray-600">No ratings yet</div>
            )}
          </div>

        </div>
      </div>

      {showAlert && <CustomAlertDialog message={alertMessage} onClose={() => setShowAlert(false)} />}
    </div>
  );
};

export default DriverProfile;