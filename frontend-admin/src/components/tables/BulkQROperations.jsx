import { useState } from "react";
import Button from "../common/Button";
import Card from "../common/Card";
import Alert from "../common/Alert";
import ConfirmDialog from "../common/ConfirmDialog";
import tableService from "../../services/tableService";

const BulkQROperations = ({ onUpdate }) => {
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState("");
	const [success, setSuccess] = useState("");
	const [showConfirmRegenerate, setShowConfirmRegenerate] = useState(false);

	const handleBulkRegenerate = async () => {
		try {
			setLoading(true);
			setError("");
			setShowConfirmRegenerate(false);
			const result = await tableService.bulkRegenerateQR();
			setSuccess(
				`Successfully regenerated ${result.data.stats.successful} QR codes. All previous QR codes are now invalid.`
			);
			if (onUpdate) onUpdate();
			setTimeout(() => setSuccess(""), 5000);
		} catch (err) {
			setError(
				err.response?.data?.message || "Failed to regenerate QR codes"
			);
		} finally {
			setLoading(false);
		}
	};

	const handleDownloadAll = async (format) => {
		try {
			setLoading(true);
			setError("");
			const blob = await tableService.downloadAllQR(format);

			// Create download link
			const url = window.URL.createObjectURL(blob);
			const link = document.createElement("a");
			link.href = url;
			const extension = format === "zip" ? "zip" : "pdf";
			link.download = `all-qr-codes.${extension}`;
			document.body.appendChild(link);
			link.click();
			document.body.removeChild(link);
			window.URL.revokeObjectURL(url);

			setSuccess(`All QR codes downloaded as ${format.toUpperCase()}`);
			setTimeout(() => setSuccess(""), 3000);
		} catch (err) {
			setError(
				err.response?.data?.message || "Failed to download QR codes"
			);
		} finally {
			setLoading(false);
		}
	};

	return (
		<Card>
			<div className="p-6">
				<h3 className="text-lg font-semibold mb-4">
					Bulk QR Operations
				</h3>

				{error && (
					<Alert
						type="error"
						message={error}
						onClose={() => setError("")}
						className="mb-4"
					/>
				)}
				{success && (
					<Alert
						type="success"
						message={success}
						onClose={() => setSuccess("")}
						className="mb-4"
					/>
				)}

				<div className="space-y-4">
					<div>
						<h4 className="text-sm font-medium text-gray-700 mb-2">
							Download All QR Codes
						</h4>
						<div className="flex gap-2 flex-wrap">
							<Button
								variant="primary"
								onClick={() => handleDownloadAll("zip")}
								disabled={loading}
							>
								{loading ? "Downloading..." : "Download as ZIP"}
							</Button>
							<Button
								variant="secondary"
								onClick={() => handleDownloadAll("pdf")}
								disabled={loading}
							>
								{loading ? "Downloading..." : "Download as PDF"}
							</Button>
						</div>
						<p className="text-xs text-gray-500 mt-2">
							ZIP contains individual PNG files. PDF contains all
							QR codes in a single document.
						</p>
					</div>

					<div className="border-t pt-4">
						<h4 className="text-sm font-medium text-gray-700 mb-2">
							Regenerate All QR Codes
						</h4>
						<Button
							variant="danger"
							onClick={() => setShowConfirmRegenerate(true)}
							disabled={loading}
						>
							Regenerate All QR Codes
						</Button>
						<p className="text-xs text-red-600 mt-2">
							⚠️ Warning: This will invalidate ALL existing QR
							codes. Any printed materials will stop working.
						</p>
					</div>
				</div>

				{/* Confirm Regenerate Dialog */}
				<ConfirmDialog
					isOpen={showConfirmRegenerate}
					onClose={() => setShowConfirmRegenerate(false)}
					onConfirm={handleBulkRegenerate}
					title="Regenerate All QR Codes"
					message="Are you sure you want to regenerate ALL QR codes? This will invalidate all current QR codes and any printed materials will no longer work. This action cannot be undone."
					confirmText="Regenerate All"
					variant="danger"
				/>
			</div>
		</Card>
	);
};

export default BulkQROperations;
