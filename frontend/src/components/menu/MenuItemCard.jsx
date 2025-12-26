import React from "react";

const MenuItemCard = ({ item, onAddToCart, onCustomize }) => {
	const hasModifiers =
		item.modifierGroups &&
		item.modifierGroups.length > 0 &&
		item.modifierGroups.some((g) => g.options && g.options.length > 0);

	const handleClick = () => {
		if (hasModifiers) {
			onCustomize(item);
		} else {
			onAddToCart(item);
		}
	};

	return (
		<div className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300">
			<div className="p-5">
				<div className="flex justify-between items-start mb-3">
					<div className="flex-1">
						<h3 className="text-lg font-semibold text-gray-900 mb-1">
							{item.name}
						</h3>
						{item.description && (
							<p className="text-gray-600 text-sm mb-3 line-clamp-2">
								{item.description}
							</p>
						)}
					</div>
					{item.is_chef_recommended && (
						<span className="inline-flex items-center gap-1 px-2 py-1 bg-amber-100 text-amber-800 rounded-full text-xs font-medium ml-2 shrink-0">
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
							${parseFloat(item.price || 0).toFixed(2)}
						</span>
						{item.prep_time_minutes > 0 && (
							<span className="text-sm text-gray-500">
								{item.prep_time_minutes} min prep
							</span>
						)}
					</div>

					<div className="flex items-center gap-2">
						{item.status === "sold_out" ? (
							<span className="px-3 py-1 bg-gray-100 text-gray-500 rounded-lg text-sm font-medium">
								Sold Out
							</span>
						) : (
							<button
								className="px-4 py-2 bg-amber-600 text-white rounded-lg font-medium hover:bg-amber-700 transition-colors flex items-center gap-1"
								onClick={handleClick}
							>
								{hasModifiers && (
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
											d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4"
										/>
									</svg>
								)}
								{hasModifiers ? "Customize" : "Add to Cart"}
							</button>
						)}
					</div>
				</div>

				{/* Show modifier hint */}
				{hasModifiers && (
					<p className="text-xs text-gray-500 mt-2">
						Customizable options available
					</p>
				)}
			</div>
		</div>
	);
};

export default MenuItemCard;
