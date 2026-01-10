import React, { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import customerService from "../services/customerService";
import SocialLoginButtons from "../components/login/SocialLoginButtons";
import { supabase } from "../config/supabaseClient";

const CustomerLoginPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [socialError, setSocialError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  // Xác định địa chỉ quay về
  const getFromPath = () => {
    if (location.state?.from) {
      return location.state.from;
    }
    
    const searchParams = new URLSearchParams(location.search);
    const tableId = searchParams.get('table');
    const token = searchParams.get('token');
    
    if (tableId || token) {
      let url = "/menu";
      const params = new URLSearchParams();
      if (tableId) params.append('table', tableId);
      if (token) params.append('token', token);
      return `${url}?${params.toString()}`;
    }
    
    return "/menu"; 
  };

  const from = getFromPath();

  console.log("[LOGIN] 🏷️ from path:", from);

  useEffect(() => {
    // Kiểm tra nếu đã login với Supabase
    const checkAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
          console.log("[LOGIN] ✅ Đã login với Supabase, đồng bộ với backend...");
          
          // Đồng bộ user với backend
		  /*
          const syncResult = await customerService.syncSupabaseUser({
            supabase_id: session.user.id,
            email: session.user.email,
            username: session.user.email.split('@')[0],
            full_name: session.user.user_metadata?.full_name || session.user.email.split('@')[0],
            avatar_url: session.user.user_metadata?.avatar_url,
            phone: session.user.phone,
            metadata: session.user.user_metadata
          });
          
          if (syncResult.success) {
            console.log("[LOGIN] ✅ Đồng bộ thành công, redirect về:", from);
            navigate(from, { replace: true });
          } else {
            console.log("[LOGIN] ❌ Đồng bộ thất bại:", syncResult.error);
          }
			*/
			//navigate(from, { replace: true });
        }
      } catch (err) {
        console.error("[LOGIN] Lỗi kiểm tra auth:", err);
      }
    };
    
    checkAuth();
  }, [navigate, from]);

  useEffect(() => {
    if (location.state?.message) {
      setSuccess(location.state.message);
    }
    if (location.state?.registeredEmail) {
      setEmail(location.state.registeredEmail);
    }
    if (location.state?.error) {
      setError(location.state.error);
    }
  }, [location]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setSocialError("");
    setSuccess("");
    setLoading(true);

    try {
      const result = await customerService.login(email, password);

      if (result.needsVerification) {
        navigate("/customer/verify-email", {
          state: {
            customerId: result.customerId,
            email: result.email,
            username: result.username,
            from: from,
            message: "Vui lòng xác thực email trước khi đăng nhập"
          }
        });
        return;
      }

      if (result.success) {
        setSuccess("Đăng nhập thành công!");
        setTimeout(() => {
          navigate(from, { replace: true });
        }, 1000);
      } else {
        throw new Error(result.error || "Đăng nhập thất bại");
      }

    } catch (err) {
      console.error("Login error:", err);
      setError(err.message || "Đăng nhập thất bại");
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
          <h2 className="text-xl font-semibold mt-2 text-gray-700">Đăng Nhập Khách Hàng</h2>
          <p className="text-gray-600 mt-2">Đăng nhập để lưu đơn hàng và nhận ưu đãi</p>
        </div>
        
        {(error || socialError) && (
          <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6 rounded">
            {error || socialError}
          </div>
        )}
        {success && (
          <div className="bg-green-100 border-l-4 border-green-500 text-green-700 p-4 mb-6 rounded">
            {success}
          </div>
        )}
        
        {/* SOCIAL LOGIN BUTTONS */}
        <div className="mb-6">
          <SocialLoginButtons 
            onError={setSocialError}
            disabled={loading}
            from={from}
            location={location}
          />
        </div>
        
        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <label className="block text-gray-700 text-sm font-bold mb-2">
              Tên đăng nhập hoặc Email
            </label>
            <input
              type="text"
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 transition-all"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Nhập tên đăng nhập hoặc email"
              required
              disabled={loading}
            />
          </div>
          
          <div>
            <label className="block text-gray-700 text-sm font-bold mb-2">
              Mật khẩu
            </label>
            <input
              type="password"
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 transition-all"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Nhập mật khẩu"
              required
              disabled={loading}
            />
            <div className="text-right mt-2">
              <Link 
                to="/customer/forgot-password" 
                state={{ from: from }}
                className="text-sm text-amber-600 hover:text-amber-700 font-medium"
              >
                Quên mật khẩu?
              </Link>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className={`w-full text-white font-bold py-3 px-4 rounded-lg transition duration-200 ${loading ? "bg-gray-400 cursor-not-allowed" : "bg-amber-600 hover:bg-amber-700"}`}
          >
            {loading ? "Đang đăng nhập..." : "Đăng Nhập"}
          </button>
        </form>

        <div className="mt-8 text-center">
          <p className="text-gray-600">
            Chưa có tài khoản?
            <Link
              to="/customer/register"
              state={{ from: from }}
              className="ml-2 text-amber-600 font-semibold hover:text-amber-700"
            >
              Đăng ký ngay
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

export default CustomerLoginPage;