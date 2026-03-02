import { useState } from 'react';
import { useNavigate } from 'react-router';
import api from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import './CreateAuction.css';

const CreateAuction = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    startingPrice: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Redirect if not logged in
  if (!user) {
    navigate('/login');
    return null;
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
  setFormData({ ...formData, [e.target.name]: e.target.value });
};

const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
    setError('');

    if (!formData.title || !formData.description || !formData.startingPrice) {
      setError('Please fill in all fields');
      return;
    }

    if (parseFloat(formData.startingPrice) <= 0) {
      setError('Starting price must be greater than 0');
      return;
    }

    setLoading(true);
    try {
      await api.post('/Auction', {
        title: formData.title,
        description: formData.description,
        startingPrice: parseFloat(formData.startingPrice),
      });
      navigate('/');
    } catch (err: any) {
      setError(err.response?.data || 'Failed to create auction');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className='container'>
      <button className='back-btn' onClick={() => navigate('/')}>← Back</button>

      <div className='create-auction-wrapper'>
        <div className='card'>
          <h1 className='page-title'>Create Auction</h1>

          {error && <p className='error-msg'>{error}</p>}

          <div className='form'>
            <div className='form-field'>
              <label>Title</label>
              <input
                type='text'
                name='title'
                value={formData.title}
                onChange={handleChange}
                placeholder='Enter auction title'
              />
            </div>

            <div className='form-field'>
              <label>Description</label>
              <textarea
                name='description'
                value={formData.description}
                onChange={handleChange}
                placeholder='Describe your item...'
                rows={4}
              />
            </div>

            <div className='form-field'>
              <label>Starting Price (kr)</label>
              <input
                type='number'
                name='startingPrice'
                value={formData.startingPrice}
                onChange={handleChange}
                placeholder='0'
                min='1'
              />
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
                {loading ? 'Creating...' : 'Create Auction'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateAuction;