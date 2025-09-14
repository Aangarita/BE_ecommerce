import { useState } from 'react'
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  IconButton,
  Badge,
  Menu,
  MenuItem,
  Box
} from '@mui/material'
import {
  ShoppingCart,
  AccountCircle,
  Store,
  AdminPanelSettings
} from '@mui/icons-material'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { useCart } from '../contexts/CartContext'

const Navbar = () => {
  const navigate = useNavigate()
  const { user, logout } = useAuth()
  const { getCartItemsCount } = useCart()
  const [anchorEl, setAnchorEl] = useState(null)

  const handleMenu = (event) => {
    setAnchorEl(event.currentTarget)
  }

  const handleClose = () => {
    setAnchorEl(null)
  }

  const handleLogout = () => {
    logout()
    handleClose()
    navigate('/login')
  }

  return (
    <AppBar position="static">
      <Toolbar>
        <Store sx={{ mr: 2 }} />
        <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
          E-Commerce
        </Typography>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Button color="inherit" onClick={() => navigate('/products')}>
            Productos
          </Button>

          {user ? (
            <>
              <IconButton
                color="inherit"
                onClick={() => navigate('/cart')}
              >
                <Badge badgeContent={getCartItemsCount()} color="secondary">
                  <ShoppingCart />
                </Badge>
              </IconButton>

              <Button color="inherit" onClick={() => navigate('/orders')}>
                Mis Órdenes
              </Button>

              {user.role === 'ADMIN' && (
                <Button
                  color="inherit"
                  startIcon={<AdminPanelSettings />}
                  onClick={() => navigate('/admin/products')}
                >
                  Admin
                </Button>
              )}

              <IconButton
                size="large"
                onClick={handleMenu}
                color="inherit"
              >
                <AccountCircle />
              </IconButton>
              <Menu
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={handleClose}
              >
                <MenuItem onClick={() => { navigate('/profile'); handleClose(); }}>
                  Perfil
                </MenuItem>
                <MenuItem onClick={handleLogout}>Cerrar Sesión</MenuItem>
              </Menu>
            </>
          ) : (
            <>
              <Button color="inherit" onClick={() => navigate('/login')}>
                Iniciar Sesión
              </Button>
              <Button color="inherit" onClick={() => navigate('/register')}>
                Registrarse
              </Button>
            </>
          )}
        </Box>
      </Toolbar>
    </AppBar>
  )
}

export default Navbar