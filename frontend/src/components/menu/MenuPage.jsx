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
	const [error, setError] = useState(null);
	const [tableInfo, setTableInfo] = useState(null);

	useEffect(() => {
		const verifyQRCode = async () => {
			if (!tableId || !token) {
				setError("Invalid QR code. Missing table or token.");
				setLoading(false);
				return;
			}

			try {
				// Verify QR token with backend
				const response = await tableService.verifyQRToken(
					tableId,
					token
				);

				if (response.success) {
					setTableInfo(response.data.table);
				} else {
					setError(response.message || "Invalid QR code");
				}
			} catch (err) {
				console.error("QR verification error:", err);
				setError(
					err.message ||
						"This QR code is no longer valid. Please ask staff for assistance."
				);
			} finally {
				setLoading(false);
			}
		};

		verifyQRCode();
	}, [tableId, token]);

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

	return (
		<div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
			{/* Success Message */}
			<div className="container mx-auto px-4 py-8">
				<div className="max-w-2xl mx-auto">
					{/* Success Card */}
					<div className="bg-white rounded-lg shadow-lg p-8 mb-6">
						<div className="text-center mb-6">
							<div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
								<svg
									className="w-8 h-8 text-green-600"
									fill="none"
									viewBox="0 0 24 24"
									stroke="currentColor"
								>
									<path
										strokeLinecap="round"
										strokeLinejoin="round"
										strokeWidth={2}
										d="M5 13l4 4L19 7"
									/>
								</svg>
							</div>
							<h1 className="text-3xl font-bold text-gray-900 mb-2">
								Welcome!
							</h1>
							<p className="text-xl text-gray-600">
								Table {tableInfo.table_number}
							</p>
						</div>

						<div className="border-t border-gray-200 pt-6">
							<div className="bg-blue-50 rounded-lg p-4 mb-6">
								<div className="flex items-start gap-3">
									<svg
										className="w-6 h-6 text-blue-600 flex-shrink-0 mt-0.5"
										fill="none"
										viewBox="0 0 24 24"
										stroke="currentColor"
									>
										<path
											strokeLinecap="round"
											strokeLinejoin="round"
											strokeWidth={2}
											d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
										/>
									</svg>
									<div>
										<h3 className="font-semibold text-blue-900 mb-1">
											QR Code Verified Successfully
										</h3>
										<p className="text-sm text-blue-700">
											Your table has been confirmed. The
											menu and ordering system will be
											available here.
										</p>
									</div>
								</div>
							</div>

							{/* Coming Soon Features */}
							<div className="space-y-4">
								<h3 className="font-semibold text-gray-900 mb-3">
									Coming Soon:
								</h3>

								<div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
									<svg
										className="w-5 h-5 text-gray-400 flex-shrink-0 mt-0.5"
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
									<div>
										<p className="font-medium text-gray-900">
											Digital Menu
										</p>
										<p className="text-sm text-gray-600">
											Browse our full menu with photos and
											descriptions
										</p>
									</div>
								</div>

								<div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
									<svg
										className="w-5 h-5 text-gray-400 flex-shrink-0 mt-0.5"
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
									<div>
										<p className="font-medium text-gray-900">
											Online Ordering
										</p>
										<p className="text-sm text-gray-600">
											Place orders directly from your
											table
										</p>
									</div>
								</div>

								<div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
									<svg
										className="w-5 h-5 text-gray-400 flex-shrink-0 mt-0.5"
										fill="none"
										viewBox="0 0 24 24"
										stroke="currentColor"
									>
										<path
											strokeLinecap="round"
											strokeLinejoin="round"
											strokeWidth={2}
											d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z"
										/>
									</svg>
									<div>
										<p className="font-medium text-gray-900">
											Payment System
										</p>
										<p className="text-sm text-gray-600">
											Request bill and pay securely online
										</p>
									</div>
								</div>

								<div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
									<svg
										className="w-5 h-5 text-gray-400 flex-shrink-0 mt-0.5"
										fill="none"
										viewBox="0 0 24 24"
										stroke="currentColor"
									>
										<path
											strokeLinecap="round"
											strokeLinejoin="round"
											strokeWidth={2}
											d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
										/>
									</svg>
									<div>
										<p className="font-medium text-gray-900">
											Call Waiter
										</p>
										<p className="text-sm text-gray-600">
											Request assistance with one tap
										</p>
									</div>
								</div>
							</div>
						</div>
					</div>

					{/* Info Card */}
					<div className="bg-white rounded-lg shadow-md p-6 text-center">
						<p className="text-gray-600 mb-4">
							This is a table management system demo. The menu and
							ordering features are under development.
						</p>
						<div className="flex items-center justify-center gap-2 text-sm text-gray-500">
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
			</div>
		</div>
	);
};

export default MenuPage;
