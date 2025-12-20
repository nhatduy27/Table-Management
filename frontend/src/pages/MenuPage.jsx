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
			<div className="min-h-screen flex items-center justify-center bg-gray-50">
				<div className="text-center">
					<div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-500 mx-auto mb-4"></div>
					<p className="text-gray-600">Verifying QR code...</p>
				</div>
			</div>
		);
	}

	if (error) {
		return (
			<div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
				<div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
					<div className="flex justify-center mb-4">
						<div className="bg-red-100 p-4 rounded-full">
							<AlertCircle size={48} className="text-red-600" />
						</div>
					</div>
					<h2 className="text-2xl font-bold text-gray-900 mb-2">
						Invalid QR Code
					</h2>
					<p className="text-gray-600 mb-6">{error}</p>
					<div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
						<p className="text-sm text-yellow-800">
							Please ask a staff member for assistance or scan a
							different QR code.
						</p>
					</div>
				</div>
			</div>
		);
	}

	return (
		<div className="min-h-screen bg-linear-to-b from-blue-50 to-white p-4">
			<div className="max-w-4xl mx-auto">
				{/* Success Message */}
				<div className="bg-white rounded-lg shadow-lg p-8 mb-6">
					<div className="flex items-center justify-center mb-6">
						<div className="bg-green-100 p-4 rounded-full">
							<CheckCircle size={48} className="text-green-600" />
						</div>
					</div>
					<h1 className="text-3xl font-bold text-center text-gray-900 mb-2">
						Welcome to Our Restaurant!
					</h1>
					<p className="text-center text-gray-600">
						You're scanning from Table {tableInfo?.table_number}
					</p>
				</div>

				{/* Table Information */}
				<div className="bg-white rounded-lg shadow-lg p-6 mb-6">
					<h2 className="text-xl font-bold text-gray-900 mb-4">
						Table Information
					</h2>
					<div className="grid grid-cols-2 gap-4">
						<div>
							<p className="text-sm text-gray-600">
								Table Number
							</p>
							<p className="font-semibold text-gray-900">
								{tableInfo?.table_number}
							</p>
						</div>
						<div>
							<p className="text-sm text-gray-600">Capacity</p>
							<p className="font-semibold text-gray-900">
								{tableInfo?.capacity} seats
							</p>
						</div>
						{tableInfo?.location && (
							<div>
								<p className="text-sm text-gray-600">
									Location
								</p>
								<p className="font-semibold text-gray-900">
									{tableInfo.location}
								</p>
							</div>
						)}
					</div>
				</div>

				{/* Menu Placeholder */}
				<div className="bg-white rounded-lg shadow-lg p-8 text-center">
					<h2 className="text-2xl font-bold text-gray-900 mb-4">
						Menu
					</h2>
					<p className="text-gray-600 mb-6">
						The menu functionality will be implemented in future
						modules.
					</p>
					<div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
						<p className="text-blue-800">
							This page verifies that your QR code is working
							correctly! 🎉
						</p>
					</div>
				</div>

				{/* Footer */}
				<div className="mt-8 text-center text-sm text-gray-500">
					<p>Thank you for choosing our restaurant!</p>
				</div>
			</div>
		</div>
	);
};

export default MenuPage;
