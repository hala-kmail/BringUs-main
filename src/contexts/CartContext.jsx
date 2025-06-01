import React, { createContext, useContext, useState, useEffect } from 'react';

const CartContext = createContext();

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState([]);

  // Load cart from localStorage on mount
  useEffect(() => {
    const savedCart = localStorage.getItem('cart');
    if (savedCart) {
      try {
        setCartItems(JSON.parse(savedCart));
      } catch (error) {
        console.error('Error loading cart from localStorage:', error);
      }
    }
  }, []);

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(cartItems));
  }, [cartItems]);

  // Add item to cart
  const addToCart = (product, options = {}) => {
    const { 
      selectedColor = '', 
      selectedSize = '', 
      quantity = 1 
    } = options;

    // Calculate price based on selected size
    let finalPrice = product.discountPrice || product.originalPrice;
    if (product.sizes && selectedSize) {
      const size = product.sizes.find(s => s.name === selectedSize);
      if (size && size.priceModifier) {
        finalPrice += size.priceModifier;
      }
    }

    // Create unique ID for cart item based on product, color, and size
    const cartItemId = `${product.id}_${selectedColor}_${selectedSize}`;

    // Check if item already exists in cart
    const existingItemIndex = cartItems.findIndex(item => item.cartItemId === cartItemId);

    if (existingItemIndex >= 0) {
      // Item exists, update quantity
      const updatedItems = [...cartItems];
      updatedItems[existingItemIndex].quantity += quantity;
      setCartItems(updatedItems);
    } else {
      // Add new item to cart
      const newCartItem = {
        cartItemId,
        productId: product.id,
        name: product.name,
        image: product.image,
        originalPrice: product.originalPrice,
        discountPrice: product.discountPrice,
        finalPrice,
        selectedColor,
        selectedSize,
        quantity,
        product: product // Keep reference to full product data
      };
      setCartItems([...cartItems, newCartItem]);
    }
  };

  // Remove item from cart
  const removeFromCart = (cartItemId) => {
    setCartItems(cartItems.filter(item => item.cartItemId !== cartItemId));
  };

  // Update item quantity
  const updateQuantity = (cartItemId, newQuantity) => {
    if (newQuantity <= 0) {
      removeFromCart(cartItemId);
      return;
    }

    const updatedItems = cartItems.map(item =>
      item.cartItemId === cartItemId 
        ? { ...item, quantity: newQuantity }
        : item
    );
    setCartItems(updatedItems);
  };

  // Clear entire cart
  const clearCart = () => {
    setCartItems([]);
  };

  // Get cart totals
  const getCartTotals = () => {
    const subtotal = cartItems.reduce((total, item) => {
      return total + (item.finalPrice * item.quantity);
    }, 0);

    const itemsCount = cartItems.reduce((total, item) => total + item.quantity, 0);

    // You can add shipping, tax, discount calculations here
    const shipping = subtotal > 100 ? 0 : 10; // Free shipping over $100
    const tax = subtotal * 0.1; // 10% tax
    const total = subtotal + shipping + tax;

    return {
      subtotal: parseFloat(subtotal.toFixed(2)),
      shipping: parseFloat(shipping.toFixed(2)),
      tax: parseFloat(tax.toFixed(2)),
      total: parseFloat(total.toFixed(2)),
      itemsCount
    };
  };

  // Check if product with specific options is in cart
  const isInCart = (productId, selectedColor = '', selectedSize = '') => {
    const cartItemId = `${productId}_${selectedColor}_${selectedSize}`;
    return cartItems.some(item => item.cartItemId === cartItemId);
  };

  // Get item quantity in cart
  const getItemQuantity = (productId, selectedColor = '', selectedSize = '') => {
    const cartItemId = `${productId}_${selectedColor}_${selectedSize}`;
    const item = cartItems.find(item => item.cartItemId === cartItemId);
    return item ? item.quantity : 0;
  };

  const value = {
    cartItems,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    getCartTotals,
    isInCart,
    getItemQuantity
  };

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
};

export default CartContext; 