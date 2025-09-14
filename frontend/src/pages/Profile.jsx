import { useState, useEffect } from 'react'
import {
  Paper,
  TextField,
  Button,
  Typography,
  Box,
  Alert,
  Snackbar
} from '@mui/material'
import { useAuth } from '../contexts/AuthContext'

const Profile = () => {
  const { user, updateProfile } = useAuth()
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  })
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' })
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        email: user.email || '',
        password: '',
        confirmPassword: ''
      })
    }
  }, [user])

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    if (formData.password && formData.password !== formData.confirmPassword) {
      setSnackbar({
        open: true,
        message: 'Las contraseñas no coinciden',
        severity: 'error'
      })
      setLoading(false)
      return
    }

    const updateData = {
      name: formData.name,
      ...(formData.password && { password: formData.password })
    }

    const result = await updateProfile(updateData)
    
    if (result.success) {
      setSnackbar({
        open: true,
        message: 'Perfil actualizado exitosamente',
        severity: 'success'
      })
      setFormData({
        ...formData,
        password: '',
        confirmPassword: ''
      })
    } else {
      setSnackbar({
        open: true,
        message: result.message,
        severity: 'error'
      })
    }
    
    setLoading(false)
  }

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false })
  }

  return (
    <Box
      display="flex"
      justifyContent="center"
      alignItems="center"
      minHeight="60vh"
    >
      <Paper elevation={3} sx={{ p: 4, maxWidth: 500, width: '100%' }}>
        <Typography variant="h4" component="h1" gutterBottom align="center">
          Mi Perfil
        </Typography>

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
            label="Email"
            name="email"
            type="email"
            value={formData.email}
            margin="normal"
            disabled
            helperText="El email no se puede modificar"
          />
          <TextField
            fullWidth
            label="Nueva Contraseña (opcional)"
            name="password"
            type="password"
            value={formData.password}
            onChange={handleChange}
            margin="normal"
          />
          <TextField
            fullWidth
            label="Confirmar Nueva Contraseña"
            name="confirmPassword"
            type="password"
            value={formData.confirmPassword}
            onChange={handleChange}
            margin="normal"
          />
          <Button
            type="submit"
            fullWidth
            variant="contained"
            sx={{ mt: 3, mb: 2 }}
            disabled={loading}
          >
            {loading ? 'Actualizando...' : 'Actualizar Perfil'}
          </Button>
        </Box>
      </Paper>

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

export default Profile