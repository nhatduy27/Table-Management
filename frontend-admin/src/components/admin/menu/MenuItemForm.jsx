import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import menuService from "../../../services/menuService";
import Button from "../../common/Button";
import Input from "../../common/Input";
import Loading from "../../common/Loading";
import Alert from "../../common/Alert";
import Modal from "../../common/Modal";

const MenuItemForm = () => {
	const navigate = useNavigate();
	const { id } = useParams();
	const fileInputRef = useRef(null);
	const isEditing = !!id;

	const [loading, setLoading] = useState(false);
	const [fetchLoading, setFetchLoading] = useState(isEditing);
	const [error, setError] = useState(null);
	const [success, setSuccess] = useState(null);

	const [categories, setCategories] = useState([]);
	const [modifierGroups, setModifierGroups] = useState([]);

	const [formData, setFormData] = useState({
		name: "",
		category_id: "",
		price: "",
		description: "",
		prep_time_minutes: "",
		status: "available",
		is_chef_recommended: false,
	});

	const [photos, setPhotos] = useState([]);
	const [selectedModifierGroups, setSelectedModifierGroups] = useState([]);
	const [uploadingPhotos, setUploadingPhotos] = useState(false);

	// Modifier group modal
	const [modifierModalOpen, setModifierModalOpen] = useState(false);

	const [errors, setErrors] = useState({});

	useEffect(() => {
		fetchInitialData();
	}, [id]);

	const fetchInitialData = async () => {
		try {
			setFetchLoading(true);
			const [categoriesRes, modifiersRes] = await Promise.all([
				menuService.getCategories(),
				menuService.getModifierGroups().catch(() => ({ data: [] })),
			]);

			setCategories(categoriesRes.data || []);
			setModifierGroups(modifiersRes.data || []);

			if (isEditing) {
				const itemRes = await menuService.getItemById(id);
				const item = itemRes.data;

				setFormData({
					name: item.name || "",
					category_id: item.category_id || "",
					price: item.price || "",
					description: item.description || "",
					prep_time_minutes: item.prep_time_minutes || "",
					status: item.status || "available",
					is_chef_recommended: item.is_chef_recommended || false,
				});

				setPhotos(item.photos || []);
				setSelectedModifierGroups(
					item.modifierGroups?.map((g) => g.id) || []
				);
			}
		} catch (err) {
			setError(err.message || "Failed to load data");
		} finally {
			setFetchLoading(false);
		}
	};

	const validateForm = () => {
		const newErrors = {};

		if (!formData.name.trim()) {
			newErrors.name = "Item name is required";
		} else if (formData.name.trim().length < 2) {
			newErrors.name = "Item name must be at least 2 characters";
		} else if (formData.name.trim().length > 80) {
			newErrors.name = "Item name cannot exceed 80 characters";
		}

		if (!formData.category_id) {
			newErrors.category_id = "Category is required";
		}

		if (!formData.price) {
			newErrors.price = "Price is required";
		} else if (parseFloat(formData.price) < 0.01) {
			newErrors.price = "Price must be at least 0.01";
		} else if (parseFloat(formData.price) > 999999.99) {
			newErrors.price = "Price cannot exceed 999,999.99";
		}

		if (
			formData.prep_time_minutes &&
			parseInt(formData.prep_time_minutes) < 0
		) {
			newErrors.prep_time_minutes = "Preparation time cannot be negative";
		} else if (
			formData.prep_time_minutes &&
			parseInt(formData.prep_time_minutes) > 240
		) {
			newErrors.prep_time_minutes =
				"Preparation time cannot exceed 240 minutes";
		}

		if (formData.description && formData.description.length > 1000) {
			newErrors.description = "Description cannot exceed 1000 characters";
		}

		setErrors(newErrors);
		return Object.keys(newErrors).length === 0;
	};

	const handleChange = (e) => {
		const { name, value, type, checked } = e.target;
		setFormData((prev) => ({
			...prev,
			[name]: type === "checkbox" ? checked : value,
		}));
		if (errors[name]) {
			setErrors((prev) => ({ ...prev, [name]: null }));
		}
	};

	const handleSubmit = async (e) => {
		e.preventDefault();

		if (!validateForm()) return;

		setLoading(true);
		setError(null);

		try {
			const dataToSubmit = {
				...formData,
				price: parseFloat(formData.price),
				prep_time_minutes: formData.prep_time_minutes
					? parseInt(formData.prep_time_minutes)
					: 0,
			};

			let savedItem;
			if (isEditing) {
				savedItem = await menuService.updateItem(id, dataToSubmit);
			} else {
				savedItem = await menuService.createItem(dataToSubmit);
			}

			// Update modifier groups (always call to handle removal of all modifiers)
			const itemId = savedItem.data?.id || id;
			if (itemId) {
				await menuService.attachModifierGroups(
					itemId,
					selectedModifierGroups
				);
			}

			setSuccess(
				isEditing
					? "Item updated successfully!"
					: "Item created successfully!"
			);
			setTimeout(() => {
				navigate("/admin/menu/items");
			}, 1500);
		} catch (err) {
			setError(err.message || "Failed to save menu item");
		} finally {
			setLoading(false);
		}
	};

	const handlePhotoUpload = async (e) => {
		const files = Array.from(e.target.files);
		if (files.length === 0) return;

		if (!isEditing) {
			setError("Please save the item first before uploading photos");
			return;
		}

		// Validate files
		const validFiles = files.filter((file) => {
			const isValidType = [
				"image/jpeg",
				"image/png",
				"image/webp",
			].includes(file.type);
			const isValidSize = file.size <= 5 * 1024 * 1024; // 5MB
			return isValidType && isValidSize;
		});

		if (validFiles.length !== files.length) {
			setError(
				"Some files were skipped. Only JPG/PNG/WebP under 5MB allowed."
			);
		}

		if (validFiles.length === 0) return;

		setUploadingPhotos(true);
		try {
			const response = await menuService.uploadPhotos(id, validFiles);
			setPhotos((prev) => [...prev, ...(response.photos || [])]);
			setSuccess("Photos uploaded successfully!");
		} catch (err) {
			setError(err.message || "Failed to upload photos");
		} finally {
			setUploadingPhotos(false);
			if (fileInputRef.current) {
				fileInputRef.current.value = "";
			}
		}
	};

	const handleDeletePhoto = async (photoId) => {
		if (!isEditing) return;

		try {
			await menuService.deletePhoto(id, photoId);
			setPhotos((prev) => prev.filter((p) => p.id !== photoId));
			setSuccess("Photo deleted successfully!");
		} catch (err) {
			setError(err.message || "Failed to delete photo");
		}
	};

	const handleSetPrimaryPhoto = async (photoId) => {
		if (!isEditing) return;

		try {
			await menuService.setPrimaryPhoto(id, photoId);
			setPhotos((prev) =>
				prev.map((p) => ({
					...p,
					is_primary: p.id === photoId,
				}))
			);
			setSuccess("Primary photo updated!");
		} catch (err) {
			setError(err.message || "Failed to set primary photo");
		}
	};

	const toggleModifierGroup = (groupId) => {
		setSelectedModifierGroups((prev) =>
			prev.includes(groupId)
				? prev.filter((id) => id !== groupId)
				: [...prev, groupId]
		);
	};

	if (fetchLoading) return <Loading size="lg" text="Loading..." />;

	return (
		<div className="container mx-auto px-4 py-8 max-w-4xl">
			{/* Header */}
			<div className="flex items-center gap-4 mb-6">
				<button
					onClick={() => navigate("/admin/menu/items")}
					className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
				>
					<svg
						className="w-6 h-6"
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
				</button>
				<div>
					<h1 className="text-3xl font-bold text-gray-900">
						{isEditing ? "Edit Menu Item" : "Add New Menu Item"}
					</h1>
					<p className="text-gray-600 mt-1">
						{isEditing
							? "Update item details and photos"
							: "Create a new menu item"}
					</p>
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

			<form onSubmit={handleSubmit} className="space-y-6">
				{/* Basic Info Card */}
				<div className="bg-white rounded-lg shadow p-6">
					<h2 className="text-lg font-semibold text-gray-900 mb-4">
						Basic Information
					</h2>

					<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
						<Input
							label="Item Name"
							name="name"
							value={formData.name}
							onChange={handleChange}
							placeholder="e.g., Grilled Salmon"
							error={errors.name}
							required
						/>

						<div className="mb-4">
							<label className="block text-sm font-medium text-gray-700 mb-1">
								Category <span className="text-red-500">*</span>
							</label>
							<select
								name="category_id"
								value={formData.category_id}
								onChange={handleChange}
								className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
									errors.category_id
										? "border-red-500"
										: "border-gray-300"
								}`}
							>
								<option value="">Select a category</option>
								{categories
									.filter((c) => c.status === "active")
									.map((cat) => (
										<option key={cat.id} value={cat.id}>
											{cat.name}
										</option>
									))}
							</select>
							{errors.category_id && (
								<p className="text-red-500 text-sm mt-1">
									{errors.category_id}
								</p>
							)}
						</div>

						<Input
							label="Price ($)"
							name="price"
							type="number"
							step="0.01"
							min="0.01"
							max="999999.99"
							value={formData.price}
							onChange={handleChange}
							placeholder="0.00"
							error={errors.price}
							required
						/>

						<Input
							label="Prep Time (minutes)"
							name="prep_time_minutes"
							type="number"
							min="0"
							max="240"
							value={formData.prep_time_minutes}
							onChange={handleChange}
							placeholder="15"
							error={errors.prep_time_minutes}
						/>
					</div>

					<div className="mb-4">
						<label className="block text-sm font-medium text-gray-700 mb-1">
							Description
						</label>
						<textarea
							name="description"
							value={formData.description}
							onChange={handleChange}
							placeholder="Describe your dish..."
							rows={3}
							className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
								errors.description
									? "border-red-500"
									: "border-gray-300"
							}`}
						/>
						{errors.description && (
							<p className="text-red-500 text-sm mt-1">
								{errors.description}
							</p>
						)}
					</div>

					{/* Status */}
					<div className="mb-4">
						<label className="block text-sm font-medium text-gray-700 mb-2">
							Status <span className="text-red-500">*</span>
						</label>
						<div className="flex flex-wrap gap-4">
							{["available", "unavailable", "sold_out"].map(
								(status) => (
									<label
										key={status}
										className="flex items-center cursor-pointer"
									>
										<input
											type="radio"
											name="status"
											value={status}
											checked={formData.status === status}
											onChange={handleChange}
											className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
										/>
										<span className="ml-2 text-sm text-gray-700 capitalize">
											{status === "sold_out"
												? "Sold Out"
												: status}
										</span>
									</label>
								)
							)}
						</div>
					</div>

					{/* Chef Recommendation */}
					<label className="flex items-center cursor-pointer">
						<input
							type="checkbox"
							name="is_chef_recommended"
							checked={formData.is_chef_recommended}
							onChange={handleChange}
							className="w-4 h-4 text-yellow-500 border-gray-300 rounded focus:ring-yellow-500"
						/>
						<span className="ml-2 text-sm text-gray-700">
							⭐ Chef's Recommendation
						</span>
					</label>
				</div>

				{/* Photos Card */}
				<div className="bg-white rounded-lg shadow p-6">
					<h2 className="text-lg font-semibold text-gray-900 mb-4">
						Photos
					</h2>

					{!isEditing && (
						<p className="text-gray-500 text-sm mb-4">
							Save the item first to upload photos.
						</p>
					)}

					<div className="flex flex-wrap gap-4 mb-4">
						{photos.map((photo) => (
							<div
								key={photo.id}
								className={`relative w-24 h-24 rounded-lg overflow-hidden border-2 ${
									photo.is_primary
										? "border-blue-500"
										: "border-gray-200"
								}`}
							>
								<img
									src={photo.url}
									alt="Menu item"
									className="w-full h-full object-cover"
								/>
								<div className="absolute inset-0 bg-black bg-opacity-0 hover:bg-opacity-50 transition-all flex items-center justify-center gap-2 opacity-0 hover:opacity-100">
									{!photo.is_primary && (
										<button
											type="button"
											onClick={() =>
												handleSetPrimaryPhoto(photo.id)
											}
											className="p-1 bg-blue-500 text-white rounded"
											title="Set as primary"
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
													d="M5 13l4 4L19 7"
												/>
											</svg>
										</button>
									)}
									<button
										type="button"
										onClick={() =>
											handleDeletePhoto(photo.id)
										}
										className="p-1 bg-red-500 text-white rounded"
										title="Delete"
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
								{photo.is_primary && (
									<span className="absolute bottom-0 left-0 right-0 bg-blue-500 text-white text-xs text-center py-0.5">
										Primary
									</span>
								)}
							</div>
						))}

						{isEditing && (
							<label className="w-24 h-24 border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-blue-500 hover:bg-blue-50 transition-colors">
								<input
									ref={fileInputRef}
									type="file"
									accept="image/jpeg,image/png,image/webp"
									multiple
									onChange={handlePhotoUpload}
									className="hidden"
									disabled={uploadingPhotos}
								/>
								{uploadingPhotos ? (
									<svg
										className="animate-spin w-6 h-6 text-blue-500"
										fill="none"
										viewBox="0 0 24 24"
									>
										<circle
											className="opacity-25"
											cx="12"
											cy="12"
											r="10"
											stroke="currentColor"
											strokeWidth="4"
										/>
										<path
											className="opacity-75"
											fill="currentColor"
											d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
										/>
									</svg>
								) : (
									<>
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
												d="M12 4v16m8-8H4"
											/>
										</svg>
										<span className="text-xs text-gray-500 mt-1">
											Add
										</span>
									</>
								)}
							</label>
						)}
					</div>

					<p className="text-xs text-gray-500">
						Accepted formats: JPG, PNG, WebP. Max size: 5MB per
						image.
					</p>
				</div>

				{/* Modifiers Card */}
				<div className="bg-white rounded-lg shadow p-6">
					<div className="flex justify-between items-center mb-4">
						<h2 className="text-lg font-semibold text-gray-900">
							Modifiers
						</h2>
						<Button
							type="button"
							variant="outline"
							size="sm"
							onClick={() => setModifierModalOpen(true)}
						>
							Select Modifiers
						</Button>
					</div>

					{selectedModifierGroups.length === 0 ? (
						<p className="text-gray-500 text-sm">
							No modifier groups selected. Click "Select
							Modifiers" to add customization options.
						</p>
					) : (
						<div className="space-y-2">
							{modifierGroups
								.filter((g) =>
									selectedModifierGroups.includes(g.id)
								)
								.map((group) => (
									<div
										key={group.id}
										className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
									>
										<div>
											<span className="font-medium text-gray-900">
												{group.name}
											</span>
											<span className="ml-2 text-sm text-gray-500">
												(
												{group.selection_type ===
												"single"
													? "Single select"
													: "Multi select"}
												{group.is_required &&
													", Required"}
												)
											</span>
											{group.options && (
												<div className="text-xs text-gray-500 mt-1">
													{group.options
														.map(
															(opt) =>
																`${opt.name}${
																	opt.price_adjustment >
																	0
																		? ` +$${opt.price_adjustment}`
																		: ""
																}`
														)
														.join(", ")}
												</div>
											)}
										</div>
										<button
											type="button"
											onClick={() =>
												toggleModifierGroup(group.id)
											}
											className="text-red-500 hover:text-red-600"
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
													d="M6 18L18 6M6 6l12 12"
												/>
											</svg>
										</button>
									</div>
								))}
						</div>
					)}
				</div>

				{/* Action Buttons */}
				<div className="flex justify-end gap-4">
					<Button
						type="button"
						variant="secondary"
						onClick={() => navigate("/admin/menu/items")}
						disabled={loading}
					>
						Cancel
					</Button>
					<Button type="submit" disabled={loading}>
						{loading ? (
							<span className="flex items-center gap-2">
								<svg
									className="animate-spin w-4 h-4"
									fill="none"
									viewBox="0 0 24 24"
								>
									<circle
										className="opacity-25"
										cx="12"
										cy="12"
										r="10"
										stroke="currentColor"
										strokeWidth="4"
									/>
									<path
										className="opacity-75"
										fill="currentColor"
										d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
									/>
								</svg>
								Saving...
							</span>
						) : isEditing ? (
							"Update Item"
						) : (
							"Create Item"
						)}
					</Button>
				</div>
			</form>

			{/* Modifier Selection Modal */}
			<Modal
				isOpen={modifierModalOpen}
				onClose={() => setModifierModalOpen(false)}
				title="Select Modifier Groups"
				size="md"
			>
				<div className="space-y-2 max-h-96 overflow-y-auto">
					{modifierGroups.length === 0 ? (
						<p className="text-gray-500 text-center py-4">
							No modifier groups available. Create some in the
							Modifiers section first.
						</p>
					) : (
						modifierGroups
							.filter((g) => g.status === "active")
							.map((group) => (
								<label
									key={group.id}
									className={`flex items-center justify-between p-3 rounded-lg cursor-pointer transition-colors ${
										selectedModifierGroups.includes(
											group.id
										)
											? "bg-blue-50 border border-blue-200"
											: "bg-gray-50 hover:bg-gray-100"
									}`}
								>
									<div className="flex items-center gap-3">
										<input
											type="checkbox"
											checked={selectedModifierGroups.includes(
												group.id
											)}
											onChange={() =>
												toggleModifierGroup(group.id)
											}
											className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
										/>
										<div>
											<span className="font-medium text-gray-900">
												{group.name}
											</span>
											<div className="text-sm text-gray-500">
												{group.selection_type ===
												"single"
													? "Single select"
													: "Multi select"}
												{group.is_required &&
													" • Required"}
											</div>
										</div>
									</div>
								</label>
							))
					)}
				</div>
				<div className="mt-4 pt-4 border-t flex justify-end">
					<Button onClick={() => setModifierModalOpen(false)}>
						Done
					</Button>
				</div>
			</Modal>
		</div>
	);
};

export default MenuItemForm;
