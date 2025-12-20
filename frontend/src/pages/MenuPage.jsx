import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { AlertCircle, CheckCircle } from "lucide-react";

const MenuPage = () => {
	const [searchParams] = useSearchParams();
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState(null);
	const [tableInfo, setTableInfo] = useState(null);

	const tableId = searchParams.get("table");
	const token = searchParams.get("token");

	const verifyQRCode = async () => {
		try {
			setLoading(true);
			setError(null);

			if (!tableId || !token) {
				setError("Invalid QR code. Missing parameters.");
				setLoading(false);
				return;
			}

			// Call backend to verify token
			const API_BASE_URL =
				import.meta.env.VITE_API_URL || "http://localhost:5000/api";
			const response = await fetch(
				`${API_BASE_URL}/menu?table=${tableId}&token=${token}`
			);

			if (!response.ok) {
				const data = await response.json();
				throw new Error(data.message || "Invalid or expired QR code");
			}

			const data = await response.json();
			setTableInfo(data.data);
		} catch (err) {
			console.error("Error verifying QR code:", err);
			setError(
				err.message ||
					"This QR code is no longer valid. Please ask staff for assistance."
			);
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		verifyQRCode();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [tableId, token]);

	if (loading) {
		return (
			<div className="min-h-screen flex items-center justify-center bg-gray-100">
				<div className="text-center">
					<div className="spinner mx-auto mb-4"></div>
					<p className="text-gray-500 font-medium">
						Verifying QR code...
					</p>
				</div>
			</div>
		);
	}

	if (error) {
		return (
			<div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
				<div className="max-w-md w-full bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
					<div className="flex justify-center mb-6">
						<div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center">
							<AlertCircle size={40} className="text-red-500" />
						</div>
					</div>
					<h2 className="text-2xl font-bold text-red-600 mb-3">
						Invalid QR Code
					</h2>
					<p className="text-gray-600 mb-6">{error}</p>
					<div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
						<p className="text-sm text-yellow-800 font-medium">
							Please ask a staff member for assistance or scan a
							different QR code.
						</p>
					</div>
				</div>
			</div>
		);
	}

	return (
		<div className="min-h-screen bg-gray-100 p-4 py-8">
			<div className="max-w-2xl w-full mx-auto">
				{/* Success Message */}
				<div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 mb-6 text-center">
					<div className="flex items-center justify-center mb-6">
						<div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center">
							<CheckCircle size={40} className="text-green-500" />
						</div>
					</div>
					<h1 className="text-3xl font-bold text-gray-900 mb-3">
						Welcome to Our Restaurant!
					</h1>
					<p className="text-gray-500">
						You're scanning from Table{" "}
						<span className="font-bold text-blue-600">
							{tableInfo?.table_number}
						</span>
					</p>
				</div>

				{/* Table Information */}
				<div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
					<h2 className="text-xl font-bold text-gray-800 mb-4">
						📍 Table Information
					</h2>
					<div className="grid grid-cols-2 gap-4">
						<div className="bg-gray-50 p-4 rounded-lg">
							<p className="text-xs text-gray-500 font-medium mb-1">
								Table Number
							</p>
							<p className="font-bold text-gray-900 text-lg">
								{tableInfo?.table_number}
							</p>
						</div>
						<div className="bg-gray-50 p-4 rounded-lg">
							<p className="text-xs text-gray-500 font-medium mb-1">
								Capacity
							</p>
							<p className="font-bold text-gray-900 text-lg">
								{tableInfo?.capacity} seats
							</p>
						</div>
						{tableInfo?.location && (
							<div className="bg-gray-50 p-4 rounded-lg col-span-2">
								<p className="text-xs text-gray-500 font-medium mb-1">
									Location
								</p>
								<p className="font-bold text-gray-900 text-lg">
									{tableInfo.location}
								</p>
							</div>
						)}
					</div>
				</div>

				{/* Menu Placeholder */}
				<div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
					<div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
						<span className="text-2xl">🍽️</span>
					</div>
					<h2 className="text-2xl font-bold text-gray-800 mb-3">
						Menu
					</h2>
					<p className="text-gray-500 mb-6">
						The menu functionality will be implemented in future
						modules.
					</p>
					<div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
						<p className="text-blue-700 font-medium">
							This page verifies that your QR code is working
							correctly! 🎉
						</p>
					</div>
				</div>

				{/* Footer */}
				<div className="mt-8 text-center">
					<p className="text-gray-400 text-sm font-medium">
						Thank you for choosing our restaurant! ❤️
					</p>
				</div>
			</div>
		</div>
	);
};

export default MenuPage;
