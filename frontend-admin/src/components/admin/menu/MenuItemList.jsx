import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import menuService from "../../../services/menuService";
import Button from "../../common/Button";
import Badge from "../../common/Badge";
import Loading from "../../common/Loading";
import Alert from "../../common/Alert";
import ConfirmDialog from "../../common/ConfirmDialog";

const MenuItemList = () => {
	const navigate = useNavigate(); 
	const [items, setItems] = useState([]);
	const [categories, setCategories] = useState([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState(null);
	const [success, setSuccess] = useState(null);

	// Filter and pagination states
	const [filters, setFilters] = useState({
		category_id: "all",
		status: "all",
		search: "",
	});
	const [sortBy, setSortBy] = useState("created_at");
	const [sortOrder, setSortOrder] = useState("desc");
	const [currentPage, setCurrentPage] = useState(1);
	const itemsPerPage = 4;

	// Confirm dialog state
	const [confirmDialog, setConfirmDialog] = useState({
		isOpen: false,
		itemId: null,
		itemName: "",
	});

	useEffect(() => {
		fetchData();
	}, []);

	const fetchData = async () => {
		try {
			setLoading(true);
			setError(null);
			const [itemsRes, categoriesRes] = await Promise.all([
				menuService.getAllItems(),
				menuService.getCategories(),
			]);
      console.log(itemsRes.data);
			setItems(itemsRes.data || []);
			setCategories(categoriesRes.data || []);
		} catch (err) {
			setError(err.message || "Failed to load menu items");
		} finally {
			setLoading(false);
		}
	};

	// Filter items
	const filteredItems = items.filter((item) => {
		if (item.is_deleted) return false;
		if (
			filters.category_id !== "all" &&
			item.category_id !== filters.category_id
		)
			return false;
		if (filters.status !== "all" && item.status !== filters.status)
			return false;
		if (
			filters.search &&
			!item.name.toLowerCase().includes(filters.search.toLowerCase())
		)
			return false;
		return true;
	});

	// Sort items
	const sortedItems = [...filteredItems].sort((a, b) => {
		let aVal = a[sortBy];
		let bVal = b[sortBy];

		if (sortBy === "name") {
			aVal = aVal?.toLowerCase() || "";
			bVal = bVal?.toLowerCase() || "";
		}

		if (sortBy === "price") {
			aVal = parseFloat(aVal) || 0;
			bVal = parseFloat(bVal) || 0;
		}

		if (sortBy === "created_at") {
			aVal = new Date(aVal);
			bVal = new Date(bVal);
		}

		if (sortOrder === "asc") {
			return aVal > bVal ? 1 : -1;
		}
		return aVal < bVal ? 1 : -1;
	});

	// Paginate
	const totalPages = Math.ceil(sortedItems.length / itemsPerPage);
	const paginatedItems = sortedItems.slice(
		(currentPage - 1) * itemsPerPage,
		currentPage * itemsPerPage
	);

	const handleFilterChange = (e) => {
		const { name, value } = e.target;
		setFilters((prev) => ({ ...prev, [name]: value }));
		setCurrentPage(1);
	};

	const handleSort = (field) => {
		if (sortBy === field) {
			setSortOrder((prev) => (prev === "asc" ? "desc" : "asc"));
		} else {
			setSortBy(field);
			setSortOrder("asc");
		}
	};

	const handleDeleteItem = (item) => {
		setConfirmDialog({
			isOpen: true,
			itemId: item.id,
			itemName: item.name,
		});
	};

	const confirmDelete = async () => {
		try {
			await menuService.deleteItem(confirmDialog.itemId);
			setSuccess("Menu item deleted successfully");
			fetchData();
		} catch (err) {
			setError(err.message || "Failed to delete menu item");
		} finally {
			setConfirmDialog({ isOpen: false, itemId: null, itemName: "" });
		}
	};

	const getCategoryName = (categoryId) => {
		const category = categories.find((c) => c.id === categoryId);
		return category ? category.name : "-";
	};

	const getStatusBadge = (status) => {
		switch (status) {
			case "available":
				return <Badge variant="success">Available</Badge>;
			case "unavailable":
				return <Badge variant="secondary">Unavailable</Badge>;
			case "sold_out":
				return <Badge variant="danger">Sold Out</Badge>;
			default:
				return <Badge variant="secondary">{status}</Badge>;
		}
	};

	const SortIcon = ({ field }) => {
		if (sortBy !== field)
			return <span className="text-gray-400 ml-1">⇅</span>;
		return sortOrder === "asc" ? (
			<span className="ml-1">↑</span>
		) : (
			<span className="ml-1">↓</span>
		);
	};

	const formatPrice = (price) => {
		return new Intl.NumberFormat("en-US", {
			style: "currency",
			currency: "USD",
		}).format(price);
	};

	if (loading) return <Loading size="lg" text="Loading menu items..." />;

	return (
		<div className="container mx-auto px-4 py-8">
			{/* Header */}
			<div className="flex justify-between items-center mb-6">
				<div>
					<h1 className="text-3xl font-bold text-gray-900">
						Menu Items
					</h1>
					<p className="text-gray-600 mt-1">
						Manage your restaurant's menu items
					</p>
				</div>
				<Button onClick={() => navigate("/admin/menu/items/new")}>
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
						Add Item
					</span>
				</Button>
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
			<div className="bg-white rounded-lg shadow p-4 mb-6">
				<div className="grid grid-cols-1 md:grid-cols-4 gap-4">
					{/* Search */}
					<div>
						<label className="block text-sm font-medium text-gray-700 mb-1">
							Search
						</label>
						<div className="relative">
							<svg
								className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400"
								fill="none"
								viewBox="0 0 24 24"
								stroke="currentColor"
							>
								<path
									strokeLinecap="round"
									strokeLinejoin="round"
									strokeWidth={2}
									d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
								/>
							</svg>
							<input
								type="text"
								name="search"
								value={filters.search}
								onChange={handleFilterChange}
								placeholder="Search items..."
								className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
							/>
						</div>
					</div>

					{/* Category Filter */}
					<div>
						<label className="block text-sm font-medium text-gray-700 mb-1">
							Category
						</label>
						<select
							name="category_id"
							value={filters.category_id}
							onChange={handleFilterChange}
							className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
						>
							<option value="all">All Categories</option>
							{categories.map((cat) => (
								<option key={cat.id} value={cat.id}>
									{cat.name}
								</option>
							))}
						</select>
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
							<option value="all">All Statuses</option>
							<option value="available">Available</option>
							<option value="unavailable">Unavailable</option>
							<option value="sold_out">Sold Out</option>
						</select>
					</div>

					{/* Sort */}
					<div>
						<label className="block text-sm font-medium text-gray-700 mb-1">
							Sort By
						</label>
						<div className="flex gap-2">
							<button
								onClick={() => handleSort("created_at")}
								className={`flex-1 px-3 py-2 rounded text-sm ${
									sortBy === "created_at"
										? "bg-blue-100 text-blue-700"
										: "bg-gray-100 text-gray-600"
								}`}
							>
								Date <SortIcon field="created_at" />
							</button>
							<button
								onClick={() => handleSort("price")}
								className={`flex-1 px-3 py-2 rounded text-sm ${
									sortBy === "price"
										? "bg-blue-100 text-blue-700"
										: "bg-gray-100 text-gray-600"
								}`}
							>
								Price <SortIcon field="price" />
							</button>
							<button
								onClick={() => handleSort("name")}
								className={`flex-1 px-3 py-2 rounded text-sm ${
									sortBy === "name"
										? "bg-blue-100 text-blue-700"
										: "bg-gray-100 text-gray-600"
								}`}
							>
								Name <SortIcon field="name" />
							</button>
						</div>
					</div>
				</div>
			</div>

			{/* Items Table */}
			{paginatedItems.length === 0 ? (
				<div className="bg-white rounded-lg shadow p-8 text-center">
					<svg
						className="w-16 h-16 mx-auto text-gray-300 mb-4"
						fill="none"
						viewBox="0 0 24 24"
						stroke="currentColor"
					>
						<path
							strokeLinecap="round"
							strokeLinejoin="round"
							strokeWidth={1.5}
							d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
						/>
					</svg>
					<h3 className="text-lg font-medium text-gray-900 mb-1">
						No Menu Items Found
					</h3>
					<p className="text-gray-500 mb-4">
						{filters.search ||
						filters.category_id !== "all" ||
						filters.status !== "all"
							? "Try adjusting your filters."
							: "Get started by creating your first menu item."}
					</p>
					{!filters.search &&
						filters.category_id === "all" &&
						filters.status === "all" && (
							<Button
								onClick={() =>
									navigate("/admin/menu/items/new")
								}
							>
								Add Menu Item
							</Button>
						)}
				</div>
			) : (
				<div className="bg-white rounded-lg shadow overflow-hidden">
					<table className="min-w-full divide-y divide-gray-200">
						<thead className="bg-gray-50">
							<tr>
								<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
									Image
								</th>
								<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
									Name
								</th>
								<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
									Category
								</th>
								<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
									Price
								</th>
								<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
									Status
								</th>
								<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
									Chef Pick
								</th>
								<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
									Created
								</th>
								<th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
									Actions
								</th>
							</tr>
						</thead>
						<tbody className="bg-white divide-y divide-gray-200">
							{paginatedItems.map((item) => (
								<tr key={item.id} className="hover:bg-gray-50">
									<td className="px-6 py-4 whitespace-nowrap">
										<div className="w-12 h-12 bg-gray-200 rounded-lg flex items-center justify-center overflow-hidden">
                     
											{item.photos &&
											item.photos.length > 0 ? (
												<img
													src={
														item.photos.find(
															(p) => p.is_primary || p.isPrimary
														)?.url ||
														item.photos[0]?.url
													}
													alt={item.name}
													className="w-full h-full object-cover"
												/>
											) : (
												<svg
													className="w-6 h-6 text-gray-400"
													fill="none"
													viewBox="0 0 24 24"
													stroke="currentColor"
												>
													<path
														strokeLinecap="round"
														strokeLinejoin="round"
														strokeWidth={2}
														d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
													/>
												</svg>
											)}
										</div>
									</td>
									<td className="px-6 py-4 whitespace-nowrap">
										<div className="text-sm font-medium text-gray-900">
											{item.name}
										</div>
										{item.description && (
											<div className="text-xs text-gray-500 truncate max-w-xs">
												{item.description}
											</div>
										)}
									</td>
									<td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
										{getCategoryName(item.category_id)}
									</td>
									<td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
										{formatPrice(item.price)}
									</td>
									<td className="px-6 py-4 whitespace-nowrap">
										{getStatusBadge(item.status)}
									</td>
									<td className="px-6 py-4 whitespace-nowrap text-center">
										{item.is_chef_recommended ? (
											<span
												className="text-yellow-500"
												title="Chef's Recommendation"
											>
												⭐
											</span>
										) : (
											<span className="text-gray-300">
												-
											</span>
										)}
									</td>
									<td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
										{new Date(
											item.created_at
										).toLocaleDateString()}
									</td>
									<td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
										<div className="flex justify-end gap-2">
											<button
												onClick={() =>
													navigate(
														`/admin/menu/items/${item.id}`
													)
												}
												className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
												title="Edit"
											>
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
														d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
													/>
												</svg>
											</button>
											<button
												onClick={() =>
													handleDeleteItem(item)
												}
												className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
												title="Delete"
											>
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
														d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
													/>
												</svg>
											</button>
										</div>
									</td>
								</tr>
							))}
						</tbody>
					</table>

					{/* Pagination */}
					{totalPages > 1 && (
						<div className="bg-gray-50 px-6 py-3 flex items-center justify-between border-t">
							<div className="text-sm text-gray-500">
								Showing {(currentPage - 1) * itemsPerPage + 1}{" "}
								to{" "}
								{Math.min(
									currentPage * itemsPerPage,
									sortedItems.length
								)}{" "}
								of {sortedItems.length} items
							</div>
							<div className="flex gap-2">
								<button
									onClick={() =>
										setCurrentPage((p) =>
											Math.max(1, p - 1)
										)
									}
									disabled={currentPage === 1}
									className="px-3 py-1 border rounded text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-white"
								>
									Previous
								</button>
								{Array.from(
									{ length: totalPages },
									(_, i) => i + 1
								)
									.filter(
										(p) =>
											p === 1 ||
											p === totalPages ||
											(p >= currentPage - 1 &&
												p <= currentPage + 1)
									)
									.map((page, idx, arr) => (
										<React.Fragment key={page}>
											{idx > 0 &&
												arr[idx - 1] !== page - 1 && (
													<span className="px-2 py-1 text-gray-400">
														...
													</span>
												)}
											<button
												onClick={() =>
													setCurrentPage(page)
												}
												className={`px-3 py-1 border rounded text-sm ${
													currentPage === page
														? "bg-blue-600 text-white border-blue-600"
														: "hover:bg-white"
												}`}
											>
												{page}
											</button>
										</React.Fragment>
									))}
								<button
									onClick={() =>
										setCurrentPage((p) =>
											Math.min(totalPages, p + 1)
										)
									}
									disabled={currentPage === totalPages}
									className="px-3 py-1 border rounded text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-white"
								>
									Next
								</button>
							</div>
						</div>
					)}
				</div>
			)}

			{/* Confirm Dialog */}
			<ConfirmDialog
				isOpen={confirmDialog.isOpen}
				onClose={() =>
					setConfirmDialog({
						isOpen: false,
						itemId: null,
						itemName: "",
					})
				}
				onConfirm={confirmDelete}
				title="Delete Menu Item"
				message={`Are you sure you want to delete "${confirmDialog.itemName}"? This action cannot be undone.`}
				confirmText="Delete"
				confirmVariant="danger"
			/>
		</div>
	);
};

export default MenuItemList;
