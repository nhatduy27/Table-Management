import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { LogOut } from 'lucide-react';
import axios from 'axios';
import { io } from 'socket.io-client'; // Import Socket
import { 
  CheckCircle, XCircle, Clock, DollarSign, Bell, Utensils, RefreshCw 
} from 'lucide-react';

// CẤU HÌNH API URL (Sửa lại theo port backend của bạn, ví dụ 3000, 4000 hay 5000)
const API_URL = 'http://localhost:5000/api'; 
const SOCKET_URL = 'http://localhost:5000';

const WaiterDashboard = () => {
  const [orders, setOrders] = useState([]); // Dữ liệu khởi tạo là Rỗng
  const [filter, setFilter] = useState('all');
  const [currentTime, setCurrentTime] = useState(new Date());
  
  // Ref để giữ kết nối socket
  const socketRef = useRef();

  // 1. LẤY DỮ LIỆU BAN ĐẦU TỪ API & KẾT NỐI SOCKET
  useEffect(() => {
    // A. Gọi API lấy danh sách đơn hiện tại
    const fetchOrders = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await axios.get(`${API_URL}/admin/orders`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        // Giả sử Backend trả về mảng orders
        if (res.data.success) {
            setOrders(res.data.data || []); 
        }
      } catch (err) {
        console.error("Lỗi lấy danh sách đơn:", err);
      }
    };
    fetchOrders();

    // B. Kết nối Socket.IO
    socketRef.current = io(SOCKET_URL);

    // Lắng nghe sự kiện 'new_order' từ Backend bắn sang
    socketRef.current.on('new_order', (newOrder) => {
      console.log("Có đơn mới:", newOrder);
      // Phát âm thanh thông báo (Tùy chọn)
      const audio = new Audio('/sounds/ding.mp3'); // Cần có file này trong public/sounds
      audio.play().catch(e => console.log("Chưa tương tác user nên không phát tiếng"));

      // Cập nhật state: Thêm đơn mới vào đầu danh sách
      setOrders((prev) => [newOrder, ...prev]);
    });

    // Cleanup khi đóng trang
    return () => {
      socketRef.current.disconnect();
    };
  }, []);

  // Đồng hồ
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 10000);
    return () => clearInterval(timer);
  }, []);

  // --- CÁC HÀM XỬ LÝ (GỌI API) ---

  const handleAcceptOrder = async (orderId) => {
    try {
      const token = localStorage.getItem('token');
      // Gọi API báo Backend là Waiter đã nhận
      await axios.put(`${API_URL}/admin/orders/${orderId}/status`, 
        { status: 'preparing' }, 
        { headers: { Authorization: `Bearer ${token}` } }
      );

      // Cập nhật UI ngay lập tức
      setOrders(prev => prev.map(o => o._id === orderId ? { ...o, status: 'preparing' } : o));
    } catch (err) {
      console.error(err);
      alert("Lỗi: " + (err.response?.data?.message || "Không thể duyệt đơn"));
    }
  };

  const handleRejectOrder = async (orderId) => {
    if(!window.confirm("Từ chối đơn này?")) return;
    try {
        const token = localStorage.getItem('token');
        await axios.put(`${API_URL}/orders/${orderId}/status`, 
            { status: 'cancelled' },
            { headers: { Authorization: `Bearer ${token}` } }
        );
        setOrders(prev => prev.filter(o => o._id !== orderId));
    } catch (err) {
        alert("Lỗi từ chối đơn!");
    }
  };

  const handleConfirmPayment = async (orderId) => {
    try {
        const token = localStorage.getItem('token');
        await axios.put(`${API_URL}/orders/${orderId}/status`, 
            { status: 'completed' },
            { headers: { Authorization: `Bearer ${token}` } }
        );
        setOrders(prev => prev.map(o => o._id === orderId ? { ...o, status: 'completed' } : o));
        setTimeout(() => setOrders(prev => prev.filter(o => o._id !== orderId)), 2000);
    } catch (err) {
        alert("Lỗi xác nhận thanh toán!");
    }
  };

  // --- LOGIC HIỂN THỊ (GIỮ NGUYÊN CODE CŨ) ---
  const filteredOrders = orders.filter(order => {
    if (filter === 'all') return true;
    // Lưu ý: Cần kiểm tra logic này khớp với dữ liệu thật trả về từ DB
    if (filter === 'pending') return order.status === 'pending'; 
    if (filter === 'payment') return order.status === 'payment';
    return true;
  });

  const getMinutesWaiting = (startTime) => {
    if (!startTime) return 0;
    const diff = Math.floor((new Date() - new Date(startTime)) / 60000);
    return diff;
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
  };

  const navigate = useNavigate();

  const handleLogout = () => {
    // 1. Hỏi xác nhận cho chắc chắn
    const isConfirm = window.confirm("Bạn có chắc chắn muốn đăng xuất không?");
    
    if (isConfirm) {
      // 2. Xóa token lưu trong máy
      localStorage.removeItem('token');
      // localStorage.removeItem('user_info'); // Xóa thêm nếu có lưu thông tin khác

      // 3. Đá về trang đăng nhập
      // [LƯU Ý] Sửa '/login' thành đường dẫn trang đăng nhập nhân viên của bạn
      navigate('/login'); 
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 font-sans">
      <header className="bg-white shadow-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          
          {/* BÊN TRÁI: Logo & Tiêu đề */}
          <div className="flex items-center gap-3">
            <div className="bg-blue-600 p-2 rounded-lg shadow-sm">
              <Utensils className="text-white w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900 leading-tight">Waiter Dashboard</h1>
              <p className="text-sm text-gray-500 font-medium">
                {currentTime.toLocaleTimeString('vi-VN', {hour: '2-digit', minute:'2-digit'})}
              </p>
            </div>
          </div>

          {/* BÊN PHẢI: Live Data & Đăng xuất */}
          <div className="flex items-center gap-3">
            {/* Badge Live Data (Thêm hiệu ứng nhấp nháy cho xịn) */}
            <div className="hidden sm:flex items-center gap-1 bg-green-50 text-green-700 px-3 py-1.5 rounded-full text-xs font-bold border border-green-200">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                </span>
                Live
            </div>

            {/* Nút Đăng xuất */}
            <button 
                onClick={handleLogout}
                className="flex items-center gap-2 bg-gray-100 hover:bg-red-50 text-gray-600 hover:text-red-600 px-4 py-2 rounded-lg transition-all duration-200 font-medium border border-transparent hover:border-red-200"
                title="Đăng xuất"
            >
                <LogOut size={18} />
                <span className="hidden sm:inline">Thoát</span>
            </button>
          </div>
        </div>
        
        {/* Filter Tabs (Giữ nguyên) */}
        <div className="border-t border-gray-100 overflow-x-auto scrollbar-hide">
          <div className="max-w-7xl mx-auto px-4 flex gap-6 py-3">
             <button onClick={() => setFilter('all')} className={`font-medium text-sm transition-colors ${filter==='all'?'text-blue-600 bg-blue-50 px-3 py-1 rounded-md':'text-gray-500 hover:text-gray-700 px-3 py-1'}`}>
                Tất cả đơn
             </button>
             <button onClick={() => setFilter('pending')} className={`font-medium text-sm transition-colors ${filter==='pending'?'text-yellow-600 bg-yellow-50 px-3 py-1 rounded-md':'text-gray-500 hover:text-gray-700 px-3 py-1'}`}>
                Cần xử lý
             </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          
          {/* MAPPING DỮ LIỆU THẬT */}
          {filteredOrders.map((order) => {
            // Mapping ID: MongoDB thường dùng _id, code cũ dùng id. Kiểm tra kỹ chỗ này.
            const orderId = order._id || order.id; 
            const isPayment = order.status === 'payment';
            const isPending = order.status === 'pending';
            
            return (
              <div key={orderId} className={`bg-white rounded-xl shadow p-4 border ${isPending ? 'border-yellow-500 border-l-4' : 'border-gray-200'}`}>
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-bold">Bàn {order.tableNumber || order.tableId}</h2>
                  <span className="text-xs text-gray-500">{getMinutesWaiting(order.createdAt)} phút</span>
                </div>

                <div className="space-y-2 mb-4 max-h-48 overflow-y-auto">
                  {order.items?.map((item, idx) => (
                    <div key={idx} className="flex justify-between text-sm">
                      <span>{item.quantity}x {item.name || item.menuItem?.name}</span>
                      <span className="font-medium">{formatCurrency(item.price)}</span>
                    </div>
                  ))}
                </div>

                <div className="flex justify-between items-center border-t pt-3">
                  <span className="font-bold text-lg">{formatCurrency(order.totalAmount)}</span>
                  <div className="flex gap-2">
                    {isPending && (
                       <button onClick={() => handleAcceptOrder(orderId)} className="bg-blue-600 text-white px-4 py-2 rounded text-sm font-bold hover:bg-blue-700">Duyệt</button>
                    )}
                    {isPayment && (
                       <button onClick={() => handleConfirmPayment(orderId)} className="bg-purple-600 text-white px-4 py-2 rounded text-sm font-bold">Xong</button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}

          {filteredOrders.length === 0 && (
             <p className="col-span-full text-center text-gray-400 mt-10">Chưa có đơn hàng nào.</p>
          )}
        </div>
      </main>
    </div>
  );
};

export default WaiterDashboard;