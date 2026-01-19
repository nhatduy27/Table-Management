import { useState, useMemo, useEffect } from "react";

// Generate unique cart item ID based on item + modifiers + note
const generateCartItemId = (itemId, modifiers = [], note = "") => {
  if (!modifiers || modifiers.length === 0) {
    return note ? `${itemId}_note_${note.slice(0, 20)}` : itemId;
  }
  const modifierIds = modifiers
    .map((m) => m.optionId)
    .sort()
    .join("-");
  const baseId = `${itemId}_${modifierIds}`;
  return note ? `${baseId}_note_${note.slice(0, 20)}` : baseId;
};

// Nhận tham số tableId để lưu storage riêng cho từng bàn
const useCart = (tableId) => {
  // --- 1. KHỞI TẠO STATE (Lấy từ LocalStorage nếu có) ---
  const [cart, setCart] = useState(() => {
    if (!tableId) return [];
    try {
      const savedCart = localStorage.getItem(`cart_table_${tableId}`);
      return savedCart ? JSON.parse(savedCart) : [];
    } catch (error) {
      console.error("Lỗi đọc giỏ hàng cũ:", error);
      return [];
    }
  });

  const [isCartOpen, setIsCartOpen] = useState(false);

  // --- 2. TỰ ĐỘNG LƯU VÀO LOCALSTORAGE KHI CART THAY ĐỔI ---
  useEffect(() => {
    if (tableId) {
      localStorage.setItem(`cart_table_${tableId}`, JSON.stringify(cart));
    }
  }, [cart, tableId]);

  // Calculate cart total from cart items
  const cartTotal = useMemo(() => {
    return cart.reduce((sum, item) => sum + item.total, 0);
  }, [cart]);

  const calculateTotal = (price, qty) => {
      // Làm tròn số nguyên cho VND
      return Math.round(price * qty); 
  };

  // Add item to cart with optional modifiers and note
  const addToCart = (
    item,
    modifiers = [],
    quantity = 1,
    modifiersTotalPrice = 0,
    note = ""
  ) => {
    const cartItemId = generateCartItemId(item.id, modifiers, note);
    const basePrice = parseFloat(item.price);
    const unitPrice = basePrice + modifiersTotalPrice;

    const existingItemIndex = cart.findIndex(
      (cartItem) => cartItem.cartItemId === cartItemId
    );

    if (existingItemIndex > -1) {
      // Update quantity if same item with same modifiers and note exists
      const updatedCart = [...cart];
      updatedCart[existingItemIndex].quantity += quantity;
      updatedCart[existingItemIndex].total = calculateTotal(unitPrice, updatedCart[existingItemIndex].quantity);
      setCart(updatedCart);
    } else {
      // Add new item to cart
      const cartItem = {
        cartItemId,
        id: item.id,
        name: item.name,
        basePrice,
        modifiers,
        modifiersTotalPrice,
        unitPrice,
        quantity,
        total: calculateTotal(unitPrice, quantity),
        note: note.trim(),
      };
      setCart([...cart, cartItem]);
    }
  };

  // Update note for a cart item
  const updateNote = (cartItemId, newNote) => {
    const updatedCart = cart.map((item) => {
      if (item.cartItemId === cartItemId) {
        return {
          ...item,
          note: newNote.trim(),
        };
      }
      return item;
    });
    setCart(updatedCart);
  };

  const removeFromCart = (cartItemId) => {
    const updatedCart = cart.filter(
      (item) => item.cartItemId !== cartItemId
    );
    setCart(updatedCart);
  };

  const updateQuantity = (cartItemId, newQuantity) => {
    if (newQuantity < 1) {
      removeFromCart(cartItemId);
      return;
    }

    const updatedCart = cart.map((item) => {
      if (item.cartItemId === cartItemId) {
        return {
          ...item,
          quantity: newQuantity,
          total: calculateTotal(item.unitPrice, newQuantity),
        };
      }
      return item;
    });

    setCart(updatedCart);
  };

  const clearCart = () => {
    setCart([]);
    // LocalStorage sẽ tự động được clear nhờ useEffect ở trên
  };

  const getTotalItems = () => {
    return cart.reduce((sum, item) => sum + item.quantity, 0);
  };

  return {
    cart,
    cartTotal,
    isCartOpen,
    setIsCartOpen,
    addToCart,
    removeFromCart,
    updateQuantity,
    updateNote,
    clearCart,
    getTotalItems,
  };
};

export default useCart;