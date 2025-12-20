import { saveAs } from "file-saver";

/**
 * Download file from blob
 */
export const downloadBlob = (blob, filename) => {
	saveAs(blob, filename);
};

/**
 * Download QR code as PNG
 */
export const downloadQRCode = async (qrAPI, tableId, tableName) => {
	try {
		const response = await qrAPI.download(tableId, "png");
		const filename = `QR_Table_${tableName}.png`;
		downloadBlob(response.data, filename);
		return { success: true };
	} catch (error) {
		console.error("Error downloading QR code:", error);
		return { success: false, error: error.message };
	}
};

/**
 * Download QR code as PDF
 */
export const downloadQRCodePDF = async (qrAPI, tableId, tableName) => {
	try {
		const response = await qrAPI.download(tableId, "pdf");
		const filename = `QR_Table_${tableName}.pdf`;
		downloadBlob(response.data, filename);
		return { success: true };
	} catch (error) {
		console.error("Error downloading QR code PDF:", error);
		return { success: false, error: error.message };
	}
};

/**
 * Download all QR codes as ZIP
 */
export const downloadAllQRCodes = async (qrAPI, format = "zip") => {
	try {
		const response = await qrAPI.downloadAll(format);
		const filename =
			format === "zip" ? "All_QR_Codes.zip" : "All_QR_Codes.pdf";
		downloadBlob(response.data, filename);
		return { success: true };
	} catch (error) {
		console.error("Error downloading all QR codes:", error);
		return { success: false, error: error.message };
	}
};
