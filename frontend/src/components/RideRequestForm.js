import React, { useState, useEffect } from 'react';
import { rideService, placesService } from '../api';

const RideRequestForm = ({ onSubmit }) => {
  const [formData, setFormData] = useState({
    originLocation: '',
    destinationLocation: '',
    rideType: 'standard'
  });
  const [message, setMessage] = useState(null);
  const [loading, setLoading] = useState({
    suggestions: false,
    submission: false
  });
  const [suggestions, setSuggestions] = useState({
    origin: [],
    destination: []
  });
  const [selectedLocations, setSelectedLocations] = useState({
    origin: null,
    destination: null
  });

  useEffect(() => {
    const fetchSuggestions = async (type, query) => {
      if (query.length < 3) {
        setSuggestions(prev => ({ ...prev, [type]: [] }));
        return;
      }

      setLoading(prev => ({ ...prev, suggestions: true }));
      
      try {
        const data = await placesService.autocomplete(query);
        setSuggestions(prev => ({
          ...prev,
          [type]: data.predictions || []
        }));
      } catch (error) {
        console.error(`${type} suggestions error:`, error);
        setMessage({
          type: 'error',
          text: 'Failed to load address suggestions'
        });
      } finally {
        setLoading(prev => ({ ...prev, suggestions: false }));
      }
    };

    const debounceTimer = setTimeout(() => {
      if (formData.originLocation !== selectedLocations.origin?.description) {
        fetchSuggestions('origin', formData.originLocation);
      }
    }, 300);

    return () => clearTimeout(debounceTimer);
  }, [formData.originLocation, selectedLocations.origin]);

  useEffect(() => {
    const fetchSuggestions = async (type, query) => {
      if (query.length < 3) {
        setSuggestions(prev => ({ ...prev, [type]: [] }));
        return;
      }

      setLoading(prev => ({ ...prev, suggestions: true }));
      
      try {
        const data = await placesService.autocomplete(query);
        setSuggestions(prev => ({
          ...prev,
          [type]: data.predictions || []
        }));
      } catch (error) {
        console.error(`${type} suggestions error:`, error);
        setMessage({
          type: 'error',
          text: 'Failed to load address suggestions'
        });
      } finally {
        setLoading(prev => ({ ...prev, suggestions: false }));
      }
    };

    const debounceTimer = setTimeout(() => {
      if (formData.destinationLocation !== selectedLocations.destination?.description) {
        fetchSuggestions('destination', formData.destinationLocation);
      }
    }, 300);

    return () => clearTimeout(debounceTimer);
  }, [formData.destinationLocation, selectedLocations.destination]);

  const handleLocationSelect = (type, suggestion) => {
    setFormData(prev => ({
      ...prev,
      [`${type}Location`]: suggestion.description
    }));
    setSelectedLocations(prev => ({
      ...prev,
      [type]: suggestion
    }));
    setSuggestions(prev => ({
      ...prev,
      [type]: []
    }));
  };

const handleSubmit = async (e) => {
  e.preventDefault();
  setMessage(null);
  setLoading(prev => ({ ...prev, submission: true }));

  if (!selectedLocations.origin || !selectedLocations.destination) {
    setMessage({
      type: 'error',
      text: 'Please select both locations from the dropdown suggestions'
    });
    setLoading(prev => ({ ...prev, submission: false }));
    return;
  }

  try {
    const [originDetails, destinationDetails] = await Promise.all([
      placesService.getPlaceDetails(selectedLocations.origin.place_id),
      placesService.getPlaceDetails(selectedLocations.destination.place_id)
    ]);

    if (!originDetails.result || !destinationDetails.result) {
      throw new Error('Invalid location details received');
    }
    
    const rideData = {
      origin: {
        locationString: originDetails.result.formatted_address,
        location: {
          type: "Point",
          coordinates: [
            originDetails.result.geometry.location.lng,
            originDetails.result.geometry.location.lat
          ]
        }
      },
      destination: {
        locationString: destinationDetails.result.formatted_address,
        location: {
          type: "Point",
          coordinates: [
            destinationDetails.result.geometry.location.lng,
            destinationDetails.result.geometry.location.lat
          ]
        }
      },
      rideType: formData.rideType
    };

    console.log('Submitting ride data:', rideData);
    const response = await rideService.requestRide(rideData);
    onSubmit(response);
    
  } catch (error) {
    console.error('Ride request failed:', error);
    setMessage({
      type: 'error',
      text: error.message || 'Failed to request ride'
    });
  } finally {
    setLoading(prev => ({ ...prev, submission: false }));
  }
};

  return (
    <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow-md w-full max-w-md mx-auto">
      <h3 className="text-xl font-semibold text-gray-800 mb-4">Request a New Ride</h3>

      {message && (
        <div className={`p-3 mb-4 rounded-md text-sm ${
          message.type === 'success' 
            ? 'bg-green-100 text-green-700' 
            : 'bg-red-100 text-red-700'
        }`}>
          {message.text}
        </div>
      )}

      <div className="mb-4 relative">
        <label className="block text-gray-700 text-sm font-bold mb-2">
          Origin Location:
          {loading.suggestions && formData.originLocation.length > 0 && (
            <span className="ml-2 text-xs text-gray-500">Loading suggestions...</span>
          )}
        </label>
        <input
          type="text"
          placeholder="e.g., Wembley Central"
          value={formData.originLocation}
          onChange={(e) => setFormData(prev => ({
            ...prev,
            originLocation: e.target.value
          }))}
          className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          required
        />
        {suggestions.origin.length > 0 && (
          <ul className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-y-auto">
            {suggestions.origin.map((suggestion) => (
              <li
                key={suggestion.place_id}
                onClick={() => handleLocationSelect('origin', suggestion)}
                className="px-4 py-2 hover:bg-blue-50 cursor-pointer"
              >
                {suggestion.description}
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="mb-4 relative">
        <label className="block text-gray-700 text-sm font-bold mb-2">
          Destination Location:
          {loading.suggestions && formData.destinationLocation.length > 0 && (
            <span className="ml-2 text-xs text-gray-500">Loading suggestions...</span>
          )}
        </label>
        <input
          type="text"
          placeholder="e.g., Wembley Stadium"
          value={formData.destinationLocation}
          onChange={(e) => setFormData(prev => ({
            ...prev,
            destinationLocation: e.target.value
          }))}
          className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          required
        />
        {suggestions.destination.length > 0 && (
          <ul className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-y-auto">
            {suggestions.destination.map((suggestion) => (
              <li
                key={suggestion.place_id}
                onClick={() => handleLocationSelect('destination', suggestion)}
                className="px-4 py-2 hover:bg-blue-50 cursor-pointer"
              >
                {suggestion.description}
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="mb-6">
        <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="rideType">
          Ride Type:
        </label>
        <select
          id="rideType"
          value={formData.rideType}
          onChange={(e) => setFormData(prev => ({
            ...prev,
            rideType: e.target.value
          }))}
          className="shadow border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
        >
          <option value="standard">Standard</option>
          <option value="pool">Pool</option>
          <option value="luxury">Luxury</option>
        </select>
      </div>

      <button
        type="submit"
        disabled={loading.submission}
        className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-md focus:outline-none focus:shadow-outline w-full transition duration-300 ease-in-out disabled:opacity-75"
      >
        {loading.submission ? (
          <span className="flex items-center justify-center">
            <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Processing...
          </span>
        ) : 'Request Ride'}
      </button>
    </form>
  );
};

export default RideRequestForm;