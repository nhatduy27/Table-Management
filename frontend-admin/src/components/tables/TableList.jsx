import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import tableService from "../../services/tableService";
import Button from "../common/Button";
import Card from "../common/Card";
import Badge from "../common/Badge";
import Loading from "../common/Loading";
import Alert from "../common/Alert";
import ConfirmDialog from "../common/ConfirmDialog";

const TableList = () => {
	const navigate = useNavigate();
	const [tables, setTables] = useState([]);
	const [filteredTables, setFilteredTables] = useState([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState(null);
	const [success, setSuccess] = useState(null);

	// Filter and sort states
	const [filters, setFilters] = useState({
		status: "all",
		location: "all",
		search: "",
	});
	const [sortBy, setSortBy] = useState("created_at");
	const [sortOrder, setSortOrder] = useState("desc");

	// Confirm dialog state
	const [confirmDialog, setConfirmDialog] = useState({
		isOpen: false,
		tableId: null,
		tableName: "",
		action: null,
	});

	// Fetch tables on component mount
	useEffect(() => {
		fetchTables();
	}, []);

	// Apply filters and sorting when tables or filters change
	useEffect(() => {
		applyFiltersAndSort();
	}, [tables, filters, sortBy, sortOrder]);

	const fetchTables = async () => {
		try {
			setLoading(true);
			setError(null);
			const response = await tableService.getAllTables();
			setTables(response.data || []);
		} catch (err) {
			setError(err.message || "Failed to load tables");
		} finally {
			setLoading(false);
		}
	};

	const applyFiltersAndSort = () => {
		let result = tableService.filterTables(tables, filters);
		result = tableService.sortTables(result, sortBy, sortOrder);
		setFilteredTables(result);
	};

	const handleFilterChange = (e) => {
		const { name, value } = e.target;
		setFilters((prev) => ({ ...prev, [name]: value }));
	};

	const handleSort = (field) => {
		if (sortBy === field) {
			setSortOrder((prev) => (prev === "asc" ? "desc" : "asc"));
		} else {
			setSortBy(field);
			setSortOrder("asc");
		}
	};

	const handleStatusChange = (tableId, tableName, currentStatus) => {
		const newStatus = currentStatus === "active" ? "inactive" : "active";
		setConfirmDialog({
			isOpen: true,
			tableId,
			tableName,
			action: "status",
			newStatus,
		});
	};

	const confirmStatusChange = async () => {
		try {
			const { tableId, newStatus } = confirmDialog;
			await tableService.updateTableStatus(tableId, newStatus);
			setSuccess(`Table status updated to ${newStatus}`);
			fetchTables();
		} catch (err) {
			setError(err.message || "Failed to update table status");
		}
	};

	const handleDownloadAllQR = async (format = "zip") => {
		try {
			setError(null);
			const blob = await tableService.downloadAllQRCodes(format);

			// Create download link
			const url = window.URL.createObjectURL(blob);
			const link = document.createElement("a");
			link.href = url;
			link.download = `all_tables_qr.${format}`;
			document.body.appendChild(link);
			link.click();
			document.body.removeChild(link);
			window.URL.revokeObjectURL(url);

			setSuccess(`All QR codes downloaded as ${format.toUpperCase()}`);
		} catch (err) {
			setError(err.message || "Failed to download QR codes");
		}
	};

	const getLocationOptions = () => {
		const locations = [
			...new Set(tables.map((t) => t.location).filter(Boolean)),
		];
		return locations.map((loc) => ({ value: loc, label: loc }));
	};

	const SortIcon = ({ field }) => {
		if (sortBy !== field) return <span className="text-gray-400">⇅</span>;
		return sortOrder === "asc" ? <span>↑</span> : <span>↓</span>;
	};

	if (loading) return <Loading size="lg" text="Loading tables..." />;

	return (
		<div className="container mx-auto px-4 py-8">
			{/* Header */}
			<div className="flex justify-between items-center mb-6">
				<div>
					<h1 className="text-3xl font-bold text-gray-900">
						Table Management
					</h1>
					<p className="text-gray-600 mt-1">
						Manage restaurant tables and seating arrangements
					</p>
				</div>
				<div className="flex gap-2">
					<Button
						variant="outline"
						onClick={() => handleDownloadAllQR("zip")}
						disabled={tables.filter((t) => t.qr_token).length === 0}
					>
						<span className="flex items-center gap-2">
							<svg
								className="w-5 h-5"
								fill="none"
								viewBox="0 0 24 24"
								stroke="currentColor"
							>
								<path
									strokeLinecap="round"
									strokeLinejoin="round"
									strokeWidth={2}
									d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
								/>
							</svg>
							Download All QR
						</span>
					</Button>
					<Button onClick={() => navigate("/tables/new")}>
						<span className="flex items-center gap-2">
							<svg
								className="w-5 h-5"
								fill="none"
								viewBox="0 0 24 24"
								stroke="currentColor"
							>
								<path
									strokeLinecap="round"
									strokeLinejoin="round"
									strokeWidth={2}
									d="M12 4v16m8-8H4"
								/>
							</svg>
							Add New Table
						</span>
					</Button>
				</div>
			</div>

			{/* Alerts */}
			{error && (
				<Alert
					type="error"
					message={error}
					onClose={() => setError(null)}
				/>
			)}
			{success && (
				<Alert
					type="success"
					message={success}
					onClose={() => setSuccess(null)}
				/>
			)}

			{/* Filters */}
			<Card className="mb-6">
				<div className="grid grid-cols-1 md:grid-cols-4 gap-4">
					{/* Search */}
					<div>
						<label className="block text-sm font-medium text-gray-700 mb-1">
							Search
						</label>
						<input
							type="text"
							name="search"
							value={filters.search}
							onChange={handleFilterChange}
							placeholder="Search tables..."
							className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
						/>
					</div>

					{/* Status Filter */}
					<div>
						<label className="block text-sm font-medium text-gray-700 mb-1">
							Status
						</label>
						<select
							name="status"
							value={filters.status}
							onChange={handleFilterChange}
							className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
						>
							<option value="all">All Status</option>
							<option value="active">Active</option>
							<option value="inactive">Inactive</option>
						</select>
					</div>

					{/* Location Filter */}
					<div>
						<label className="block text-sm font-medium text-gray-700 mb-1">
							Location
						</label>
						<select
							name="location"
							value={filters.location}
							onChange={handleFilterChange}
							className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
						>
							<option value="all">All Locations</option>
							{getLocationOptions().map((opt) => (
								<option key={opt.value} value={opt.value}>
									{opt.label}
								</option>
							))}
						</select>
					</div>

					{/* Clear Filters */}
					<div className="flex items-end">
						<Button
							variant="outline"
							className="w-full"
							onClick={() =>
								setFilters({
									status: "all",
									location: "all",
									search: "",
								})
							}
						>
							Clear Filters
						</Button>
					</div>
				</div>
			</Card>

			{/* Table Stats */}
			<div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
				<Card>
					<div className="text-center">
						<p className="text-gray-600 text-sm">Total Tables</p>
						<p className="text-3xl font-bold text-gray-900">
							{tables.length}
						</p>
					</div>
				</Card>
				<Card>
					<div className="text-center">
						<p className="text-gray-600 text-sm">Active</p>
						<p className="text-3xl font-bold text-green-600">
							{tables.filter((t) => t.status === "active").length}
						</p>
					</div>
				</Card>
				<Card>
					<div className="text-center">
						<p className="text-gray-600 text-sm">Inactive</p>
						<p className="text-3xl font-bold text-red-600">
							{
								tables.filter((t) => t.status === "inactive")
									.length
							}
						</p>
					</div>
				</Card>
				<Card>
					<div className="text-center">
						<p className="text-gray-600 text-sm">Total Capacity</p>
						<p className="text-3xl font-bold text-blue-600">
							{tables.reduce(
								(sum, t) => sum + (t.capacity || 0),
								0
							)}
						</p>
					</div>
				</Card>
			</div>

			{/* Tables List */}
			<Card>
				{filteredTables.length === 0 ? (
					<div className="text-center py-12">
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
								d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
							/>
						</svg>
						<h3 className="text-lg font-medium text-gray-900 mb-2">
							No tables found
						</h3>
						<p className="text-gray-600">
							Get started by creating your first table
						</p>
					</div>
				) : (
					<div className="overflow-x-auto">
						<table className="w-full">
							<thead className="bg-gray-50 border-b">
								<tr>
									<th
										className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
										onClick={() =>
											handleSort("table_number")
										}
									>
										<div className="flex items-center gap-2">
											Table Number
											<SortIcon field="table_number" />
										</div>
									</th>
									<th
										className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
										onClick={() => handleSort("capacity")}
									>
										<div className="flex items-center gap-2">
											Capacity
											<SortIcon field="capacity" />
										</div>
									</th>
									<th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
										Location
									</th>
									<th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
										Status
									</th>
									<th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
										QR Code
									</th>
									<th
										className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
										onClick={() => handleSort("created_at")}
									>
										<div className="flex items-center gap-2">
											Created At
											<SortIcon field="created_at" />
										</div>
									</th>
									<th className="px-6 py-3 text-right text-xs font-medium text-gray-700 uppercase tracking-wider">
										Actions
									</th>
								</tr>
							</thead>
							<tbody className="bg-white divide-y divide-gray-200">
								{filteredTables.map((table) => (
									<tr
										key={table.id}
										className="hover:bg-gray-50"
									>
										<td className="px-6 py-4 whitespace-nowrap">
											<div className="font-medium text-gray-900">
												{table.table_number}
											</div>
											{table.description && (
												<div className="text-sm text-gray-500">
													{table.description}
												</div>
											)}
										</td>
										<td className="px-6 py-4 whitespace-nowrap">
											<div className="flex items-center gap-1">
												<svg
													className="w-4 h-4 text-gray-400"
													fill="none"
													viewBox="0 0 24 24"
													stroke="currentColor"
												>
													<path
														strokeLinecap="round"
														strokeLinejoin="round"
														strokeWidth={2}
														d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
													/>
												</svg>
												<span className="text-gray-900">
													{table.capacity}
												</span>
											</div>
										</td>
										<td className="px-6 py-4 whitespace-nowrap">
											<div className="text-gray-900">
												{table.location || "-"}
											</div>
										</td>
										<td className="px-6 py-4 whitespace-nowrap">
											<Badge
												variant={
													table.status === "active"
														? "success"
														: "danger"
												}
											>
												{table.status}
											</Badge>
										</td>
										<td className="px-6 py-4 whitespace-nowrap">
											<Badge
												variant={
													table.qr_token
														? "info"
														: "default"
												}
											>
												{table.qr_token
													? "Generated"
													: "Not Generated"}
											</Badge>
										</td>
										<td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
											{new Date(
												table.created_at
											).toLocaleDateString()}
										</td>
										<td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
											<div className="flex justify-end gap-2">
												<Button
													size="sm"
													variant="outline"
													onClick={() =>
														navigate(
															`/tables/${table.id}`
														)
													}
												>
													Edit
												</Button>
												<Button
													size="sm"
													variant={
														table.status ===
														"active"
															? "warning"
															: "success"
													}
													onClick={() =>
														handleStatusChange(
															table.id,
															table.table_number,
															table.status
														)
													}
												>
													{table.status === "active"
														? "Deactivate"
														: "Activate"}
												</Button>
												<Button
													size="sm"
													variant="secondary"
													onClick={() =>
														navigate(
															`/tables/${table.id}/qr`
														)
													}
												>
													QR Code
												</Button>
											</div>
										</td>
									</tr>
								))}
							</tbody>
						</table>
					</div>
				)}
			</Card>

			{/* Confirm Dialog */}
			<ConfirmDialog
				isOpen={confirmDialog.isOpen}
				onClose={() =>
					setConfirmDialog({ ...confirmDialog, isOpen: false })
				}
				onConfirm={confirmStatusChange}
				title={`${
					confirmDialog.newStatus === "active"
						? "Activate"
						: "Deactivate"
				} Table`}
				message={`Are you sure you want to ${
					confirmDialog.newStatus === "active"
						? "activate"
						: "deactivate"
				} table "${confirmDialog.tableName}"?`}
				confirmText={
					confirmDialog.newStatus === "active"
						? "Activate"
						: "Deactivate"
				}
				variant={
					confirmDialog.newStatus === "active" ? "info" : "warning"
				}
			/>
		</div>
	);
};

export default TableList;
