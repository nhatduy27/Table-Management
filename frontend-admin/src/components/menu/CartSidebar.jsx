import React from "react";

const CartSidebar = ({
	cart,
	cartTotal,
	isOpen,
	onClose,
	onUpdateQuantity,
	onRemoveItem,
	onClearCart,
	onPlaceOrder,
	onUpdateNote,
}) => {
	if (!isOpen || cart.length === 0) return null;

	const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);

	return (
		<>
			{/* Backdrop - semi-transparent */}
			<div className="fixed inset-0 bg-black/20 z-30" onClick={onClose} />
			<div className="fixed bottom-0 left-0 right-0 md:right-4 md:bottom-4 md:left-auto md:w-96 bg-white shadow-2xl rounded-t-2xl md:rounded-2xl z-40 max-h-[80vh] overflow-hidden">
				<div className="p-4">
					<div className="flex items-center justify-between mb-4">
						<h3 className="text-lg font-bold text-gray-900">
							Your Order ({totalItems} items)
						</h3>
						<button
							onClick={onClose}
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
								key={item.cartItemId || item.id}
								className="flex items-center justify-between py-3 border-b border-gray-100"
							>
								<div className="flex-1">
									<p className="font-medium text-gray-900">
										{item.name}
									</p>
									{/* Display selected modifiers */}
									{item.modifiers &&
										item.modifiers.length > 0 && (
											<div className="mt-1">
												{item.modifiers.map((mod) => (
													<p
														key={mod.optionId}
														className="text-xs text-gray-500"
													>
														+ {mod.optionName} (+$
														{mod.priceAdjustment.toFixed(
															2
														)}
														)
													</p>
												))}
											</div>
										)}
									{/* Special instructions note */}
									{item.note && (
										<p className="text-xs text-amber-600 italic mt-1">
											📝 {item.note}
										</p>
									)}
									<p className="text-sm text-gray-600">
										${item.unitPrice.toFixed(2)} each
									</p>
								</div>

								<div className="flex items-center gap-2">
									<div className="flex items-center border border-gray-300 rounded">
										<button
											onClick={() =>
												onUpdateQuantity(
													item.cartItemId || item.id,
													item.quantity - 1
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
												onUpdateQuantity(
													item.cartItemId || item.id,
													item.quantity + 1
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
											onRemoveItem(
												item.cartItemId || item.id
											)
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
							<span className="text-2xl font-bold text-amber-600">
								${cartTotal.toFixed(2)}
							</span>
						</div>

						<button
							onClick={onPlaceOrder}
							className="w-full py-3 bg-emerald-600 text-white font-medium rounded-lg hover:bg-emerald-700 transition-colors"
						>
							🍴 Place Order
						</button>

						<button
							onClick={onClearCart}
							className="w-full mt-2 py-2 text-sm text-red-600 hover:text-red-800 hover:bg-red-50 rounded-lg transition-colors"
						>
							Clear All Items
						</button>

						<p className="text-xs text-gray-500 text-center mt-2">
							Order will be sent to the kitchen immediately
						</p>
					</div>
				</div>
			</div>
		</>
	);
};

export default CartSidebar;
