import { createContext, useContext, useState, useEffect } from 'react'
import api from '../services/api'
import { useAuth } from './AuthContext'

const CartContext = createContext()

export const useCart = () => {
  const context = useContext(CartContext)
  if (!context) {
    throw new Error('useCart must be used within a CartProvider')
  }
  return context
}

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState({ items: [] })
  const [loading, setLoading] = useState(false)
  const { user } = useAuth()

  useEffect(() => {
    if (user) {
      fetchCart()
    } else {
      setCart({ items: [] })
    }
  }, [user])

  const fetchCart = async () => {
    try {
      setLoading(true)
      const response = await api.get('/cart')
      setCart(response.data)
    } catch (error) {
      console.error('Error fetching cart:', error)
    } finally {
      setLoading(false)
    }
  }

  const addToCart = async (productId, quantity = 1) => {
    try {
      await api.post('/cart/add', { productId, quantity })
      await fetchCart()
      return { success: true }
    } catch (error) {
      return { 
        success: false, 
        message: error.response?.data?.message || 'Error al agregar al carrito' 
      }
    }
  }

  const updateCartItem = async (productId, quantity) => {
    try {
      await api.put(`/cart/item/${productId}`, { quantity })
      await fetchCart()
      return { success: true }
    } catch (error) {
      return { 
        success: false, 
        message: error.response?.data?.message || 'Error al actualizar cantidad' 
      }
    }
  }

  const removeFromCart = async (productId) => {
    try {
      await api.delete(`/cart/item/${productId}`)
      await fetchCart()
      return { success: true }
    } catch (error) {
      return { 
        success: false, 
        message: error.response?.data?.message || 'Error al eliminar del carrito' 
      }
    }
  }

  const clearCart = async () => {
    try {
      await api.delete('/cart/clear')
      await fetchCart()
      return { success: true }
    } catch (error) {
      return { 
        success: false, 
        message: error.response?.data?.message || 'Error al vaciar carrito' 
      }
    }
  }

  const getCartTotal = () => {
    return cart.items?.reduce((total, item) => {
      return total + (item.product.price * item.quantity)
    }, 0) || 0
  }

  const getCartItemsCount = () => {
    return cart.items?.reduce((total, item) => total + item.quantity, 0) || 0
  }

  const value = {
    cart,
    loading,
    addToCart,
    updateCartItem,
    removeFromCart,
    clearCart,
    getCartTotal,
    getCartItemsCount,
    fetchCart
  }

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  )
}