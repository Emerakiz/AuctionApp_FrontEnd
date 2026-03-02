import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router';
import api from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import type { Auction, Bid } from '../types';
import './AuctionDetail.css';

const AuctionDetail = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [auction, setAuction] = useState<Auction | null>(null);
  const [bids, setBids] = useState<Bid[]>([]);
  const [bidAmount, setBidAmount] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(true);

  /* FETCH */

  const fetchAuction = async () => {
    try {
      const response = await api.get(`/Auction/${id}`);
      setAuction(response.data);
    } catch {
      setError('Failed to load auction');
    }
  };

  const fetchBids = async () => {
    try {
      const response = await api.get(`/Auction/${id}/bidHistory`);

      const sorted = [...response.data].sort(
        (a: Bid, b: Bid) =>
          new Date(b.bidDate).getTime() -
          new Date(a.bidDate).getTime()
      );

      setBids(sorted);
    } catch {
      setError('Failed to load bids');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setLoading(true);
    fetchAuction();
    fetchBids();
  }, [id]);

  /*AUCTION STATE */

  const isOpen =
    !!auction &&
    Date.now() <
      new Date(auction.endDate).getTime();

  const isOwner =
    user &&
    auction &&
    String(user.id) === String(auction.userId);

  const latestBid =
    bids.length > 0 ? bids[0] : null;

  /* Auto refresh when auction ends */
  useEffect(() => {
    if (!auction) return;

    const end =
      new Date(auction.endDate).getTime();

    const remaining = end - Date.now();
    if (remaining <= 0) return;

    const timer = setTimeout(() => {
      fetchAuction();
      fetchBids();
    }, remaining + 500);

    return () => clearTimeout(timer);
  }, [auction?.endDate]);

  /* ACTIONS  */

  const handlePlaceBid = async () => {
    setError('');
    setSuccess('');

    try {
      await api.post(
        `/Bid/auction/${id}`,
        { amount: parseFloat(bidAmount) }
      );

      setSuccess('Bid placed successfully!');
      setBidAmount('');

      fetchAuction();
      fetchBids();
    } catch (err) {
      const error = err as {
        response?: { data?: unknown };
      };

      const data = error.response?.data;

      if (typeof data === 'string')
        setError(data);
      else if (
        data &&
        typeof data === 'object'
      )
        setError(
          (data as { message?: string })
            .message ||
            'Something went wrong'
        );
      else setError('Something went wrong');
    }
  };

  const handleDeleteBid = async (
    bidId: number
  ) => {
    setError('');
    setSuccess('');

    try {
      await api.delete(`/Bid/${bidId}`);

      setSuccess(
        'Bid removed successfully!'
      );

      fetchAuction();
      fetchBids();
    } catch (err) {
      const error = err as {
        response?: { data?: string };
      };

      setError(
        error.response?.data ||
          'Something went wrong'
      );
    }
  };

  const handleEditAuction = () =>
    navigate(`/edit-auction/${id}`);

  /* HELPERS*/

  const formatDate = (
    dateString: string
  ) =>
    new Date(dateString).toLocaleDateString(
      'sv-SE',
      {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      }
    );

  /*  STATES */

  if (loading)
    return (
      <div className='container'>
        <p className='loading-msg'>
          Loading...
        </p>
      </div>
    );

  if (!auction)
    return (
      <div className='container'>
        <p className='error-msg'>
          Auction not found.
        </p>
      </div>
    );

  /*  UI */

  return (
    <div className='container'>
      <button
        className='back-btn'
        onClick={() => navigate('/')}
      >
        ← Back
      </button>

      <div className='auction-detail-grid'>

        {/* LEFT */}
        <div className='auction-info card'>
          <div className='detail-header'>
            <h1 className='page-title'>
              {auction.title}
            </h1>

            <span
              className={`auction-badge ${
                isOpen
                  ? 'badge-open'
                  : 'badge-closed'
              }`}
            >
              {isOpen
                ? 'Open'
                : 'Closed'}
            </span>
          </div>

          <p className='detail-description'>
            {auction.description}
          </p>

          <div className='detail-meta'>
            <div className='meta-row'>
              <span className='meta-label'>
                Created by
              </span>
              <span>
                {auction.userName}
              </span>
            </div>

            <div className='meta-row'>
              <span className='meta-label'>
                Starting price
              </span>
              <span>
                {auction.startingPrice} kr
              </span>
            </div>

            <div className='meta-row'>
              <span className='meta-label'>
                {isOpen
                  ? 'Current price'
                  : 'Winning bid'}
              </span>

              <span className='current-price'>
                {auction.currentPrice} kr
              </span>
            </div>

            <div className='meta-row'>
              <span className='meta-label'>
                End date
              </span>
              <span>
                {formatDate(
                  auction.endDate
                )}
              </span>
            </div>
          </div>

          {isOwner && isOpen && (
            <div className='owner-controls'>
              <button
                className='btn-secondary'
                onClick={
                  handleEditAuction
                }
              >
                Edit Auction
              </button>
            </div>
          )}
        </div>

        {/* RIGHT */}
        <div className='bids-section'>

          {/* PLACE BID */}
          {isOpen &&
            user &&
            !isOwner && (
              <div className='place-bid card'>
                <h3>
                  Place a Bid
                </h3>

                {error && (
                  <p className='error-msg'>
                    {error}
                  </p>
                )}

                {success && (
                  <p className='success-msg'>
                    {success}
                  </p>
                )}

                <div className='bid-input-row'>
                  <input
                    type='number'
                    placeholder={`Min: ${
                      auction.currentPrice +
                      1
                    } kr`}
                    value={
                      bidAmount
                    }
                    onChange={(
                      e
                    ) =>
                      setBidAmount(
                        e.target
                          .value
                      )
                    }
                    className='bid-input'
                  />

                  <button
                    className='btn-primary bid-btn'
                    onClick={
                      handlePlaceBid
                    }
                  >
                    Place Bid
                  </button>
                </div>
              </div>
            )}

            {/* HISTORY / WINNER */}
            <div className='card'>
              <h3>{isOpen ? 'Bid History' : 'Winning Bid'}</h3>

              {/* CLOSED*/}
              {!isOpen ? (
                latestBid ? (
                  <div className='winning-bid'>
                    <p>Winner</p>
                    <p className='winning-amount'>{latestBid.amount} kr</p>
                    <p>by {latestBid.userName}</p>
                    <p className='winning-date'>{formatDate(latestBid.bidDate)}</p>
                  </div>
                ) : (
                  <p style={{ color: '#64748b' }}>No bids were placed.</p>
                )
              ) : (
                /* OPEN */
                !user ? (
                  <p className='no-bids'>
                    Please{' '}
                    <span className='link' onClick={() => navigate('/login')}>
                      login
                    </span>{' '}
                    to see bid history.
                  </p>
                ) : bids.length === 0 ? (
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

                          {String(bid.userId) === String(user.id) && index === 0 && (
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
                )
              )}
            </div>
        </div>
      </div>
    </div>
  );
};

export default AuctionDetail;