import React from 'react';

const RideRequestModal = ({ rideDetails, onAccept, onReject }) => (
  <div className="bg-white p-6 rounded-lg shadow-xl text-center">
    <h3 className="text-2xl font-bold mb-4">New Ride Request!</h3>
    {rideDetails && (
      <>
        {/* Display locationString from the rideDetails object */}
        <p className="text-lg mb-2">From: {rideDetails.origin.locationString}</p>
        <p className="text-lg mb-4">To: {rideDetails.destination.locationString}</p>
        <p className="text-md mb-6">Type: <span className="capitalize">{rideDetails.rideType}</span></p>
      </>
    )}
    <div className="flex justify-center space-x-4">
      <button
        onClick={onAccept}
        className="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded-md transition duration-300 ease-in-out"
      >
        Accept
      </button>
      <button
        onClick={onReject}
        className="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded-md transition duration-300 ease-in-out"
      >
        Reject
      </button>
    </div>
  </div>
);

export default RideRequestModal;
