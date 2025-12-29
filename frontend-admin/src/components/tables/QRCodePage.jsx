import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import tableService from "../../services/tableService";
import Button from "../common/Button";
import Loading from "../common/Loading";
import Alert from "../common/Alert";
import QRCodeManagement from "./QRCodeManagement";

const QRCodePage = () => {
	const navigate = useNavigate();
	const { id } = useParams();
	const [table, setTable] = useState(null);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState(null);

	useEffect(() => {
		fetchTable();
	}, [id]);

	const fetchTable = async () => {
		try {
			setLoading(true);
			setError(null);
			const response = await tableService.getTableById(id);
			setTable(response.data);
		} catch (err) {
			setError(err.message || "Failed to load table");
		} finally {
			setLoading(false);
		}
	};

	if (loading) {
		return <Loading size="lg" text="Loading table information..." />;
	}

	if (error || !table) {
		return (
			<div className="container mx-auto px-4 py-8">
				<Alert
					type="error"
					message={error || "Table not found"}
					onClose={() => setError(null)}
				/>
				<Button onClick={() => navigate("/tables")}>
					Back to Tables
				</Button>
			</div>
		);
	}

	return (
		<div className="container mx-auto px-4 py-8 max-w-4xl">
			{/* Header */}
			<div className="mb-6">
				<div className="flex items-center gap-2 mb-2">
					<Button
						variant="outline"
						size="sm"
						onClick={() => navigate("/tables")}
					>
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
								d="M15 19l-7-7 7-7"
							/>
						</svg>
					</Button>
					<h1 className="text-3xl font-bold text-gray-900">
						QR Code Management
					</h1>
				</div>
				<p className="text-gray-600">
					Manage QR code for Table {table.table_number}
				</p>
			</div>

			{/* QR Code Management Component */}
			<QRCodeManagement table={table} onUpdate={fetchTable} />
		</div>
	);
};

export default QRCodePage;
