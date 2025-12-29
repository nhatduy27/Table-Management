import React from "react";

const MenuHeader = ({ tableNumber, cartItemCount }) => {
	return (
		<header className="bg-linear-to-r from-amber-600 to-orange-600 shadow-lg sticky top-0 z-10">
			<div className="container mx-auto px-4 py-4">
				<div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
					<div>
						<h1 className="text-2xl font-bold text-white">
							🍽️ Table {tableNumber}
						</h1>
						<p className="text-amber-100">
							Welcome to our restaurant
						</p>
					</div>

					<div className="flex items-center gap-4">
						<div className="inline-flex items-center gap-2 px-3 py-1 bg-white/20 text-white rounded-full text-sm font-medium backdrop-blur-sm">
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

						{cartItemCount > 0 && (
							<div className="hidden md:block px-3 py-1 bg-white/20 text-white rounded-full text-sm font-medium backdrop-blur-sm">
								{cartItemCount} items in cart
							</div>
						)}
					</div>
				</div>
			</div>
		</header>
	);
};

export default MenuHeader;
