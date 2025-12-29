import React from "react";

const CartButton = ({ totalItems, cartTotal, onClick }) => {
	if (totalItems === 0) return null;

	return (
		<button
			onClick={onClick}
			className="fixed bottom-4 right-4 bg-amber-600 text-white px-4 py-3 rounded-full shadow-lg z-20 flex items-center gap-3 hover:bg-amber-700 transition-colors"
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
					{totalItems}
				</span>
			</div>
			<span className="font-medium">${cartTotal.toFixed(2)}</span>
		</button>
	);
};

export default CartButton;
