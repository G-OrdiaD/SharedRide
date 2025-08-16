async function requestRide(origin, destination, rideType) {
    // Validate authentication
    const token = localStorage.getItem('token');
    if (!token) {
        throw new Error('User not authenticated. Please log in.');
    }

    // Validate input parameters
    if (!origin || !destination) {
        throw new Error('Please select both origin and destination locations');
    }

    if (!origin.location || !destination.location) {
        throw new Error('Invalid location data - please reselect your locations');
    }

    if (!rideType) {
        throw new Error('Please select a ride type');
    }

    // Standardize the request payload to use 'lat' and 'lng'
    const rideRequest = {
        origin: {
            locationString: origin.locationString || '',
            location: {
               
                lat: origin.location.lat || origin.location.latitude,
                
                lng: origin.location.lng || origin.location.longitude
            }
        },
        destination: {
            locationString: destination.locationString || '',
            location: {
                lat: destination.location.lat || destination.location.latitude,
                lng: destination.location.lng || destination.location.longitude
            }
        },
        rideType
    };

    try {
        const response = await fetch('http://localhost:5000/api/rides/request', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(rideRequest),
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || `Ride request failed with status ${response.status}`);
        }

        const data = await response.json();
        console.log('Ride requested successfully:', data);
        return data;
    } catch (error) {
        console.error('Error requesting ride:', error);
        throw new Error(error.message || 'Failed to request ride. Please try again.');
    }
}