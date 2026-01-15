import React, { useState, useEffect } from "react";
import { useNavigate, Link, useLocation } from "react-router-dom";
import CustomerService from "../services/customerService";
import TableService from "../services/tableService";

const OrderHistoryPage = () => {
  const [orders, setOrders] = useState([]);
  const [tableNames, setTableNames] = useState({});
  const [loading, setLoading] = useState(true);
  
  const navigate = useNavigate();
  const location = useLocation();

  // Logic quay lại
  const getFromPath = () => {
    if (location.state?.from) return location.state.from;
    const searchParams = new URLSearchParams(location.search);
    const tableId = searchParams.get('table');
    const token = searchParams.get('token');
    
    if (tableId || token) {
      const params = new URLSearchParams();
      if (tableId) params.append('table', tableId);
      if (token) params.append('token', token);
      return `/menu?${params.toString()}`;
    }
    return "/";
  };

  const fromPath = getFromPath();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      // Check login
      if (!CustomerService.isLoggedIn()) {
        navigate("/customer/login", { state: { from: location.pathname + location.search } });
        return;
      }

      // 1. Lấy danh sách đơn
      const ordersResponse = await CustomerService.getOrders();
      const fetchedOrders = ordersResponse.data || [];
      
      // Sắp xếp đơn mới nhất lên đầu
      fetchedOrders.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
      
      setOrders(fetchedOrders);

      // 2. Lấy tên bàn (Fallback nếu backend không trả về order.table)
      // Lọc ra các order mà chưa có thông tin table bên trong object
      const missingTableOrders = fetchedOrders.filter(o => !o.table && o.table_id);
      
      if (missingTableOrders.length > 0) {
          const uniqueTableIds = [...new Set(missingTableOrders.map(o => o.table_id))];
          const namesMap = {};
          await Promise.all(
            uniqueTableIds.map(async (id) => {
              try {
                const response = await TableService.getTableNumberById(id);
                namesMap[id] = response.data?.table_number || "N/A";
              } catch (err) {
                namesMap[id] = "?";
              }
            })
          );
          setTableNames(namesMap);
      }
      
    } catch (err) {
      console.error(err);
      if (err.message?.includes("401")) {
        CustomerService.logout();
        navigate("/customer/login");
      }
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "";
    return new Date(dateString).toLocaleDateString("vi-VN", {
      year: 'numeric', month: '2-digit', day: '2-digit',
      hour: '2-digit', minute: '2-digit'
    });
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount || 0);
  };

  // 🔥 HÀM MỚI: Hiển thị trạng thái đẹp & đúng logic
  const getStatusBadge = (status) => {
      const configs = {
          completed: { label: 'Hoàn thành', class: 'bg-green-100 text-green-800' },
          cancelled: { label: 'Đã hủy', class: 'bg-red-100 text-red-800' },
          pending:   { label: 'Chờ xác nhận', class: 'bg-yellow-100 text-yellow-800' },
          confirmed: { label: 'Đã xác nhận', class: 'bg-blue-100 text-blue-800' },
          preparing: { label: 'Đang nấu', class: 'bg-orange-100 text-orange-800' },
          ready:     { label: 'Sẵn sàng', class: 'bg-purple-100 text-purple-800' },
          served:    { label: 'Đang phục vụ', class: 'bg-indigo-100 text-indigo-800' },
          payment:   { label: 'Thanh toán', class: 'bg-pink-100 text-pink-800' },
      };

      const config = configs[status] || { label: status, class: 'bg-gray-100 text-gray-800' };

      return (
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.class}`}>
          <span className={`w-1.5 h-1.5 rounded-full mr-1.5 bg-current opacity-60`}></span>
          {config.label}
        </span>
      );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 font-sans">
      <div className="container mx-auto px-4 max-w-6xl">
        
        <div className="mb-8 text-center md:text-left flex flex-col md:flex-row justify-between items-center gap-4">
          <div>
              <h1 className="text-3xl font-bold text-gray-900">Lịch sử đơn hàng</h1>
              <p className="text-gray-500 mt-1">Các bữa ăn bạn đã thưởng thức</p>
          </div>
          {/* Nút quay lại menu nếu cần */}
          <Link to={fromPath} className="text-orange-600 font-medium hover:underline text-sm">
             ← Quay lại thực đơn
          </Link>
        </div>

        {orders.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-16 text-center">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Bạn chưa có đơn hàng nào</h3>
            <Link to={fromPath} className="inline-block px-8 py-3 bg-orange-600 text-white rounded-xl font-bold hover:bg-orange-700 transition-colors">
              Đặt món ngay
            </Link>
          </div>
        ) : (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase">Mã / Ngày</th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase">Bàn</th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase">Tổng tiền</th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase">Trạng thái</th>
                    <th className="px-6 py-4 text-right text-xs font-bold text-gray-500 uppercase"></th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {orders.map((order) => (
                    <tr key={order.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="text-sm font-bold text-gray-900">#{order.id.slice(0,8).toUpperCase()}</div>
                        <div className="text-xs text-gray-500">{formatDate(order.created_at || order.ordered_at)}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-gray-100 text-gray-700">
                          {/* Ưu tiên lấy từ order.table, nếu không có thì lấy từ map */}
                          Bàn {order.table?.table_number || tableNames[order.table_id] || "?"}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm font-bold text-orange-600">{formatCurrency(order.total_amount)}</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {/* 🔥 SỬ DỤNG HÀM GET STATUS BADGE */}
                        {getStatusBadge(order.status)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right">
                        <button
                          onClick={() => navigate(`/customer/orders/${order.id}`)}
                          className="text-orange-600 hover:text-orange-800 text-sm font-semibold hover:underline"
                        >
                          Chi tiết
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default OrderHistoryPage;