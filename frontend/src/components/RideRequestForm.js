import React, { useState, useEffect } from 'react';
import rideService from '../services/RideService';
import { placesService } from '../api';

console.log('RideService being used:', rideService);
console.log('Does it have requestRide?', 'requestRide' in rideService);

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

      // Enhanced validation for Google API response
      if (!originDetails.result || !destinationDetails.result) {
        throw new Error('Invalid location details received from Google API');
      }

      if (!originDetails.result.geometry?.location || !destinationDetails.result.geometry?.location) {
        throw new Error('Google Maps API returned invalid location data');
      }

      // Validate coordinate values are numbers
      const originLng = originDetails.result.geometry.location.lng;
      const originLat = originDetails.result.geometry.location.lat;
      const destLng = destinationDetails.result.geometry.location.lng;
      const destLat = destinationDetails.result.geometry.location.lat;

      if (typeof originLng !== 'number' || typeof originLat !== 'number' ||
          typeof destLng !== 'number' || typeof destLat !== 'number') {
        throw new Error('Invalid coordinate values received from Google API');
      }
      
      const rideData = {
        origin: {
          locationString: originDetails.result.formatted_address,
          location: {
            type: "Point",
            coordinates: [originLng, originLat]
          }
        },
        destination: {
          locationString: destinationDetails.result.formatted_address,
          location: {
            type: "Point",
            coordinates: [destLng, destLat]
          }
        },
        rideType: formData.rideType
      };

      console.log('Submitting ride data:', JSON.stringify(rideData, null, 2));
      const response = await rideService.requestRide(rideData);
    
      // SUCCESS HANDLING
      setMessage({
        type: 'success',
        text: `Ride booked successfully! Fare: £${response.fare?.toFixed(2) || 'Calculating...'}`
      });
    
      // Reset form after successful booking
      setFormData({
        originLocation: '',
        destinationLocation: '',
        rideType: 'standard'
      });
      setSelectedLocations({
        origin: null,
        destination: null
      });
    
      onSubmit(response); // Pass the complete response to parent component
      
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
    <form onSubmit={handleSubmit} className="ride-request-form">
      <h3 className="form-title">Request a New Ride</h3>

      {message && (
        <div className={`form-message ${message.type === 'success' ? 'success' : 'error'}`}>
          {message.text}
        </div>
      )}

      <div className="form-group">
        <label className="form-label">
          Origin Location:
          {loading.suggestions && formData.originLocation.length > 0 && (
            <span className="loading-text">Loading suggestions...</span>
          )}
        </label>
        <input
          type="text"
          value={formData.originLocation}
          onChange={(e) => setFormData(prev => ({
            ...prev,
            originLocation: e.target.value
          }))}
          className="form-input"
          required
        />
        {suggestions.origin.length > 0 && (
          <ul className="suggestions-list">
            {suggestions.origin.map((suggestion) => (
              <li
                key={suggestion.place_id}
                onClick={() => handleLocationSelect('origin', suggestion)}
                className="suggestion-item"
              >
                {suggestion.description}
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="form-group">
        <label className="form-label">
          Destination Location:
          {loading.suggestions && formData.destinationLocation.length > 0 && (
            <span className="loading-text">Loading suggestions...</span>
          )}
        </label>
        <input
          type="text"
          value={formData.destinationLocation}
          onChange={(e) => setFormData(prev => ({
            ...prev,
            destinationLocation: e.target.value
          }))}
          className="form-input"
          required
        />
        {suggestions.destination.length > 0 && (
          <ul className="suggestions-list">
            {suggestions.destination.map((suggestion) => (
              <li
                key={suggestion.place_id}
                onClick={() => handleLocationSelect('destination', suggestion)}
                className="suggestion-item"
              >
                {suggestion.description}
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="form-group">
        <label className="form-label" htmlFor="rideType">
          Ride Type:
        </label>
        <select
          id="rideType"
          value={formData.rideType}
          onChange={(e) => setFormData(prev => ({
            ...prev,
            rideType: e.target.value
          }))}
          className="form-select"
        >
          <option value="standard">Standard</option>
          <option value="pool">Pool</option>
          <option value="luxury">Luxury</option>
        </select>
      </div>

      <button
        type="submit"
        disabled={loading.submission}
        className="submit-button"
      >
        {loading.submission ? (
          <span className="button-loading">
            <svg className="spinner" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
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