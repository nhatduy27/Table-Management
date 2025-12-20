import { useState, useEffect } from "react";
import { X } from "lucide-react";
import { tableAPI } from "../utils/api";

const TableForm = ({ table, onClose, onSuccess }) => {
	const [formData, setFormData] = useState({
		table_number: "",
		capacity: "",
		location: "",
		description: "",
		status: "active",
	});

	const [errors, setErrors] = useState({});
	const [loading, setLoading] = useState(false);

	const predefinedLocations = [
		"Indoor",
		"Outdoor",
		"Patio",
		"VIP Room",
		"Terrace",
		"Garden",
	];

	useEffect(() => {
		if (table) {
			setFormData({
				table_number: table.table_number || "",
				capacity: table.capacity || "",
				location: table.location || "",
				description: table.description || "",
				status: table.status || "active",
			});
		}
	}, [table]);

	const handleChange = (e) => {
		const { name, value } = e.target;
		setFormData((prev) => ({ ...prev, [name]: value }));
		// Clear error for this field
		if (errors[name]) {
			setErrors((prev) => ({ ...prev, [name]: null }));
		}
	};

	const validateForm = () => {
		const newErrors = {};

		if (!formData.table_number.trim()) {
			newErrors.table_number = "Table number is required";
		} else if (!/^[A-Za-z0-9-_]+$/.test(formData.table_number)) {
			newErrors.table_number =
				"Table number can only contain letters, numbers, hyphens and underscores";
		} else if (formData.table_number.length > 50) {
			newErrors.table_number = "Table number cannot exceed 50 characters";
		}

		if (!formData.capacity) {
			newErrors.capacity = "Capacity is required";
		} else {
			const capacity = parseInt(formData.capacity);
			if (isNaN(capacity) || capacity < 1 || capacity > 20) {
				newErrors.capacity = "Capacity must be between 1 and 20";
			}
		}

		if (formData.location && formData.location.length > 100) {
			newErrors.location = "Location cannot exceed 100 characters";
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
			setErrors({});

			const submitData = {
				...formData,
				capacity: parseInt(formData.capacity),
			};

			if (table) {
				// Update existing table
				await tableAPI.update(table.id, submitData);
			} else {
				// Create new table
				await tableAPI.create(submitData);
			}

			onSuccess();
		} catch (err) {
			console.error("Error saving table:", err);

			if (err.response?.data?.errors) {
				// Handle validation errors from backend
				const backendErrors = {};
				err.response.data.errors.forEach((error) => {
					backendErrors[error.field] = error.message;
				});
				setErrors(backendErrors);
			} else {
				setErrors({
					submit:
						err.response?.data?.message || "Failed to save table",
				});
			}
		} finally {
			setLoading(false);
		}
	};

	return (
		<div className="fixed inset-0 modal-backdrop flex items-center justify-center z-50 p-4">
			<div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
				{/* Header */}
				<div className="flex items-center justify-between p-6 border-b border-gray-200">
					<div>
						<h2 className="text-2xl font-bold text-gray-900">
							{table ? "Edit Table" : "Create New Table"}
						</h2>
						<p className="text-gray-500 text-sm mt-1">
							{table
								? "Update table details"
								: "Add a new table to your restaurant"}
						</p>
					</div>
					<button
						onClick={onClose}
						className="w-10 h-10 rounded-lg border border-gray-300 flex items-center justify-center text-gray-400 hover:text-gray-600 hover:bg-gray-50 transition"
					>
						<X size={20} />
					</button>
				</div>

				{/* Form */}
				<form onSubmit={handleSubmit} className="p-6 space-y-5">
					{/* General Error */}
					{errors.submit && (
						<div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
							<span className="font-medium">{errors.submit}</span>
						</div>
					)}

					{/* Table Number */}
					<div>
						<label
							htmlFor="table_number"
							className="block text-sm font-medium text-gray-700 mb-2"
						>
							Table Number <span className="text-red-500">*</span>
						</label>
						<input
							type="text"
							id="table_number"
							name="table_number"
							value={formData.table_number}
							onChange={handleChange}
							placeholder="e.g., T01, Table-A1"
							className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
								errors.table_number
									? "border-red-400"
									: "border-gray-300"
							}`}
						/>
						{errors.table_number && (
							<p className="mt-2 text-sm text-red-600">
								{errors.table_number}
							</p>
						)}
					</div>

					{/* Capacity */}
					<div>
						<label
							htmlFor="capacity"
							className="block text-sm font-medium text-gray-700 mb-2"
						>
							Capacity (Number of Seats){" "}
							<span className="text-red-500">*</span>
						</label>
						<input
							type="number"
							id="capacity"
							name="capacity"
							value={formData.capacity}
							onChange={handleChange}
							min="1"
							max="20"
							placeholder="1-20"
							className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
								errors.capacity
									? "border-red-400"
									: "border-gray-300"
							}`}
						/>
						{errors.capacity && (
							<p className="mt-2 text-sm text-red-600">
								{errors.capacity}
							</p>
						)}
					</div>

					{/* Location */}
					<div>
						<label
							htmlFor="location"
							className="block text-sm font-medium text-gray-700 mb-2"
						>
							Location / Zone
						</label>
						<select
							id="location"
							name="location"
							value={formData.location}
							onChange={handleChange}
							className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer ${
								errors.location
									? "border-red-400"
									: "border-gray-300"
							}`}
						>
							<option value="">Select a location</option>
							{predefinedLocations.map((loc) => (
								<option key={loc} value={loc}>
									{loc}
								</option>
							))}
						</select>
						{/* Custom Location Input */}
						<input
							type="text"
							name="location"
							value={formData.location}
							onChange={handleChange}
							placeholder="Or enter custom location"
							className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 mt-3"
						/>
						{errors.location && (
							<p className="mt-2 text-sm text-red-600">
								{errors.location}
							</p>
						)}
					</div>

					{/* Description */}
					<div>
						<label
							htmlFor="description"
							className="block text-sm font-medium text-gray-700 mb-2"
						>
							Description
						</label>
						<textarea
							id="description"
							name="description"
							value={formData.description}
							onChange={handleChange}
							rows="3"
							placeholder="Additional notes about this table..."
							className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
						/>
					</div>

					{/* Status */}
					<div>
						<label
							htmlFor="status"
							className="block text-sm font-medium text-gray-700 mb-2"
						>
							Status
						</label>
						<select
							id="status"
							name="status"
							value={formData.status}
							onChange={handleChange}
							className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
						>
							<option value="active">Active</option>
							<option value="inactive">Inactive</option>
						</select>
					</div>

					{/* Actions */}
					<div className="flex gap-4 pt-5 border-t border-gray-200">
						<button
							type="button"
							onClick={onClose}
							className="flex-1 px-5 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition font-medium"
						>
							Cancel
						</button>
						<button
							type="submit"
							disabled={loading}
							className="flex-1 px-5 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium disabled:opacity-50"
						>
							{loading
								? "Saving..."
								: table
								? "Update Table"
								: "Create Table"}
						</button>
					</div>
				</form>
			</div>
		</div>
	);
};

export default TableForm;
