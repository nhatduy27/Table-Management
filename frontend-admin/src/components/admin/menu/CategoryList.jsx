import React, { useState, useEffect } from "react";
import menuService from "../../../services/menuService";
import Button from "../../common/Button";
import Badge from "../../common/Badge";
import Loading from "../../common/Loading";
import Alert from "../../common/Alert";
import ConfirmDialog from "../../common/ConfirmDialog";
import CategoryForm from "./CategoryForm";

const CategoryList = () => {
	const [categories, setCategories] = useState([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState(null);
	const [success, setSuccess] = useState(null);
	const [sortBy, setSortBy] = useState("display_order");
	const [sortOrder, setSortOrder] = useState("asc");

	// Modal states
	const [isFormOpen, setIsFormOpen] = useState(false);
	const [editingCategory, setEditingCategory] = useState(null);

	// Confirm dialog state
	const [confirmDialog, setConfirmDialog] = useState({
		isOpen: false,
		categoryId: null,
		categoryName: "",
		action: null,
	});

	useEffect(() => {
		fetchCategories();
	}, []);

	const fetchCategories = async () => {
		try {
			setLoading(true);
			setError(null);
			const response = await menuService.getCategories();
			setCategories(response.data || []);
		} catch (err) {
			setError(err.message || "Failed to load categories");
		} finally {
			setLoading(false);
		}
	};

	const sortedCategories = [...categories].sort((a, b) => {
		let aVal = a[sortBy];
		let bVal = b[sortBy];

		if (sortBy === "name") {
			aVal = aVal?.toLowerCase() || "";
			bVal = bVal?.toLowerCase() || "";
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

	const handleSort = (field) => {
		if (sortBy === field) {
			setSortOrder((prev) => (prev === "asc" ? "desc" : "asc"));
		} else {
			setSortBy(field);
			setSortOrder("asc");
		}
	};

	const handleAddCategory = () => {
		setEditingCategory(null);
		setIsFormOpen(true);
	};

	const handleEditCategory = (category) => {
		setEditingCategory(category);
		setIsFormOpen(true);
	};

	const handleDeleteCategory = (category) => {
		setConfirmDialog({
			isOpen: true,
			categoryId: category.id,
			categoryName: category.name,
			action: "delete",
		});
	};

	const handleStatusChange = (category) => {
		const newStatus = category.status === "active" ? "inactive" : "active";
		setConfirmDialog({
			isOpen: true,
			categoryId: category.id,
			categoryName: category.name,
			action: "status",
			newStatus,
		});
	};

	const confirmAction = async () => {
		try {
			const { categoryId, action, newStatus } = confirmDialog;

			if (action === "delete") {
				await menuService.deleteCategory(categoryId);
				setSuccess("Category deleted successfully");
			} else if (action === "status") {
				await menuService.updateCategoryStatus(categoryId, newStatus);
				setSuccess(`Category status updated to ${newStatus}`);
			}

			fetchCategories();
		} catch (err) {
			setError(err.message || "Failed to perform action");
		} finally {
			setConfirmDialog({
				isOpen: false,
				categoryId: null,
				categoryName: "",
				action: null,
			});
		}
	};

	const handleFormSuccess = () => {
		setIsFormOpen(false);
		setEditingCategory(null);
		fetchCategories();
		setSuccess(
			editingCategory
				? "Category updated successfully"
				: "Category created successfully"
		);
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

	const getStatusBadge = (status) => {
		return status === "active" ? (
			<Badge variant="success">Active</Badge>
		) : (
			<Badge variant="secondary">Inactive</Badge>
		);
	};

	if (loading) return <Loading size="lg" text="Loading categories..." />;

	return (
		<div className="container mx-auto px-4 py-8">
			{/* Header */}
			<div className="flex justify-between items-center mb-6">
				<div>
					<h1 className="text-3xl font-bold text-gray-900">
						Menu Categories
					</h1>
					<p className="text-gray-600 mt-1">
						Manage menu categories and their display order
					</p>
				</div>
				<Button onClick={handleAddCategory}>
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
						Add Category
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

			{/* Sort Options */}
			<div className="mb-4 flex items-center gap-4">
				<span className="text-gray-600 text-sm">Sort by:</span>
				<div className="flex gap-2">
					<button
						onClick={() => handleSort("display_order")}
						className={`px-3 py-1 rounded text-sm ${
							sortBy === "display_order"
								? "bg-blue-100 text-blue-700"
								: "bg-gray-100 text-gray-600"
						}`}
					>
						Display Order <SortIcon field="display_order" />
					</button>
					<button
						onClick={() => handleSort("name")}
						className={`px-3 py-1 rounded text-sm ${
							sortBy === "name"
								? "bg-blue-100 text-blue-700"
								: "bg-gray-100 text-gray-600"
						}`}
					>
						Name <SortIcon field="name" />
					</button>
					<button
						onClick={() => handleSort("created_at")}
						className={`px-3 py-1 rounded text-sm ${
							sortBy === "created_at"
								? "bg-blue-100 text-blue-700"
								: "bg-gray-100 text-gray-600"
						}`}
					>
						Created Date <SortIcon field="created_at" />
					</button>
				</div>
			</div>

			{/* Categories Table */}
			{sortedCategories.length === 0 ? (
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
							d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
						/>
					</svg>
					<h3 className="text-lg font-medium text-gray-900 mb-1">
						No Categories Found
					</h3>
					<p className="text-gray-500 mb-4">
						Get started by creating your first category.
					</p>
					<Button onClick={handleAddCategory}>Add Category</Button>
				</div>
			) : (
				<div className="bg-white rounded-lg shadow overflow-hidden">
					<table className="min-w-full divide-y divide-gray-200">
						<thead className="bg-gray-50">
							<tr>
								<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
									Order
								</th>
								<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
									Name
								</th>
								<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
									Description
								</th>
								<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
									Status
								</th>
								<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
									Items
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
							{sortedCategories.map((category) => (
								<tr
									key={category.id}
									className="hover:bg-gray-50"
								>
									<td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
										{category.display_order}
									</td>
									<td className="px-6 py-4 whitespace-nowrap">
										<div className="text-sm font-medium text-gray-900">
											{category.name}
										</div>
									</td>
									<td className="px-6 py-4">
										<div className="text-sm text-gray-500 truncate max-w-xs">
											{category.description || "-"}
										</div>
									</td>
									<td className="px-6 py-4 whitespace-nowrap">
										{getStatusBadge(category.status)}
									</td>
									<td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
										{category.items?.length ||
											category.item_count ||
											0}
									</td>
									<td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
										{new Date(
											category.created_at
										).toLocaleDateString()}
									</td>
									<td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
										<div className="flex justify-end gap-2">
											<button
												onClick={() =>
													handleStatusChange(category)
												}
												className={`p-2 rounded-lg transition-colors ${
													category.status === "active"
														? "text-yellow-600 hover:bg-yellow-50"
														: "text-green-600 hover:bg-green-50"
												}`}
												title={
													category.status === "active"
														? "Deactivate"
														: "Activate"
												}
											>
												{category.status ===
												"active" ? (
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
															d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636"
														/>
													</svg>
												) : (
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
															d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
														/>
													</svg>
												)}
											</button>
											<button
												onClick={() =>
													handleEditCategory(category)
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
													handleDeleteCategory(
														category
													)
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
				</div>
			)}

			{/* Category Form Modal */}
			<CategoryForm
				isOpen={isFormOpen}
				onClose={() => {
					setIsFormOpen(false);
					setEditingCategory(null);
				}}
				onSuccess={handleFormSuccess}
				category={editingCategory}
			/>

			{/* Confirm Dialog */}
			<ConfirmDialog
				isOpen={confirmDialog.isOpen}
				onClose={() =>
					setConfirmDialog({
						isOpen: false,
						categoryId: null,
						categoryName: "",
						action: null,
					})
				}
				onConfirm={confirmAction}
				title={
					confirmDialog.action === "delete"
						? "Delete Category"
						: "Change Status"
				}
				message={
					confirmDialog.action === "delete"
						? `Are you sure you want to delete "${confirmDialog.categoryName}"? This action cannot be undone.`
						: `Are you sure you want to ${
								confirmDialog.newStatus === "active"
									? "activate"
									: "deactivate"
						  } "${confirmDialog.categoryName}"?`
				}
				confirmText={
					confirmDialog.action === "delete" ? "Delete" : "Confirm"
				}
				confirmVariant={
					confirmDialog.action === "delete" ? "danger" : "primary"
				}
			/>
		</div>
	);
};

export default CategoryList;
