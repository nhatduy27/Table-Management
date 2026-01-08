// components/menu/ActiveOrderBar.jsx
import React from 'react';
import { DollarSign, List, Clock } from 'lucide-react';

const ActiveOrderBar = ({ order, onViewOrder, onRequestBill }) => {
  if (!order) return null;

  const getStatusColor = (status) => {
    switch(status) {
        case 'pending': return 'bg-yellow-500';
        case 'preparing': return 'bg-blue-500';
        case 'serving': return 'bg-green-500';
        default: return 'bg-gray-500';
    }
  };

  const getStatusText = (status) => {
    switch(status) {
        case 'pending': return 'Đang chờ xác nhận...'; // Màu vàng
        case 'preparing': return 'Bếp đang nấu...';    // Màu xanh dương
        case 'serving': return 'Đã lên món';          // Màu xanh lá
        case 'payment': return 'Đang chờ thanh toán'; // Màu tím/đỏ
        case 'completed': return 'Hoàn tất';
        default: return 'Đang xử lý';
    }
};

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)] p-4 z-40 pb-safe">
      <div className="container mx-auto flex items-center justify-between">
        <div className="flex items-center gap-3">
            <div className={`w-3 h-3 rounded-full animate-pulse ${getStatusColor(order.status)}`}></div>
            <div className="flex flex-col">
                <span className="text-xs text-gray-500">Đơn #...{order.id?.toString().slice(-4)}</span>
                <span className="font-bold text-sm text-gray-800">{getStatusText(order.status)}</span>
            </div>
        </div>

        <div className="flex gap-2">
            <button 
                onClick={onViewOrder}
                className="bg-gray-100 text-gray-700 px-3 py-2 rounded-lg text-sm font-medium flex items-center gap-1"
            >
                <List size={16} /> Chi tiết
            </button>
            
            {order.status !== 'payment' && (
                <button 
                    onClick={onRequestBill}
                    className="bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-1 shadow-lg shadow-green-200"
                >
                    <DollarSign size={16} /> Gọi Bill
                </button>
            )}
        </div>
      </div>
    </div>
  );
};

export default ActiveOrderBar;