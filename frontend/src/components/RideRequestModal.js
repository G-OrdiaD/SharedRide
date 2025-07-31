import React from 'react';

const RideRequestModal = ({ onAccept, onReject }) => (
  <div className="ride-request-modal">
    <h3>New Ride Request</h3>
    <p>A passenger is requesting a ride nearby.</p>
    <div className="modal-buttons">
      <button onClick={onAccept}>Accept</button>
      <button onClick={onReject}>Reject</button>
    </div>
  </div>
);

export default RideRequestModal;