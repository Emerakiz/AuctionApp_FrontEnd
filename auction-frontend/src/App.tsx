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
import ProtectedRoute from './components/ProtectedRoute';

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
          <Route path='/update-account' element={<ProtectedRoute><UpdateUser /></ProtectedRoute>} />
          <Route path='/auction/:id' element={<AuctionDetail />} />
          <Route path='/create-auction' element={<ProtectedRoute><CreateAuction /></ProtectedRoute>} />
          <Route path='/edit-auction/:id' element={<ProtectedRoute><EditAuction /></ProtectedRoute>} />
          <Route path='/admin' element={<ProtectedRoute><Admin /></ProtectedRoute>} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
};

export default App;