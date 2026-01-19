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

	const [isFormOpen, setIsFormOpen] = useState(false);
	const [editingCategory, setEditingCategory] = useState(null);

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
		if (sortBy !== field) return <span className="text-gray-400 ml-1">⇅</span>;
		return sortOrder === "asc" ? 
			<span className="ml-1 text-purple-600">↑</span> : 
			<span className="ml-1 text-purple-600">↓</span>;
	};

	const getStatusBadge = (status) => {
		return status === "active" ? (
			<Badge variant="success">Active</Badge>
		) : (
			<Badge variant="secondary">Inactive</Badge>
		);
	};

	if (loading) return (
		<div className="min-h-screen bg-gradient-to-br from-gray-50 to-purple-50 flex items-center justify-center">
			<Loading size="lg" text="Loading categories..." />
		</div>
	);

	return (
		<div className="min-h-screen bg-gradient-to-br from-gray-50 via-purple-50 to-pink-50">
			<div className="container mx-auto px-4 py-8">
				{/* Header */}
				<div className="bg-white rounded-2xl shadow-lg p-6 mb-6 border border-gray-100">
					<div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
						<div className="flex items-center gap-3">
							<div className="p-2.5 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl shadow-md">
								<svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
									<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
								</svg>
							</div>
							<div>
								<h1 className="text-3xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
									Menu Categories
								</h1>
								<p className="text-gray-600 mt-1">
									Manage menu categories and their display order
								</p>
							</div>
						</div>
						<Button onClick={handleAddCategory} className="shadow-md hover:shadow-lg transition-all">
							<span className="flex items-center gap-2">
								<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
									<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
								</svg>
								Add Category
							</span>
						</Button>
					</div>
				</div>

				{/* Alerts */}
				{error && <Alert type="error" message={error} onClose={() => setError(null)} />}
				{success && <Alert type="success" message={success} onClose={() => setSuccess(null)} />}

				{/* Stats & Sort */}
				<div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
					<div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl shadow-lg p-6 text-white transform hover:scale-105 transition-transform">
						<div className="flex items-center justify-between mb-2">
							<p className="text-purple-100 text-sm font-medium">Total Categories</p>
							<svg className="w-8 h-8 text-purple-200" fill="none" viewBox="0 0 24 24" stroke="currentColor">
								<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
							</svg>
						</div>
						<p className="text-4xl font-bold">{categories.length}</p>
					</div>

					<div className="bg-gradient-to-br from-green-500 to-green-600 rounded-2xl shadow-lg p-6 text-white transform hover:scale-105 transition-transform">
						<div className="flex items-center justify-between mb-2">
							<p className="text-green-100 text-sm font-medium">Active</p>
							<svg className="w-8 h-8 text-green-200" fill="none" viewBox="0 0 24 24" stroke="currentColor">
								<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
							</svg>
						</div>
						<p className="text-4xl font-bold">{categories.filter(c => c.status === "active").length}</p>
					</div>

					<div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
						<p className="text-sm font-medium text-gray-700 mb-3">Sort By</p>
						<div className="grid grid-cols-3 gap-2">
							<button
								onClick={() => handleSort("display_order")}
								className={`px-3 py-2 rounded-lg text-xs font-medium transition-all ${
									sortBy === "display_order"
										? "bg-gradient-to-r from-purple-500 to-purple-600 text-white shadow-md"
										: "bg-gray-100 text-gray-600 hover:bg-gray-200"
								}`}
							>
								Order <SortIcon field="display_order" />
							</button>
							<button
								onClick={() => handleSort("name")}
								className={`px-3 py-2 rounded-lg text-xs font-medium transition-all ${
									sortBy === "name"
										? "bg-gradient-to-r from-purple-500 to-purple-600 text-white shadow-md"
										: "bg-gray-100 text-gray-600 hover:bg-gray-200"
								}`}
							>
								Name <SortIcon field="name" />
							</button>
							<button
								onClick={() => handleSort("created_at")}
								className={`px-3 py-2 rounded-lg text-xs font-medium transition-all ${
									sortBy === "created_at"
										? "bg-gradient-to-r from-purple-500 to-purple-600 text-white shadow-md"
										: "bg-gray-100 text-gray-600 hover:bg-gray-200"
								}`}
							>
								Date <SortIcon field="created_at" />
							</button>
						</div>
					</div>
				</div>

				{/* Categories Table */}
				{sortedCategories.length === 0 ? (
					<div className="bg-white rounded-2xl shadow-lg p-12 text-center border border-gray-100">
						<div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full mb-4">
							<svg className="w-10 h-10 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
								<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
							</svg>
						</div>
						<h3 className="text-xl font-semibold text-gray-900 mb-2">No Categories Found</h3>
						<p className="text-gray-600 mb-6">
							Get started by creating your first category.
						</p>
						<Button onClick={handleAddCategory}>
							<span className="flex items-center gap-2">
								<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
									<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
								</svg>
								Add First Category
							</span>
						</Button>
					</div>
				) : (
					<div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
						<div className="overflow-x-auto">
							<table className="w-full">
								<thead className="bg-gradient-to-r from-gray-50 to-purple-50 border-b-2 border-gray-200">
									<tr>
										<th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
											Order
										</th>
										<th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
											Name
										</th>
										<th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
											Description
										</th>
										<th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
											Status
										</th>
										<th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
											Items
										</th>
										<th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
											Created
										</th>
										<th className="px-6 py-4 text-right text-xs font-bold text-gray-700 uppercase tracking-wider">
											Actions
										</th>
									</tr>
								</thead>
								<tbody className="divide-y divide-gray-100">
									{sortedCategories.map((category, index) => (
										<tr key={category.id} className="hover:bg-gradient-to-r hover:from-purple-50 hover:to-transparent transition-all">
											<td className="px-6 py-4 whitespace-nowrap">
												<div className="flex items-center gap-2">
													<div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-100 to-purple-200 flex items-center justify-center">
														<span className="text-sm font-bold text-purple-700">
															{category.display_order}
														</span>
													</div>
												</div>
											</td>
											<td className="px-6 py-4 whitespace-nowrap">
												<div className="font-semibold text-gray-900">
													{category.name}
												</div>
											</td>
											<td className="px-6 py-4">
												<div className="text-sm text-gray-600 truncate max-w-xs">
													{category.description || "-"}
												</div>
											</td>
											<td className="px-6 py-4 whitespace-nowrap">
												{getStatusBadge(category.status)}
											</td>
											<td className="px-6 py-4 whitespace-nowrap">
												<span className="inline-flex items-center justify-center w-10 h-10 rounded-lg bg-blue-100 text-blue-700 font-bold">
													{category.items?.length || category.item_count || 0}
												</span>
											</td>
											<td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
												{new Date(category.created_at).toLocaleDateString()}
											</td>
											<td className="px-6 py-4 whitespace-nowrap text-right">
												<div className="flex justify-end gap-2">
													<button
														onClick={() => handleStatusChange(category)}
														className={`p-2 rounded-lg transition-all hover:scale-110 ${
															category.status === "active"
																? "text-yellow-600 hover:bg-yellow-50"
																: "text-green-600 hover:bg-green-50"
														}`}
														title={category.status === "active" ? "Deactivate" : "Activate"}
													>
														{category.status === "active" ? (
															<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
																<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
															</svg>
														) : (
															<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
																<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
															</svg>
														)}
													</button>
													<button
														onClick={() => handleEditCategory(category)}
														className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-all hover:scale-110"
														title="Edit"
													>
														<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
															<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
														</svg>
													</button>
													<button
														onClick={() => handleDeleteCategory(category)}
														className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-all hover:scale-110"
														title="Delete"
													>
														<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
															<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
														</svg>
													</button>
												</div>
											</td>
										</tr>
									))}
								</tbody>
							</table>
						</div>
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
		</div>
	);
};

export default CategoryList;