// Function to calculate Haversine distance
function calculateHaversineDistance(coord1, coord2) {
  const [lat1, lon1] = coord1;
  const [lat2, lon2] = coord2;

  const R = 6371; // Earth radius in km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;

  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1 * Math.PI / 180) *
      Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLon / 2) ** 2;

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c; // Distance in km
}

// Reusable function to validate coordinates
function isValidCoordinate(coords) {
  return typeof coords === 'number' && !isNaN(coords) && isFinite(coords);
}

const fareStrategies = {
  standard: {
    calculate: (coord1, coord2) => {
      const [originLat, originLng] = coord1;
      const [destLat, destLng] = coord2;

      if (
        !isValidCoordinate(originLat) ||
        !isValidCoordinate(originLng) ||
        !isValidCoordinate(destLat) ||
        !isValidCoordinate(destLng)
      ) {
        throw new Error('Invalid coordinates provided');
      }

      const baseFare = 5;
      const distanceFactor = 0.5;
      const distance = calculateHaversineDistance(coord1, coord2);

      return baseFare + distance * distanceFactor;
    },
  },

  pool: {
    calculate: (coord1, coord2) => {
      const [originLat, originLng] = coord1;
      const [destLat, destLng] = coord2;

      if (
        !isValidCoordinate(originLat) ||
        !isValidCoordinate(originLng) ||
        !isValidCoordinate(destLat) ||
        !isValidCoordinate(destLng)
      ) {
        throw new Error('Invalid coordinates provided');
      }

      const baseFare = 3;
      const distanceFactor = 0.3;
      const distance = calculateHaversineDistance(coord1, coord2);

      return baseFare + distance * distanceFactor;
    },
  },

  luxury: {
    calculate: (coord1, coord2) => {
      const [originLat, originLng] = coord1;
      const [destLat, destLng] = coord2;

      if (
        !isValidCoordinate(originLat) ||
        !isValidCoordinate(originLng) ||
        !isValidCoordinate(destLat) ||
        !isValidCoordinate(destLng)
      ) {
        throw new Error('Invalid coordinates provided');
      }

      const baseFare = 10;
      const distanceFactor = 1.0;
      const distance = calculateHaversineDistance(coord1, coord2);

      return baseFare + distance * distanceFactor;
    },
  },
};

/**
 * Returns the appropriate fare strategy based on ride type.
 * @param {string} rideType - 'standard', 'pool', or 'luxury'
 * @returns {object} A fare strategy object with a 'calculate' method.
 */
exports.getFareStrategy = (rideType) => {
  return fareStrategies[rideType] || fareStrategies.standard;
};