import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { fetchRatings } from '../features/ratingsSlice';

const PassengerProfile = () => {
  const { user } = useSelector((state) => state.auth);
  const { averageRating, feedbackList, isLoading } = useSelector((state) => state.ratings);
  const [editableFields, setEditableFields] = useState({
    phone: '',
    email: ''
  });

  useEffect(() => {
    if (user) {
      setEditableFields({
        phone: user.phone || '',
        email: user.email || ''
      });
    }
  }, [user]);

  const handleSave = async () => {
    console.log('Saving passenger profile:', editableFields);
  };

  if (!user) {
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
          <div className="avatar-placeholder">
            <div className="avatar-text">{user.name.charAt(0).toUpperCase()}</div>
          </div>
          <button className="upload-button">
            <div className="upload-text">Upload Photo</div>
          </button>
        </div>

        <div className="user-name">{user.name}</div>
        <div className="user-rating">⭐ {averageRating.toFixed(1)}</div>
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
          <input
            className="editable-input"
            value={editableFields.email}
            onChange={(e) => setEditableFields({ ...editableFields, email: e.target.value })}
            type="email"
          />
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
      </div>

      <div className="profile-section">
        <div className="section-title">Ratings from Drivers</div>
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

export default PassengerProfile;