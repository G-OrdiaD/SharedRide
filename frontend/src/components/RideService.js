async function requestRide(origin, destination, type) {
    const token = localStorage.getItem('token'); // Retrieve JWT token from local storage

    if (!token) {
        throw new Error('User not authenticated. Please log in.');
    }

    try {
        const response = await fetch('http://localhost:5000/api/rides/request', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}` // Include the JWT token
            },
            body: JSON.stringify({
                origin,
                destination,
                type
            }),
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Ride request failed');
        }

        const data = await response.json();
        console.log('Ride requested successfully:', data);
        return data;
    } catch (error) {
        console.error('Error requesting ride:', error);
        throw error;
    }
}

// Example usage
// const origin = { lat: 34.0522, lng: -118.2437 }; // Los Angeles
// const destination = { lat: 34.0000, lng: -118.5000 }; // Santa Monica
// requestRide(origin, destination, 'standard')
//   .then(ride => console.log('New ride:', ride))
//   .catch(err => console.error(err.message));