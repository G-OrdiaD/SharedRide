const fareStrategies = {
  standard: {
    calculate: (originLat, originLng, destLat, destLng) => {
      // Dummy calculation for now. In a real app, you'd use a distance matrix API
      // to get actual distance and estimated time, then apply a rate.
      // For example, a base fare + rate per km/mile.
      const baseFare = 5; // Example base fare
      const distanceFactor = 0.5; // Example cost per unit distance
      // Simplified "distance" for demonstration (Euclidean distance on a flat plane)
      const distance = Math.sqrt(
        Math.pow(destLat - originLat, 2) + Math.pow(destLng - originLng, 2)
      );
      return baseFare + (distance * distanceFactor);
    }
  },
  pool: {
    calculate: (originLat, originLng, destLat, destLng) => {
      // Pool might be cheaper
      const baseFare = 3;
      const distanceFactor = 0.3;
      const distance = Math.sqrt(
        Math.pow(destLat - originLat, 2) + Math.pow(destLng - originLng, 2)
      );
      return baseFare + (distance * distanceFactor);
    }
  },
  luxury: {
    calculate: (originLat, originLng, destLat, destLng) => {
      // Luxury might be more expensive
      const baseFare = 10;
      const distanceFactor = 1.0;
      const distance = Math.sqrt(
        Math.pow(destLat - originLat, 2) + Math.pow(destLng - originLng, 2)
      );
      return baseFare + (distance * distanceFactor);
    }
  }
};

/**
 * Returns the appropriate fare strategy based on ride type.
 * @param {string} rideType - 'standard', 'pool', or 'luxury'
 * @returns {object} A fare strategy object with a 'calculate' method.
 */
exports.getFareStrategy = (rideType) => {
  // Return the specific strategy, or a default if not found
  return fareStrategies[rideType] || fareStrategies.standard;
};
