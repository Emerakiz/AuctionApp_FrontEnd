import { useState } from 'react';
import { useNavigate } from 'react-router';
import api from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import './Login.css';

const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    username: '',
    password: '',
  });
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const response = await api.post('/User/login', formData);
      const token = response.data.token;

      const payload = JSON.parse(atob(token.split('.')[1]));
      const userData = {
        id: payload['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier'],
        username: payload['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name'],
        isAdmin: payload['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/role'] === 'Admin',
      };

      login(userData, token);
      navigate('/');
    } catch (err) {
      setError('Invalid username or password');
    }
  };

  return (
    <div className='login-container'>
      <div className='login-card'>
        <h2>Login</h2>

        {error && <p className='error-msg'>{error}</p>}

        <div className='form'>
          <div className='form-field'>
            <label>Username</label>
            <input
              type='text'
              name='username'
              value={formData.username}
              onChange={handleChange}
            />
          </div>

          <div className='form-field'>
            <label>Password</label>
            <input
              type='password'
              name='password'
              value={formData.password}
              onChange={handleChange}
            />
          </div>

          <button className='btn-primary' onClick={handleSubmit}>Login</button>
        </div>
      </div>
    </div>
  );
};

export default Login;