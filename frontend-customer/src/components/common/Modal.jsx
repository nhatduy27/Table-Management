import React from "react";

const Modal = ({
	isOpen,
	onClose,
	title,
	children,
	size = "md",
	showCloseButton = true,
}) => {
	if (!isOpen) return null;

	const sizes = {
		sm: "max-w-md",
		md: "max-w-2xl",
		lg: "max-w-4xl",
		xl: "max-w-6xl",
	};

	return (
		<div className="fixed inset-0 z-50 overflow-y-auto">
			{/* Backdrop */}
			<div
				className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
				onClick={onClose}
			></div>

			{/* Modal */}
			<div className="flex min-h-full items-center justify-center p-4">
				<div
					className={`relative bg-white rounded-lg shadow-xl ${sizes[size]} w-full`}
					onClick={(e) => e.stopPropagation()}
				>
					{/* Header */}
					{(title || showCloseButton) && (
						<div className="flex items-center justify-between p-4 border-b">
							{title && (
								<h3 className="text-xl font-semibold text-gray-900">
									{title}
								</h3>
							)}
							{showCloseButton && (
								<button
									onClick={onClose}
									className="text-gray-400 hover:text-gray-600 transition-colors"
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
							)}
						</div>
					)}

					{/* Content */}
					<div className="p-6">{children}</div>
				</div>
			</div>
		</div>
	);
};

export default Modal;
