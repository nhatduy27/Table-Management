import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import CustomerService from '../services/customerService';
import { ArrowLeft, MapPin, Clock, Receipt, Star } from 'lucide-react';
import ReviewModal from '../components/review/ReviewModal';

const OrderDetailPage = () => {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const [items, setItems] = useState([]);
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // Review Modal State
  const [reviewModalOpen, setReviewModalOpen] = useState(false);
  const [selectedMenuItem, setSelectedMenuItem] = useState(null);
  const [reviewedItems, setReviewedItems] = useState(new Set()); // Track món đã review

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

        // Fetch danh sách món đã review (nếu order đã completed)
        if (actualOrder.status === 'completed') {
          try {
            const reviewableData = await CustomerService.getReviewableItems(orderId);
            if (reviewableData.success) {
              // Backend trả về reviewable_items (món CHƯA review)
              // Tính ngược lại: tất cả món - món chưa review = món đã review
              const allItemIds = (actualOrder.items || []).map(i => i.menu_item_id || i.menu_item?.id);
              const reviewableIds = new Set(
                reviewableData.data.reviewable_items?.map(r => r.menu_item_id) || []
              );
              // Món đã review = món không có trong reviewable_items
              const reviewedIds = new Set(
                allItemIds.filter(id => !reviewableIds.has(id))
              );
              setReviewedItems(reviewedIds);
            }
          } catch (reviewError) {
            console.error('Lỗi khi lấy thông tin review:', reviewError);
          }
        }
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

  // Handler mở review modal
  const handleOpenReview = (item) => {
    setSelectedMenuItem({
      id: item.menu_item_id || item.menu_item?.id,
      name: item.menu_item?.name || item.name,
      price: item.price_at_order
    });
    setReviewModalOpen(true);
  };

  const handleReviewSuccess = () => {
    // Thêm món vào danh sách đã review
    if (selectedMenuItem?.id) {
      setReviewedItems(prev => new Set([...prev, selectedMenuItem.id]));
    }
    setReviewModalOpen(false);
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
                 // 🔥 Tính giá đúng: base price + tất cả modifier prices
                 const basePrice = parseFloat(item.price_at_order || item.menu_item?.price || 0);
                 const modifiersTotal = (item.modifiers || []).reduce((sum, mod) => {
                   return sum + parseFloat(
                     mod.price ||
                     mod.price_adjustment ||
                     mod.modifier_option?.price_adjustment ||
                     0
                   );
                 }, 0);
                 const itemTotal = (basePrice + modifiersTotal) * item.quantity;

                 return (
                    <div key={index} className="p-5 grid grid-cols-12 gap-4 items-start hover:bg-gray-50/50 transition-colors">
                      {/* Tên & Topping */}
                      <div className="col-span-8 md:col-span-6">
                        <div className="flex items-baseline gap-2 flex-wrap">
                          <p className="font-bold text-gray-800 break-words text-lg md:text-base">
                            {item.menu_item?.name || item.name || "Món ăn chưa xác định"}
                          </p>
                          <span className="text-sm text-gray-500 font-medium">
                            {formatCurrency(item.price_at_order)}
                          </span>
                        </div>
                        
                        {/* 🔥 FIX: HIỆN TOPPING (Modifiers) VỚI GIÁ */}
                        {item.modifiers && item.modifiers.length > 0 && (
                            <div className="mt-1.5 space-y-1">
                                {item.modifiers.map((mod, idx) => {
                                    const modPrice = parseFloat(
                                      mod.price ||
                                      mod.price_adjustment ||
                                      mod.modifier_option?.price_adjustment ||
                                      0
                                    );
                                    return (
                                      <p key={idx} className="text-xs text-gray-500 flex items-center gap-2">
                                        <span className="flex items-center gap-1.5">
                                          <span className="w-1 h-1 rounded-full bg-gray-400"></span>
                                          <span>+ {mod.modifier_option?.name || mod.name}</span>
                                        </span>
                                        {modPrice > 0 && (
                                          <span className="font-medium text-gray-700">
                                            {formatCurrency(modPrice)}
                                          </span>
                                        )}
                                      </p>
                                    );
                                })}
                            </div>
                        )}

                        {/* 🔥 FIX: HIỆN GHI CHÚ MÓN */}
                        {item.notes && (
                             <div className="flex items-start gap-1 mt-2 text-orange-600 text-xs italic bg-orange-50 p-1.5 rounded w-fit">
                                <span>Note:</span>
                                <span>{item.notes}</span>
                             </div>
                        )}
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
                        
                        {/* Nút Review - chỉ hiện khi order đã completed */}
                        {order?.status === 'completed' && (
                          reviewedItems.has(item.menu_item_id || item.menu_item?.id) ? (
                            <div className="mt-2 inline-flex items-center gap-1.5 px-3 py-1.5 bg-green-100 text-green-700 text-xs font-bold rounded-lg border border-green-200">
                              <Star size={14} className="fill-green-600" />
                              Đã đánh giá
                            </div>
                          ) : (
                            <button
                              onClick={() => handleOpenReview(item)}
                              className="mt-2 inline-flex items-center gap-1.5 px-3 py-1.5 bg-orange-500 hover:bg-orange-600 text-white text-xs font-bold rounded-lg transition-colors shadow-sm"
                            >
                              <Star size={14} />
                              Đánh giá
                            </button>
                          )
                        )}
                      </div>
                    </div>
                 );
              }) : (
                <div className="p-10 text-center text-gray-400">Không có dữ liệu món ăn</div>
              )}
            </div>

            {/* Total Section */}
            <div className="bg-gray-50 border-t-2 border-gray-200">
              {/* Hiển thị breakdown nếu order đã có subtotal > 0 (waiter đã chốt bill) */}
              {order?.subtotal > 0 ? (
                <div className="p-6 space-y-3">
                  <div className="flex justify-between items-center text-gray-600">
                    <span className="text-sm">Tạm tính</span>
                    <span className="font-medium">{formatCurrency(order.subtotal)}</span>
                  </div>
                  
                  {order.discount_value > 0 && (
                    <div className="flex justify-between items-center text-red-600">
                      <span className="text-sm">
                        Giảm giá 
                        {order.discount_type === 'percent' && ` (${order.discount_value}%)`}
                      </span>
                      <span className="font-medium">
                        -{formatCurrency(
                          order.discount_type === 'percent'
                            ? (order.subtotal * order.discount_value) / 100
                            : order.discount_value
                        )}
                      </span>
                    </div>
                  )}
                  
                  {order.tax_amount > 0 && (
                    <div className="flex justify-between items-center text-gray-600">
                      <span className="text-sm">Thuế</span>
                      <span className="font-medium">+{formatCurrency(order.tax_amount)}</span>
                    </div>
                  )}
                  
                  {/* Hiển thị phương thức thanh toán nếu đã chọn */}
                  {order.payment_method && (
                    <div className="flex justify-between items-center py-2 px-3 bg-blue-50 rounded-lg border border-blue-200">
                      <span className="text-sm font-medium text-gray-700">Phương thức thanh toán</span>
                      <span className="font-bold text-blue-600 flex items-center gap-1">
                        {order.payment_method === 'cash' && '💵 Tiền mặt'}
                        {order.payment_method === 'momo' && '🟣 MoMo'}
                        {order.payment_method === 'vnpay' && '🔵 VNPay'}
                        {!['cash', 'momo', 'vnpay'].includes(order.payment_method) && order.payment_method}
                      </span>
                    </div>
                  )}
                  
                  <div className="pt-3 border-t-2 border-dashed border-gray-300">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-orange-100 rounded-lg">
                          <Receipt size={24} className="text-orange-600" />
                        </div>
                        <div>
                          <span className="block font-bold text-gray-900 text-lg">Tổng thanh toán</span>
                          <span className="text-xs text-gray-500">Đã bao gồm thuế & phí</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="text-3xl font-black text-orange-600 tracking-tight">
                          {formatCurrency(order.total_amount)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                // Nếu chưa chốt bill, hiển thị tổng đơn giản
                <div className="p-6 bg-gray-900 text-white">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-white/10 rounded-lg hidden md:block">
                        <Receipt size={24} className="text-orange-500" />
                      </div>
                      <div>
                        <span className="block font-medium opacity-90 text-sm">Tổng thanh toán</span>
                        <span className="text-xs opacity-50 italic">Tạm tính</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="text-2xl md:text-3xl font-black text-orange-500 tracking-tight">
                        {formatCurrency(order?.total_amount || totalAmount)}
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
          

      {/* Review Modal */}
      <ReviewModal
        isOpen={reviewModalOpen}
        onClose={() => setReviewModalOpen(false)}
        menuItem={selectedMenuItem}
        orderId={orderId}
        onSuccess={handleReviewSuccess}
      />
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