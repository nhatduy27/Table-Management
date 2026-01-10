import React, { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import supabaseAuthService from '../services/supabaseAuthService';
import customerService from '../services/customerService';

const AuthCallbackPage = () => {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const handleCallback = async () => {
      try {
        console.log("[CALLBACK] Processing OAuth callback...");
        console.log("[CALLBACK] Current URL:", window.location.href);
        
        // Đợi Supabase xử lý OAuth callback
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Lấy session từ Supabase
        const { session, error: sessionError } = await supabaseAuthService.getSession();
        
        if (sessionError || !session?.user) {
          console.error("[CALLBACK] No session found after OAuth:", sessionError);
          throw new Error('Không thể lấy thông tin đăng nhập từ Google');
        }

        const user = session.user;
        console.log("[CALLBACK] Google user authenticated:", user.email);
        
        // Lấy query parameters
        const searchParams = new URLSearchParams(location.search);
        const tableId = searchParams.get('table');
        const token = searchParams.get('token');
        const fromPath = searchParams.get('from_path') || '/menu';
        const redirectTo = searchParams.get('redirect_to');
        
        console.log("[CALLBACK] Query params:", {
          tableId,
          token,
          fromPath,
          redirectTo
        });

        // Đồng bộ user với backend
        
        // Xác định nơi cần redirect
        let finalRedirectPath = redirectTo || fromPath || '/menu';
        
        // Thêm query parameters nếu có
        const finalParams = new URLSearchParams();
        if (tableId) finalParams.append('table', tableId);
        if (token) finalParams.append('token', token);
        
        if (finalParams.toString()) {
          finalRedirectPath = finalRedirectPath.includes('?') 
            ? `${finalRedirectPath}&${finalParams.toString()}`
            : `${finalRedirectPath}?${finalParams.toString()}`;
        }
        
        console.log("[CALLBACK] Final redirect path:", finalRedirectPath);
        
        // Redirect về trang đích
        navigate(finalRedirectPath, {
          replace: true,
          state: {
            message: 'Đăng nhập với Google thành công!',
            socialLogin: true
          }
        });

      } catch (error) {
        console.error('[CALLBACK] Error:', error);
        
        // Redirect về trang login với thông báo lỗi
        navigate('/customer/login', {
          replace: true,
          state: {
            error: error.message || 'Đăng nhập Google thất bại. Vui lòng thử lại.'
          }
        });
      }
    };

    handleCallback();
  }, [navigate, location]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-amber-50 to-orange-50">
      <div className="text-center">
        <div className="w-16 h-16 border-4 border-amber-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Đang đăng nhập với Google...</h1>
        <p className="text-gray-600">Vui lòng đợi trong giây lát</p>
      </div>
    </div>
  );
};

export default AuthCallbackPage;