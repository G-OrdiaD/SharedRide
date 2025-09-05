import api from './api'; // Your Axios instance

const userService = {
  getWallet: () => {
    return api.get('/users/wallet');
  },
  topUpWallet: (amount, paymentMethod) => {
    return api.post('/users/wallet/top-up', { amount, paymentMethod });
  },
  getEarnings: () => {
    return api.get('/users/earnings');
  },
  getRatings: (userId) => {
    // If a userId is provided, fetch ratings for that user. Otherwise, fetch for the logged-in user.
    const url = userId ? `/users/${userId}/ratings` : '/users/ratings';
    return api.get(url);
  },
};

export default userService;