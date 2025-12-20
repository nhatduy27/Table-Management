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
		<div className="fixed inset-0 modal-backdrop flex items-center justify-center z-50 p-4">
			<div className="bg-white rounded-lg shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto">
				{/* Header */}
				<div className="flex items-center justify-between p-6 border-b border-gray-200">
					<div>
						<h2 className="text-2xl font-bold text-gray-900">
							QR Code
						</h2>
						<p className="text-gray-500 mt-1">
							Table:{" "}
							<span className="font-semibold text-gray-700">
								{table.table_number}
							</span>
						</p>
					</div>
					<button
						onClick={onClose}
						className="w-10 h-10 rounded-lg border border-gray-300 flex items-center justify-center text-gray-400 hover:text-gray-600 hover:bg-gray-50 transition"
					>
						<X size={20} />
					</button>
				</div>

				{/* Content */}
				<div className="p-6 space-y-5">
					{loading ? (
						<div className="flex items-center justify-center h-64">
							<div className="spinner"></div>
						</div>
					) : (
						<>
							{/* QR Code Display */}
							<div className="flex justify-center bg-gray-50 p-6 rounded-lg border border-gray-200">
								<div className="bg-white p-4 rounded-lg">
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
								<div className="grid grid-cols-2 gap-3">
									<div className="bg-white p-3 rounded-lg border border-gray-200">
										<p className="text-xs text-gray-500 font-medium">
											Table Number
										</p>
										<p className="font-bold text-gray-900 mt-1">
											{table.table_number}
										</p>
									</div>
									<div className="bg-white p-3 rounded-lg border border-gray-200">
										<p className="text-xs text-gray-500 font-medium">
											Capacity
										</p>
										<p className="font-bold text-gray-900 mt-1">
											{table.capacity} seats
										</p>
									</div>
									{table.location && (
										<div className="bg-white p-3 rounded-lg border border-gray-200">
											<p className="text-xs text-gray-500 font-medium">
												Location
											</p>
											<p className="font-bold text-gray-900 mt-1">
												{table.location}
											</p>
										</div>
									)}
									<div className="bg-white p-3 rounded-lg border border-gray-200">
										<p className="text-xs text-gray-500 font-medium">
											Status
										</p>
										<span
											className={`inline-block mt-1 px-2 py-1 rounded-full text-xs font-semibold ${
												table.status === "active"
													? "bg-green-100 text-green-800"
													: "bg-gray-100 text-gray-600"
											}`}
										>
											{table.status}
										</span>
									</div>
								</div>

								{table.qr_token_created_at && (
									<div className="pt-3 border-t border-gray-200">
										<div className="flex items-center text-sm text-gray-600 bg-white p-3 rounded-lg border border-gray-200">
											<Calendar
												size={16}
												className="mr-2 text-gray-400"
											/>
											<span>
												Created:{" "}
												<span className="font-semibold">
													{formatDate(
														table.qr_token_created_at
													)}
												</span>
											</span>
										</div>
									</div>
								)}
							</div>

							{/* Instructions */}
							<div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
								<h3 className="font-bold text-blue-900 mb-2">
									How to Use
								</h3>
								<ul className="text-sm text-blue-800 space-y-1">
									<li>• Download the QR code and print it</li>
									<li>
										• Place it on the table for customers to
										scan
									</li>
									<li>
										• Customers can scan to view the menu
									</li>
									<li>• Regenerate for security if needed</li>
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
										className="flex-1 px-4 py-3 border border-gray-300 rounded-l-lg bg-gray-50 text-sm font-mono text-gray-600"
									/>
									<button
										onClick={() => {
											navigator.clipboard.writeText(
												qrUrl
											);
											alert("URL copied to clipboard!");
										}}
										className="px-5 py-3 bg-blue-600 text-white rounded-r-lg hover:bg-blue-700 transition font-medium"
									>
										Copy
									</button>
								</div>
							</div>
						</>
					)}
				</div>

				{/* Actions */}
				<div className="flex gap-3 p-6 border-t border-gray-200 bg-gray-50 rounded-b-lg">
					<button
						onClick={onDownloadPNG}
						className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition font-medium"
					>
						<Download size={18} />
						PNG
					</button>
					<button
						onClick={onDownloadPDF}
						className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium"
					>
						<Download size={18} />
						PDF
					</button>
					<button
						onClick={onRegenerate}
						className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition font-medium"
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
