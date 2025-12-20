import { useEffect, useState } from "react";
import { QRCode } from "react-qr-code";
import { X, Download, RefreshCw, Calendar } from "lucide-react";
import { qrAPI } from "../utils/api";

const QRCodeModal = ({
	table,
	onClose,
	onRegenerate,
	onDownloadPNG,
	onDownloadPDF,
}) => {
	const [qrUrl, setQrUrl] = useState("");
	const [loading, setLoading] = useState(true);

	const fetchQRPreview = async () => {
		try {
			setLoading(true);
			const response = await qrAPI.getPreview(table.id);
			setQrUrl(response.data.data.qr_url);
		} catch (err) {
			console.error("Error fetching QR preview:", err);
			// Fallback: construct URL manually
			const baseUrl =
				import.meta.env.VITE_FRONTEND_URL || window.location.origin;
			setQrUrl(
				`${baseUrl}/menu?table=${table.id}&token=${table.qr_token}`
			);
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		fetchQRPreview();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [table.id]);

	const formatDate = (dateString) => {
		if (!dateString) return "N/A";
		return new Date(dateString).toLocaleString();
	};

	return (
		<div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
			<div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
				{/* Header */}
				<div className="flex items-center justify-between p-6 border-b border-gray-200">
					<div>
						<h2 className="text-2xl font-bold text-gray-900">
							QR Code
						</h2>
						<p className="text-gray-600 mt-1">
							Table: {table.table_number}
						</p>
					</div>
					<button
						onClick={onClose}
						className="text-gray-400 hover:text-gray-600 transition"
					>
						<X size={24} />
					</button>
				</div>

				{/* Content */}
				<div className="p-6 space-y-6">
					{loading ? (
						<div className="flex items-center justify-center h-64">
							<div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
						</div>
					) : (
						<>
							{/* QR Code Display */}
							<div className="flex justify-center bg-white p-8 rounded-lg border-2 border-gray-200">
								<div className="bg-white p-4">
									<QRCode
										value={qrUrl}
										size={256}
										level="H"
										includeMargin={true}
									/>
								</div>
							</div>

							{/* Table Information */}
							<div className="bg-gray-50 rounded-lg p-4 space-y-3">
								<div className="grid grid-cols-2 gap-4">
									<div>
										<p className="text-sm text-gray-600">
											Table Number
										</p>
										<p className="font-semibold text-gray-900">
											{table.table_number}
										</p>
									</div>
									<div>
										<p className="text-sm text-gray-600">
											Capacity
										</p>
										<p className="font-semibold text-gray-900">
											{table.capacity} seats
										</p>
									</div>
									{table.location && (
										<div>
											<p className="text-sm text-gray-600">
												Location
											</p>
											<p className="font-semibold text-gray-900">
												{table.location}
											</p>
										</div>
									)}
									<div>
										<p className="text-sm text-gray-600">
											Status
										</p>
										<span
											className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${
												table.status === "active"
													? "bg-green-100 text-green-800"
													: "bg-gray-100 text-gray-800"
											}`}
										>
											{table.status}
										</span>
									</div>
								</div>

								{table.qr_token_created_at && (
									<div className="pt-3 border-t border-gray-200">
										<div className="flex items-center text-sm text-gray-600">
											<Calendar
												size={16}
												className="mr-2"
											/>
											<span>
												QR Code Created:{" "}
												{formatDate(
													table.qr_token_created_at
												)}
											</span>
										</div>
									</div>
								)}
							</div>

							{/* Instructions */}
							<div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
								<h3 className="font-semibold text-blue-900 mb-2">
									How to Use
								</h3>
								<ul className="text-sm text-blue-800 space-y-1 list-disc list-inside">
									<li>Download the QR code and print it</li>
									<li>
										Place it on the table for customers to
										scan
									</li>
									<li>
										Customers can scan to view the menu and
										place orders
									</li>
									<li>
										Regenerate the QR code if it gets
										damaged or for security
									</li>
								</ul>
							</div>

							{/* URL Display */}
							<div>
								<label className="block text-sm font-medium text-gray-700 mb-2">
									QR Code URL
								</label>
								<div className="flex">
									<input
										type="text"
										value={qrUrl}
										readOnly
										className="flex-1 px-4 py-2 border border-gray-300 rounded-l-lg bg-gray-50 text-sm"
									/>
									<button
										onClick={() => {
											navigator.clipboard.writeText(
												qrUrl
											);
											alert("URL copied to clipboard!");
										}}
										className="px-4 py-2 bg-gray-200 border border-l-0 border-gray-300 rounded-r-lg hover:bg-gray-300 transition text-sm"
									>
										Copy
									</button>
								</div>
							</div>
						</>
					)}
				</div>

				{/* Actions */}
				<div className="flex gap-3 p-6 border-t border-gray-200 bg-gray-50">
					<button
						onClick={onDownloadPNG}
						className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
					>
						<Download size={18} />
						Download PNG
					</button>
					<button
						onClick={onDownloadPDF}
						className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
					>
						<Download size={18} />
						Download PDF
					</button>
					<button
						onClick={onRegenerate}
						className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition"
					>
						<RefreshCw size={18} />
						Regenerate
					</button>
				</div>
			</div>
		</div>
	);
};

export default QRCodeModal;
