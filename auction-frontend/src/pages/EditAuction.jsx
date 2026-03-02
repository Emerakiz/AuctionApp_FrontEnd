import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router';
import api from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import './CreateAuction.css';

const EditAuction = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    startingPrice: '',
  });
  const [hasBids, setHasBids] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Redirect if not logged in
  if (!user) {
    navigate('/login');
    return null;
  }

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [auctionRes, bidsRes] = await Promise.all([
          api.get(`/Auction/${id}`),
          api.get(`/Auction/${id}/bidHistory`),
        ]);

        const auction = auctionRes.data;

        // Redirect if not the owner
        if (String(auction.userId) !== String(user.id)) {
          navigate('/');
          return;
        }

        setFormData({
          title: auction.title,
          description: auction.description,
          startingPrice: auction.startingPrice,
        });

        setHasBids(bidsRes.data.length > 0);
      } catch (err) {
        setError('Failed to load auction');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
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

    setSaving(true);
    try {
      await api.put(`/Auction/${id}`, {
        title: formData.title,
        description: formData.description,
        startingPrice: parseFloat(formData.startingPrice),
      });
      navigate(`/auction/${id}`);
    } catch (err) {
      setError(err.response?.data || 'Failed to update auction');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className='container'><p className='loading-msg'>Loading...</p></div>;

  return (
    <div className='container'>
      <button className='back-btn' onClick={() => navigate(`/auction/${id}`)}>← Back</button>

      <div className='create-auction-wrapper'>
        <div className='card'>
          <h1 className='page-title'>Edit Auction</h1>

          {error && <p className='error-msg'>{error}</p>}

          {hasBids && (
            <div className='info-msg'>
              ⚠️ This auction has bids — the starting price cannot be changed.
            </div>
          )}

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
                disabled={hasBids}
                className={hasBids ? 'input-disabled' : ''}
              />
            </div>

            <div className='form-buttons'>
              <button
                className='btn-secondary'
                onClick={() => navigate(`/auction/${id}`)}
              >
                Cancel
              </button>
              <button
                className='btn-primary'
                onClick={handleSubmit}
                disabled={saving}
              >
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditAuction;