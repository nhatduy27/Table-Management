// src/pages/Kitchen.jsx
import React, { useState, useEffect, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import kitchenService from "../../services/kitchenService";
import OrderCard from "../../components/kitchen/OrderCard";
import { io } from "socket.io-client";

const SOCKET_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";
// Âm thanh thông báo
const NOTIFICATION_SOUND =
  "data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2teleJlvwY+nMx8LP5jW3LJ5dGm9iqQvHwk/l9XXtnl1Z7iNpTIgCD+Y1di5e3Zlt4+mNSIIP5rV2Lx8d2S1kafxIwg/m9TYvn15ZLOTqPYkCT+c1NjAfnplsZWp+SUJP57U2MJ/e2WvlqryJgk/n9TYw4B8ZayXq+0nCT+g1NjEgX1lq5ir6CgJP6HU2MWCfmWomKzjKQk/otTYxoN/ZaaZrd4qCT+j1NjHhIBmpaub2SsJP6TU2MiFgGajq53ULAk/pdTYyYaBZqKsnc8tCT+m1NjKh4Jmoa2eyi4JP6fU2MuIg2afsJ7FMAI/qNTYzImDZp6xnsEzAj+p1NjNioRmnrKevjQCP6rU2M6KhGadsZ67NgI/q9TYz4uFZpy0nrg3Aj+s1NjQi4Vmm7WesTkCP63U2NGMhmabtp6tOgI/rtTY0o2GZpq3nqk8Aj+v1NjTjYdmmbiepj0CP7DU2NSNh2aZuZ6iQAI/sdTY1Y6IZpi6np5BAj+y1NjWj4lml7yelkMCP7PU2NeQiWaXvJ6SRAJAstXX2JCKZpa9npBFAkCz1dfZkYtmr8GdjkYCQH/M0tqXk26jy5yISQJAbr/H3J+edoTD1INQAkBbutfbnqBs";

const WARNING_TIME = 10;
const OVERDUE_TIME = 20;

const Kitchen = () => {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [stats, setStats] = useState({
    pending: 0,
    preparing: 0,
    ready: 0,
    completedToday: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [updatingOrders, setUpdatingOrders] = useState(new Set());
  const [filter, setFilter] = useState("all");

  const audioRef = useRef(null);
  const socketRef = useRef();

  // --- 0. HÀM ĐĂNG XUẤT ---
  const handleLogout = () => {
    if (window.confirm("Bạn có chắc chắn muốn đăng xuất?")) {
      localStorage.removeItem("token");
      navigate("/login");
    }
  };

  // 1. Setup Audio
  useEffect(() => {
    audioRef.current = new Audio(NOTIFICATION_SOUND);
    audioRef.current.volume = 0.8;
  }, []);

  const playNotificationSound = useCallback(() => {
    if (soundEnabled && audioRef.current) {
      audioRef.current.currentTime = 0;
      audioRef.current.play().catch((err) => console.log("Audio failed:", err));
    }
  }, [soundEnabled]);

  // 2. Fetch Data
  const fetchOrders = useCallback(async () => {
    try {
      const response = await kitchenService.getKitchenOrders();
      if (response.success) setOrders(response.data);
    } catch (err) {
      console.error(err);
      setError("Mất kết nối với máy chủ");
    }
  }, []);

  const fetchStats = useCallback(async () => {
    try {
      const response = await kitchenService.getKitchenStats();
      if (response.success) setStats(response.data);
    } catch (err) {
      console.error(err);
    }
  }, []);

  // 3. SOCKET LOGIC (ĐÃ FIX)
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await Promise.all([fetchOrders(), fetchStats()]);
      setLoading(false);
    };
    loadData();

    socketRef.current = io(SOCKET_URL);

    // Hàm update state chung
    const handleOrderUpdate = (updatedOrder) => {
      setOrders((prev) => {
        const exists = prev.find((o) => o.id === updatedOrder.id);
        if (exists)
          return prev.map((o) => (o.id === updatedOrder.id ? updatedOrder : o));
        // Chỉ thêm vào list nếu trạng thái là confirmed (đã duyệt) trở đi
        // Pending không thêm vào để tránh rác
        if (
          ["confirmed", "preparing", "ready", "served"].includes(
            updatedOrder.status
          )
        ) {
          return [updatedOrder, ...prev];
        }
        return prev;
      });
      fetchStats();
    };

    // [FIX 1] BỎ EVENT 'new_order_created' (Vì bếp không cần biết khi khách mới đặt)
    // socketRef.current.on('new_order_created', ...) -> DELETE

    // [FIX 2] Chỉ nghe sự kiện update trạng thái
    socketRef.current.on("order_status_updated", (updatedOrder) => {
      console.log("🔄 Update:", updatedOrder.status);

      // [FIX 3] CHỈ KÊU KHI WAITER DUYỆT (CONFIRMED)
      // Kể cả đơn cũ gọi thêm món, khi Waiter duyệt -> Status chuyển Confirmed -> Bếp kêu
      if (updatedOrder.status === "confirmed") {
        playNotificationSound();
      }

      handleOrderUpdate(updatedOrder);
    });

    return () => {
      if (socketRef.current) socketRef.current.disconnect();
    };
  }, [fetchOrders, fetchStats, playNotificationSound]);

  // 4. Handlers (Nấu, Xong)
  const handleStartOrder = async (orderId) => {
    setUpdatingOrders((prev) => new Set(prev).add(orderId));
    try {
      // Optimistic UI Update
      setOrders((prev) =>
        prev.map((o) => {
          if (o.id === orderId) {
            // Chuyển status order và các món pending -> preparing
            const newItems = o.items.map((i) =>
              i.status === "confirmed" ? { ...i, status: "preparing" } : i
            );
            return { ...o, status: "preparing", items: newItems };
          }
          return o;
        })
      );
      await kitchenService.updateOrderStatus(orderId, "preparing");
      fetchStats();
    } catch (err) {
      console.error(err);
      fetchOrders();
    } finally {
      setUpdatingOrders((prev) => {
        const n = new Set(prev);
        n.delete(orderId);
        return n;
      });
    }
  };

  const handleReadyOrder = async (orderId) => {
    setUpdatingOrders((prev) => new Set(prev).add(orderId));
    try {
      await kitchenService.updateOrderStatus(orderId, "ready");
    } catch (err) {
      console.error(err);
    } finally {
      setUpdatingOrders((prev) => {
        const n = new Set(prev);
        n.delete(orderId);
        return n;
      });
    }
  };

  const handleRefresh = () => {
    fetchOrders();
    fetchStats();
  };

  // 5. [FIX 4] Filter Logic Chuẩn
  const filteredOrders = orders
    .filter((o) => {
      // Bếp tuyệt đối không hiển thị đơn Hủy, Hoàn tất hoặc PENDING (chưa duyệt)
      if (["completed", "cancelled", "pending", "served", "payment_request", "payment_pending"].includes(o.status))
        return false;

      if (filter === "all") return true;

      // Tab "Chờ nấu" thực chất là hiển thị đơn "Confirmed"
      if (filter === "pending") return o.status === "confirmed";

      return o.status === filter;
    })
    .sort(
      (a, b) =>
        new Date(a.created_at || a.ordered_at) -
        new Date(b.created_at || b.ordered_at)
    );

  if (loading)
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="animate-spin text-4xl">🍳</div>
      </div>
    );

  return (
    <div className="min-h-screen bg-gray-100 font-sans text-gray-900">
      {/* HEADER */}
      <header className="bg-gray-900 text-white shadow-md sticky top-0 z-20">
        <div className="max-w-8xl mx-auto px-4 py-3 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <span className="text-3xl">🔥</span>
            <div>
              <h1 className="text-xl font-bold uppercase tracking-wider">
                Kitchen Display
              </h1>
              <p className="text-xs text-gray-400">
                Đang hoạt động • {new Date().toLocaleTimeString("vi-VN")}
              </p>
            </div>
          </div>

          <div className="flex gap-3">
            <button
              onClick={() => setSoundEnabled(!soundEnabled)}
              className={`p-2 rounded-lg font-bold text-sm flex items-center gap-2 ${
                soundEnabled ? "bg-green-600" : "bg-gray-700"
              }`}
            >
              {soundEnabled ? "🔊 ON" : "🔇 OFF"}
            </button>
            <button
              onClick={handleRefresh}
              className="p-2 bg-blue-600 rounded-lg text-white hover:bg-blue-500"
            >
              ↻
            </button>
            <button
              onClick={handleLogout}
              className="p-2 bg-red-600 rounded-lg text-white hover:bg-red-500 font-bold text-sm"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      {/* FILTER TABS */}
      <div className="bg-white border-b sticky top-[64px] z-10 shadow-sm">
        <div className="max-w-8xl mx-auto px-4 flex overflow-x-auto gap-4 pt-3 pb-0">
          {[
            { key: "all", label: "Tất cả", count: filteredOrders.length },
            {
              key: "pending",
              label: "Chờ nấu",
              count: stats.pending,
              color: "border-yellow-500 text-yellow-700",
            },
            {
              key: "preparing",
              label: "Đang nấu",
              count: stats.preparing,
              color: "border-blue-500 text-blue-700",
            },
            {
              key: "ready",
              label: "Sẵn sàng",
              count: stats.ready,
              color: "border-green-500 text-green-700",
            },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setFilter(tab.key)}
              className={`pb-3 px-4 text-sm font-bold uppercase border-b-4 transition-all flex items-center gap-2 whitespace-nowrap ${
                filter === tab.key
                  ? tab.color || "border-gray-800 text-gray-900"
                  : "border-transparent text-gray-400 hover:text-gray-600"
              }`}
            >
              {tab.label}
              {/* (Lưu ý: stats.pending ở đây nên hiểu là số lượng đơn confirmed từ backend trả về) */}
              {tab.key !== "all" && (
                <span className="bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded text-xs">
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* MAIN CONTENT */}
      <main className="p-4 pb-24 max-w-8xl mx-auto">
        {error && (
          <div className="bg-red-100 text-red-700 p-3 rounded mb-4 border border-red-300">
            ⚠️ {error}
          </div>
        )}

        {filteredOrders.length === 0 ? (
          <div className="text-center py-20 opacity-40">
            <div className="text-6xl mb-4">👨‍🍳</div>
            <h2 className="text-2xl font-bold">Bếp đang rảnh</h2>
            <p>Chưa có đơn hàng nào cần xử lý</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filteredOrders.map((order) => (
              <OrderCard
                key={order.id}
                order={order}
                onStartOrder={handleStartOrder}
                onReadyOrder={handleReadyOrder}
                isUpdating={updatingOrders.has(order.id)}
              />
            ))}
          </div>
        )}

        {/* LEGEND */}
        <div className="mt-8 flex justify-center gap-6 text-xs text-gray-500">
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-green-500"></span> Mới
            (&lt;{WARNING_TIME}p)
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-yellow-500"></span> Chậm (
            {WARNING_TIME}-{OVERDUE_TIME}p)
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>{" "}
            Quá hạn (&gt;{OVERDUE_TIME}p)
          </span>
        </div>
      </main>

      {/* FOOTER STATS */}
      <footer className="fixed bottom-0 left-0 right-0 bg-white border-t p-2 shadow-lg z-20 hidden md:block">
        <div className="flex justify-center gap-12 text-center">
          <div>
            <div className="text-xs text-gray-500 uppercase">Waiting</div>
            <div className="text-xl font-bold text-red-600">
              {stats.pending}
            </div>
          </div>
          <div>
            <div className="text-xs text-gray-500 uppercase">Cooking</div>
            <div className="text-xl font-bold text-blue-600">
              {stats.preparing}
            </div>
          </div>
          <div>
            <div className="text-xs text-gray-500 uppercase">Ready</div>
            <div className="text-xl font-bold text-green-600">
              {stats.ready}
            </div>
          </div>
          <div>
            <div className="text-xs text-gray-500 uppercase">Done Today</div>
            <div className="text-xl font-bold text-gray-800">
              {stats.completedToday}
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Kitchen;
