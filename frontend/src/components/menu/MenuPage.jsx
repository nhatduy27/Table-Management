import React, { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import Loading from "../common/Loading";
import Alert from "../common/Alert";
import tableService from "../../services/tableService";

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
	const [cart, setCart] = useState([]);
	const [cartTotal, setCartTotal] = useState(0);
	const [isCartOpen, setIsCartOpen] = useState(false);

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

			if (!tableId || !token) {
				setError("Invalid QR code. Missing table or token.");
				setLoading(false);
				return;
			}

			try {
				// Verify QR token with backend
				console.log("TABLE ID (from query):", tableId);
				console.log("TOKEN (from query):", token);
				const response = await tableService.verifyQRToken(
					tableId,
					token
				);

				if (response.success) {
					setTableInfo(response.data);
					//Debug
					// console.log("Table info is set", response.data);
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
			if (!tableInfo) {
				return;
			}

			setMenuLoading(true);
			setMenuError(null);

			try {
				// Get categories and items from tableInfo
				const rawCategories = tableInfo.categories || [];
				const items = tableInfo.items || [];

				if (rawCategories.length > 0) {
					// Group items by category ID
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

					// Merge items into their respective categories
					const categoriesWithItems = rawCategories.map(
						(category) => ({
							...category,
							items: itemsByCategory[category.id] || [],
						})
					);

					setCategories(categoriesWithItems);

					// Set first category as active if available
					if (categoriesWithItems.length > 0) {
						setActiveCategory(categoriesWithItems[0].id);
					}
				} else {
					setMenuError("Failed to load menu");
					console.log("Failed to load menu");
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

	// Update cart total whenever cart changes
	useEffect(() => {
		const total = cart.reduce((sum, item) => sum + item.total, 0);
		setCartTotal(total);
	}, [cart]);

	const addToCart = (item) => {
		const existingItemIndex = cart.findIndex(
			(cartItem) => cartItem.id === item.id
		);

		if (existingItemIndex > -1) {
			// Update quantity if item already exists
			const updatedCart = [...cart];
			updatedCart[existingItemIndex].quantity += 1;
			updatedCart[existingItemIndex].total =
				updatedCart[existingItemIndex].quantity *
				parseFloat(item.price);
			setCart(updatedCart);
		} else {
			// Add new item to cart
			const cartItem = {
				id: item.id,
				name: item.name,
				price: parseFloat(item.price),
				quantity: 1,
				total: parseFloat(item.price),
			};
			setCart([...cart, cartItem]);
		}
	};

	const removeFromCart = (itemId) => {
		const updatedCart = cart.filter((item) => item.id !== itemId);
		setCart(updatedCart);
	};

	const updateQuantity = (itemId, newQuantity) => {
		if (newQuantity < 1) {
			removeFromCart(itemId);
			return;
		}

		const updatedCart = cart.map((item) => {
			if (item.id === itemId) {
				return {
					...item,
					quantity: newQuantity,
					total: newQuantity * item.price,
				};
			}
			return item;
		});

		setCart(updatedCart);
	};

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
				price: item.price,
			})),
			total_amount: cartTotal,
		};

		console.log("Placing order:", orderData);
		alert(`Order placed successfully! Total: $${cartTotal.toFixed(2)}`);

		// Clear cart after order
		setCart([]);
		setCartTotal(0);
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
		<div className="min-h-screen bg-linear-to-br from-gray-50 to-gray-100">
			{/* Header */}
			<header className="bg-white shadow-sm sticky top-0 z-10">
				<div className="container mx-auto px-4 py-4">
					<div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
						<div>
							<h1 className="text-2xl font-bold text-gray-900">
								Table {tableInfo.table?.table_number}
							</h1>
							<p className="text-gray-600">
								Welcome to our restaurant
							</p>
						</div>

						<div className="flex items-center gap-4">
							<div className="inline-flex items-center gap-2 px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
								<svg
									className="w-4 h-4"
									fill="currentColor"
									viewBox="0 0 20 20"
								>
									<path
										fillRule="evenodd"
										d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
										clipRule="evenodd"
									/>
								</svg>
								Verified
							</div>

							{cart.length > 0 && (
								<div className="hidden md:block px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
									{cart.length} items in cart
								</div>
							)}
						</div>
					</div>
				</div>
			</header>

			<main className="container mx-auto px-4 py-6">
				{menuError && (
					<div className="mb-6">
						<Alert type="warning" message={menuError} />
					</div>
				)}

				{/* Menu Categories Navigation */}
				{menuLoading ? (
					<div className="flex justify-center py-12">
						<Loading text="Loading menu..." />
					</div>
				) : categories.length > 0 ? (
					<>
						{/* Categories Tabs */}
						<div className="mb-8">
							<h2 className="text-xl font-bold text-gray-900 mb-4">
								Our Menu
							</h2>
							<div className="flex flex-wrap gap-2 mb-6 overflow-x-auto pb-2">
								{categories
									.sort(
										(a, b) =>
											(a.display_order || 0) -
											(b.display_order || 0)
									)
									.map((category) => (
										<button
											key={category.id}
											onClick={() =>
												setActiveCategory(category.id)
											}
											className={`px-4 py-2 rounded-lg font-medium transition-all whitespace-nowrap ${
												activeCategory === category.id
													? "bg-blue-600 text-white shadow-md"
													: "bg-white text-gray-700 hover:bg-gray-50 shadow-sm"
											}`}
										>
											{category.name}
											{category.items && (
												<span className="ml-2 text-xs opacity-80">
													({category.items.length})
												</span>
											)}
										</button>
									))}
							</div>

							{/* Menu Items Grid */}
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
												<div
													key={item.id}
													className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300"
												>
													<div className="p-5">
														<div className="flex justify-between items-start mb-3">
															<div className="flex-1">
																<h3 className="text-lg font-semibold text-gray-900 mb-1">
																	{item.name}
																</h3>
																{item.description && (
																	<p className="text-gray-600 text-sm mb-3 line-clamp-2">
																		{
																			item.description
																		}
																	</p>
																)}
															</div>
															{item.is_chef_recommended && (
																<span className="inline-flex items-center gap-1 px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs font-medium ml-2 shrink-0">
																	<svg
																		className="w-3 h-3"
																		fill="currentColor"
																		viewBox="0 0 20 20"
																	>
																		<path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
																	</svg>
																	Chef's Pick
																</span>
															)}
														</div>

														<div className="flex items-center justify-between mt-4">
															<div className="flex flex-col">
																<span className="text-xl font-bold text-gray-900">
																	$
																	{parseFloat(
																		item.price ||
																			0
																	).toFixed(
																		2
																	)}
																</span>
																{item.prep_time_minutes >
																	0 && (
																	<span className="text-sm text-gray-500">
																		{
																			item.prep_time_minutes
																		}{" "}
																		min prep
																	</span>
																)}
															</div>

															<div className="flex items-center gap-2">
																{item.status ===
																"sold_out" ? (
																	<span className="px-3 py-1 bg-gray-100 text-gray-500 rounded-lg text-sm font-medium">
																		Sold Out
																	</span>
																) : (
																	<button
																		className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
																		onClick={() =>
																			addToCart(
																				item
																			)
																		}
																	>
																		Add to
																		Cart
																	</button>
																)}
															</div>
														</div>
													</div>
												</div>
											))}
									</div>

									{(!activeCategoryData.items ||
										activeCategoryData.items.length ===
											0) && (
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
												Check back later for new menu
												items in this category.
											</p>
										</div>
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
					</>
				) : (
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
							The menu is currently being prepared. Please check
							back soon.
						</p>
						<button
							onClick={() => window.location.reload()}
							className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
						>
							Retry
						</button>
					</div>
				)}

				{/* Cart Sidebar */}
				{isCartOpen && cart.length > 0 && (
					<>
						{/* Backdrop - semi-transparent */}
						<div
							className="fixed inset-0 bg-black/20 z-30"
							onClick={() => setIsCartOpen(false)}
						/>
						<div className="fixed bottom-0 left-0 right-0 md:right-4 md:bottom-4 md:left-auto md:w-96 bg-white shadow-2xl rounded-t-2xl md:rounded-2xl z-40 max-h-[80vh] overflow-hidden">
							<div className="p-4">
								<div className="flex items-center justify-between mb-4">
									<h3 className="text-lg font-bold text-gray-900">
										Your Order (
										{cart.reduce(
											(sum, item) => sum + item.quantity,
											0
										)}{" "}
										items)
									</h3>
									<button
										onClick={() => setIsCartOpen(false)}
										className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-full transition-colors"
									>
										<svg
											className="w-6 h-6"
											fill="none"
											viewBox="0 0 24 24"
											stroke="currentColor"
										>
											<path
												strokeLinecap="round"
												strokeLinejoin="round"
												strokeWidth={2}
												d="M6 18L18 6M6 6l12 12"
											/>
										</svg>
									</button>
								</div>

								<div className="max-h-60 overflow-y-auto mb-4">
									{cart.map((item) => (
										<div
											key={item.id}
											className="flex items-center justify-between py-3 border-b border-gray-100"
										>
											<div className="flex-1">
												<p className="font-medium text-gray-900">
													{item.name}
												</p>
												<p className="text-sm text-gray-600">
													${item.price.toFixed(2)}{" "}
													each
												</p>
											</div>

											<div className="flex items-center gap-2">
												<div className="flex items-center border border-gray-300 rounded">
													<button
														onClick={() =>
															updateQuantity(
																item.id,
																item.quantity -
																	1
															)
														}
														className="px-2 py-1 text-gray-600 hover:bg-gray-100"
													>
														-
													</button>
													<span className="px-3 py-1 text-gray-900">
														{item.quantity}
													</span>
													<button
														onClick={() =>
															updateQuantity(
																item.id,
																item.quantity +
																	1
															)
														}
														className="px-2 py-1 text-gray-600 hover:bg-gray-100"
													>
														+
													</button>
												</div>
												<span className="font-medium text-gray-900 w-16 text-right">
													${item.total.toFixed(2)}
												</span>
												<button
													onClick={() =>
														removeFromCart(item.id)
													}
													className="text-red-500 hover:text-red-700 ml-2"
												>
													<svg
														className="w-5 h-5"
														fill="none"
														viewBox="0 0 24 24"
														stroke="currentColor"
													>
														<path
															strokeLinecap="round"
															strokeLinejoin="round"
															strokeWidth={2}
															d="M6 18L18 6M6 6l12 12"
														/>
													</svg>
												</button>
											</div>
										</div>
									))}
								</div>

								<div className="border-t border-gray-200 pt-4">
									<div className="flex justify-between items-center mb-4">
										<span className="text-lg font-bold text-gray-900">
											Total:
										</span>
										<span className="text-2xl font-bold text-blue-600">
											${cartTotal.toFixed(2)}
										</span>
									</div>

									<button
										onClick={handlePlaceOrder}
										className="w-full py-3 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 transition-colors"
									>
										Place Order
									</button>

									<button
										onClick={() => setCart([])}
										className="w-full mt-2 py-2 text-sm text-red-600 hover:text-red-800 hover:bg-red-50 rounded-lg transition-colors"
									>
										Clear All Items
									</button>

									<p className="text-xs text-gray-500 text-center mt-2">
										Order will be sent to the kitchen
										immediately
									</p>
								</div>
							</div>
						</div>
					</>
				)}

				{/* Floating Cart Button */}
				{cart.length > 0 && !isCartOpen && (
					<button
						onClick={() => setIsCartOpen(true)}
						className="fixed bottom-4 right-4 bg-blue-600 text-white px-4 py-3 rounded-full shadow-lg z-20 flex items-center gap-3 hover:bg-blue-700 transition-colors"
					>
						<div className="relative">
							<svg
								className="w-6 h-6"
								fill="none"
								viewBox="0 0 24 24"
								stroke="currentColor"
							>
								<path
									strokeLinecap="round"
									strokeLinejoin="round"
									strokeWidth={2}
									d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
								/>
							</svg>
							<span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
								{cart.reduce(
									(sum, item) => sum + item.quantity,
									0
								)}
							</span>
						</div>
						<span className="font-medium">
							${cartTotal.toFixed(2)}
						</span>
					</button>
				)}
			</main>

			{/* Footer */}
			<footer className="mt-8 border-t border-gray-200 bg-white pt-6 pb-8">
				<div className="container mx-auto px-4">
					<div className="flex flex-col md:flex-row justify-between items-center gap-4">
						<div className="text-sm text-gray-600">
							© {new Date().getFullYear()} Restaurant Name. All
							rights reserved.
						</div>
						<div className="flex items-center gap-2 text-sm text-gray-500">
							<svg
								className="w-4 h-4"
								fill="none"
								viewBox="0 0 24 24"
								stroke="currentColor"
							>
								<path
									strokeLinecap="round"
									strokeLinejoin="round"
									strokeWidth={2}
									d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
								/>
							</svg>
							<span>Secured with JWT token verification</span>
						</div>
					</div>
				</div>
			</footer>
		</div>
	);
};

export default MenuPage;
