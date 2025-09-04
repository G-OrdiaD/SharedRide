import React from 'react';

const RideRequestModal = ({ rideDetails, onAccept, onReject, onClose }) => {
  if (!rideDetails) return null;

  const handleAccept = () => {
    onAccept();
    onClose();
  };

  const handleReject = () => {
    onReject();
    onClose();
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        {/* Header */}
        <div className="modal-header">
          <h3>New Ride Request</h3>
          <button
            onClick={onClose}
            className="close-button"
            aria-label="Close"
          >
            &times;
          </button>
        </div>

        {/* Ride Details */}
        <div className="ride-details">
          <div className="detail-card">
            <p className="detail-label">From:</p>
            <p className="detail-value">{rideDetails.origin?.locationString || 'N/A'}</p>
          </div>
          
          <div className="detail-card">
            <p className="detail-label">To:</p>
            <p className="detail-value">{rideDetails.destination?.locationString || 'N/A'}</p>
          </div>
          
          <div className="detail-card">
            <p className="detail-label">Passenger:</p>
            <p className="detail-value">{rideDetails.passenger?.name || 'N/A'}</p>
          </div>
          
          <div className="detail-card">
            <p className="detail-label">Ride Type:</p>
            <p className="detail-value capitalize">{rideDetails.rideType || 'Standard'}</p>
          </div>
          
          <div className="detail-card">
            <p className="detail-label">Fare:</p>
            <p className="detail-value fare-amount">
              £{rideDetails.fare ? rideDetails.fare.toFixed(2) : 'N/A'}
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="modal-actions">
          <button
            onClick={handleReject}
            className="btn-light-blue"
          >
            Reject
          </button>
          <button
            onClick={handleAccept}
            className="btn-light-blue"
          >
            Accept
          </button>
        </div>
      </div>
    </div>
  );
};

export default RideRequestModal;