import { useState, useMemo } from "react";

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

const useCart = () => {
	const [cart, setCart] = useState([]);
	const [isCartOpen, setIsCartOpen] = useState(false);

	// Calculate cart total from cart items
	const cartTotal = useMemo(() => {
		return cart.reduce((sum, item) => sum + item.total, 0);
	}, [cart]);

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
			updatedCart[existingItemIndex].total =
				updatedCart[existingItemIndex].quantity * unitPrice;
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
				total: unitPrice * quantity,
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
					total: newQuantity * item.unitPrice,
				};
			}
			return item;
		});

		setCart(updatedCart);
	};

	const clearCart = () => {
		setCart([]);
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
