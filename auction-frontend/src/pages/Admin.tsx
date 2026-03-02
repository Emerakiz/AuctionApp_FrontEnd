import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import api from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import type { Auction, UserDTO } from '../types';
import './Admin.css';

const Admin = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [auctions, setAuctions] = useState<Auction[]>([]);
  const [users, setUsers] = useState<UserDTO[]>([]);
  const [activeTab, setActiveTab] = useState('auctions');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(true);

  // Redirect if not admin
  if (!user || !user.isAdmin) {
    navigate('/');
    return null;
  }

  const fetchData = async () => {
    setLoading(true);
    setError('');
    try {
      const [auctionsRes, usersRes] = await Promise.all([
        api.get('/Auction', { params: { status: 'admin' } }),
        api.get('/User'),
      ]);
      setAuctions(auctionsRes.data);
      setUsers(usersRes.data);
    } catch (err) {
      const error = err as { response?: { data?: string } };
      setError(error.response?.data || 'Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleDisableAuction = async (auctionId: number) => {
  setError('');
  setSuccess('');
  try {
    await api.put(`/Admin/auction/${auctionId}`);
    setSuccess('Auction status updated');
    setAuctions(prev => prev.map(a => 
      a.auctionId === auctionId ? { ...a, isActive: !a.isActive } : a
    ));
  } catch (err) {
    const error = err as { response?: { data?: string } };
    setError(error.response?.data || 'Something went wrong');
  }
};

  const handleDisableUser = async (userId: number) => {
  setError('');
  setSuccess('');
  try {
    await api.put(`/Admin/user/${userId}`);
    setSuccess('User status updated');
    setUsers(prev => prev.map(u =>
      u.userId === userId ? { ...u, isActive: !u.isActive } : u
    ));
  } catch (err) {
    const error = err as { response?: { data?: string } };
    setError(error.response?.data || 'Something went wrong');
  }
};

  const handleDeleteAuction = async (auctionId: number) => {
    setError('');
    setSuccess('');
    try {
      await api.delete(`/Admin/auction/${auctionId}`);
      setSuccess('Auction deleted');
      fetchData();
    } catch (err) {
      const error = err as { response?: { data?: string } };
      setError(error.response?.data || 'Something went wrong');
    }
  };

  const handleDeleteUser = async (userId: number) => {
    setError('');
    setSuccess('');
    try {
      await api.delete(`/Admin/user/${userId}`);
      setSuccess('User deleted');
      fetchData();
    } catch (err) {
      const error = err as { response?: { data?: string } };
      setError(error.response?.data || 'Something went wrong');
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('sv-SE', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  if (loading) return <div className='container'><p className='loading-msg'>Loading...</p></div>;

  return (
    <div className='container'>
      <h1 className='page-title'>Admin Panel</h1>

      {error && <p className='error-msg'>{error}</p>}
      {success && <p className='success-msg'>{success}</p>}

      <div className='admin-tabs'>
        <button
          className={`tab-btn ${activeTab === 'auctions' ? 'active' : ''}`}
          onClick={() => setActiveTab('auctions')}
        >
          Auctions ({auctions.length})
        </button>
        <button
          className={`tab-btn ${activeTab === 'users' ? 'active' : ''}`}
          onClick={() => setActiveTab('users')}
        >
          Users ({users.length})
        </button>
      </div>

      {activeTab === 'auctions' && (
        <div className='card'>
          <table className='admin-table'>
            <thead>
              <tr>
                <th>Title</th>
                <th>Created by</th>
                <th>End date</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {auctions.map((auction) => (
                <tr key={auction.auctionId}>
                  <td
                    className='table-link'
                    onClick={() => navigate(`/auction/${auction.auctionId}`)}
                  >
                    {auction.title}
                  </td>
                  <td>{auction.userName}</td>
                  <td>{formatDate(auction.endDate)}</td>
                  <td>
                    <span className={`auction-badge ${auction.isActive ? 'badge-open' : 'badge-closed'}`}>
                      {auction.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td>
                    <div className='action-btns'>
                      <button
                        className='btn-secondary table-btn'
                        onClick={() => handleDisableAuction(auction.auctionId)}
                      >
                        {auction.isActive ? 'Disable' : 'Enable'}
                      </button>
                      <button
                        className='btn-danger table-btn'
                        onClick={() => handleDeleteAuction(auction.auctionId)}
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {activeTab === 'users' && (
        <div className='card'>
          <table className='admin-table'>
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Role</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.userId}>
                  <td>{u.name}</td>
                  <td>{u.email}</td>
                  <td>{u.isAdmin ? 'Admin' : 'User'}</td>
                  <td>
                    <span className={`auction-badge ${u.isActive ? 'badge-open' : 'badge-closed'}`}>
                      {u.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td>
                    <div className='action-btns'>
                      {!u.isAdmin && (
                        <>
                          <button
                            className='btn-secondary table-btn'
                            onClick={() => handleDisableUser(u.userId)}
                          >
                            {u.isActive ? 'Disable' : 'Enable'}
                          </button>
                          <button
                            className='btn-danger table-btn'
                            onClick={() => handleDeleteUser(u.userId)}
                          >
                            Delete
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default Admin;