import React, { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import Loading from "../common/Loading";
import Alert from "../common/Alert";
import tableService from "../../services/tableService";
import MenuHeader from "./MenuHeader";
import MenuFooter from "./MenuFooter";
import CategoryTabs from "./CategoryTabs";
import MenuItemCard from "./MenuItemCard";
import CartSidebar from "./CartSidebar";
import CartButton from "./CartButton";
import ModifierModal from "./ModifierModal";
import useCart from "./hooks/useCart";

const MenuPage = () => {
	const [searchParams] = useSearchParams();
	const tableId = searchParams.get("table");
	const token = searchParams.get("token");
	const [loading, setLoading] = useState(true);
	const [menuLoading, setMenuLoading] = useState(false);
	const [error, setError] = useState(null);
	const [menuError, setMenuError] = useState(null);
	const [tableInfo, setTableInfo] = useState(null);
	const [categories, setCategories] = useState([]);
	const [activeCategory, setActiveCategory] = useState(null);
	const [selectedItem, setSelectedItem] = useState(null); // For modifier modal

	const {
		cart,
		cartTotal,
		isCartOpen,
		setIsCartOpen,
		addToCart,
		removeFromCart,
		updateQuantity,
		clearCart,
		getTotalItems,
	} = useCart();

	useEffect(() => {
		const verifyQRCode = async () => {
			if (!tableId || !token) {
				console.error(
					"Missing parameters - tableId:",
					tableId,
					"token:",
					token
				);
				setError("Invalid QR code. Missing table or token.");
				setLoading(false);
				return;
			}

			try {
				console.log("TABLE ID (from query):", tableId);
				console.log("TOKEN (from query):", token);
				const response = await tableService.verifyQRToken(
					tableId,
					token
				);

				if (response.success) {
					setTableInfo(response.data);
				} else {
					setError(response.message || "Invalid QR code");
				}
			} catch (err) {
				console.error("QR verification error:", err);
			} finally {
				setLoading(false);
			}
		};

		verifyQRCode();
	}, [tableId, token]);

	// Load menu when tableInfo is available
	useEffect(() => {
		const loadMenu = async () => {
			if (!tableInfo) return;

			setMenuLoading(true);
			setMenuError(null);

			try {
				const rawCategories = tableInfo.categories || [];
				const items = tableInfo.items || [];

				if (rawCategories.length > 0) {
					const itemsByCategory = items.reduce((acc, item) => {
						const categoryId = item.category?.id;
						if (categoryId) {
							if (!acc[categoryId]) {
								acc[categoryId] = [];
							}
							acc[categoryId].push(item);
						}
						return acc;
					}, {});

					const categoriesWithItems = rawCategories.map(
						(category) => ({
							...category,
							items: itemsByCategory[category.id] || [],
						})
					);

					setCategories(categoriesWithItems);

					if (categoriesWithItems.length > 0) {
						setActiveCategory(categoriesWithItems[0].id);
					}
				} else {
					setMenuError("Failed to load menu");
				}
			} catch (err) {
				console.error("Error loading menu:", err);
				setMenuError("Unable to load menu. Please try again later.");
			} finally {
				setMenuLoading(false);
			}
		};

		if (tableInfo) {
			loadMenu();
		}
	}, [tableInfo]);

	const handlePlaceOrder = () => {
		if (cart.length === 0) {
			alert("Your cart is empty!");
			return;
		}

		const orderData = {
			table_id: tableInfo.id,
			items: cart.map((item) => ({
				menu_item_id: item.id,
				quantity: item.quantity,
				base_price: item.basePrice,
				modifiers: item.modifiers || [],
				modifiers_total: item.modifiersTotalPrice || 0,
				unit_price: item.unitPrice,
				total: item.total,
			})),
			total_amount: cartTotal,
		};

		console.log("Placing order:", orderData);
		alert(`Order placed successfully! Total: $${cartTotal.toFixed(2)}`);
		clearCart();
	};

	// Handle customize (open modifier modal)
	const handleCustomize = (item) => {
		setSelectedItem(item);
	};

	// Handle add to cart from modifier modal
	const handleAddFromModal = (
		item,
		modifiers,
		quantity,
		modifiersTotalPrice
	) => {
		addToCart(item, modifiers, quantity, modifiersTotalPrice);
		setSelectedItem(null);
	};

	if (loading) {
		return (
			<div className="min-h-screen bg-gray-50 flex items-center justify-center">
				<Loading size="lg" text="Verifying QR code..." />
			</div>
		);
	}

	if (error || !tableInfo) {
		return (
			<div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
				<div className="max-w-md w-full">
					<Alert
						type="error"
						message={error || "Invalid QR code"}
						className="mb-4"
					/>
					<div className="bg-white rounded-lg shadow-md p-6 text-center">
						<svg
							className="w-16 h-16 mx-auto text-red-500 mb-4"
							fill="none"
							viewBox="0 0 24 24"
							stroke="currentColor"
						>
							<path
								strokeLinecap="round"
								strokeLinejoin="round"
								strokeWidth={2}
								d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
							/>
						</svg>
						<h2 className="text-xl font-bold text-gray-900 mb-2">
							Invalid QR Code
						</h2>
						<p className="text-gray-600">
							Please scan a valid table QR code or contact staff
							for assistance.
						</p>
					</div>
				</div>
			</div>
		);
	}

	const activeCategoryData = categories.find(
		(cat) => cat.id === activeCategory
	);

	return (
		<div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-50">
			<MenuHeader
				tableNumber={tableInfo.table?.table_number}
				cartItemCount={cart.length}
			/>

			<main className="container mx-auto px-4 py-6">
				{menuError && (
					<div className="mb-6">
						<Alert type="warning" message={menuError} />
					</div>
				)}

				{menuLoading ? (
					<div className="flex justify-center py-12">
						<Loading text="Loading menu..." />
					</div>
				) : categories.length > 0 ? (
					<div className="mb-8">
						<h2 className="text-xl font-bold text-gray-900 mb-4">
							Our Menu
						</h2>

						<CategoryTabs
							categories={categories}
							activeCategory={activeCategory}
							onSelectCategory={setActiveCategory}
						/>

						{activeCategoryData ? (
							<div className="space-y-6">
								<div className="flex items-center justify-between mb-4">
									<h3 className="text-xl font-bold text-gray-900">
										{activeCategoryData.name}
									</h3>
									{activeCategoryData.description && (
										<p className="text-gray-600 text-sm md:text-base max-w-lg hidden md:block">
											{activeCategoryData.description}
										</p>
									)}
								</div>

								{activeCategoryData.description && (
									<p className="text-gray-600 text-sm mb-6 md:hidden">
										{activeCategoryData.description}
									</p>
								)}

								<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
									{activeCategoryData.items
										?.sort(
											(a, b) =>
												new Date(b.created_at) -
												new Date(a.created_at)
										)
										.map((item) => (
											<MenuItemCard
												key={item.id}
												item={item}
												onAddToCart={addToCart}
												onCustomize={handleCustomize}
											/>
										))}
								</div>

								{(!activeCategoryData.items ||
									activeCategoryData.items.length === 0) && (
									<EmptyCategory />
								)}
							</div>
						) : (
							<div className="text-center py-12">
								<p className="text-gray-600">
									Select a category to view items
								</p>
							</div>
						)}
					</div>
				) : (
					<EmptyMenu />
				)}

				<CartSidebar
					cart={cart}
					cartTotal={cartTotal}
					isOpen={isCartOpen}
					onClose={() => setIsCartOpen(false)}
					onUpdateQuantity={updateQuantity}
					onRemoveItem={removeFromCart}
					onClearCart={clearCart}
					onPlaceOrder={handlePlaceOrder}
				/>

				{!isCartOpen && (
					<CartButton
						totalItems={getTotalItems()}
						cartTotal={cartTotal}
						onClick={() => setIsCartOpen(true)}
					/>
				)}

				{/* Modifier Modal */}
				<ModifierModal
					item={selectedItem}
					isOpen={!!selectedItem}
					onClose={() => setSelectedItem(null)}
					onAddToCart={handleAddFromModal}
				/>
			</main>

			<MenuFooter />
		</div>
	);
};

// Small sub-components for empty states
const EmptyCategory = () => (
	<div className="text-center py-12">
		<div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 rounded-full mb-4">
			<svg
				className="w-8 h-8 text-gray-400"
				fill="none"
				viewBox="0 0 24 24"
				stroke="currentColor"
			>
				<path
					strokeLinecap="round"
					strokeLinejoin="round"
					strokeWidth={2}
					d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
				/>
			</svg>
		</div>
		<h3 className="text-lg font-medium text-gray-900 mb-2">
			No items available
		</h3>
		<p className="text-gray-600">
			Check back later for new menu items in this category.
		</p>
	</div>
);

const EmptyMenu = () => (
	<div className="text-center py-12">
		<div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 rounded-full mb-4">
			<svg
				className="w-8 h-8 text-gray-400"
				fill="none"
				viewBox="0 0 24 24"
				stroke="currentColor"
			>
				<path
					strokeLinecap="round"
					strokeLinejoin="round"
					strokeWidth={2}
					d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
				/>
			</svg>
		</div>
		<h3 className="text-lg font-medium text-gray-900 mb-2">
			Menu Not Available
		</h3>
		<p className="text-gray-600">
			The menu is currently being prepared. Please check back soon.
		</p>
		<button
			onClick={() => window.location.reload()}
			className="mt-4 px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors"
		>
			Retry
		</button>
	</div>
);

export default MenuPage;
