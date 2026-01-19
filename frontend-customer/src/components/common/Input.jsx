import React from "react";

const Input = ({
	label,
	type = "text",
	name,
	value,
	onChange,
	placeholder,
	error,
	required = false,
	disabled = false,
	className = "",
	...props
}) => {
	return (
		<div className="mb-4">
			{label && (
				<label className="block text-sm font-medium text-gray-700 mb-1">
					{label}
					{required && <span className="text-red-500 ml-1">*</span>}
				</label>
			)}
			<input
				type={type}
				name={name}
				value={value}
				onChange={onChange}
				placeholder={placeholder}
				disabled={disabled}
				required={required}
				className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed ${
					error ? "border-red-500" : "border-gray-300"
				} ${className}`}
				{...props}
			/>
			{error && <p className="text-red-500 text-sm mt-1">{error}</p>}
		</div>
	);
};

export default Input;
