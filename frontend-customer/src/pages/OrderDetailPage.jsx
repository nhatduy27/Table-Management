import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import CustomerService from '../services/customerService';
import { ArrowLeft, MapPin, Clock, Receipt } from 'lucide-react'; // Thêm icon

const OrderDetailPage = () => {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const [items, setItems] = useState([]);
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  // --- 1. HELPER: BADGE TRẠNG THÁI (UI Đẹp) ---
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
      <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-bold border ${config.class}`}>
        <span className="w-2 h-2 rounded-full bg-current mr-2 opacity-70"></span>
        {config.label}
      </span>
    );
  };

  // --- 2. LOGIC FETCH DATA (Đã fix lỗi N/A và Mang về) ---
  useEffect(() => {
    const fetchOrderDetail = async () => {
      try {
        setLoading(true);
        // Gọi API (Backend đã update service include table + modifiers)
        const apiResponse = await CustomerService.getOrderById(orderId);
        
        // Log để kiểm tra (có thể xóa sau này)
        console.log("🔍 API Response:", apiResponse);

        // Xử lý data an toàn (phòng trường hợp axios bọc data)
        const actualOrder = apiResponse.data || apiResponse;
        
        setOrder(actualOrder);
        setItems(actualOrder.items || []);
      } catch (error) {
        console.error('Lỗi khi lấy chi tiết đơn hàng:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchOrderDetail();
  }, [orderId]);

  // --- 3. FORMATTERS ---
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount || 0);
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleString('vi-VN', {
      hour: '2-digit', minute: '2-digit', day: '2-digit', month: '2-digit', year: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600"></div>
      </div>
    );
  }

  // Fallback tính tổng nếu backend chưa trả total_amount
  const totalAmount = items.reduce((sum, item) => 
    sum + (Number(item.quantity || 0) * Number(item.price_at_order || 0)), 0
  );

  return (
    <div className="min-h-screen bg-gray-50 flex justify-center py-6 px-4 font-sans"> 
      <div className="w-full max-w-3xl"> 
        
        {/* --- HEADER --- */}
        <div className="mb-6 flex items-center gap-4">
          <button onClick={() => navigate(-1)} className="p-2 bg-white rounded-full shadow-sm hover:bg-gray-100 transition-colors">
            <ArrowLeft size={20} className="text-gray-600" />
          </button>
          <div>
            <h1 className="text-2xl font-extrabold text-gray-900">Chi tiết đơn hàng</h1>
            <p className="text-gray-500 text-sm font-mono">#{orderId?.substring(0, 8).toUpperCase()}</p>
          </div>
        </div>

        <div className="space-y-6">
          {/* --- 1. INFO CARD (Trạng thái, Bàn, Giờ) --- */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                
                {/* Trạng thái */}
                <div className="flex flex-col gap-1">
                    <span className="text-xs text-gray-400 uppercase font-bold tracking-wider">Trạng thái</span>
                    {getStatusBadge(order?.status)}
                </div>

                {/* Thông tin Bàn & Giờ */}
                <div className="flex gap-6 w-full md:w-auto">
                    <div className="flex items-center gap-2 flex-1 md:flex-none">
                        <div className="p-2 bg-orange-50 rounded-lg text-orange-600">
                            <MapPin size={18} />
                        </div>
                        <div>
                            <p className="text-xs text-gray-400 font-bold uppercase">Vị trí</p>
                            {/* 🔥 FIX: Hiển thị đúng số bàn hoặc Mang về */}
                            <p className="font-bold text-gray-900">
                                {order?.table?.table_number ? `Bàn ${order.table.table_number}` : 'Mang về'}
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2 flex-1 md:flex-none">
                        <div className="p-2 bg-blue-50 rounded-lg text-blue-600">
                            <Clock size={18} />
                        </div>
                        <div>
                            <p className="text-xs text-gray-400 font-bold uppercase">Thời gian</p>
                            {/* 🔥 FIX: Hiển thị đúng giờ */}
                            <p className="font-bold text-gray-900">
                                {formatDate(order?.created_at || order?.ordered_at)}
                            </p>
                        </div>
                    </div>
                </div>
            </div>
          </div>

          {/* --- 2. LIST MÓN ĂN --- */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="hidden md:grid grid-cols-12 gap-4 p-5 bg-gray-50/80 border-b border-gray-100 text-xs uppercase font-bold text-gray-500 tracking-wider">
              <div className="col-span-6">Tên món</div>
              <div className="col-span-2 text-center">SL</div>
              <div className="col-span-4 text-right">Thành tiền</div>
            </div>
            
            <div className="divide-y divide-gray-50">
              {items.length > 0 ? items.map((item, index) => {
                 // Tính giá item (bao gồm topping nếu có logic đó, ở đây hiển thị đơn giản)
                 const itemTotal = item.total_price || (item.quantity * item.price_at_order);

                 return (
                    <div key={index} className="p-5 grid grid-cols-12 gap-4 items-start hover:bg-gray-50/50 transition-colors">
                      {/* Tên & Topping */}
                      <div className="col-span-8 md:col-span-6">
                        <p className="font-bold text-gray-800 break-words text-lg md:text-base">
                          {item.menu_item?.name || item.name || "Món ăn chưa xác định"}
                        </p>
                        
                        {/* 🔥 FIX: HIỆN TOPPING (Modifiers) */}
                        {item.modifiers && item.modifiers.length > 0 && (
                            <div className="mt-1.5 space-y-1">
                                {item.modifiers.map((mod, idx) => (
                                    <p key={idx} className="text-xs text-gray-500 flex items-center gap-1.5">
                                        <span className="w-1 h-1 rounded-full bg-gray-400"></span>
                                        <span>+ {mod.modifier_option?.name || mod.name}</span>
                                    </p>
                                ))}
                            </div>
                        )}

                        {/* 🔥 FIX: HIỆN GHI CHÚ MÓN */}
                        {item.notes && (
                             <div className="flex items-start gap-1 mt-2 text-orange-600 text-xs italic bg-orange-50 p-1.5 rounded w-fit">
                                <span>Note:</span>
                                <span>{item.notes}</span>
                             </div>
                        )}

                        <p className="text-xs text-gray-400 mt-1 md:hidden">
                           Đơn giá: {formatCurrency(item.price_at_order)}
                        </p>
                      </div>

                      {/* Số lượng */}
                      <div className="col-span-4 md:col-span-2 text-left md:text-center">
                        <span className="inline-flex items-center px-3 py-1 rounded-lg text-sm font-bold bg-gray-100 text-gray-800 border border-gray-200">
                          x{item.quantity}
                        </span>
                      </div>

                      {/* Thành tiền */}
                      <div className="col-span-12 md:col-span-4 text-right mt-2 md:mt-0 pt-2 md:pt-0 border-t md:border-t-0 border-dashed border-gray-200">
                        <p className="font-bold text-gray-900 text-lg md:text-base">
                          {formatCurrency(itemTotal)}
                        </p>
                      </div>
                    </div>
                 );
              }) : (
                <div className="p-10 text-center text-gray-400">Không có dữ liệu món ăn</div>
              )}
            </div>

            {/* Total Section */}
            <div className="p-6 bg-gray-900 text-white">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-white/10 rounded-lg hidden md:block">
                    <Receipt size={24} className="text-orange-500" />
                  </div>
                  <div>
                    <span className="block font-medium opacity-90 text-sm">Tổng thanh toán</span>
                    <span className="text-xs opacity-50 italic">Đã bao gồm thuế & phí</span>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-2xl md:text-3xl font-black text-orange-500 tracking-tight">
                    {formatCurrency(order?.total_amount || totalAmount)}
                  </span>
                </div>
              </div>
            </div>
          </div>
          
          {/* --- 3. GHI CHÚ TỔNG --- */}
          {order?.notes && (
            <div className="bg-orange-50 border border-orange-100 rounded-2xl p-5">
              <div className="flex items-center gap-2 mb-2">
                <p className="text-xs font-bold text-orange-700 uppercase tracking-wider">Ghi chú đơn hàng</p>
              </div>
              <p className="text-sm text-gray-700 italic leading-relaxed">"{order.notes}"</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default OrderDetailPage;