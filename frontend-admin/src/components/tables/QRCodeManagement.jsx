import { useState, useEffect } from "react";
import Button from "../common/Button";
import Card from "../common/Card";
import Loading from "../common/Loading";
import Alert from "../common/Alert";
import Modal from "../common/Modal";
import ConfirmDialog from "../common/ConfirmDialog";
import tableService from "../../services/tableService";

const QRCodeManagement = ({ table, onUpdate }) => {
	const [qrPreview, setQrPreview] = useState(null);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState("");
	const [success, setSuccess] = useState("");
	const [showPreview, setShowPreview] = useState(false);
	const [showConfirmRegenerate, setShowConfirmRegenerate] = useState(false);
	const [downloading, setDownloading] = useState(false);

	useEffect(() => {
		if (table.qr_code_url && showPreview) {
			loadQRPreview();
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [table.id, showPreview]);

	const loadQRPreview = async () => {
		try {
			setLoading(true);
			const response = await tableService.getQRPreview(table.id);
			setQrPreview(response.data);
			setError("");
		} catch (err) {
			setError(err.message || "Failed to load QR preview");
		} finally {
			setLoading(false);
		}
	};

	const handleGenerateQR = async () => {
		try {
			setLoading(true);
			setError("");
			const response = await tableService.generateQRCode(table.id);
			setQrPreview(response.data);
			setSuccess("QR code generated successfully!");
			if (onUpdate) onUpdate();
			setTimeout(() => setSuccess(""), 3000);
		} catch (err) {
			setError(err.message || "Failed to generate QR code");
		} finally {
			setLoading(false);
		}
	};

	const handleRegenerateQR = async () => {
		try {
			setLoading(true);
			setError("");
			setShowConfirmRegenerate(false);
			const response = await tableService.regenerateQRCode(table.id);
			setQrPreview(response.data);
			setSuccess(
				"QR code regenerated successfully! Previous QR codes are now invalid."
			);
			if (onUpdate) onUpdate();
			setTimeout(() => setSuccess(""), 3000);
		} catch (err) {
			setError(err.message || "Failed to regenerate QR code");
		} finally {
			setLoading(false);
		}
	};

	const handleDownload = async (format) => {
		try {
			setDownloading(true);
			setError("");
			const blob = await tableService.downloadQRCode(table.id, format);

			// Create download link
			const url = window.URL.createObjectURL(blob);
			const link = document.createElement("a");
			link.href = url;
			link.download = `table-${table.table_number}-qr.${format}`;
			document.body.appendChild(link);
			link.click();
			document.body.removeChild(link);
			window.URL.revokeObjectURL(url);

			setSuccess(`QR code downloaded as ${format.toUpperCase()}`);
			setTimeout(() => setSuccess(""), 3000);
		} catch (err) {
			setError(
				err.response?.data?.message || "Failed to download QR code"
			);
		} finally {
			setDownloading(false);
		}
	};

	const hasQRCode = table.qr_token;

	return (
		<div className="space-y-4">
			{error && (
				<Alert
					type="error"
					message={error}
					onClose={() => setError("")}
				/>
			)}
			{success && (
				<Alert
					type="success"
					message={success}
					onClose={() => setSuccess("")}
				/>
			)}

			<Card>
				<div className="p-6">
					<h3 className="text-lg font-semibold mb-4">
						QR Code Status
					</h3>

					{!hasQRCode ? (
						<div className="text-center py-8">
							<div className="mb-4 text-gray-500">
								No QR code generated for this table yet.
							</div>
							<Button
								variant="primary"
								onClick={handleGenerateQR}
								disabled={loading}
							>
								{loading ? "Generating..." : "Generate QR Code"}
							</Button>
						</div>
					) : (
						<div className="space-y-4">
							<div className="flex items-center justify-between">
								<div>
									<div className="text-sm text-gray-600">
										QR Code Status
									</div>
									<div className="text-sm font-medium text-green-600">
										Active (Created:{" "}
										{table.qr_token_created_at
											? new Date(
													table.qr_token_created_at
											  ).toLocaleDateString()
											: "N/A"}
										)
									</div>
								</div>
								<Button
									variant="secondary"
									size="sm"
									onClick={() => {
										setShowPreview(true);
										loadQRPreview();
									}}
								>
									Preview
								</Button>
							</div>

							<div className="flex gap-2 flex-wrap">
								<Button
									variant="primary"
									onClick={() => handleDownload("png")}
									disabled={downloading}
								>
									{downloading
										? "Downloading..."
										: "Download PNG"}
								</Button>
								<Button
									variant="secondary"
									onClick={() => handleDownload("pdf")}
									disabled={downloading}
								>
									{downloading
										? "Downloading..."
										: "Download PDF"}
								</Button>
								<Button
									variant="danger"
									onClick={() =>
										setShowConfirmRegenerate(true)
									}
									disabled={loading}
								>
									Regenerate QR Code
								</Button>
							</div>

							<div className="text-xs text-gray-500 mt-2">
								⚠️ Regenerating will invalidate the current QR
								code
							</div>
						</div>
					)}
				</div>
			</Card>

			{/* QR Preview Modal */}
			<Modal
				isOpen={showPreview}
				onClose={() => setShowPreview(false)}
				title={`QR Code - Table ${table.table_number}`}
			>
				<div className="p-4">
					{loading ? (
						<Loading />
					) : qrPreview ? (
						<div className="space-y-4">
							<div className="flex justify-center">
								<img
									src={qrPreview.qr_data_url}
									alt={`QR Code for Table ${table.table_number}`}
									className="w-64 h-64 border-2 border-gray-200 rounded-lg"
								/>
							</div>
							<div className="text-center">
								<div className="text-sm font-semibold">
									Table {table.table_number}
								</div>
								<div className="text-xs text-gray-500">
									Location: {table.location || "N/A"}
								</div>
								<div className="text-xs text-gray-500 mt-2 break-all">
									URL: {qrPreview.qr_url}
								</div>
							</div>
							<div className="flex gap-2 justify-center">
								<Button
									variant="primary"
									size="sm"
									onClick={() => handleDownload("png")}
								>
									Download PNG
								</Button>
								<Button
									variant="secondary"
									size="sm"
									onClick={() => handleDownload("pdf")}
								>
									Download PDF
								</Button>
							</div>
						</div>
					) : (
						<div className="text-center text-gray-500">
							Failed to load QR preview
						</div>
					)}
				</div>
			</Modal>

			{/* Confirm Regenerate Dialog */}
			<ConfirmDialog
				isOpen={showConfirmRegenerate}
				onClose={() => setShowConfirmRegenerate(false)}
				onConfirm={handleRegenerateQR}
				title="Regenerate QR Code"
				message="Are you sure you want to regenerate the QR code? This will invalidate the current QR code and any printed materials will no longer work."
				confirmText="Regenerate"
				variant="danger"
			/>
		</div>
	);
};

export default QRCodeManagement;
