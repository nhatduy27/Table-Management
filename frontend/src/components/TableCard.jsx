import { useState } from "react";
import {
	MapPin,
	Users,
	Edit2,
	QrCode,
	Power,
	MoreVertical,
	Download,
	RefreshCw,
} from "lucide-react";
import { tableAPI, qrAPI } from "../utils/api";
import { downloadQRCode, downloadQRCodePDF } from "../utils/downloadFile";
import QRCodeModal from "./QRCodeModal";

const TableCard = ({ table, onEdit, onRefresh }) => {
	const [showMenu, setShowMenu] = useState(false);
	const [showQRModal, setShowQRModal] = useState(false);
	const [loading, setLoading] = useState(false);

	const handleToggleStatus = async () => {
		const newStatus = table.status === "active" ? "inactive" : "active";
		const confirmed = confirm(
			`Are you sure you want to ${
				newStatus === "inactive" ? "deactivate" : "activate"
			} table ${table.table_number}?`
		);

		if (!confirmed) return;

		try {
			setLoading(true);
			await tableAPI.updateStatus(table.id, newStatus);
			onRefresh();
		} catch (err) {
			alert(
				err.response?.data?.message || "Failed to update table status"
			);
		} finally {
			setLoading(false);
		}
	};

	const handleGenerateQR = async () => {
		try {
			setLoading(true);
			await qrAPI.generate(table.id);
			onRefresh();
			setShowQRModal(true);
		} catch (err) {
			alert(err.response?.data?.message || "Failed to generate QR code");
		} finally {
			setLoading(false);
		}
	};

	const handleRegenerateQR = async () => {
		const confirmed = confirm(
			"Are you sure you want to regenerate the QR code? The old QR code will be invalidated."
		);

		if (!confirmed) return;

		try {
			setLoading(true);
			await qrAPI.regenerate(table.id);
			onRefresh();
			alert("QR code regenerated successfully!");
		} catch (err) {
			alert(
				err.response?.data?.message || "Failed to regenerate QR code"
			);
		} finally {
			setLoading(false);
		}
	};

	const handleDownloadPNG = async () => {
		const result = await downloadQRCode(
			qrAPI,
			table.id,
			table.table_number
		);
		if (!result.success) {
			alert("Failed to download QR code: " + result.error);
		}
	};

	const handleDownloadPDF = async () => {
		const result = await downloadQRCodePDF(
			qrAPI,
			table.id,
			table.table_number
		);
		if (!result.success) {
			alert("Failed to download QR code PDF: " + result.error);
		}
	};

	const hasQRCode = table.qr_token && table.qr_token_created_at;

	return (
		<>
			<div className="bg-white rounded-lg shadow-md border border-gray-200 p-6 hover:shadow-lg transition relative">
				{/* Status Badge */}
				<div className="absolute top-4 right-4">
					<span
						className={`px-3 py-1 rounded-full text-xs font-semibold ${
							table.status === "active"
								? "bg-green-100 text-green-800"
								: "bg-gray-100 text-gray-800"
						}`}
					>
						{table.status}
					</span>
				</div>

				{/* Table Number */}
				<div className="mb-4">
					<h3 className="text-2xl font-bold text-gray-900">
						{table.table_number}
					</h3>
				</div>

				{/* Table Info */}
				<div className="space-y-2 mb-4">
					<div className="flex items-center text-gray-600">
						<Users size={18} className="mr-2" />
						<span>Capacity: {table.capacity} seats</span>
					</div>
					{table.location && (
						<div className="flex items-center text-gray-600">
							<MapPin size={18} className="mr-2" />
							<span>{table.location}</span>
						</div>
					)}
				</div>

				{/* Description */}
				{table.description && (
					<p className="text-sm text-gray-500 mb-4 line-clamp-2">
						{table.description}
					</p>
				)}

				{/* QR Code Status */}
				<div className="mb-4 pb-4 border-b border-gray-200">
					{hasQRCode ? (
						<div className="flex items-center text-green-600 text-sm">
							<QrCode size={16} className="mr-2" />
							<span>QR Code Active</span>
						</div>
					) : (
						<div className="flex items-center text-gray-400 text-sm">
							<QrCode size={16} className="mr-2" />
							<span>No QR Code</span>
						</div>
					)}
				</div>

				{/* Actions */}
				<div className="flex gap-2">
					<button
						onClick={() => onEdit(table)}
						className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
					>
						<Edit2 size={16} />
						Edit
					</button>

					{hasQRCode ? (
						<button
							onClick={() => setShowQRModal(true)}
							className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition"
						>
							<QrCode size={16} />
							View QR
						</button>
					) : (
						<button
							onClick={handleGenerateQR}
							disabled={loading}
							className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition disabled:opacity-50"
						>
							<QrCode size={16} />
							{loading ? "Generating..." : "Generate QR"}
						</button>
					)}

					{/* More Menu */}
					<div className="relative">
						<button
							onClick={() => setShowMenu(!showMenu)}
							className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
						>
							<MoreVertical size={20} />
						</button>

						{showMenu && (
							<>
								<div
									className="fixed inset-0 z-10"
									onClick={() => setShowMenu(false)}
								/>
								<div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-20">
									{hasQRCode && (
										<>
											<button
												onClick={() => {
													handleDownloadPNG();
													setShowMenu(false);
												}}
												className="w-full text-left px-4 py-2 hover:bg-gray-100 flex items-center gap-2"
											>
												<Download size={16} />
												Download PNG
											</button>
											<button
												onClick={() => {
													handleDownloadPDF();
													setShowMenu(false);
												}}
												className="w-full text-left px-4 py-2 hover:bg-gray-100 flex items-center gap-2"
											>
												<Download size={16} />
												Download PDF
											</button>
											<button
												onClick={() => {
													handleRegenerateQR();
													setShowMenu(false);
												}}
												className="w-full text-left px-4 py-2 hover:bg-gray-100 flex items-center gap-2 text-orange-600"
											>
												<RefreshCw size={16} />
												Regenerate QR
											</button>
										</>
									)}
									<button
										onClick={() => {
											handleToggleStatus();
											setShowMenu(false);
										}}
										className={`w-full text-left px-4 py-2 hover:bg-gray-100 flex items-center gap-2 ${
											table.status === "active"
												? "text-red-600"
												: "text-green-600"
										}`}
									>
										<Power size={16} />
										{table.status === "active"
											? "Deactivate"
											: "Activate"}
									</button>
								</div>
							</>
						)}
					</div>
				</div>
			</div>

			{/* QR Code Modal */}
			{showQRModal && (
				<QRCodeModal
					table={table}
					onClose={() => setShowQRModal(false)}
					onRegenerate={handleRegenerateQR}
					onDownloadPNG={handleDownloadPNG}
					onDownloadPDF={handleDownloadPDF}
				/>
			)}
		</>
	);
};

export default TableCard;
