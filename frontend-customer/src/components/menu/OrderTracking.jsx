import React, { useEffect, useState, useRef } from 'react';
import { io } from 'socket.io-client';
import { CheckCircle, Clock, ChefHat, DollarSign, ArrowLeft } from 'lucide-react';
import Swal from 'sweetalert2';
import CustomerService from '../../services/customerService'; // Hãy kiểm tra lại đường dẫn import service cho đúng

// URL Socket của bạn
const SOCKET_URL = 'http://localhost:5000'; 

const OrderTracking = ({ orderId, onOrderMore, tableId }) => {
    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);
    const socketRef = useRef();

    // 1. Lấy dữ liệu đơn hàng & Kết nối Socket
    useEffect(() => {
        const fetchOrder = async () => {
            try {
                const res = await CustomerService.getOrderById(orderId);
                if (res.success) setOrder(res.data);
            } catch (err) {
                console.error("Lỗi lấy đơn hàng:", err);
            } finally {
                setLoading(false);
            }
        };

        if (orderId) fetchOrder();

        socketRef.current = io(SOCKET_URL);
        
        // Lắng nghe sự kiện update từ server (tên event phải khớp với Backend)
        socketRef.current.on(`order_update_${orderId}`, (updatedOrder) => {
            console.log("Order updated:", updatedOrder);
            setOrder(updatedOrder);
        });

        return () => socketRef.current.disconnect();
    }, [orderId]);

    const handleRequestPayment = async () => {
        const result = await Swal.fire({
            title: 'Yêu cầu thanh toán?',
            text: "Nhân viên sẽ mang hóa đơn đến bàn cho bạn.",
            icon: 'question',
            showCancelButton: true,
            confirmButtonColor: '#7e22ce',
            confirmButtonText: 'Đúng, gọi thanh toán',
            cancelButtonText: 'Chưa'
        });

        if (result.isConfirmed) {
            try {
                await CustomerService.requestPayment(orderId);
                Swal.fire('Đã gửi yêu cầu!', 'Vui lòng đợi nhân viên.', 'success');
            } catch (err) {
                Swal.fire('Lỗi', 'Không gửi được yêu cầu.', 'error');
            }
        }
    };

    const formatCurrency = (amount) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);

    const renderItemStatus = (status) => {
        switch (status) {
            case 'pending': return <span className="text-yellow-600 bg-yellow-100 text-xs px-2 py-1 rounded-full flex items-center gap-1"><Clock size={12}/> Chờ duyệt</span>;
            case 'preparing': return <span className="text-blue-600 bg-blue-100 text-xs px-2 py-1 rounded-full flex items-center gap-1"><ChefHat size={12}/> Đang nấu</span>;
            case 'served': return <span className="text-green-600 bg-green-100 text-xs px-2 py-1 rounded-full flex items-center gap-1"><CheckCircle size={12}/> Đã ra món</span>;
            default: return <span className="text-gray-500 text-xs">{status}</span>;
        }
    };

    if (loading) return <div className="text-center p-10">Đang tải hóa đơn...</div>;
    if (!order) return <div className="text-center p-10">Không tìm thấy đơn hàng</div>;

    return (
        <div className="min-h-screen bg-gray-50 pb-24">
            {/* Header */}
            <div className="bg-white p-4 shadow-sm sticky top-0 z-10 flex items-center justify-between">
                <button onClick={onOrderMore} className="flex items-center text-blue-600 font-medium">
                    <ArrowLeft size={20} className="mr-1" /> Gọi thêm món
                </button>
                <div className="text-right">
                    <p className="text-xs text-gray-500">Đơn hàng</p>
                    <p className="font-bold text-gray-800">#{orderId.toString().slice(-6).toUpperCase()}</p>
                </div>
            </div>

            {/* List Món Ăn */}
            <div className="p-4 space-y-4">
                <div className="bg-white rounded-xl shadow-sm p-4">
                    <h3 className="font-bold text-lg mb-3 border-b pb-2">Danh sách món</h3>
                    {order.items?.map((item, idx) => (
                        <div key={idx} className="flex justify-between items-start py-3 border-b border-dashed last:border-0">
                            <div className="flex-1">
                                <div className="flex justify-between">
                                    <span className="font-medium text-gray-800">{item.quantity}x {item.name || item.menuItem?.name}</span>
                                    <span className="text-gray-600">{formatCurrency(item.price * item.quantity)}</span>
                                </div>
                                {item.notes && <p className="text-xs text-gray-400 italic mt-1">Ghi chú: {item.notes}</p>}
                                <div className="mt-2">
                                    {renderItemStatus(item.status)}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Tổng tiền */}
                <div className="bg-white rounded-xl shadow-sm p-4">
                    <div className="flex justify-between items-center text-lg font-bold">
                        <span>Tổng tạm tính:</span>
                        <span className="text-orange-600">{formatCurrency(order.totalAmount)}</span>
                    </div>
                </div>
            </div>

            {/* Bottom Actions */}
            <div className="fixed bottom-0 left-0 right-0 bg-white border-t p-4 flex gap-3">
                <button onClick={onOrderMore} className="flex-1 py-3 bg-gray-100 text-gray-700 font-bold rounded-xl hover:bg-gray-200 transition">
                    + Gọi thêm
                </button>
                <button onClick={handleRequestPayment} className="flex-1 py-3 bg-purple-600 text-white font-bold rounded-xl shadow-lg hover:bg-purple-700 flex justify-center items-center gap-2">
                    <DollarSign size={20} /> Thanh toán
                </button>
            </div>
        </div>
    );
};

export default OrderTracking;