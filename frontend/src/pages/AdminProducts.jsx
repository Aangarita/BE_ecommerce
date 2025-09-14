import { useState, useEffect } from 'react'
import {
  Paper,
  Typography,
  Box,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  IconButton,
  Alert,
  Snackbar,
  Card,
  CardMedia,
  CardContent,
  CardActions,
  Grid,
  Chip
} from '@mui/material'
import { Add, Edit, Delete } from '@mui/icons-material'
import api from '../services/api'

const AdminProducts = () => {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingProduct, setEditingProduct] = useState(null)
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    stock: '',
    image: null
  })
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' })

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

  const handleOpenDialog = (product = null) => {
    if (product) {
      setEditingProduct(product)
      setFormData({
        name: product.name,
        description: product.description || '',
        price: product.price.toString(),
        stock: product.stock.toString(),
        image: null
      })
    } else {
      setEditingProduct(null)
      setFormData({
        name: '',
        description: '',
        price: '',
        stock: '',
        image: null
      })
    }
    setDialogOpen(true)
  }

  const handleCloseDialog = () => {
    setDialogOpen(false)
    setEditingProduct(null)
    setFormData({
      name: '',
      description: '',
      price: '',
      stock: '',
      image: null
    })
  }

  const handleChange = (e) => {
    if (e.target.name === 'image') {
      setFormData({
        ...formData,
        image: e.target.files[0]
      })
    } else {
      setFormData({
        ...formData,
        [e.target.name]: e.target.value
      })
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    const submitData = new FormData()
    submitData.append('name', formData.name)
    submitData.append('description', formData.description)
    submitData.append('price', formData.price)
    submitData.append('stock', formData.stock)
    if (formData.image) {
      submitData.append('image', formData.image)
    }

    try {
      if (editingProduct) {
        await api.put(`/product/${editingProduct.id}`, submitData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        })
        setSnackbar({
          open: true,
          message: 'Producto actualizado exitosamente',
          severity: 'success'
        })
      } else {
        await api.post('/product', submitData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        })
        setSnackbar({
          open: true,
          message: 'Producto creado exitosamente',
          severity: 'success'
        })
      }
      
      handleCloseDialog()
      fetchProducts()
    } catch (error) {
      setSnackbar({
        open: true,
        message: error.response?.data?.message || 'Error al guardar producto',
        severity: 'error'
      })
    }
  }

  const handleDelete = async (productId) => {
    if (window.confirm('¿Estás seguro de que quieres eliminar este producto?')) {
      try {
        await api.delete(`/product/${productId}`)
        setSnackbar({
          open: true,
          message: 'Producto eliminado exitosamente',
          severity: 'success'
        })
        fetchProducts()
      } catch (error) {
        setSnackbar({
          open: true,
          message: error.response?.data?.message || 'Error al eliminar producto',
          severity: 'error'
        })
      }
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
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" component="h1">
          Administrar Productos
        </Typography>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={() => handleOpenDialog()}
        >
          Agregar Producto
        </Button>
      </Box>

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
                <IconButton
                  color="primary"
                  onClick={() => handleOpenDialog(product)}
                >
                  <Edit />
                </IconButton>
                <IconButton
                  color="error"
                  onClick={() => handleDelete(product.id)}
                >
                  <Delete />
                </IconButton>
              </CardActions>
            </Card>
          </Grid>
        ))}
      </Grid>

      {products.length === 0 && (
        <Box textAlign="center" mt={4}>
          <Typography variant="h6" color="text.secondary">
            No hay productos creados
          </Typography>
        </Box>
      )}

      {/* Dialog para crear/editar producto */}
      <Dialog open={dialogOpen} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>
          {editingProduct ? 'Editar Producto' : 'Crear Producto'}
        </DialogTitle>
        <DialogContent>
          <Box component="form" onSubmit={handleSubmit}>
            <TextField
              fullWidth
              label="Nombre"
              name="name"
              value={formData.name}
              onChange={handleChange}
              margin="normal"
              required
            />
            <TextField
              fullWidth
              label="Descripción"
              name="description"
              value={formData.description}
              onChange={handleChange}
              margin="normal"
              multiline
              rows={3}
            />
            <TextField
              fullWidth
              label="Precio"
              name="price"
              type="number"
              step="0.01"
              value={formData.price}
              onChange={handleChange}
              margin="normal"
              required
            />
            <TextField
              fullWidth
              label="Stock"
              name="stock"
              type="number"
              value={formData.stock}
              onChange={handleChange}
              margin="normal"
              required
            />
            <Box mt={2}>
              <Typography variant="body2" gutterBottom>
                Imagen del producto:
              </Typography>
              <input
                type="file"
                name="image"
                accept="image/*"
                onChange={handleChange}
                style={{ width: '100%' }}
              />
            </Box>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancelar</Button>
          <Button onClick={handleSubmit} variant="contained">
            {editingProduct ? 'Actualizar' : 'Crear'}
          </Button>
        </DialogActions>
      </Dialog>

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

export default AdminProducts