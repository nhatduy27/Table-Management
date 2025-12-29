import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import tableService from "../../services/tableService";
import Button from "../common/Button";
import Input from "../common/Input";
import Select from "../common/Select";
import Card from "../common/Card";
import Loading from "../common/Loading";
import Alert from "../common/Alert";

const LOCATION_OPTIONS = [
	{ value: "", label: "Select location" },
	{ value: "Indoor", label: "Indoor" },
	{ value: "Outdoor", label: "Outdoor" },
	{ value: "Patio", label: "Patio" },
	{ value: "VIP Room", label: "VIP Room" },
	{ value: "Bar Area", label: "Bar Area" },
	{ value: "Garden", label: "Garden" },
];

const STATUS_OPTIONS = [
	{ value: "active", label: "Active" },
	{ value: "inactive", label: "Inactive" },
];

const TableForm = () => {
	const navigate = useNavigate();
	const { id } = useParams();
	const isEditMode = !!id;

	const [formData, setFormData] = useState({
		table_number: "",
		capacity: "",
		location: "",
		description: "",
		status: "active",
	});

	const [errors, setErrors] = useState({});
	const [loading, setLoading] = useState(false);
	const [fetchLoading, setFetchLoading] = useState(false);
	const [error, setError] = useState(null);
	const [success, setSuccess] = useState(null);

	// Fetch table data if in edit mode
	useEffect(() => {
		if (isEditMode) {
			fetchTable();
		}
	}, [id]);

	const fetchTable = async () => {
		try {
			setFetchLoading(true);
			setError(null);
			const response = await tableService.getTableById(id);
			const table = response.data;
			setFormData({
				table_number: table.table_number || "",
				capacity: table.capacity || "",
				location: table.location || "",
				description: table.description || "",
				status: table.status || "active",
			});
		} catch (err) {
			setError(err.message || "Failed to load table");
		} finally {
			setFetchLoading(false);
		}
	};

	const handleChange = (e) => {
		const { name, value } = e.target;
		setFormData((prev) => ({
			...prev,
			[name]: value,
		}));
		// Clear error for this field when user types
		if (errors[name]) {
			setErrors((prev) => ({
				...prev,
				[name]: "",
			}));
		}
	};

	const validateForm = () => {
		const newErrors = {};

		// Table number validation
		if (!formData.table_number.trim()) {
			newErrors.table_number = "Table number is required";
		} else if (!/^[A-Za-z0-9-_]+$/.test(formData.table_number)) {
			newErrors.table_number =
				"Table number can only contain letters, numbers, hyphens and underscores";
		} else if (formData.table_number.length > 50) {
			newErrors.table_number =
				"Table number must not exceed 50 characters";
		}

		// Capacity validation
		if (!formData.capacity) {
			newErrors.capacity = "Capacity is required";
		} else {
			const capacityNum = parseInt(formData.capacity);
			if (isNaN(capacityNum) || capacityNum < 1) {
				newErrors.capacity = "Capacity must be at least 1";
			} else if (capacityNum > 20) {
				newErrors.capacity = "Capacity cannot exceed 20";
			}
		}

		// Location validation (optional but if provided, check length)
		if (formData.location && formData.location.length > 100) {
			newErrors.location = "Location must not exceed 100 characters";
		}

		setErrors(newErrors);
		return Object.keys(newErrors).length === 0;
	};

	const handleSubmit = async (e) => {
		e.preventDefault();

		if (!validateForm()) {
			return;
		}

		try {
			setLoading(true);
			setError(null);
			setSuccess(null);

			const submitData = {
				...formData,
				capacity: parseInt(formData.capacity),
			};

			if (isEditMode) {
				await tableService.updateTable(id, submitData);
				setSuccess("Table updated successfully");
				setTimeout(() => navigate("/tables"), 1500);
			} else {
				await tableService.createTable(submitData);
				setSuccess("Table created successfully");
				setTimeout(() => navigate("/tables"), 1500);
			}
		} catch (err) {
			setError(
				err.message ||
					`Failed to ${isEditMode ? "update" : "create"} table`
			);
		} finally {
			setLoading(false);
		}
	};

	if (fetchLoading) {
		return <Loading size="lg" text="Loading table details..." />;
	}

	return (
		<div className="container mx-auto px-4 py-8 max-w-3xl">
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
						{isEditMode ? "Edit Table" : "Create New Table"}
					</h1>
				</div>
				<p className="text-gray-600">
					{isEditMode
						? "Update table information and settings"
						: "Add a new table to your restaurant"}
				</p>
			</div>

			{/* Alerts */}
			{error && (
				<Alert
					type="error"
					message={error}
					onClose={() => setError(null)}
				/>
			)}
			{success && <Alert type="success" message={success} />}

			{/* Form */}
			<Card>
				<form onSubmit={handleSubmit}>
					<div className="space-y-6">
						{/* Table Number */}
						<Input
							label="Table Number"
							name="table_number"
							value={formData.table_number}
							onChange={handleChange}
							placeholder="e.g., T1, A-01, Table-001"
							error={errors.table_number}
							required
							disabled={loading}
						/>

						{/* Capacity */}
						<Input
							label="Capacity"
							name="capacity"
							type="number"
							value={formData.capacity}
							onChange={handleChange}
							placeholder="Number of seats (1-20)"
							error={errors.capacity}
							required
							min="1"
							max="20"
							disabled={loading}
						/>

						{/* Location */}
						<Select
							label="Location"
							name="location"
							value={formData.location}
							onChange={handleChange}
							options={LOCATION_OPTIONS}
							error={errors.location}
							disabled={loading}
						/>

						{/* Description */}
						<div className="mb-4">
							<label className="block text-sm font-medium text-gray-700 mb-1">
								Description
							</label>
							<textarea
								name="description"
								value={formData.description}
								onChange={handleChange}
								placeholder="Optional notes about this table..."
								rows="3"
								disabled={loading}
								className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
							/>
						</div>

						{/* Status */}
						<Select
							label="Status"
							name="status"
							value={formData.status}
							onChange={handleChange}
							options={STATUS_OPTIONS}
							error={errors.status}
							disabled={loading}
							required
						/>

						{/* Info Box */}
						<div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
							<div className="flex gap-3">
								<svg
									className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5"
									fill="currentColor"
									viewBox="0 0 20 20"
								>
									<path
										fillRule="evenodd"
										d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
										clipRule="evenodd"
									/>
								</svg>
								<div className="text-sm text-blue-800">
									<p className="font-medium mb-1">
										Table Guidelines:
									</p>
									<ul className="list-disc list-inside space-y-1">
										<li>
											Table number must be unique and can
											only contain letters, numbers,
											hyphens, and underscores
										</li>
										<li>
											Capacity must be between 1 and 20
											seats
										</li>
										<li>
											Inactive tables will not accept new
											orders
										</li>
										<li>
											QR codes can be generated after
											table creation
										</li>
									</ul>
								</div>
							</div>
						</div>

						{/* Form Actions */}
						<div className="flex justify-end gap-3 pt-4 border-t">
							<Button
								type="button"
								variant="outline"
								onClick={() => navigate("/tables")}
								disabled={loading}
							>
								Cancel
							</Button>
							<Button type="submit" disabled={loading}>
								{loading ? (
									<span className="flex items-center gap-2">
										<div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
										{isEditMode
											? "Updating..."
											: "Creating..."}
									</span>
								) : isEditMode ? (
									"Update Table"
								) : (
									"Create Table"
								)}
							</Button>
						</div>
					</div>
				</form>
			</Card>

			{/* QR Code Section (for edit mode) */}
			{isEditMode && (
				<Card className="mt-6">
					<div className="text-center py-8">
						<svg
							className="w-16 h-16 mx-auto text-gray-400 mb-4"
							fill="none"
							viewBox="0 0 24 24"
							stroke="currentColor"
						>
							<path
								strokeLinecap="round"
								strokeLinejoin="round"
								strokeWidth={2}
								d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z"
							/>
						</svg>
						<h3 className="text-lg font-semibold text-gray-900 mb-2">
							QR Code Management
						</h3>
						<p className="text-gray-600 mb-4">
							QR code feature is under development
						</p>
						<Button variant="secondary" disabled>
							Generate QR Code (Coming Soon)
						</Button>
					</div>
				</Card>
			)}
		</div>
	);
};

export default TableForm;
