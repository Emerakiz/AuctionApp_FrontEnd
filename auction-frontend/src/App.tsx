import { BrowserRouter, Routes, Route } from 'react-router';
import { AuthProvider } from './contexts/AuthContext';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import UpdateUser from './pages/UpdateUser';
import AuctionDetail from './pages/AuctionDetail';
import CreateAuction from './pages/CreateAuction';
import EditAuction from './pages/EditAuction';
import Admin from './pages/Admin';

const App = () => {
  return (
    // Wrap to enable routing
    <BrowserRouter>
      {/* Wrap to provide auth context */}
      <AuthProvider>
        <Navbar />
        <Routes>
          <Route path='/' element={<Home />} />
          <Route path='/login' element={<Login />} />
          <Route path='/register' element={<Register />} />
          <Route path='/update-account' element={<UpdateUser />} />
          <Route path='/auction/:id' element={<AuctionDetail />} />
          <Route path='/create-auction' element={<CreateAuction />} />
          <Route path='/edit-auction/:id' element={<EditAuction />} />
          <Route path='/admin' element={<Admin />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
};

export default App;