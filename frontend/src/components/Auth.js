import RegisterForm from '../components/auth/RegisterForm';

function AuthPage() {
  return (
    <div className="auth-page">
      <RegisterForm />
      {/* Already have an account? Login link */}
    </div>
  );
}
async function registerUser(name, phone, role, password) {
    try {
        const response = await fetch('http://localhost:5000/api/auth/register', {
            method: 'POST', // HTTP method
            headers: {
                'Content-Type': 'application/json', // Tell the server we're sending JSON
            },
            body: JSON.stringify({ // Convert JavaScript object to JSON string
                name,
                phone,
                role,
                passwordHash: password // Assuming your backend expects passwordHash directly for now
            }),
        });

        // Check if the request was successful (status code 2xx)
        if (!response.ok) {
            const errorData = await response.json(); // Parse error response from server
            throw new Error(errorData.message || 'Registration failed');
        }

        const data = await response.json(); // Parse the successful JSON response
        console.log('Registration successful:', data);
        // You might store the JWT token here if the backend sends one
        // localStorage.setItem('token', data.token);
        return data; // Return data (e.g., user info, token)
    } catch (error) {
        console.error('Error during registration:', error);
        throw error; // Re-throw to be handled by calling component/function
    }
}