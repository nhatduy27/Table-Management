import React, { useState, useEffect } from "react";
import menuService from "../../../services/menuService";
import Button from "../../common/Button";
import Badge from "../../common/Badge";
import Loading from "../../common/Loading";
import Alert from "../../common/Alert";
import ConfirmDialog from "../../common/ConfirmDialog";
import ModifierGroupForm from "./ModifierGroupForm";

const ModifierGroupList = () => {
	const [modifierGroups, setModifierGroups] = useState([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState(null);
	const [success, setSuccess] = useState(null);

	// Modal states
	const [isFormOpen, setIsFormOpen] = useState(false);
	const [editingGroup, setEditingGroup] = useState(null);

	// Expanded groups (to show options)
	const [expandedGroups, setExpandedGroups] = useState({});

	// Confirm dialog state
	const [confirmDialog, setConfirmDialog] = useState({
		isOpen: false,
		type: null, // 'group' or 'option'
		id: null,
		name: "",
		groupId: null,
	});

	useEffect(() => {
		fetchModifierGroups();
	}, []);

	const fetchModifierGroups = async () => {
		try {
			setLoading(true);
			setError(null);
			const response = await menuService.getModifierGroups();
			setModifierGroups(response.data || []);
		} catch (err) {
			setError(err.message || "Failed to load modifier groups");
		} finally {
			setLoading(false);
		}
	};

	const handleAddGroup = () => {
		setEditingGroup(null);
		setIsFormOpen(true);
	};

	const handleEditGroup = (group) => {
		setEditingGroup(group);
		setIsFormOpen(true);
	};

	const handleDeleteGroup = (group) => {
		setConfirmDialog({
			isOpen: true,
			type: "group",
			id: group.id,
			name: group.name,
			groupId: null,
		});
	};

	const handleDeleteOption = (groupId, option) => {
		setConfirmDialog({
			isOpen: true,
			type: "option",
			id: option.id,
			name: option.name,
			groupId: groupId,
		});
	};

	const confirmDelete = async () => {
		try {
			if (confirmDialog.type === "group") {
				await menuService.deleteModifierGroup(confirmDialog.id);
				setSuccess("Modifier group deleted successfully");
			} else {
				await menuService.deleteModifierOption(confirmDialog.id);
				setSuccess("Option deleted successfully");
			}
			fetchModifierGroups();
		} catch (err) {
			setError(err.message || "Failed to delete");
		} finally {
			setConfirmDialog({
				isOpen: false,
				type: null,
				id: null,
				name: "",
				groupId: null,
			});
		}
	};

	const handleFormSuccess = () => {
		setIsFormOpen(false);
		setEditingGroup(null);
		fetchModifierGroups();
		setSuccess(
			editingGroup
				? "Modifier group updated successfully"
				: "Modifier group created successfully"
		);
	};

	const toggleExpand = (groupId) => {
		setExpandedGroups((prev) => ({
			...prev,
			[groupId]: !prev[groupId],
		}));
	};

	const getStatusBadge = (status) => {
		return status === "active" ? (
			<Badge variant="success">Active</Badge>
		) : (
			<Badge variant="secondary">Inactive</Badge>
		);
	};

	const formatPrice = (price) => {
		if (!price || price === 0) return "+$0";
		return `+$${parseFloat(price).toFixed(2)}`;
	};

	if (loading) return <Loading size="lg" text="Loading modifier groups..." />;

	return (
		<div className="container mx-auto px-4 py-8">
			{/* Header */}
			<div className="flex justify-between items-center mb-6">
				<div>
					<h1 className="text-3xl font-bold text-gray-900">
						Menu Modifiers
					</h1>
					<p className="text-gray-600 mt-1">
						Manage modifier groups and options for menu
						customization
					</p>
				</div>
				<Button onClick={handleAddGroup}>
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
						Add Modifier Group
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

			{/* Info Card */}
			<div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
				<div className="flex items-start gap-3">
					<svg
						className="w-5 h-5 text-blue-500 mt-0.5"
						fill="none"
						viewBox="0 0 24 24"
						stroke="currentColor"
					>
						<path
							strokeLinecap="round"
							strokeLinejoin="round"
							strokeWidth={2}
							d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
						/>
					</svg>
					<div className="text-sm text-blue-700">
						<p className="font-medium">What are Modifier Groups?</p>
						<p className="mt-1">
							Modifier groups allow customers to customize their
							orders. For example, a "Size" modifier lets
							customers choose Small, Medium, or Large. An
							"Extras" modifier lets them add toppings.
						</p>
					</div>
				</div>
			</div>

			{/* Modifier Groups List */}
			{modifierGroups.length === 0 ? (
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
							d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4"
						/>
					</svg>
					<h3 className="text-lg font-medium text-gray-900 mb-1">
						No Modifier Groups
					</h3>
					<p className="text-gray-500 mb-4">
						Create modifier groups to offer customization options
						for your menu items.
					</p>
					<Button onClick={handleAddGroup}>
						Create First Modifier Group
					</Button>
				</div>
			) : (
				<div className="space-y-4">
					{modifierGroups.map((group) => (
						<div
							key={group.id}
							className="bg-white rounded-lg shadow overflow-hidden"
						>
							{/* Group Header */}
							<div
								className="flex items-center justify-between p-4 cursor-pointer hover:bg-gray-50"
								onClick={() => toggleExpand(group.id)}
							>
								<div className="flex items-center gap-4">
									<button className="text-gray-400">
										<svg
											className={`w-5 h-5 transform transition-transform ${
												expandedGroups[group.id]
													? "rotate-90"
													: ""
											}`}
											fill="none"
											viewBox="0 0 24 24"
											stroke="currentColor"
										>
											<path
												strokeLinecap="round"
												strokeLinejoin="round"
												strokeWidth={2}
												d="M9 5l7 7-7 7"
											/>
										</svg>
									</button>
									<div>
										<div className="flex items-center gap-2">
											<h3 className="text-lg font-medium text-gray-900">
												{group.name}
											</h3>
											{getStatusBadge(group.status)}
										</div>
										<div className="flex items-center gap-3 mt-1 text-sm text-gray-500">
											<span
												className={
													group.selection_type ===
													"single"
														? "text-blue-600"
														: "text-purple-600"
												}
											>
												{group.selection_type ===
												"single"
													? "● Single Select"
													: "● Multi Select"}
											</span>
											{group.is_required && (
												<span className="text-red-500">
													Required
												</span>
											)}
											{group.selection_type ===
												"multiple" && (
												<span>
													(Min: {group.min_selections}
													, Max:{" "}
													{group.max_selections ||
														"∞"}
													)
												</span>
											)}
											<span className="text-gray-400">
												|
											</span>
											<span>
												{group.options?.length || 0}{" "}
												options
											</span>
										</div>
									</div>
								</div>
								<div
									className="flex items-center gap-2"
									onClick={(e) => e.stopPropagation()}
								>
									<button
										onClick={() => handleEditGroup(group)}
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
										onClick={() => handleDeleteGroup(group)}
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
							</div>

							{/* Options (Expandable) */}
							{expandedGroups[group.id] && (
								<div className="border-t bg-gray-50">
									{!group.options ||
									group.options.length === 0 ? (
										<div className="p-4 text-center text-gray-500 text-sm">
											No options yet. Edit this group to
											add options.
										</div>
									) : (
										<div className="divide-y divide-gray-200">
											{group.options.map((option) => (
												<div
													key={option.id}
													className="flex items-center justify-between px-6 py-3 hover:bg-gray-100"
												>
													<div className="flex items-center gap-3">
														<span
															className={`w-2 h-2 rounded-full ${
																option.status ===
																"active"
																	? "bg-green-500"
																	: "bg-gray-400"
															}`}
														/>
														<span className="text-gray-900">
															{option.name}
														</span>
														<span className="text-gray-500 text-sm">
															{formatPrice(
																option.price_adjustment
															)}
														</span>
													</div>
													<button
														onClick={() =>
															handleDeleteOption(
																group.id,
																option
															)
														}
														className="p-1 text-red-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
														title="Delete option"
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
																d="M6 18L18 6M6 6l12 12"
															/>
														</svg>
													</button>
												</div>
											))}
										</div>
									)}
								</div>
							)}
						</div>
					))}
				</div>
			)}

			{/* Modifier Group Form Modal */}
			<ModifierGroupForm
				isOpen={isFormOpen}
				onClose={() => {
					setIsFormOpen(false);
					setEditingGroup(null);
				}}
				onSuccess={handleFormSuccess}
				group={editingGroup}
			/>

			{/* Confirm Dialog */}
			<ConfirmDialog
				isOpen={confirmDialog.isOpen}
				onClose={() =>
					setConfirmDialog({
						isOpen: false,
						type: null,
						id: null,
						name: "",
						groupId: null,
					})
				}
				onConfirm={confirmDelete}
				title={
					confirmDialog.type === "group"
						? "Delete Modifier Group"
						: "Delete Option"
				}
				message={
					confirmDialog.type === "group"
						? `Are you sure you want to delete "${confirmDialog.name}" and all its options? This action cannot be undone.`
						: `Are you sure you want to delete the option "${confirmDialog.name}"?`
				}
				confirmText="Delete"
				confirmVariant="danger"
			/>
		</div>
	);
};

export default ModifierGroupList;
