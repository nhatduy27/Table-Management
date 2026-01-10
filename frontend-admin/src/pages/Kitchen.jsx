// src/pages/Kitchen.jsx
import React, { useState, useEffect, useCallback, useRef } from "react";
import { io } from "socket.io-client";
import kitchenService from "../services/kitchenService";
import { OrderCard, WARNING_TIME, OVERDUE_TIME } from "../components/kitchen";

const SOCKET_URL = "http://localhost:5000";

// Notification sound (base64 encoded short beep)
const NOTIFICATION_SOUND =
  "data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2teleJlvwY+nMx8LP5jW3LJ5dGm9iqQvHwk/l9XXtnl1Z7iNpTIgCD+Y1di5e3Zlt4+mNSIIP5rV2Lx8d2S1kafxIwg/m9TYvn15ZLOTqPYkCT+c1NjAfnplsZWp+SUJP57U2MJ/e2WvlqryJgk/n9TYw4B8ZayXq+0nCT+g1NjEgX1lq5ir6CgJP6HU2MWCfmWomKzjKQk/otTYxoN/ZaaZrd4qCT+j1NjHhIBmpaub2SsJP6TU2MiFgGajq53ULAk/pdTYyYaBZqKsnc8tCT+m1NjKh4Jmoa2eyi4JP6fU2MuIg2afsJ7FMAI/qNTYzImDZp6xnsEzAj+p1NjNioRmnrKevjQCP6rU2M6KhGadsZ67NgI/q9TYz4uFZpy0nrg3Aj+s1NjQi4Vmm7WesTkCP63U2NGMhmabtp6tOgI/rtTY0o2GZpq3nqk8Aj+v1NjTjYdmmbiepj0CP7DU2NSNh2aZuZ6iQAI/sdTY1Y6IZpi6np5BAj+y1NjWj4lml7yelkMCP7PU2NeQiWaXvJ6SRAJAstXX2JCKZpa9npBFAkCz1dfZkYtmr8GdjkYCQH/M0tqXk26jy5yISQJAbr/H3J+edoTD1INQAkBbutfbnqBs";

// Main Kitchen Page Component
const Kitchen = () => {
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
  const [filter, setFilter] = useState("all"); // 'all', 'pending', 'preparing', 'ready'

  const audioRef = useRef(null);
  const socketRef = useRef(null);

  // Khởi tạo audio
  useEffect(() => {
    audioRef.current = new Audio(NOTIFICATION_SOUND);
    audioRef.current.volume = 0.5;
  }, []);

  // Phát âm thanh khi có order mới
  const playNotificationSound = useCallback(() => {
    if (soundEnabled && audioRef.current) {
      audioRef.current.currentTime = 0;
      audioRef.current
        .play()
        .catch((err) => console.log("Audio play failed:", err));
    }
  }, [soundEnabled]);

  // Fetch orders
  const fetchOrders = useCallback(async () => {
    try {
      const response = await kitchenService.getKitchenOrders();
      if (response.success) {
        setOrders(response.data);
      }
    } catch (err) {
      console.error("Error fetching orders:", err);
      setError("Không thể tải danh sách đơn hàng");
    }
  }, []);

  // Fetch stats
  const fetchStats = useCallback(async () => {
    try {
      const response = await kitchenService.getKitchenStats();
      if (response.success) {
        setStats(response.data);
      }
    } catch (err) {
      console.error("Error fetching stats:", err);
    }
  }, []);

  // Fetch data initially and setup Socket.IO
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await Promise.all([fetchOrders(), fetchStats()]);
      setLoading(false);
    };

    loadData();

    // Setup Socket.IO connection
    socketRef.current = io(SOCKET_URL);

    // Lắng nghe khi có đơn mới từ khách
    socketRef.current.on("new_order_request", (newOrder) => {
      console.log("🔔 Kitchen: Đơn mới từ khách:", newOrder);
      playNotificationSound();

      setOrders((prevOrders) => {
        const exists = prevOrders.find((o) => o.id === newOrder.id);
        if (exists) {
          return prevOrders.map((o) => (o.id === newOrder.id ? newOrder : o));
        } else {
          return [newOrder, ...prevOrders];
        }
      });

      fetchStats();
    });

    // Lắng nghe khi trạng thái order được cập nhật
    socketRef.current.on("order_status_updated", (updatedOrder) => {
      console.log("📝 Kitchen: Order updated:", updatedOrder);

      setOrders((prevOrders) =>
        prevOrders.map((o) => (o.id === updatedOrder.id ? updatedOrder : o))
      );

      fetchStats();
    });

    // Cleanup khi component unmount
    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
    };
  }, [fetchOrders, fetchStats, playNotificationSound]);

  // Update order status
  const updateOrderStatus = async (orderId, newStatus) => {
    setUpdatingOrders((prev) => new Set(prev).add(orderId));

    try {
      const response = await kitchenService.updateOrderStatus(
        orderId,
        newStatus
      );
      if (response.success) {
        // Update local state
        setOrders((prev) =>
          prev.map((order) =>
            order.id === orderId ? { ...order, status: newStatus } : order
          )
        );
        // Refresh stats
        fetchStats();
      }
    } catch (err) {
      console.error("Error updating order:", err);
      alert("Không thể cập nhật trạng thái đơn hàng");
    } finally {
      setUpdatingOrders((prev) => {
        const next = new Set(prev);
        next.delete(orderId);
        return next;
      });
    }
  };

  const handleStartOrder = (orderId) => {
    updateOrderStatus(orderId, "preparing");
  };

  const handleReadyOrder = (orderId) => {
    updateOrderStatus(orderId, "ready");
  };

  const handleRefresh = () => {
    fetchOrders();
    fetchStats();
  };

  // Filter orders - hide ready orders from "all" tab, show them only in "ready" tab
  // Sort orders by ordered_at (oldest first)
  const filteredOrders = orders
    .filter((o) => {
      if (filter === "all") {
        // Ẩn các order đã ready khỏi tab "Tất cả"
        return o.status !== "ready" && o.status !== "pending";
      }
      if (filter === "confirmed") {
        return o.status === "confirmed";
      }
      return o.status === filter;
    })
    .sort((a, b) => new Date(a.ordered_at) - new Date(b.ordered_at)); // Oldest first

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Đang tải...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-gray-800 text-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-3xl">🍳</span>
              <h1 className="text-2xl font-bold">Kitchen Display System</h1>
            </div>
            <div className="flex items-center gap-4">
              {/* Sound Toggle */}
              <button
                onClick={() => setSoundEnabled(!soundEnabled)}
                className={`flex items-center gap-2 px-3 py-2 rounded transition-colors ${
                  soundEnabled
                    ? "bg-green-600 hover:bg-green-700"
                    : "bg-gray-600 hover:bg-gray-700"
                }`}
              >
                <span>🔊</span>
                <span className="text-sm">
                  Sound: {soundEnabled ? "ON" : "OFF"}
                </span>
              </button>

              {/* Refresh Button */}
              <button
                onClick={handleRefresh}
                className="p-2 bg-blue-600 hover:bg-blue-700 rounded transition-colors"
                title="Refresh"
              >
                <span className="text-xl">↻</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Filter Tabs */}
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex gap-1">
            {[
              { key: "all", label: "Tất cả" },
              { key: "confirmed", label: "Đã xác nhận" },
              { key: "preparing", label: "Đang làm" },
              { key: "ready", label: "Sẵn sàng" },
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => setFilter(tab.key)}
                className={`px-4 py-3 font-medium transition-colors border-b-2 ${
                  filter === tab.key
                    ? "border-orange-500 text-orange-600"
                    : "border-transparent text-gray-500 hover:text-gray-700"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-6">
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        {/* Orders Grid */}
        {filteredOrders.length === 0 ? (
          <div className="text-center py-12">
            <span className="text-6xl">📋</span>
            <p className="mt-4 text-gray-500 text-lg">Không có đơn hàng nào</p>
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

        {/* Legend */}
        <div className="mt-8 bg-white rounded-lg shadow p-4">
          <h3 className="font-semibold text-gray-700 mb-2">Chú thích:</h3>
          <div className="flex flex-wrap gap-6 text-sm">
            <div className="flex items-center gap-2">
              <span>🟢</span>
              <span>
                Đúng giờ ({"<"} {WARNING_TIME} phút)
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span>🟡</span>
              <span>
                Cảnh báo ({WARNING_TIME}-{OVERDUE_TIME} phút)
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span>🔴</span>
              <span>
                Quá hạn ({">"} {OVERDUE_TIME} phút)
              </span>
            </div>
          </div>
        </div>
      </main>

      {/* Footer Stats */}
      <footer className="fixed bottom-0 left-0 right-0 bg-gray-800 text-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 py-3">
          <div className="flex justify-center gap-8 text-sm">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 bg-gray-400 rounded-full"></span>
              <span>
                Chờ xử lý: <strong>{stats.pending}</strong>
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 bg-orange-400 rounded-full"></span>
              <span>
                Đang làm: <strong>{stats.preparing}</strong>
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 bg-green-400 rounded-full"></span>
              <span>
                Sẵn sàng: <strong>{stats.ready}</strong>
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 bg-blue-400 rounded-full"></span>
              <span>
                Hoàn thành hôm nay: <strong>{stats.completedToday}</strong>
              </span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Kitchen;
