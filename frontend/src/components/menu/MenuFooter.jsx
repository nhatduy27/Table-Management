import React from "react";

const MenuFooter = () => {
	return (
		<footer className="mt-8 border-t border-amber-200 bg-linear-to-r from-amber-50 to-orange-50 pt-6 pb-8">
			<div className="container mx-auto px-4">
				<div className="flex flex-col md:flex-row justify-between items-center gap-4">
					<div className="text-sm text-stone-600">
						© {new Date().getFullYear()} Restaurant Name. All rights
						reserved.
					</div>
					<div className="flex items-center gap-2 text-sm text-stone-500">
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
						<span>Secured ordering system</span>
					</div>
				</div>
			</div>
		</footer>
	);
};

export default MenuFooter;
