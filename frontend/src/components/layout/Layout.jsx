import React from "react";
import { Link, useLocation, Outlet } from "react-router-dom";

const Layout = ({ children }) => {
	const location = useLocation();

	const isActive = (path) => {
		return (
			location.pathname === path ||
			location.pathname.startsWith(path + "/")
		);
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
									Table Management System
								</p>
							</div>
						</Link>

						{/* Navigation Links */}
						<div className="flex items-center gap-4">
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

							{/* Future menu items can be added here */}
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
