import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import api from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import './Home.css';

const Home = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [auctions, setAuctions] = useState([]);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('active');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const fetchAuctions = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await api.get('/Auction', {
        params: { status, search },
      });
      setAuctions(response.data);
    } catch (err) {
      setError('Failed to load auctions');
    } finally {
      setLoading(false);
    }
  };

  // Fetch auctions when status changes
  useEffect(() => {
    fetchAuctions();
  }, [status]);

  const handleSearch = (e) => {
    e.preventDefault();
    fetchAuctions();
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('sv-SE', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className='container'>
      <div className='home-header'>
        <h1 className='page-title'>Auctions</h1>
        {user && (
          <button className='btn-primary home-create-btn' onClick={() => navigate('/create-auction')}>
            + Create Auction
          </button>
        )}
      </div>

      {/* Search bar */}
      <div className='home-search card'>
        <div className='search-row'>
          <input
            type='text'
            placeholder='Search by title...'
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch(e)}
            className='search-input'
          />
          <button className='btn-primary search-btn' onClick={handleSearch}>
            Search
          </button>
        </div>

        {/* Status filter */}
        <div className='status-filters'>
          <button
            className={`filter-btn ${status === 'active' ? 'active' : ''}`}
            onClick={() => setStatus('active')}
          >
            Open Auctions
          </button>
          <button
            className={`filter-btn ${status === 'closed' ? 'active' : ''}`}
            onClick={() => setStatus('closed')}
          >
            Closed Auctions
          </button>
          <button
            className={`filter-btn ${status === 'all' ? 'active' : ''}`}
            onClick={() => setStatus('all')}
          >
            All Auctions
          </button>
        </div>
      </div>

      {/* Error */}
      {error && <p className='error-msg'>{error}</p>}

      {/* Loading */}
      {loading && <p className='loading-msg'>Loading auctions...</p>}

      {/* Auction grid */}
      {!loading && auctions.length === 0 ? (
        <div className='no-results card'>
          <p>No auctions found.</p>
        </div>
      ) : (
        <div className='auction-grid'>
          {auctions.map((auction) => (
            <div
              key={auction.auctionId}
              className='auction-card card'
              onClick={() => navigate(`/auction/${auction.auctionId}`)}
            >
              <div className='auction-card-header'>
                <h3 className='auction-title'>{auction.title}</h3>
                <span className={`auction-badge ${auction.isActive ? 'badge-open' : 'badge-closed'}`}>
                  {auction.isActive ? 'Open' : 'Closed'}
                </span>
              </div>

              <p className='auction-description'>{auction.description}</p>

              <div className='auction-card-footer'>
                <div className='auction-price'>
                  <span className='price-label'>Current price</span>
                  <span className='price-value'>{auction.currentPrice} kr</span>
                </div>
                <div className='auction-meta'>
                  <span>By {auction.userName}</span>
                  <span>Ends: {formatDate(auction.endDate)}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};