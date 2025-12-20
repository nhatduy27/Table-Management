import { useState, useEffect } from "react";
import { Plus, Search, Filter, Download, RefreshCw } from "lucide-react";
import { tableAPI, qrAPI } from "../utils/api";
import { downloadAllQRCodes } from "../utils/downloadFile";
import TableCard from "./TableCard";
import TableForm from "./TableForm";

const TableList = () => {
	const [tables, setTables] = useState([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState(null);
	const [showForm, setShowForm] = useState(false);
	const [editingTable, setEditingTable] = useState(null);

	// Filters
	const [searchTerm, setSearchTerm] = useState("");
	const [statusFilter, setStatusFilter] = useState("all");
	const [locationFilter, setLocationFilter] = useState("all");
	const [sortBy, setSortBy] = useState("created_at");

	// Loading states
	const [bulkRegenerating, setBulkRegenerating] = useState(false);
	const [downloadingAll, setDownloadingAll] = useState(false);

	useEffect(() => {
		fetchTables();
	}, []);

	const fetchTables = async () => {
		try {
			setLoading(true);
			setError(null);
			const response = await tableAPI.getAll();
			setTables(response.data.data || []);
		} catch (err) {
			setError(err.response?.data?.message || "Failed to fetch tables");
			console.error("Error fetching tables:", err);
		} finally {
			setLoading(false);
		}
	};

	const handleCreateTable = () => {
		setEditingTable(null);
		setShowForm(true);
	};

	const handleEditTable = (table) => {
		setEditingTable(table);
		setShowForm(true);
	};

	const handleCloseForm = () => {
		setShowForm(false);
		setEditingTable(null);
	};

	const handleFormSuccess = () => {
		setShowForm(false);
		setEditingTable(null);
		fetchTables();
	};

	const handleBulkRegenerate = async () => {
		if (
			!confirm(
				"Are you sure you want to regenerate ALL QR codes? This will invalidate all existing QR codes."
			)
		) {
			return;
		}

		try {
			setBulkRegenerating(true);
			await qrAPI.regenerateAll();
			alert("All QR codes regenerated successfully!");
			fetchTables();
		} catch (err) {
			alert(
				err.response?.data?.message || "Failed to regenerate QR codes"
			);
		} finally {
			setBulkRegenerating(false);
		}
	};

	const handleDownloadAll = async (format) => {
		try {
			setDownloadingAll(true);
			const result = await downloadAllQRCodes(qrAPI, format);
			if (result.success) {
				alert(
					`All QR codes downloaded successfully as ${format.toUpperCase()}!`
				);
			} else {
				alert("Failed to download QR codes: " + result.error);
			}
		} catch (error) {
			console.error("Download error:", error);
			alert("Failed to download QR codes");
		} finally {
			setDownloadingAll(false);
		}
	};

	// Filter and sort tables
	const filteredTables = tables
		.filter((table) => {
			const matchesSearch =
				table.table_number
					.toLowerCase()
					.includes(searchTerm.toLowerCase()) ||
				(table.location || "")
					.toLowerCase()
					.includes(searchTerm.toLowerCase());
			const matchesStatus =
				statusFilter === "all" || table.status === statusFilter;
			const matchesLocation =
				locationFilter === "all" || table.location === locationFilter;
			return matchesSearch && matchesStatus && matchesLocation;
		})
		.sort((a, b) => {
			switch (sortBy) {
				case "table_number":
					return a.table_number.localeCompare(b.table_number);
				case "capacity":
					return b.capacity - a.capacity;
				case "created_at":
				default:
					return new Date(b.created_at) - new Date(a.created_at);
			}
		});

	// Get unique locations for filter
	const locations = [
		...new Set(tables.map((t) => t.location).filter(Boolean)),
	];

	if (loading) {
		return (
			<div className="flex items-center justify-center h-64">
				<div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
			</div>
		);
	}

	return (
		<div className="max-w-7xl mx-auto px-4 py-8">
			{/* Header */}
			<div className="mb-8">
				<h1 className="text-3xl font-bold text-gray-900 mb-2">
					Table Management
				</h1>
				<p className="text-gray-600">
					Manage your restaurant tables and QR codes
				</p>
			</div>

			{error && (
				<div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
					{error}
				</div>
			)}

			{/* Actions Bar */}
			<div className="mb-6 flex flex-wrap gap-4 items-center justify-between">
				<button
					onClick={handleCreateTable}
					className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
				>
					<Plus size={20} />
					Create New Table
				</button>

				<div className="flex gap-2">
					<button
						onClick={handleBulkRegenerate}
						disabled={bulkRegenerating}
						className="flex items-center gap-2 bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700 transition disabled:opacity-50"
					>
						<RefreshCw
							size={20}
							className={bulkRegenerating ? "animate-spin" : ""}
						/>
						{bulkRegenerating
							? "Regenerating..."
							: "Regenerate All QR"}
					</button>

					<div className="relative group">
						<button
							disabled={downloadingAll}
							className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition disabled:opacity-50"
						>
							<Download size={20} />
							{downloadingAll ? "Downloading..." : "Download All"}
						</button>
						<div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 invisible group-hover:visible z-10">
							<button
								onClick={() => handleDownloadAll("zip")}
								className="w-full text-left px-4 py-2 hover:bg-gray-100 rounded-t-lg"
							>
								Download as ZIP
							</button>
							<button
								onClick={() => handleDownloadAll("pdf")}
								className="w-full text-left px-4 py-2 hover:bg-gray-100 rounded-b-lg"
							>
								Download as PDF
							</button>
						</div>
					</div>
				</div>
			</div>

			{/* Filters */}
			<div className="mb-6 bg-white p-4 rounded-lg shadow-sm border border-gray-200">
				<div className="flex items-center gap-2 mb-4">
					<Filter size={20} className="text-gray-500" />
					<h2 className="font-semibold text-gray-700">Filters</h2>
				</div>

				<div className="grid grid-cols-1 md:grid-cols-4 gap-4">
					{/* Search */}
					<div className="relative">
						<Search
							size={20}
							className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
						/>
						<input
							type="text"
							placeholder="Search tables..."
							value={searchTerm}
							onChange={(e) => setSearchTerm(e.target.value)}
							className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
						/>
					</div>

					{/* Status Filter */}
					<select
						value={statusFilter}
						onChange={(e) => setStatusFilter(e.target.value)}
						className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
					>
						<option value="all">All Status</option>
						<option value="active">Active</option>
						<option value="inactive">Inactive</option>
					</select>

					{/* Location Filter */}
					<select
						value={locationFilter}
						onChange={(e) => setLocationFilter(e.target.value)}
						className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
					>
						<option value="all">All Locations</option>
						{locations.map((location) => (
							<option key={location} value={location}>
								{location}
							</option>
						))}
					</select>

					{/* Sort By */}
					<select
						value={sortBy}
						onChange={(e) => setSortBy(e.target.value)}
						className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
					>
						<option value="created_at">Newest First</option>
						<option value="table_number">Table Number</option>
						<option value="capacity">Capacity</option>
					</select>
				</div>
			</div>

			{/* Results Count */}
			<div className="mb-4 text-sm text-gray-600">
				Showing {filteredTables.length} of {tables.length} tables
			</div>

			{/* Tables Grid */}
			{filteredTables.length === 0 ? (
				<div className="text-center py-12 bg-white rounded-lg shadow-sm border border-gray-200">
					<p className="text-gray-500 text-lg">No tables found</p>
					<button
						onClick={handleCreateTable}
						className="mt-4 text-blue-600 hover:text-blue-700 font-medium"
					>
						Create your first table
					</button>
				</div>
			) : (
				<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
					{filteredTables.map((table) => (
						<TableCard
							key={table.id}
							table={table}
							onEdit={handleEditTable}
							onRefresh={fetchTables}
						/>
					))}
				</div>
			)}

			{/* Table Form Modal */}
			{showForm && (
				<TableForm
					table={editingTable}
					onClose={handleCloseForm}
					onSuccess={handleFormSuccess}
				/>
			)}
		</div>
	);
};

export default TableList;
