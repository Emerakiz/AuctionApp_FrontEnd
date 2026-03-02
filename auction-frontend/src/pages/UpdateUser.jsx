import { useState } from 'react';
import { useNavigate } from 'react-router';
import api from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import './UpdateUser.css';

const UpdateUser = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  if (!user) {
    navigate('/login');
    return null;
  }

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    // Validate at least one field is filled
    if (!formData.email && !formData.password) {
      setError('Please fill in at least one field to update');
      return;
    }

    // Validate passwords match if password is being changed
    if (formData.password && formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (formData.password && formData.password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setLoading(true);
    try {
      await api.put('/User', {
        username: user.username,
        email: formData.email || undefined,
        password: formData.password || undefined,
      });
      setSuccess('Your account has been updated successfully!');
      setFormData({ email: '', password: '', confirmPassword: '' });
    } catch (err) {
      setError(err.response?.data || 'Failed to update account');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className='container'>
      <button className='back-btn' onClick={() => navigate('/')}>← Back</button>

      <div className='update-user-wrapper'>
        <div className='card'>
          <h1 className='page-title'>Update Account</h1>
          <p className='update-subtitle'>Logged in as <strong>{user.username}</strong></p>
          <p className='update-note'>Leave a field empty to keep it unchanged.</p>

          {error && <p className='error-msg'>{error}</p>}
          {success && <p className='success-msg'>{success}</p>}

          <div className='form'>
            <div className='update-section'>
              <h3 className='section-title'>Update Email</h3>
              <div className='form-field'>
                <label>New Email</label>
                <input
                  type='email'
                  name='email'
                  value={formData.email}
                  onChange={handleChange}
                  placeholder='Enter new email'
                />
              </div>
            </div>

            <div className='update-divider' />

            <div className='update-section'>
              <h3 className='section-title'>Update Password</h3>
              <div className='form-field'>
                <label>New Password</label>
                <input
                  type='password'
                  name='password'
                  value={formData.password}
                  onChange={handleChange}
                  placeholder='Enter new password'
                />
              </div>
              <div className='form-field'>
                <label>Confirm New Password</label>
                <input
                  type='password'
                  name='confirmPassword'
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  placeholder='Confirm new password'
                />
              </div>
            </div>

            <div className='form-buttons'>
              <button
                className='btn-secondary'
                onClick={() => navigate('/')}
              >
                Cancel
              </button>
              <button
                className='btn-primary'
                onClick={handleSubmit}
                disabled={loading}
              >
                {loading ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UpdateUser;