import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router';
import api from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import './AuctionDetail.css';

const AuctionDetail = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [auction, setAuction] = useState(null);
  const [bids, setBids] = useState([]);
  const [bidAmount, setBidAmount] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(true);

  const fetchAuction = async () => {
    try {
      const response = await api.get(`/Auction/${id}`);
      setAuction(response.data);
    } catch (err) {
      setError('Failed to load auction');
    }
  };

  const fetchBids = async () => {
    try {
      const response = await api.get(`/Auction/${id}/bidHistory`);
      setBids(response.data);
    } catch (err) {
      setError('Failed to load bids');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAuction();
    fetchBids();
  }, [id]);

  const handlePlaceBid = async () => {
    setError('');
    setSuccess('');
    try {
      await api.post(`/Bid/auction/${id}`, { amount: parseFloat(bidAmount) });
      setSuccess('Bid placed successfully!');
      setBidAmount('');
      fetchAuction();
      fetchBids();
    } catch (err) {
      setError(err.response?.data || 'Failed to place bid');
    }
  };

  const handleDeleteBid = async (bidId) => {
    setError('');
    setSuccess('');
    try {
      await api.delete(`/Bid/${bidId}`);
      setSuccess('Bid removed successfully!');
      fetchAuction();
      fetchBids();
    } catch (err) {
      setError(err.response?.data || 'Failed to remove bid');
    }
  };

  const handleEditAuction = () => {
    navigate(`/edit-auction/${id}`);
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

  const isOwner = user && auction && String(user.id) === String(auction.userId);
  const isOpen = auction?.isActive;
  const latestBid = bids.length > 0 ? bids[0] : null;
  const userLatestBid = bids.find(
    (bid) => String(bid.userId) === String(user?.id)
  );

  if (loading) return <div className='container'><p className='loading-msg'>Loading...</p></div>;

  if (!auction) return <div className='container'><p className='error-msg'>Auction not found.</p></div>;

  return (
    <div className='container'>
      <button className='back-btn' onClick={() => navigate('/')}>← Back</button>

      <div className='auction-detail-grid'>

        {/* Left - Auction info */}
        <div className='auction-info card'>
          <div className='detail-header'>
            <h1 className='page-title'>{auction.title}</h1>
            <span className={`auction-badge ${isOpen ? 'badge-open' : 'badge-closed'}`}>
              {isOpen ? 'Open' : 'Closed'}
            </span>
          </div>

          <p className='detail-description'>{auction.description}</p>

          <div className='detail-meta'>
            <div className='meta-row'>
              <span className='meta-label'>Created by</span>
              <span>{auction.userName}</span>
            </div>
            <div className='meta-row'>
              <span className='meta-label'>Starting price</span>
              <span>{auction.startingPrice} kr</span>
            </div>
            <div className='meta-row'>
              <span className='meta-label'>Current price</span>
              <span className='current-price'>{auction.currentPrice} kr</span>
            </div>
            <div className='meta-row'>
              <span className='meta-label'>Start date</span>
              <span>{formatDate(auction.startDate)}</span>
            </div>
            <div className='meta-row'>
              <span className='meta-label'>End date</span>
              <span>{formatDate(auction.endDate)}</span>
            </div>
          </div>

          {/* Owner controls */}
          {isOwner && isOpen && (
            <div className='owner-controls'>
              <button className='btn-secondary' onClick={handleEditAuction}>
                Edit Auction
              </button>
            </div>
          )}
        </div>

        {/* Right - Bids */}
        <div className='bids-section'>

          {/* Place bid - only show if open, logged in, and not owner */}
          {isOpen && user && !isOwner && (
            <div className='place-bid card'>
              <h3>Place a Bid</h3>
              {error && <p className='error-msg'>{error}</p>}
              {success && <p className='success-msg'>{success}</p>}
              <div className='bid-input-row'>
                <input
                  type='number'
                  placeholder={`Min: ${auction.currentPrice + 1} kr`}
                  value={bidAmount}
                  onChange={(e) => setBidAmount(e.target.value)}
                  className='bid-input'
                />
                <button className='btn-primary bid-btn' onClick={handlePlaceBid}>
                  Place Bid
                </button>
              </div>
            </div>
          )}

          {/* Not logged in notice */}
          {isOpen && !user && (
            <div className='card login-notice'>
              <p>Please <span className='link' onClick={() => navigate('/login')}>login</span> to place a bid.</p>
            </div>
          )}

          {/* Closed auction - show only winning bid */}
          {!isOpen ? (
            <div className='card'>
              <h3>Auction Closed</h3>
              {latestBid ? (
                <div className='winning-bid'>
                  <p className='winning-label'>🏆 Winning Bid</p>
                  <p className='winning-amount'>{latestBid.amount} kr</p>
                  <p className='winning-user'>by {latestBid.userName}</p>
                </div>
              ) : (
                <p style={{ color: '#64748b' }}>No bids were placed.</p>
              )}
            </div>
          ) : (
            /* Open auction - show full bid history */
            <div className='card'>
              <h3>Bid History</h3>
              {bids.length === 0 ? (
                <p className='no-bids'>No bids yet. Be the first!</p>
              ) : (
                <ul className='bid-list'>
                  {bids.map((bid, index) => (
                    <li key={bid.bidId} className='bid-item'>
                      <div className='bid-info'>
                        <span className='bid-user'>{bid.userName}</span>
                        <span className='bid-date'>{formatDate(bid.bidDate)}</span>
                      </div>
                      <div className='bid-right'>
                        <span className='bid-amount'>{bid.amount} kr</span>
                        {/* Allow delete if it's the user's latest bid and auction is open */}
                        {user &&
                          String(bid.userId) === String(user.id) &&
                          index === 0 && (
                            <button
                              className='btn-danger bid-delete-btn'
                              onClick={() => handleDeleteBid(bid.bidId)}
                            >
                              Undo
                            </button>
                          )}
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AuctionDetail;