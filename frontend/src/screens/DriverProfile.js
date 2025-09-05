import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { fetchRatings } from '../features/ratingsSlice';

const DriverProfile = () => {
  const { user } = useSelector((state) => state.auth);
  const { averageRating, feedbackList, isLoading } = useSelector((state) => state.ratings);
  const [profile, setProfile] = useState(null);
  const [editableFields, setEditableFields] = useState({
    phone: '',
    homeAddress: ''
  });

  useEffect(() => {
    if (user) {
      const mockDriverData = {
        vehicle: user.vehicle || {},
        licenseNumber: user.licenseNumber || '',
        homeAddress: '123 Driver Street, London',
        profilePicture: null,
        totalTrips: 147
      };

      setProfile(mockDriverData);
      setEditableFields({
        phone: user.phone,
        homeAddress: mockDriverData.homeAddress
      });
    }
  }, [user]);

  const handleSave = async () => {
    console.log('Saving:', editableFields);
  };

  if (!profile || !user) {
    return (
      <div className="loading-container">
        <div>Loading...</div>
        <div className="loading-text">Loading profile...</div>
      </div>
    );
  }

  return (
    <div className="profile-container">
      <div className="profile-header">
        <div className="avatar-container">
          {profile.profilePicture ? (
            <img src={profile.profilePicture} className="avatar-image" alt="Profile" />
          ) : (
            <div className="avatar-placeholder">
              <div className="avatar-text">{user.name.charAt(0).toUpperCase()}</div>
            </div>
          )}
          <button className="upload-button">
            <div className="upload-text">Upload Photo</div>
          </button>
        </div>

        <div className="user-name">{user.name}</div>
        <div className="driver-rating">⭐ {averageRating.toFixed(1)} • {profile.totalTrips} trips</div>
      </div>

      <div className="profile-section">
        <div className="section-title">Personal Information</div>
        
        <div className="field-group">
          <div className="field-label">Full Name</div>
          <div className="field-value">{user.name}</div>
          <div className="field-note">Cannot be changed</div>
        </div>

        <div className="field-group">
          <div className="field-label">Email</div>
          <div className="field-value">{user.email}</div>
        </div>

        <div className="field-group">
          <div className="field-label">Phone Number</div>
          <input
            className="editable-input"
            value={editableFields.phone}
            onChange={(e) => setEditableFields({ ...editableFields, phone: e.target.value })}
            type="tel"
          />
        </div>

        <div className="field-group">
          <div className="field-label">Home Address</div>
          <textarea
            className="editable-input"
            value={editableFields.homeAddress}
            onChange={(e) => setEditableFields({ ...editableFields, homeAddress: e.target.value })}
            rows="3"
          />
        </div>
      </div>

      <div className="profile-section">
        <div className="section-title">Driver Information</div>
        
        <div className="field-group">
          <div className="field-label">License Number</div>
          <div className="field-value">{profile.licenseNumber}</div>
          <div className="field-note">Cannot be changed</div>
        </div>

        <div className="field-group">
          <div className="field-label">Vehicle Make</div>
          <div className="field-value">{profile.vehicle.make || 'Not set'}</div>
        </div>

        <div className="field-group">
          <div className="field-label">Vehicle Model</div>
          <div className="field-value">{profile.vehicle.model || 'Not set'}</div>
        </div>

        <div className="field-group">
          <div className="field-label">License Plate</div>
          <div className="field-value">{profile.vehicle.licensePlate || 'Not set'}</div>
        </div>

        <div className="field-group">
          <div className="field-label">Vehicle Color</div>
          <div className="field-value">{profile.vehicle.color || 'Not set'}</div>
        </div>
      </div>

      <div className="profile-section">
        <div className="section-title">Ratings & Feedback</div>
        {isLoading ? (
          <div>Loading...</div>
        ) : (
          feedbackList.map((feedback, index) => (
            <div key={index} className="feedback-item">
              <div className="feedback-rating">⭐ {feedback.score}</div>
              {feedback.feedback && <div className="feedback-text">"{feedback.feedback}"</div>}
            </div>
          ))
        )}
      </div>

      <button className="save-button" onClick={handleSave}>
        <div className="save-button-text">Save Changes</div>
      </button>
    </div>
  );
};

export default DriverProfile;