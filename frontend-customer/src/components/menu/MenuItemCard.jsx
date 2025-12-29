import React from "react";

const MenuItemCard = ({ item, onCustomize }) => {
	const hasModifiers =
		item.modifierGroups &&
		item.modifierGroups.length > 0 &&
		item.modifierGroups.some((g) => g.options && g.options.length > 0);

	const handleClick = () => {
		// Always open modal to allow adding notes
		onCustomize(item);
	};

	return (
		<div className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300">
			{/* Primary Photo */}
			{item.primary_photo?.url ? (
				<div className="relative h-48 w-full overflow-hidden bg-gray-100 flex items-center justify-center">
					<img
						src={item.primary_photo.url}
						alt={item.name}
						className="max-w-full max-h-full object-contain"
					/>
					{item.is_chef_recommended && (
						<span className="absolute top-2 right-2 inline-flex items-center gap-1 px-2 py-1 bg-amber-100 text-amber-800 rounded-full text-xs font-medium shadow-sm">
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
					{item.status === "sold_out" && (
						<div className="absolute inset-0 bg-black/50 flex items-center justify-center">
							<span className="text-white font-semibold text-lg">
								Sold Out
							</span>
						</div>
					)}
				</div>
			) : (
				<div className="relative h-48 w-full bg-gradient-to-br from-amber-50 to-orange-100 flex items-center justify-center">
					<svg
						className="w-16 h-16 text-amber-300"
						fill="none"
						viewBox="0 0 24 24"
						stroke="currentColor"
					>
						<path
							strokeLinecap="round"
							strokeLinejoin="round"
							strokeWidth={1.5}
							d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
						/>
					</svg>
					{item.is_chef_recommended && (
						<span className="absolute top-2 right-2 inline-flex items-center gap-1 px-2 py-1 bg-amber-100 text-amber-800 rounded-full text-xs font-medium shadow-sm">
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
					{item.status === "sold_out" && (
						<div className="absolute inset-0 bg-black/50 flex items-center justify-center">
							<span className="text-white font-semibold text-lg">
								Sold Out
							</span>
						</div>
					)}
				</div>
			)}

			<div className="p-5">
				<div className="flex justify-between items-start mb-3">
					<div className="flex-1">
						<h3 className="text-lg font-semibold text-gray-900 mb-1 line-clamp-1">
							{item.name}
						</h3>
						<p className="text-gray-600 text-sm mb-3 line-clamp-2 min-h-[2.5rem]">
							{item.description || "\u00A0"}
						</p>
					</div>
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
						<button
							className="px-4 py-2 bg-amber-600 text-white rounded-lg font-medium hover:bg-amber-700 transition-colors flex items-center gap-1 disabled:bg-gray-300 disabled:cursor-not-allowed"
							onClick={handleClick}
							disabled={item.status === "sold_out"}
						>
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
									d="M12 4v16m8-8H4"
								/>
							</svg>
							Add
						</button>
					</div>
				</div>

				{/* Show modifier/customization hint */}
				<p className="text-xs text-gray-500 mt-2">
					{hasModifiers
						? "Customizable options available"
						: "Tap to add special instructions"}
				</p>
			</div>
		</div>
	);
};

export default MenuItemCard;
