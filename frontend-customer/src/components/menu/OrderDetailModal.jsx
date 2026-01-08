import React from 'react';
import { X, Clock, Receipt } from 'lucide-react';

const OrderDetailModal = ({ order, onClose }) => {
  if (!order) return null;

  // Hàm format tiền tệ
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
  };

  // Hàm hiển thị trạng thái bằng tiếng Việt
  const getStatusText = (status) => {
    switch(status) {
        case 'pending': return 'Chờ xác nhận';
        case 'preparing': return 'Đang chuẩn bị';
        case 'serving': return 'Đã lên món';
        case 'payment': return 'Chờ thanh toán';
        case 'completed': return 'Hoàn tất';
        case 'cancelled': return 'Đã hủy';
        default: return status;
    }
  };

  // Hàm hiển thị màu trạng thái
  const getStatusColor = (status) => {
    switch(status) {
        case 'pending': return 'bg-yellow-100 text-yellow-800';
        case 'preparing': return 'bg-blue-100 text-blue-800';
        case 'serving': return 'bg-green-100 text-green-800';
        case 'payment': return 'bg-purple-100 text-purple-800';
        default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-2xl w-full max-w-md overflow-hidden shadow-2xl flex flex-col max-h-[80vh]">
        
        {/* HEADER */}
        <div className="bg-white p-4 border-b flex justify-between items-center sticky top-0 z-10">
          <div>
            <h3 className="text-lg font-bold flex items-center gap-2">
              <Receipt size={20} className="text-orange-600"/>
              Chi tiết đơn hàng
            </h3>
            <p className="text-xs text-gray-500">Mã đơn: #{order.id?.toString().slice(-6).toUpperCase()}</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
            <X size={24} className="text-gray-500" />
          </button>
        </div>

        {/* BODY - SCROLLABLE */}
        <div className="p-4 overflow-y-auto flex-1 bg-gray-50">
          
          {/* Trạng thái đơn */}
          <div className="mb-4 flex justify-between items-center bg-white p-3 rounded-xl border border-gray-100 shadow-sm">
            <span className="text-sm font-medium text-gray-600 flex items-center gap-1">
                <Clock size={16}/> Trạng thái:
            </span>
            <span className={`px-3 py-1 rounded-full text-xs font-bold ${getStatusColor(order.status)}`}>
              {getStatusText(order.status)}
            </span>
          </div>

          {/* Danh sách món */}
          <div className="space-y-3">
            {order.items?.map((item, index) => (
              <div key={index} className="bg-white p-3 rounded-xl border border-gray-100 shadow-sm flex justify-between gap-3">
                
                {/* Số lượng */}
                <div className="flex flex-col justify-start pt-1">
                   <span className="w-6 h-6 flex items-center justify-center bg-orange-100 text-orange-600 text-xs font-bold rounded-md">
                     {item.quantity}x
                   </span>
                </div>

                {/* Thông tin món */}
                <div className="flex-1">
                  <h4 className="font-medium text-gray-900">{item.name || item.menu_item_name}</h4>
                  
                  {/* Modifiers (Topping, Size...) */}
                  {item.modifiers && item.modifiers.length > 0 && (
                    <div className="text-xs text-gray-500 mt-1 space-y-0.5">
                      {item.modifiers.map((mod, idx) => (
                         <p key={idx}>+ {mod.name}</p>
                      ))}
                    </div>
                  )}
                  
                  {/* Ghi chú */}
                  {item.notes && (
                    <p className="text-xs text-gray-400 italic mt-1">Note: {item.notes}</p>
                  )}
                </div>

                {/* Giá tiền */}
                <div className="text-right">
                  <p className="font-medium text-gray-900">{formatCurrency(item.price || item.price_at_order)}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* FOOTER */}
        <div className="p-4 bg-white border-t space-y-3 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
          <div className="flex justify-between items-center text-gray-600">
            <span>Tạm tính</span>
            <span>{formatCurrency(order.totalAmount || order.total_amount)}</span>
          </div>
          
          <div className="border-t border-dashed my-2"></div>
          
          <div className="flex justify-between items-center text-xl font-bold text-gray-900">
            <span>Tổng cộng</span>
            <span className="text-orange-600">{formatCurrency(order.totalAmount || order.total_amount)}</span>
          </div>

          <button 
            onClick={onClose}
            className="w-full py-3 bg-gray-900 text-white rounded-xl font-bold hover:bg-gray-800 transition-colors mt-2"
          >
            Đóng
          </button>
        </div>

      </div>
    </div>
  );
};

export default OrderDetailModal;