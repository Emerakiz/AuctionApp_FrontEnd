import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import api from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import type { Auction } from '../types';
import './Home.css';

const Home = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [auctions, setAuctions] = useState<Auction[]>([]);
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

  const handleSearch = (e: React.SyntheticEvent) => {
  e.preventDefault();
  fetchAuctions();
  };

  const [, setTick] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => setTick(t => t + 1), 60000);
    return () => clearInterval(timer);
  }, []);

 

  const getCountdown = (endDate: string): string => {
  const diff = new Date(endDate).getTime() - new Date().getTime();
  if (diff <= 0) return 'Ended';
  
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

  if (days > 0) return `${days}d left`;
  if (hours > 0) return `${hours}h left`;
  return `${minutes}m left`;
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
                  <span>Ends in: {getCountdown(auction.endDate)}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Home;