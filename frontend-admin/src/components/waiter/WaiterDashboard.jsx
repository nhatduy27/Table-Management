import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  LogOut,
  Utensils,
  Bell,
  CheckCircle,
  Clock,
  Trash2,
  XCircle,
} from "lucide-react"; // Thêm Trash2, XCircle
import axios from "axios";
import { io } from "socket.io-client";

// Cấu hình URL
const API_URL = "http://localhost:5000/api";
const SOCKET_URL = "http://localhost:5000";

const WaiterDashboard = () => {
  const [orders, setOrders] = useState([]);
  const [filter, setFilter] = useState("all");
  const [currentTime, setCurrentTime] = useState(new Date());

  const socketRef = useRef();
  const navigate = useNavigate();

  // --- 0. HÀM ĐĂNG XUẤT ---
  const handleLogout = () => {
    if (window.confirm("Bạn có chắc chắn muốn đăng xuất?")) {
      localStorage.removeItem("token");
      navigate("/login");
    }
  };

  // --- 1. SETUP DATA & SOCKET ---
  useEffect(() => {
    const fetchOrders = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        alert("Bạn chưa đăng nhập! Đang chuyển hướng...");
        navigate("/login");
        return;
      }
      try {
        const res = await axios.get(`${API_URL}/admin/orders`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.data.success) {
          setOrders(res.data.data || []);
        }
      } catch (err) {
        console.error("Lỗi API:", err);
      }
    };
    fetchOrders();

    socketRef.current = io(SOCKET_URL);
    socketRef.current.on("new_order_created", (updatedOrder) => {
      playNotificationSound();
      setOrders((prev) => {
        const exists = prev.find((o) => o.id === updatedOrder.id);
        return exists
          ? prev.map((o) => (o.id === updatedOrder.id ? updatedOrder : o))
          : [updatedOrder, ...prev];
      });
    });
    socketRef.current.on("order_status_updated", (updatedOrder) => {
      setOrders((prev) =>
        prev.map((o) => (o.id === updatedOrder.id ? updatedOrder : o))
      );
    });
    return () => {
      socketRef.current.disconnect();
    };
  }, []);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  const playNotificationSound = () => {
    const audio = new Audio("/sounds/ding.mp3");
    audio.play().catch((e) => {});
  };

  // --- 2. CÁC HÀM XỬ LÝ API ---

  // Update trạng thái Order (Duyệt, Bưng, Thanh toán)
  const handleUpdateStatus = async (orderId, status) => {
    const token = localStorage.getItem("token");

    // Optimistic UI
    setOrders((prev) =>
      prev.map((o) => {
        if (String(o.id || o._id) === String(orderId)) {
          if (status === "confirmed") {
            const updatedItems = o.items.map((i) =>
              i.status === "pending" ? { ...i, status: "confirmed" } : i
            );
            return { ...o, status: "confirmed", items: updatedItems };
          } else if (status === "served") {
            const updatedItems = o.items.map((i) =>
              i.status === "ready" ? { ...i, status: "served" } : i
            );
            return { ...o, items: updatedItems };
          }
          return { ...o, status: status };
        }
        return o;
      })
    );

    try {
      await axios.put(
        `${API_URL}/admin/orders/${orderId}/status`,
        { status },
        { headers: { Authorization: `Bearer ${token}` } }
      );
    } catch (err) {
      console.error(err);
      window.location.reload();
    }
  };

  // [MỚI] HỦY MÓN LẺ (Reject Item)
  const handleRejectItem = async (orderId, itemId) => {
    const reason = window.prompt(
      "Lý do hủy món này? (VD: Hết hàng, Khách đổi ý)"
    );
    if (reason === null) return;

    const token = localStorage.getItem("token");

    // Optimistic UI: Đổi status sang cancelled ngay lập tức
    setOrders((prev) =>
      prev.map((o) => {
        if (String(o.id || o._id) === String(orderId)) {
          const updatedItems = o.items.map((i) =>
            String(i.id || i._id) === String(itemId)
              ? { ...i, status: "cancelled", reject_reason: reason }
              : i
          );
          return { ...o, items: updatedItems };
        }
        return o;
      })
    );

    try {
      await axios.put(
        `${API_URL}/admin/orders/items/${itemId}/reject`,
        { reason },
        { headers: { Authorization: `Bearer ${token}` } }
      );
    } catch (err) {
      alert("Lỗi: " + err.message);
      window.location.reload();
    }
  };

  const handleConfirmPayment = async (orderId) => {
    if (!window.confirm("Xác nhận đã thanh toán?")) return;
    handleUpdateStatus(orderId, "completed");
    setTimeout(
      () => setOrders((prev) => prev.filter((o) => o.id !== orderId)),
      2000
    );
  };

  // --- 3. HELPER ---
  const getMinutesWaiting = (d) => {
    if (!d) return 0;
    const diff = new Date() - new Date(d);
    return Math.floor(diff / 60000);
  };
  const formatCurrency = (a) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(a);
  };

  const filteredOrders = orders.filter((order) => {
    if (filter === "all")
      return order.status !== "completed" && order.status !== "cancelled";
    if (filter === "pending")
      return (
        order.status === "pending" ||
        order.items?.some((i) => i.status === "pending")
      );
    return order.status === filter;
  });

  // --- 4. RENDER GIAO DIỆN ---
  return (
    <div className="min-h-screen bg-gray-50 font-sans p-6">
      {/* HEADER */}
      <header className="flex justify-between items-center mb-8 bg-white p-4 rounded-xl shadow-sm">
        <div className="flex items-center gap-3">
          <div className="bg-blue-600 p-2 rounded-lg text-white">
            <Utensils size={24} />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-800">
              Waiter Dashboard
            </h1>
            <p className="text-gray-500 text-sm">
              {currentTime.toLocaleTimeString("vi-VN", {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex gap-2">
            {["all", "pending", "payment"].map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  filter === f
                    ? "bg-blue-600 text-white shadow-md"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                {f === "all"
                  ? "Tất cả"
                  : f === "pending"
                  ? "Cần duyệt"
                  : "Thanh toán"}
              </button>
            ))}
          </div>
          <div className="h-8 w-px bg-gray-200"></div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 text-red-600 hover:bg-red-50 px-3 py-2 rounded-lg transition-all font-medium text-sm border border-transparent hover:border-red-100"
          >
            <LogOut size={18} /> Đăng xuất
          </button>
        </div>
      </header>

      {/* GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredOrders.map((order) => {
          const orderId = order.id || order._id;

          const pendingItems =
            order.items?.filter((i) => i.status === "pending") || [];
          const readyItems =
            order.items?.filter((i) => i.status === "ready") || [];
          // Active Items: Lấy cả món Cancelled để hiển thị (nhưng làm mờ đi)
          const activeItems =
            order.items?.filter((i) => i.status !== "pending") || [];

          const hasNewRequest = pendingItems.length > 0;
          const hasReadyToServe = readyItems.length > 0;
          const isPayment = order.status === "payment";

          const borderClass = hasNewRequest
            ? "border-red-500 border-2 shadow-red-100 ring-2 ring-red-100"
            : hasReadyToServe
            ? "border-green-500 border-2 shadow-green-100"
            : order.status === "pending"
            ? "border-yellow-500 border-l-4"
            : "border-gray-200";

          return (
            <div
              key={orderId}
              className={`bg-white rounded-xl shadow-sm overflow-hidden flex flex-col transition-all ${borderClass}`}
            >
              {/* CARD HEADER */}
              <div
                className={`p-3 flex justify-between items-center ${
                  hasNewRequest
                    ? "bg-red-50"
                    : hasReadyToServe
                    ? "bg-green-50"
                    : "bg-gray-50"
                }`}
              >
                <div className="flex flex-col">
                  <h3
                    className={`font-bold text-lg ${
                      hasNewRequest ? "text-red-700" : "text-gray-800"
                    }`}
                  >
                    Bàn {order.table?.table_number || "Unknown"}
                  </h3>
                  <span className="text-[10px] text-gray-500 flex items-center gap-1">
                    <Clock size={10} /> {getMinutesWaiting(order.created_at)}{" "}
                    phút
                  </span>
                </div>
                {hasNewRequest && (
                  <span className="bg-red-600 text-white text-[10px] font-bold px-2 py-1 rounded-full animate-pulse flex items-center gap-1">
                    <Bell size={10} /> MỚI
                  </span>
                )}
                {!hasNewRequest && hasReadyToServe && (
                  <span className="bg-green-600 text-white text-[10px] font-bold px-2 py-1 rounded-full animate-bounce flex items-center gap-1">
                    <CheckCircle size={10} /> XONG
                  </span>
                )}
                {!hasNewRequest && !hasReadyToServe && (
                  <span
                    className={`text-[10px] px-2 py-1 rounded font-bold ${
                      isPayment
                        ? "bg-purple-100 text-purple-700"
                        : "bg-gray-200 text-gray-600"
                    }`}
                  >
                    {isPayment ? "THANH TOÁN" : order.status.toUpperCase()}
                  </span>
                )}
              </div>

              {/* CARD BODY */}
              <div className="p-4 space-y-4 max-h-80 overflow-y-auto flex-1">
                {/* A. MÓN MỚI (PENDING) */}
                {pendingItems.length > 0 && (
                  <div className="bg-red-50 border border-red-100 rounded-lg p-2">
                    <p className="text-[10px] text-red-600 font-bold mb-2 uppercase tracking-wider border-b border-red-200 pb-1">
                      Cần xác nhận ({pendingItems.length})
                    </p>
                    {pendingItems.map((item, idx) => (
                      <div
                        key={`pending-${idx}`}
                        className="mb-2 last:mb-0 flex justify-between items-start border-b border-red-100 pb-2 last:border-0 last:pb-0"
                      >
                        <div className="flex flex-col">
                          <span className="font-bold text-gray-900 text-sm">
                            {item.quantity}x {item.menu_item?.name}
                          </span>
                          {item.modifiers && item.modifiers.length > 0 && (
                            <span className="text-[10px] text-gray-500 italic pl-1">
                              +{" "}
                              {item.modifiers
                                .map((m) => m.modifier_option?.name)
                                .join(", ")}
                            </span>
                          )}
                          {item.notes && (
                            <span className="text-[10px] text-orange-600 pl-1">
                              "{item.notes}"
                            </span>
                          )}
                        </div>
                        {/* Nút Hủy Món Lẻ */}
                        <button
                          onClick={() =>
                            handleRejectItem(orderId, item.id || item._id)
                          }
                          className="text-red-400 hover:text-red-700 p-1 rounded hover:bg-red-100 ml-2"
                          title="Từ chối món"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                {/* B. MÓN ĐANG LÀM / ĐÃ XONG / ĐÃ HỦY */}
                {activeItems.length > 0 && (
                  <div
                    className={`mt-3 ${
                      hasNewRequest ? "opacity-60" : ""
                    } transition-all`}
                  >
                    {hasNewRequest && (
                      <p className="text-[10px] text-gray-400 font-bold mb-2 uppercase">
                        Đang phục vụ
                      </p>
                    )}
                    {activeItems.map((item, idx) => {
                      const isCancelled = item.status === "cancelled";
                      return (
                        <div
                          key={`active-${idx}`}
                          className={`flex justify-between items-center mb-3 pb-2 border-b border-gray-50 last:border-0 ${
                            isCancelled ? "opacity-50" : ""
                          }`}
                        >
                          <div className="flex flex-col flex-1">
                            {/* Tên món (Gạch ngang nếu hủy) */}
                            <span
                              className={`text-gray-700 text-sm font-medium ${
                                isCancelled ? "line-through text-gray-400" : ""
                              }`}
                            >
                              {item.quantity}x{" "}
                              {item.menu_item?.name || item.name}
                            </span>

                            {/* Badge trạng thái */}
                            <div className="flex flex-wrap gap-1 mt-1">
                              {item.status === "confirmed" && (
                                <span className="text-[9px] bg-gray-100 text-gray-600 px-2 py-0.5 rounded border border-gray-300 font-bold">
                                  Chờ bếp
                                </span>
                              )}
                              {item.status === "preparing" && (
                                <span className="text-[9px] bg-blue-50 text-blue-600 px-2 py-0.5 rounded border border-blue-100">
                                  Bếp đang nấu
                                </span>
                              )}
                              {item.status === "ready" && (
                                <span className="text-[9px] bg-yellow-100 text-yellow-800 px-2 py-0.5 rounded border border-yellow-200 animate-pulse font-bold flex items-center gap-1">
                                  <Bell size={8} /> Đã xong
                                </span>
                              )}
                              {item.status === "served" && (
                                <span className="text-[9px] bg-green-50 text-green-700 px-2 py-0.5 rounded border border-green-100">
                                  Đã lên
                                </span>
                              )}

                              {/* [MỚI] Badge ĐÃ HỦY */}
                              {isCancelled && (
                                <span className="text-[9px] bg-red-100 text-red-600 px-2 py-0.5 rounded border border-red-200 font-bold flex items-center gap-1">
                                  <XCircle size={8} /> ĐÃ HỦY
                                </span>
                              )}
                            </div>

                            {item.modifiers &&
                              !isCancelled &&
                              item.modifiers.length > 0 && (
                                <span className="text-[10px] text-gray-400 italic pl-1">
                                  +{" "}
                                  {item.modifiers
                                    .map((m) => m.modifier_option?.name)
                                    .join(", ")}
                                </span>
                              )}

                            {/* [MỚI] Hiện lý do hủy */}
                            {isCancelled && item.reject_reason && (
                              <span className="text-[10px] text-red-500 italic mt-1">
                                Lý do: {item.reject_reason}
                              </span>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* CARD FOOTER */}
              <div className="p-3 bg-gray-50 border-t border-gray-100 mt-auto">
                <div className="flex justify-between items-center mb-3">
                  <span className="text-gray-500 text-xs">Tổng tiền</span>
                  <span className="text-lg font-bold text-gray-900">
                    {formatCurrency(order.total_amount)}
                  </span>
                </div>
                {hasNewRequest ? (
                  <button
                    onClick={() => handleUpdateStatus(orderId, "confirmed")}
                    className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-2 rounded-lg shadow-md transition-all active:scale-95 flex justify-center items-center gap-2"
                  >
                    <CheckCircle size={16} /> Duyệt {pendingItems.length} món
                    mới
                  </button>
                ) : hasReadyToServe ? (
                  <button
                    onClick={() => handleUpdateStatus(orderId, "served")}
                    className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-2 rounded-lg shadow-md transition-all active:scale-95 flex justify-center items-center gap-2 animate-pulse"
                  >
                    <Utensils size={16} /> Bưng {readyItems.length} món đã xong
                  </button>
                ) : (
                  <div className="w-full">
                    {isPayment && (
                      <button
                        onClick={() => handleConfirmPayment(orderId)}
                        className="w-full bg-purple-600 text-white font-bold py-2 rounded-lg hover:bg-purple-700 shadow-md"
                      >
                        Xác nhận thanh toán
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
      {filteredOrders.length === 0 && (
        <div className="flex flex-col items-center justify-center mt-20 text-gray-400">
          <Utensils size={48} className="mb-4 opacity-20" />
          <p>Hiện chưa có đơn hàng nào.</p>
        </div>
      )}
    </div>
  );
};
export default WaiterDashboard;
