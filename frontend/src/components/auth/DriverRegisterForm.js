import { useState } from 'react';
import { authService } from '../../services/RideService';
import { useNavigate } from 'react-router-dom';

export default function DriverRegisterForm() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
    role: 'driver',
    licenseNumber: '',
    vehicleMake: '',
    vehicleModel: '',
    vehiclePlate: '',
    vehicleColor: ''
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
      const requestData = {
        ...formData,
        vehicle: {
          make: formData.vehicleMake,
          model: formData.vehicleModel,
          licensePlate: formData.vehiclePlate,
          color: formData.vehicleColor
        }
      };
      delete requestData.vehicleMake;
      delete requestData.vehicleModel;
      delete requestData.vehiclePlate;
      delete requestData.vehicleColor;

      const response = await authService.register(requestData);
      if (response.success) {
        navigate('/driver-dashboard');
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
      <h2>Register as Driver</h2>
      <input type="text" name="name" placeholder="Full Name" value={formData.name} onChange={handleChange} required />
      <input type="email" name="email" placeholder="Email" value={formData.email} onChange={handleChange} required />
      <input type="password" name="password" placeholder="Password" value={formData.password} onChange={handleChange} required />
      <input type="tel" name="phone" placeholder="Phone Number" value={formData.phone} onChange={handleChange} required />

      <input type="text" name="licenseNumber" placeholder="Driver License Number" value={formData.licenseNumber} onChange={handleChange} required />
      <input type="text" name="vehicleMake" placeholder="Vehicle Make" value={formData.vehicleMake} onChange={handleChange} required />
      <input type="text" name="vehicleModel" placeholder="Vehicle Model" value={formData.vehicleModel} onChange={handleChange} required />
      <input type="text" name="vehiclePlate" placeholder="License Plate" value={formData.vehiclePlate} onChange={handleChange} required />
      <input type="text" name="vehicleColor" placeholder="Vehicle Color" value={formData.vehicleColor} onChange={handleChange} required />

      {error && <div className="error-message">{error}</div>}
      <button type="submit" disabled={isSubmitting}>
        {isSubmitting ? 'Registering...' : 'Create Driver Account'}
      </button>
    </form>
  );
}
