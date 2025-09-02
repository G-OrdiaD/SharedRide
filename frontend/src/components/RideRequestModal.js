import React from 'react';

const RideRequestModal = ({ rideDetails, onAccept, onReject, onClose }) => {
  if (!rideDetails) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg transform transition-transform scale-100">
        <div className="p-6">
          {/* Header */}
          <div className="flex justify-between items-center mb-6 border-b border-gray-200 pb-2">
            <h3 className="text-2xl font-bold text-gray-800">New Ride Request</h3>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 text-3xl font-bold transition-colors"
              aria-label="Close"
            >
              &times;
            </button>
          </div>

          {/* Ride Details */}
          <div className="space-y-4">
            <div>
              <p className="text-gray-600 font-semibold">From:</p>
              <p className="text-gray-800">{rideDetails.origin?.locationString || 'N/A'}</p>
            </div>
            <div>
              <p className="text-gray-600 font-semibold">To:</p>
              <p className="text-gray-800">{rideDetails.destination?.locationString || 'N/A'}</p>
            </div>
            <div>
              <p className="text-gray-600 font-semibold">Passenger:</p>
              <p className="text-gray-800">{rideDetails.passenger?.name || 'N/A'}</p>
            </div>
            <div>
              <p className="text-gray-600 font-semibold">Ride Type:</p>
              <p className="text-gray-800 capitalize">{rideDetails.rideType || 'Standard'}</p>
            </div>
            <div>
              <p className="text-gray-600 font-semibold">Fare:</p>
              <p className="text-gray-800">£{rideDetails.fare ? rideDetails.fare.toFixed(2) : 'N/A'}</p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="mt-6 flex justify-end space-x-4">
            <button
              onClick={onReject}
              className="px-5 py-2 bg-red-600 text-white font-semibold rounded-lg hover:bg-red-700 transition"
            >
              Reject
            </button>
            <button
              onClick={onAccept}
              className="px-5 py-2 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 transition"
            >
              Accept
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RideRequestModal;