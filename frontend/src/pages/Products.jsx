import { useState, useEffect } from 'react'
import {
  Grid,
  Card,
  CardMedia,
  CardContent,
  CardActions,
  Typography,
  Button,
  Box,
  Alert,
  Snackbar,
  Chip
} from '@mui/material'
import { AddShoppingCart } from '@mui/icons-material'
import api from '../services/api'
import { useCart } from '../contexts/CartContext'
import { useAuth } from '../contexts/AuthContext'

const Products = () => {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' })
  const { addToCart } = useCart()
  const { user } = useAuth()

  useEffect(() => {
    fetchProducts()
  }, [])

  const fetchProducts = async () => {
    try {
      const response = await api.get('/product')
      setProducts(response.data)
    } catch (error) {
      console.error('Error fetching products:', error)
      setSnackbar({
        open: true,
        message: 'Error al cargar productos',
        severity: 'error'
      })
    } finally {
      setLoading(false)
    }
  }

  const handleAddToCart = async (productId) => {
    if (!user) {
      setSnackbar({
        open: true,
        message: 'Debes iniciar sesión para agregar productos al carrito',
        severity: 'warning'
      })
      return
    }

    const result = await addToCart(productId, 1)
    
    if (result.success) {
      setSnackbar({
        open: true,
        message: 'Producto agregado al carrito',
        severity: 'success'
      })
    } else {
      setSnackbar({
        open: true,
        message: result.message,
        severity: 'error'
      })
    }
  }

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false })
  }

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="50vh">
        <Typography>Cargando productos...</Typography>
      </Box>
    )
  }

  return (
    <Box>
      <Typography variant="h4" component="h1" gutterBottom>
        Productos
      </Typography>

      <Grid container spacing={3}>
        {products.map((product) => (
          <Grid item xs={12} sm={6} md={4} key={product.id}>
            <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
              <CardMedia
                component="img"
                height="200"
                image={product.imageUrl || 'https://via.placeholder.com/300x200?text=Sin+Imagen'}
                alt={product.name}
                sx={{ objectFit: 'cover' }}
              />
              <CardContent sx={{ flexGrow: 1 }}>
                <Typography gutterBottom variant="h6" component="h2">
                  {product.name}
                </Typography>
                <Typography variant="body2" color="text.secondary" paragraph>
                  {product.description}
                </Typography>
                <Box display="flex" justifyContent="space-between" alignItems="center">
                  <Typography variant="h6" color="primary">
                    ${product.price.toFixed(2)}
                  </Typography>
                  <Chip 
                    label={`Stock: ${product.stock}`}
                    color={product.stock > 0 ? 'success' : 'error'}
                    size="small"
                  />
                </Box>
              </CardContent>
              <CardActions>
                <Button
                  fullWidth
                  variant="contained"
                  startIcon={<AddShoppingCart />}
                  onClick={() => handleAddToCart(product.id)}
                  disabled={product.stock === 0}
                >
                  {product.stock > 0 ? 'Agregar al Carrito' : 'Sin Stock'}
                </Button>
              </CardActions>
            </Card>
          </Grid>
        ))}
      </Grid>

      {products.length === 0 && (
        <Box textAlign="center" mt={4}>
          <Typography variant="h6" color="text.secondary">
            No hay productos disponibles
          </Typography>
        </Box>
      )}

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
      >
        <Alert onClose={handleCloseSnackbar} severity={snackbar.severity}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  )
}

export default Products