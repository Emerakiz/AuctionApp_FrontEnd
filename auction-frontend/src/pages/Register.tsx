import { useState } from 'react';
import { useNavigate, Link } from 'react-router';
import api from '../services/api';
import './Register.css';

const Register = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

 

  const handleSubmit = async (e: React.SyntheticEvent) => {
  e.preventDefault();
  setError('');
  setSuccess('');
  try {
    await api.post('/User/register', formData);
    setSuccess('Account created! Redirecting to login...');
    setTimeout(() => navigate('/login'), 2000);
  } catch (err) {
  const error = err as { response?: { data?: unknown } };
  const data = error.response?.data;
  
  if (typeof data === 'string') {
    setError(data);
  } else if (data && typeof data === 'object') {
    const validationErrors = (data as { errors?: Record<string, string[]> }).errors;
    if (validationErrors) {
      const messages = Object.values(validationErrors).flat().join(', ');
      setError(messages);
    } else {
      setError('Registration failed, please try again');
    }
  } else {
    setError('Registration failed, please try again');
  }
}
};

  return (
    <div className='login-container'>
      <div className='login-card'>
        <h2>Create Account</h2>

        {error && <p className='error-msg'>{error}</p>}
        {success && <p className='success-msg'>{success}</p>}

        <div className='form'>
          <div className='form-field'>
            <label>Username</label>
            <input
              type='text'
              name='name'
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            />
          </div>

          <div className='form-field'>
            <label>Email</label>
            <input
              type='email'
              name='email'
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            />
          </div>

          <div className='form-field'>
            <label>Password</label>
            <input
              type='password'
              name='password'
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            />
          </div>

          <button className='btn-primary' onClick={handleSubmit}>
            Register
          </button>

          <p style={{ textAlign: 'center', color: '#475569', fontSize: '0.9rem' }}>
            Already have an account? <Link to='/login' style={{ color: '#1e293b' }}>Login here</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;