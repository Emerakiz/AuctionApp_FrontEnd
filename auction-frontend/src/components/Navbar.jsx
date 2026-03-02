import { NavLink } from 'react-router';
import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import './Navbar.css';

const Navbar = () => {
  const { user, logout } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <nav className='navbar'>
      <div className='navbar-brand'>🔨 AuctionApp</div>

      <button className='navbar-toggle' onClick={() => setMenuOpen(!menuOpen)}>
        <span /><span /><span />
      </button>

      <ul className={`navbar-links ${menuOpen ? 'open' : ''}`}>
        <li><NavLink to='/' onClick={() => setMenuOpen(false)}>Home</NavLink></li>

        {user ? (
          <>
            <li><NavLink to='/create-auction' onClick={() => setMenuOpen(false)}>Create Auction</NavLink></li>
            {user.isAdmin && (
              <li><NavLink to='/admin' onClick={() => setMenuOpen(false)}>Admin</NavLink></li>
            )}
            <li className='navbar-username'>Hi, {user.username}</li>
            <li><button className='btn-danger' onClick={logout}>Logout</button></li>
          </>
        ) : (
          <>
            <li><NavLink to='/login' onClick={() => setMenuOpen(false)}>Login</NavLink></li>
            <li><NavLink to='/register' onClick={() => setMenuOpen(false)}>Register</NavLink></li>
          </>
        )}
      </ul>
    </nav>
  );
};

export default Navbar;