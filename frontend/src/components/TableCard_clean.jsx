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
				<div className="bg-white rounded-lg shadow-sm border border-gray-200 p-5 hover:shadow-md transition relative">
					{/* Status Badge */}
					<div className="absolute top-4 right-4">
						<span
							className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
								table.status === "active"
									? "bg-green-100 text-green-800"
									: "bg-gray-100 text-gray-800"
							}`}
						>
							{table.status}
						</span>
					</div>

					{/* Table Number */}
					<div className="mb-3 pr-20">
						<h3 className="text-xl font-bold text-gray-900">
					{table.table_number}
				</h3>
			</div>
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

