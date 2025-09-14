import { useState, useEffect } from 'react'
import {
  Paper,
  Typography,
  Box,
  Chip,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Grid,
  Button,
  Alert,
  Snackbar
} from '@mui/material'
import { ExpandMore } from '@mui/icons-material'
import api from '../services/api'

const Orders = () => {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' })

  useEffect(() => {
    fetchOrders()
  }, [])

  const fetchOrders = async () => {
    try {
      const response = await api.get('/orders')
      setOrders(response.data.orders)
    } catch (error) {
      console.error('Error fetching orders:', error)
      setSnackbar({
        open: true,
        message: 'Error al cargar órdenes',
        severity: 'error'
      })
    } finally {
      setLoading(false)
    }
  }

  const handleCancelOrder = async (orderId) => {
    try {
      await api.put(`/orders/${orderId}`, { status: 'cancelled' })
      await fetchOrders()
      setSnackbar({
        open: true,
        message: 'Orden cancelada exitosamente',
        severity: 'success'
      })
    } catch (error) {
      setSnackbar({
        open: true,
        message: error.response?.data?.message || 'Error al cancelar orden',
        severity: 'error'
      })
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending':
        return 'warning'
      case 'paid':
        return 'success'
      case 'cancelled':
        return 'error'
      case 'failed':
        return 'error'
      default:
        return 'default'
    }
  }

  const getStatusText = (status) => {
    switch (status) {
      case 'pending':
        return 'Pendiente'
      case 'paid':
        return 'Pagado'
      case 'cancelled':
        return 'Cancelado'
      case 'failed':
        return 'Fallido'
      default:
        return status
    }
  }

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false })
  }

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="50vh">
        <Typography>Cargando órdenes...</Typography>
      </Box>
    )
  }

  if (orders.length === 0) {
    return (
      <Box textAlign="center" mt={4}>
        <Typography variant="h5" gutterBottom>
          No tienes órdenes
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Realiza tu primera compra para ver tus órdenes aquí
        </Typography>
      </Box>
    )
  }

  return (
    <Box>
      <Typography variant="h4" component="h1" gutterBottom>
        Mis Órdenes
      </Typography>

      {orders.map((order) => (
        <Accordion key={order.id} sx={{ mb: 2 }}>
          <AccordionSummary expandIcon={<ExpandMore />}>
            <Grid container alignItems="center" spacing={2}>
              <Grid item xs={3}>
                <Typography variant="h6">
                  Orden #{order.id}
                </Typography>
              </Grid>
              <Grid item xs={3}>
                <Chip
                  label={getStatusText(order.status)}
                  color={getStatusColor(order.status)}
                  size="small"
                />
              </Grid>
              <Grid item xs={3}>
                <Typography variant="body1">
                  ${order.total.toFixed(2)}
                </Typography>
              </Grid>
              <Grid item xs={3}>
                {order.status === 'pending' && (
                  <Button
                    variant="outlined"
                    color="error"
                    size="small"
                    onClick={(e) => {
                      e.stopPropagation()
                      handleCancelOrder(order.id)
                    }}
                  >
                    Cancelar
                  </Button>
                )}
              </Grid>
            </Grid>
          </AccordionSummary>
          <AccordionDetails>
            <Typography variant="h6" gutterBottom>
              Productos:
            </Typography>
            {order.items.map((item) => (
              <Paper key={item.id} sx={{ p: 2, mb: 1 }}>
                <Grid container alignItems="center" spacing={2}>
                  <Grid item xs={6}>
                    <Typography variant="body1">
                      {item.product.name}
                    </Typography>
                  </Grid>
                  <Grid item xs={2}>
                    <Typography variant="body2">
                      Cantidad: {item.quantity}
                    </Typography>
                  </Grid>
                  <Grid item xs={2}>
                    <Typography variant="body2">
                      Precio: ${item.price.toFixed(2)}
                    </Typography>
                  </Grid>
                  <Grid item xs={2}>
                    <Typography variant="body2">
                      Total: ${(item.price * item.quantity).toFixed(2)}
                    </Typography>
                  </Grid>
                </Grid>
              </Paper>
            ))}
          </AccordionDetails>
        </Accordion>
      ))}

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

export default Orders