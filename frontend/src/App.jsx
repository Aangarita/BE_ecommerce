import { Routes, Route, Navigate } from 'react-router-dom'
import { Container } from '@mui/material'
import Navbar from './components/Navbar'
import Login from './pages/Login'
import Register from './pages/Register'
import Products from './pages/Products'
import Cart from './pages/Cart'
import Orders from './pages/Orders'
import Profile from './pages/Profile'
import AdminProducts from './pages/AdminProducts'
import { useAuth } from './contexts/AuthContext'

function App() {
  const { user } = useAuth()

  return (
    <>
      <Navbar />
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Routes>
          <Route path="/login" element={!user ? <Login /> : <Navigate to="/products" />} />
          <Route path="/register" element={!user ? <Register /> : <Navigate to="/products" />} />
          <Route path="/products" element={<Products />} />
          <Route path="/cart" element={user ? <Cart /> : <Navigate to="/login" />} />
          <Route path="/orders" element={user ? <Orders /> : <Navigate to="/login" />} />
          <Route path="/profile" element={user ? <Profile /> : <Navigate to="/login" />} />
          <Route 
            path="/admin/products" 
            element={user?.role === 'ADMIN' ? <AdminProducts /> : <Navigate to="/products" />} 
          />
          <Route path="/" element={<Navigate to="/products" />} />
        </Routes>
      </Container>
    </>
  )
}

export default App