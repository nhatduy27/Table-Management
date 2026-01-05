import React, { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import customerService from "../services/customerService";

const RegisterPage = () => {
	const [formData, setFormData] = useState({
		username: "",
		email: "",
		password: "",
		confirmPassword: ""
	});
	const [error, setError] = useState("");
	const [success, setSuccess] = useState("");
	const [loading, setLoading] = useState(false);
	const navigate = useNavigate();
	const location = useLocation();

	// Lấy URL gốc đã được truyền từ Login sang (VD: /menu?table=...)
	const from = location.state?.from || "/";

	const handleChange = (e) => {
		setFormData({ ...formData, [e.target.name]: e.target.value });
		setError("");
	};

	const handleSubmit = async (e) => {
		e.preventDefault();
		setError("");
		setSuccess("");
		setLoading(true);

		if (formData.password !== formData.confirmPassword) {
			setError("Mật khẩu xác nhận không khớp");
			setLoading(false);
			return;
		}

		try {
			// 🔥 SỬA: Gọi register API mới
			const response = await customerService.register(
				formData.username, 
				formData.email, 
				formData.password
			);

			console.log("Register response:", response);

			// Kiểm tra response format
			if (response.success) {
				// Lấy customerId từ response
				const customerId = response.data?.customer?.uid || 
								  response.data?.customerId ||
								  response.customerId;

				if (!customerId) {
					throw new Error("Không nhận được thông tin xác thực từ server");
				}

				setSuccess("Đăng ký thành công! Vui lòng kiểm tra email để xác thực.");
				
				
				setTimeout(() => {
					navigate("/customer/verify-email", { 
						state: { 
							customerId: customerId,
							email: formData.email,
							username: formData.username,
							from: from, // Lưu đường dẫn menu để sau verify quay về
							message: "Đăng ký thành công! Vui lòng xác thực email." 
						}
					});
				}, 1500);

			} else {
				throw new Error(response.error || "Đăng ký thất bại");
			}

		} catch (err) {
			console.error("Register error:", err);
			setError(err.message || "Đăng ký thất bại");
		} finally {
			setLoading(false);
		}
	};

	return (
		<div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-50 flex items-center justify-center p-4">
			<div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md">
				<div className="text-center mb-8">
					<div className="w-16 h-16 bg-amber-600 rounded-xl flex items-center justify-center mx-auto mb-4">
						<span className="text-white text-2xl font-bold">R</span>
					</div>
					<h1 className="text-3xl font-bold text-gray-900">Smart Restaurant</h1>
					<h2 className="text-xl font-semibold mt-2 text-gray-700">Đăng Ký Khách Hàng</h2>
					<p className="text-gray-600 mt-2 text-sm">
						Đăng ký để lưu đơn hàng và nhận ưu đãi
					</p>
				</div>
				
				{error && (
					<div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6 rounded">
						{error}
					</div>
				)}
				{success && (
					<div className="bg-green-100 border-l-4 border-green-500 text-green-700 p-4 mb-6 rounded">
						{success}
					</div>
				)}
				
				<form onSubmit={handleSubmit} className="space-y-6">
					<div>
						<label className="block text-gray-700 text-sm font-bold mb-2">
							Tên đăng nhập
						</label>
						<input 
							name="username" 
							type="text" 
							value={formData.username}
							onChange={handleChange} 
							className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 transition-all" 
							placeholder="Nhập tên đăng nhập" 
							required 
							disabled={loading} 
						/>
					</div>
					<div>
						<label className="block text-gray-700 text-sm font-bold mb-2">
							Email
						</label>
						<input 
							name="email" 
							type="email" 
							value={formData.email}
							onChange={handleChange} 
							className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 transition-all" 
							placeholder="Nhập email" 
							required 
							disabled={loading} 
						/>
					</div>
					<div>
						<label className="block text-gray-700 text-sm font-bold mb-2">
							Mật khẩu
						</label>
						<input 
							name="password" 
							type="password" 
							value={formData.password}
							onChange={handleChange} 
							className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 transition-all" 
							placeholder="Ít nhất 6 ký tự" 
							required 
							disabled={loading} 
						/>
					</div>
					<div>
						<label className="block text-gray-700 text-sm font-bold mb-2">
							Xác nhận mật khẩu
						</label>
						<input 
							name="confirmPassword" 
							type="password" 
							value={formData.confirmPassword}
							onChange={handleChange} 
							className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 transition-all" 
							placeholder="Nhập lại mật khẩu" 
							required 
							disabled={loading} 
						/>
					</div>

					<button 
						type="submit" 
						disabled={loading} 
						className={`w-full text-white font-bold py-3 px-4 rounded-lg transition duration-200 ${loading ? "bg-gray-400 cursor-not-allowed" : "bg-amber-600 hover:bg-amber-700"}`}
					>
						{loading ? "Đang đăng ký..." : "Đăng Ký"}
					</button>
				</form>

				<div className="mt-8 text-center">
					<p className="text-gray-600">
						Đã có tài khoản?
						<Link 
							to="/customer/login" 
							state={{ from: from }} 
							className="ml-2 text-amber-600 font-semibold hover:text-amber-700"
						>
							Đăng nhập ngay
						</Link>
					</p>
					<div className="mt-4 pt-4 border-t border-gray-200">
						<button 
							onClick={() => navigate(from)} 
							className="text-gray-500 hover:text-gray-700 text-sm flex items-center justify-center mx-auto"
							disabled={loading}
						>
							<svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
							</svg>
							Quay lại menu
						</button>
					</div>
				</div>
			</div>
		</div>
	);
};

export default RegisterPage;