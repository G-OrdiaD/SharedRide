import React, { useState, useEffect } from 'react';
import { rideService, placesService } from '../api'; // Updated import

const RideRequestForm = ({ onSubmit }) => {
  const [originLocation, setOriginLocation] = useState('');
  const [destinationLocation, setDestinationLocation] = useState('');
  const [rideType, setRideType] = useState('standard');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [originSuggestions, setOriginSuggestions] = useState([]);
  const [destinationSuggestions, setDestinationSuggestions] = useState([]);
  const [selectedOrigin, setSelectedOrigin] = useState(null);
  const [selectedDestination, setSelectedDestination] = useState(null);

  // Effect to fetch origin location suggestions
  useEffect(() => {
    const fetchSuggestions = async () => {
      if (originLocation.length > 2) {
        try {
          const data = await placesService.autocomplete(originLocation);
          if (data.predictions) {
            setOriginSuggestions(data.predictions);
          }
        } catch (error) {
          console.error('Error fetching origin suggestions:', error);
        }
      } else {
        setOriginSuggestions([]);
      }
    };
    fetchSuggestions();
  }, [originLocation]);

  // Effect to fetch destination location suggestions
  useEffect(() => {
    const fetchSuggestions = async () => {
      if (destinationLocation.length > 2) {
        try {
          const data = await placesService.autocomplete(destinationLocation);
          if (data.predictions) {
            setDestinationSuggestions(data.predictions);
          }
        } catch (error) {
          console.error('Error fetching destination suggestions:', error);
        }
      } else {
        setDestinationSuggestions([]);
      }
    };
    fetchSuggestions();
  }, [destinationLocation]);

  const getGeoJsonFromPlaceId = async (placeId) => {
    try {
      const data = await placesService.getPlaceDetails(placeId);
      if (data.result) {
        const { lat, lng } = data.result.geometry.location;
        return {
          locationString: data.result.formatted_address,
          location: {
            type: "Point",
            coordinates: [lng, lat]
          }
        };
      }
    } catch (error) {
      console.error('Geocoding error:', error);
      throw new Error('Failed to geocode place ID.');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    setLoading(true);

    if (!selectedOrigin || !selectedDestination) {
      setMessage({ type: 'error', text: 'Please select both origin and destination locations from the suggestions.' });
      setLoading(false);
      return;
    }

    try {
      const originGeoJSON = await getGeoJsonFromPlaceId(selectedOrigin.place_id);
      const destinationGeoJSON = await getGeoJsonFromPlaceId(selectedDestination.place_id);

      const rideData = {
        origin: originGeoJSON,
        destination: destinationGeoJSON,
        rideType: rideType
      };

      const response = await rideService.requestRide(rideData);
      setMessage({ type: 'success', text: `Ride requested successfully! Ride ID: ${response._id}` });
      if (onSubmit) onSubmit(rideData);
      
      // Reset form
      setOriginLocation('');
      setDestinationLocation('');
      setSelectedOrigin(null);
      setSelectedDestination(null);
      setRideType('standard');
    } catch (error) {
      setMessage({ type: 'error', text: error.message || 'Failed to request ride.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow-md w-full max-w-md mx-auto">
      {/* ... (keep all your existing JSX exactly the same) ... */}
    </form>
  );
};

export default RideRequestForm;