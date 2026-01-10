import React, { useState, useEffect, useCallback } from "react";
import Swal from "sweetalert2";
import customerService from "../../services/customerService";

const OrderStatusModal = ({
  isOpen,
  tableId,
  onClose,
  recentOrderIds,
  socketRef,
}) => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);

  const getStatusLabel = useCallback((status) => {
    const statusMap = {
      pending: "Chờ xác nhận",
      confirmed: "Đã xác nhận",
      preparing: "Đang chuẩn bị",
      ready: "Sẵn sàng",
      served: "Đã phục vụ",
      payment: "Chờ thanh toán",
      completed: "Hoàn thành",
    };
    return statusMap[status] || status;
  }, []);

  const fetchOrders = useCallback(async () => {
    if (!recentOrderIds || recentOrderIds.length === 0) return;

    setLoading(true);
    try {
      const response = await customerService.getOrdersByIds(recentOrderIds);
      if (response.success) {
        setOrders(response.data || []);
      } else {
        Swal.fire({
          icon: "error",
          title: "Lỗi",
          text: response.message || "Không thể tải trạng thái đơn hàng",
        });
      }
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Lỗi",
        text: error.message,
      });
    } finally {
      setLoading(false);
    }
  }, [recentOrderIds]);

  useEffect(() => {
    if (isOpen && recentOrderIds && recentOrderIds.length > 0) {
      fetchOrders();
    }
  }, [isOpen, recentOrderIds, fetchOrders]);

  // Lắng nghe socket để cập nhật realtime
  useEffect(() => {
    const socket = socketRef?.current;
    if (!socket || !tableId) return;

    const handleOrderUpdate = (updatedOrder) => {
      console.log("Socket received order update:", updatedOrder);

      // Cập nhật order trong danh sách nếu nó thuộc recentOrderIds
      setOrders((prevOrders) => {
        return prevOrders.map((order) => {
          if (order.id === updatedOrder.id) {
            return updatedOrder;
          }
          return order;
        });
      });

      // Hiển thị toast thông báo
      Swal.fire({
        icon: "info",
        title: "Cập nhật đơn hàng",
        text: `Đơn hàng #${updatedOrder.id?.slice(
          0,
          8
        )} đã chuyển sang: ${getStatusLabel(updatedOrder.status)}`,
        toast: true,
        position: "top-end",
        showConfirmButton: false,
        timer: 3000,
        timerProgressBar: true,
      });
    };

    const eventName = `order_update_table_${tableId}`;
    socket.on(eventName, handleOrderUpdate);

    return () => {
      socket.off(eventName, handleOrderUpdate);
    };
  }, [socketRef, tableId, getStatusLabel]);

  const getStatusColor = (status) => {
    switch (status) {
      case "pending":
        return "bg-gray-100 text-gray-800";
      case "confirmed":
        return "bg-blue-100 text-blue-800";
      case "preparing":
        return "bg-yellow-100 text-yellow-800";
      case "ready":
        return "bg-green-100 text-green-800";
      case "served":
        return "bg-green-300 text-green-800";
      case "payment":
        return "bg-purple-100 text-purple-800";
      case "completed":
        return "bg-blue-500 text-white";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString("en-US");
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[80vh] overflow-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 p-6 flex justify-between items-center">
          <h2 className="text-2xl font-bold text-gray-800">Order Status</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-2xl"
          >
            ×
          </button>
        </div>

        <div className="p-6">
          {loading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
          ) : orders.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500 text-lg">No orders yet</p>
            </div>
          ) : (
            <div className="space-y-4">
              {orders.map((order, index) => (
                <div
                  key={order?.id || index}
                  className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                >
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h3 className="font-semibold text-gray-800">
                        Order #{order?.id?.slice(0, 8) || "N/A"}
                      </h3>
                      <p className="text-sm text-gray-500">
                        {order?.ordered_at
                          ? formatDate(order.ordered_at)
                          : "N/A"}
                      </p>
                    </div>
                    <span
                      className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(
                        order?.status
                      )}`}
                    >
                      {getStatusLabel(order?.status)}
                    </span>
                  </div>

                  <div className="border-t border-gray-100 pt-3">
                    <p className="text-lg font-bold text-gray-800">
                      Total:{" "}
                      <span className="text-amber-600">
                        $
                        {new Intl.NumberFormat("en-US", {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        }).format(order?.total_amount || 0)}
                      </span>
                    </p>
                  </div>

                  {/* Các items trong order */}
                  {order.items && order.items.length > 0 && (
                    <div className="border-t border-gray-100 pt-3 mt-3">
                      <p className="text-sm font-semibold text-gray-700 mb-2">
                        Items:
                      </p>
                      <ul className="space-y-1">
                        {order.items.map((item) => (
                          <li key={item.id} className="text-sm text-gray-600">
                            <span className="font-medium">
                              {item.menu_item?.name}
                            </span>
                            {" × "}
                            <span className="text-gray-500">
                              {item.quantity}
                            </span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {order.completed_at && (
                    <p className="text-xs text-gray-500 mt-2">
                      Completed at: {formatDate(order.completed_at)}
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="sticky bottom-0 bg-gray-50 border-t border-gray-200 p-6 flex gap-3">
          <button
            onClick={fetchOrders}
            className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors font-medium"
          >
            Refresh
          </button>
          <button
            onClick={onClose}
            className="flex-1 bg-gray-300 text-gray-800 py-2 px-4 rounded-lg hover:bg-gray-400 transition-colors font-medium"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default OrderStatusModal;
