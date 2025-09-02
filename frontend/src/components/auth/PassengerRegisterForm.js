import { useState } from 'react';
import { authService } from '../../services/RideService';
import { useNavigate } from 'react-router-dom';

export default function PassengerRegisterForm() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
    role: 'passenger'
  });
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');

    try {
      const response = await authService.register(formData);
      if (response.success) {
        navigate('/passenger-dashboard');
      } else {
        setError(response.message || 'Registration failed');
      }
    } catch (err) {
      setError(err.message || 'An error occurred');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="register-form">
      <h2>Register as Passenger</h2>
      <input type="text" name="name" placeholder="Full Name" value={formData.name} onChange={handleChange} required />
      <input type="email" name="email" placeholder="Email" value={formData.email} onChange={handleChange} required />
      <input type="password" name="password" placeholder="Password" value={formData.password} onChange={handleChange} required />
      <input type="tel" name="phone" placeholder="Phone Number" value={formData.phone} onChange={handleChange} required />
      {error && <div className="error-message">{error}</div>}
      <button type="submit" disabled={isSubmitting}>
        {isSubmitting ? 'Registering...' : 'Create Passenger Account'}
      </button>
    </form>
  );
}