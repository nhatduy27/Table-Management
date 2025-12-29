import React, { useState } from "react";
import { Link, useLocation, Outlet } from "react-router-dom";

const Layout = ({ children }) => {
	const location = useLocation();
	const [menuOpen, setMenuOpen] = useState(false);

	const isActive = (path) => {
		return (
			location.pathname === path ||
			location.pathname.startsWith(path + "/")
		);
	};

	const isMenuActive = () => {
		return location.pathname.startsWith("/admin/menu");
	};

	return (
		<div className="min-h-screen bg-gray-50">
			{/* Header/Navbar */}
			<nav className="bg-white shadow-sm border-b">
				<div className="container mx-auto px-4">
					<div className="flex items-center justify-between h-16">
						{/* Logo */}
						<Link to="/tables" className="flex items-center gap-3">
							<div className="bg-blue-600 text-white p-2 rounded-lg">
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
										d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
									/>
								</svg>
							</div>
							<div>
								<h1 className="text-xl font-bold text-gray-900">
									Smart Restaurant
								</h1>
								<p className="text-xs text-gray-600">
									Admin Management System
								</p>
							</div>
						</Link>

						{/* Navigation Links */}
						<div className="flex items-center gap-2">
							{/* Tables Link */}
							<Link
								to="/tables"
								className={`px-4 py-2 rounded-lg font-medium transition-colors ${
									isActive("/tables")
										? "bg-blue-50 text-blue-600"
										: "text-gray-600 hover:bg-gray-50"
								}`}
							>
								<span className="flex items-center gap-2">
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
											d="M3 10h18M3 14h18m-9-4v8m-7 0h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
										/>
									</svg>
									Tables
								</span>
							</Link>

							{/* Menu Dropdown */}
							<div className="relative">
								<button
									onClick={() => setMenuOpen(!menuOpen)}
									className={`px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2 ${
										isMenuActive()
											? "bg-blue-50 text-blue-600"
											: "text-gray-600 hover:bg-gray-50"
									}`}
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
											d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
										/>
									</svg>
									Menu
									<svg
										className={`w-4 h-4 transition-transform ${
											menuOpen ? "rotate-180" : ""
										}`}
										fill="none"
										viewBox="0 0 24 24"
										stroke="currentColor"
									>
										<path
											strokeLinecap="round"
											strokeLinejoin="round"
											strokeWidth={2}
											d="M19 9l-7 7-7-7"
										/>
									</svg>
								</button>

								{/* Dropdown Menu */}
								{menuOpen && (
									<div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border z-50">
										<Link
											to="/admin/menu/categories"
											onClick={() => setMenuOpen(false)}
											className={`block px-4 py-2 text-sm transition-colors rounded-t-lg ${
												isActive(
													"/admin/menu/categories"
												)
													? "bg-blue-50 text-blue-600"
													: "text-gray-700 hover:bg-gray-50"
											}`}
										>
											<span className="flex items-center gap-2">
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
														d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
													/>
												</svg>
												Categories
											</span>
										</Link>
										<Link
											to="/admin/menu/items"
											onClick={() => setMenuOpen(false)}
											className={`block px-4 py-2 text-sm transition-colors ${
												isActive("/admin/menu/items")
													? "bg-blue-50 text-blue-600"
													: "text-gray-700 hover:bg-gray-50"
											}`}
										>
											<span className="flex items-center gap-2">
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
														d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
													/>
												</svg>
												Menu Items
											</span>
										</Link>
										<Link
											to="/admin/menu/modifiers"
											onClick={() => setMenuOpen(false)}
											className={`block px-4 py-2 text-sm transition-colors rounded-b-lg ${
												isActive(
													"/admin/menu/modifiers"
												)
													? "bg-blue-50 text-blue-600"
													: "text-gray-700 hover:bg-gray-50"
											}`}
										>
											<span className="flex items-center gap-2">
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
												Modifiers
											</span>
										</Link>
									</div>
								)}
							</div>

							{/* Admin indicator */}
							<div className="text-gray-400 px-4 py-2">
								<span className="flex items-center gap-2">
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
											d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
										/>
									</svg>
									Admin
								</span>
							</div>
						</div>
					</div>
				</div>
			</nav>

			{/* Click outside to close menu */}
			{menuOpen && (
				<div
					className="fixed inset-0 z-40"
					onClick={() => setMenuOpen(false)}
				/>
			)}

			{/* Main Content */}
			<main className="min-h-[calc(100vh-4rem)]">
				<Outlet />
			</main>

			{/* Footer */}
			<footer className="bg-white border-t mt-auto">
				<div className="container mx-auto px-4 py-6">
					<div className="flex flex-col md:flex-row justify-between items-center gap-4">
						<p className="text-sm text-gray-600">
							© 2025 Smart Restaurant. Table Management System.
						</p>
						<div className="flex items-center gap-4 text-sm text-gray-600">
							<span>Version 1.0.0</span>
							<span>•</span>
							<span>Assignment: Table Management Module</span>
						</div>
					</div>
				</div>
			</footer>
		</div>
	);
};

export default Layout;
