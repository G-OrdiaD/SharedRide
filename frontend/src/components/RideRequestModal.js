import React from 'react';

const RideRequestModal = ({ rideDetails, onAccept, onReject, onClose }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md transform transition-all">
        <div className="p-6">
          <div className="flex justify-between items-start mb-4">
            <h3 className="text-xl font-bold text-gray-800">New Ride Request</h3>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 text-2xl font-bold"
              aria-label="Close"
            >
              &times;
            </button>
          </div>
          
          <div className="space-y-4">
            <div>
              <p className="font-semibold">From:</p>
              <p>{rideDetails?.origin?.locationString || 'N/A'}</p>
            </div>
            <div>
              <p className="font-semibold">To:</p>
              <p>{rideDetails?.destination?.locationString || 'N/A'}</p>
            </div>
            <div>
              <p className="font-semibold">Fare:</p>
              <p>£{rideDetails?.fare ? rideDetails.fare.toFixed(2) : 'N/A'}</p>
            </div>
          </div>

          <div className="mt-6 flex justify-between">
            <button
              onClick={onReject}
              className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition"
            >
              Reject
            </button>
            <button
              onClick={onAccept}
              className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 transition"
            >
              Accept (£{rideDetails?.fare ? rideDetails.fare.toFixed(2) : ''})
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RideRequestModal;