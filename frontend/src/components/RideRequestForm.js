import React, { useState } from 'react';
import { rideService } from '../api'; // import path

const RideRequestForm = () => {
  // State for single origin and destination location strings
  const [originLocation, setOriginLocation] = useState('');
  const [destinationLocation, setDestinationLocation] = useState('');
  const [rideType, setRideType] = useState('standard');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  // const dispatch = useDispatch(); // Removed this line

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    setLoading(true);

    if (!originLocation || !destinationLocation) {
      setMessage({ type: 'error', text: 'Please enter both origin and destination locations.' });
      setLoading(false);
      return;
    }

    try {
      const response = await rideService.requestRide(originLocation, destinationLocation, rideType);
      setMessage({ type: 'success', text: `Ride requested successfully! Ride ID: ${response._id}` });
      setOriginLocation('');
      setDestinationLocation('');
      setRideType('standard');
    } catch (error) {
      setMessage({ type: 'error', text: error.message || 'Failed to request ride.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow-md w-full max-w-md mx-auto">
      <h3 className="text-xl font-semibold text-gray-800 mb-4">Request a New Ride</h3>

      {message.text && (
        <div className={`p-3 mb-4 rounded-md text-sm ${message.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
          {message.text}
        </div>
      )}

      {/* Origin Input */}
      <div className="mb-4">
        <label className="block text-gray-700 text-sm font-bold mb-2">Origin Location (Address or Postcode):</label>
        <input
          type="text"
          placeholder="e.g., Wembley Central or HA0 4AP"
          value={originLocation}
          onChange={(e) => setOriginLocation(e.target.value)}
          className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          required
        />
      </div>

      {/* Destination Input */}
      <div className="mb-4">
        <label className="block text-gray-700 text-sm font-bold mb-2">Destination Location (Address or Postcode):</label>
        <input
          type="text"
          placeholder="e.g., Wembley Stadium or HA9 0WS"
          value={destinationLocation}
          onChange={(e) => setDestinationLocation(e.target.value)}
          className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          required
        />
      </div>

      {/* Ride Type Selection */}
      <div className="mb-6">
        <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="rideType">
          Ride Type:
        </label>
        <select
          id="rideType"
          value={rideType}
          onChange={(e) => setRideType(e.target.value)}
          className="shadow border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
        >
          <option value="standard">Standard</option>
          <option value="pool">Pool</option>
          <option value="luxury">Luxury</option>
        </select>
      </div>

      <button
        type="submit"
        disabled={loading}
        className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-md focus:outline-none focus:shadow-outline w-full transition duration-300 ease-in-out"
      >
        {loading ? 'Requesting...' : 'Request Ride'}
      </button>
    </form>
  );
};

export default RideRequestForm;