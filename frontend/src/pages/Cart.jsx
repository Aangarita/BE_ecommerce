import { useState } from 'react'
import {
  Paper,
  Typography,
  Box,
  Button,
  IconButton,
  TextField,
  Divider,
  Alert,
  Snackbar,
  Card,
  CardContent,
  CardMedia,
  Grid
} from '@mui/material'
import { Delete, Add, Remove } from '@mui/icons-material'
import { loadStripe } from '@stripe/stripe-js'
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js'
import { useCart } from '../contexts/CartContext'
import api from '../services/api'

const stripePromise = loadStripe('pk_test_your_publishable_key_here') // Reemplaza con tu clave pública de Stripe

const CheckoutForm = ({ clientSecret, onSuccess, onError }) => {
  const stripe = useStripe()
  const elements = useElements()
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (event) => {
    event.preventDefault()
    setLoading(true)

    if (!stripe || !elements) {
      return
    }

    const result = await stripe.confirmCardPayment(clientSecret, {
      payment_method: {
        card: elements.getElement(CardElement),
      }
    })

    if (result.error) {
      onError(result.error.message)
    } else {
      onSuccess()
    }
    
    setLoading(false)
  }

  return (
    <form onSubmit={handleSubmit}>
      <Box sx={{ p: 2, border: '1px solid #ccc', borderRadius: 1, mb: 2 }}>
        <CardElement />
      </Box>
      <Button
        type="submit"
        variant="contained"
        fullWidth
        disabled={!stripe || loading}
      >
        {loading ? 'Procesando...' : 'Pagar Ahora'}
      </Button>
    </form>
  )
}

const Cart = () => {
  const { cart, updateCartItem, removeFromCart, clearCart, getCartTotal } = useCart()
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' })
  const [showCheckout, setShowCheckout] = useState(false)
  const [clientSecret, setClientSecret] = useState('')
  const [loading, setLoading] = useState(false)

  const handleQuantityChange = async (productId, newQuantity) => {
    if (newQuantity < 1) return
    
    const result = await updateCartItem(productId, newQuantity)
    if (!result.success) {
      setSnackbar({
        open: true,
        message: result.message,
        severity: 'error'
      })
    }
  }

  const handleRemoveItem = async (productId) => {
    const result = await removeFromCart(productId)
    if (result.success) {
      setSnackbar({
        open: true,
        message: 'Producto eliminado del carrito',
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

  const handleClearCart = async () => {
    const result = await clearCart()
    if (result.success) {
      setSnackbar({
        open: true,
        message: 'Carrito vaciado',
        severity: 'success'
      })
    }
  }

  const handleCheckout = async () => {
    setLoading(true)
    try {
      const response = await api.post('/orders')
      setClientSecret(response.data.clientSecret)
      setShowCheckout(true)
    } catch (error) {
      setSnackbar({
        open: true,
        message: error.response?.data?.message || 'Error al procesar la orden',
        severity: 'error'
      })
    } finally {
      setLoading(false)
    }
  }

  const handlePaymentSuccess = () => {
    setSnackbar({
      open: true,
      message: 'Pago procesado exitosamente',
      severity: 'success'
    })
    setShowCheckout(false)
    setClientSecret('')
  }

  const handlePaymentError = (error) => {
    setSnackbar({
      open: true,
      message: error,
      severity: 'error'
    })
  }

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false })
  }

  if (!cart.items || cart.items.length === 0) {
    return (
      <Box textAlign="center" mt={4}>
        <Typography variant="h5" gutterBottom>
          Tu carrito está vacío
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Agrega algunos productos para comenzar
        </Typography>
      </Box>
    )
  }

  return (
    <Box>
      <Typography variant="h4" component="h1" gutterBottom>
        Carrito de Compras
      </Typography>

      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
          {cart.items.map((item) => (
            <Card key={item.id} sx={{ mb: 2 }}>
              <CardContent>
                <Grid container spacing={2} alignItems="center">
                  <Grid item xs={3}>
                    <CardMedia
                      component="img"
                      height="80"
                      image={item.product.imageUrl || 'https://via.placeholder.com/80x80?text=Sin+Imagen'}
                      alt={item.product.name}
                      sx={{ objectFit: 'cover', borderRadius: 1 }}
                    />
                  </Grid>
                  <Grid item xs={4}>
                    <Typography variant="h6">{item.product.name}</Typography>
                    <Typography variant="body2" color="text.secondary">
                      ${item.product.price.toFixed(2)}
                    </Typography>
                  </Grid>
                  <Grid item xs={3}>
                    <Box display="flex" alignItems="center">
                      <IconButton
                        onClick={() => handleQuantityChange(item.productId, item.quantity - 1)}
                        disabled={item.quantity <= 1}
                      >
                        <Remove />
                      </IconButton>
                      <TextField
                        value={item.quantity}
                        onChange={(e) => handleQuantityChange(item.productId, parseInt(e.target.value) || 1)}
                        size="small"
                        sx={{ width: 60, mx: 1 }}
                        inputProps={{ min: 1, style: { textAlign: 'center' } }}
                      />
                      <IconButton
                        onClick={() => handleQuantityChange(item.productId, item.quantity + 1)}
                      >
                        <Add />
                      </IconButton>
                    </Box>
                  </Grid>
                  <Grid item xs={2}>
                    <Box display="flex" alignItems="center" justifyContent="space-between">
                      <Typography variant="h6">
                        ${(item.product.price * item.quantity).toFixed(2)}
                      </Typography>
                      <IconButton
                        color="error"
                        onClick={() => handleRemoveItem(item.productId)}
                      >
                        <Delete />
                      </IconButton>
                    </Box>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          ))}
        </Grid>

        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Resumen del Pedido
            </Typography>
            <Divider sx={{ my: 2 }} />
            
            <Box display="flex" justifyContent="space-between" mb={2}>
              <Typography>Subtotal:</Typography>
              <Typography>${getCartTotal().toFixed(2)}</Typography>
            </Box>
            
            <Divider sx={{ my: 2 }} />
            
            <Box display="flex" justifyContent="space-between" mb={3}>
              <Typography variant="h6">Total:</Typography>
              <Typography variant="h6">${getCartTotal().toFixed(2)}</Typography>
            </Box>

            {!showCheckout ? (
              <Box>
                <Button
                  variant="contained"
                  fullWidth
                  onClick={handleCheckout}
                  disabled={loading}
                  sx={{ mb: 2 }}
                >
                  {loading ? 'Procesando...' : 'Proceder al Pago'}
                </Button>
                <Button
                  variant="outlined"
                  fullWidth
                  onClick={handleClearCart}
                  color="error"
                >
                  Vaciar Carrito
                </Button>
              </Box>
            ) : (
              <Elements stripe={stripePromise}>
                <CheckoutForm
                  clientSecret={clientSecret}
                  onSuccess={handlePaymentSuccess}
                  onError={handlePaymentError}
                />
              </Elements>
            )}
          </Paper>
        </Grid>
      </Grid>

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

export default Cart