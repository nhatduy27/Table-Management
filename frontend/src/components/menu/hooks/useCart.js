import { useState, useMemo } from "react";

// Generate unique cart item ID based on item + modifiers
const generateCartItemId = (itemId, modifiers = []) => {
	if (!modifiers || modifiers.length === 0) {
		return itemId;
	}
	const modifierIds = modifiers
		.map((m) => m.optionId)
		.sort()
		.join("-");
	return `${itemId}_${modifierIds}`;
};

const useCart = () => {
	const [cart, setCart] = useState([]);
	const [isCartOpen, setIsCartOpen] = useState(false);

	// Calculate cart total from cart items
	const cartTotal = useMemo(() => {
		return cart.reduce((sum, item) => sum + item.total, 0);
	}, [cart]);

	// Add item to cart with optional modifiers
	const addToCart = (
		item,
		modifiers = [],
		quantity = 1,
		modifiersTotalPrice = 0
	) => {
		const cartItemId = generateCartItemId(item.id, modifiers);
		const basePrice = parseFloat(item.price);
		const unitPrice = basePrice + modifiersTotalPrice;

		const existingItemIndex = cart.findIndex(
			(cartItem) => cartItem.cartItemId === cartItemId
		);

		if (existingItemIndex > -1) {
			// Update quantity if same item with same modifiers exists
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
			};
			setCart([...cart, cartItem]);
		}
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
		clearCart,
		getTotalItems,
	};
};

export default useCart;
