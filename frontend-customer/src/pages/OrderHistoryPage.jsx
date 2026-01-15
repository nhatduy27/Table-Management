import React, { useState, useEffect } from "react";
import { useNavigate, Link, useLocation } from "react-router-dom";
import CustomerService from "../services/customerService";
import TableService from "../services/tableService";
import ReviewModal from "../components/review/ReviewModal";

const OrderHistoryPage = () => {
  const [orders, setOrders] = useState([]);
  const [tableNames, setTableNames] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [reviewModalOpen, setReviewModalOpen] = useState(false);
  const [selectedOrderForReview, setSelectedOrderForReview] = useState(null);
  const [reviewableItems, setReviewableItems] = useState([]);
  const [currentReviewItem, setCurrentReviewItem] = useState(null);

  const navigate = useNavigate();
  const location = useLocation();

  // Logic getFromPath có thể giữ lại nếu bạn vẫn dùng Link ở phần "Bạn chưa có đơn hàng nào"
  const getFromPath = () => {
    if (location.state?.from) return location.state.from;
    const searchParams = new URLSearchParams(location.search);
    const tableId = searchParams.get("table");
    const token = searchParams.get("token");

    if (tableId || token) {
      const params = new URLSearchParams();
      if (tableId) params.append("table", tableId);
      if (token) params.append("token", token);
      return `/menu?${params.toString()}`;
    }
    return "/";
  };

  const fromPath = getFromPath();

  useEffect(() => {
    fetchData();
  }, []);

  // Auto open review modal if navigated from payment completion
  useEffect(() => {
    if (location.state?.autoOpenReview && location.state?.orderId && orders.length > 0) {
      const order = orders.find(o => o.id === location.state.orderId);
      if (order) {
        handleOpenReview(order);
        // Clear state to prevent re-opening on refresh
        window.history.replaceState({}, document.title);
      }
    }
  }, [orders, location.state]);

  const fetchData = async () => {
    try {
      setLoading(true);
      if (!CustomerService.isLoggedIn()) {
        navigate("/customer/login", {
          state: { from: location.pathname + location.search },
        });
        return;
      }

      const ordersResponse = await CustomerService.getOrders();
      const fetchedOrders = ordersResponse.data || [];
      setOrders(fetchedOrders);

      const uniqueTableIds = [
        ...new Set(fetchedOrders.map((o) => o.table_id)),
      ].filter(Boolean);
      const namesMap = {};
      await Promise.all(
        uniqueTableIds.map(async (id) => {
          try {
            const response = await TableService.getTableNumberById(id);
            namesMap[id] = response.data?.table_number || "N/A";
          } catch (err) {
            namesMap[id] = "Lỗi";
          }
        })
      );
      setTableNames(namesMap);
    } catch (err) {
      setError(err.message);
      if (err.message.includes("401")) {
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
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount);
  };

  const handleViewDetail = (orderId) => {
    navigate(`/customer/orders/${orderId}`);
  };

  const handleOpenReview = async (order) => {
    try {
      const result = await CustomerService.getReviewableItems(order.id);
      if (result.success && result.data.reviewable_items.length > 0) {
        setSelectedOrderForReview(order);
        setReviewableItems(result.data.reviewable_items);
        setCurrentReviewItem(result.data.reviewable_items[0]);
        setReviewModalOpen(true);
      } else {
        alert("Bạn đã đánh giá tất cả món ăn trong đơn hàng này rồi!");
      }
    } catch (error) {
      console.error("Get reviewable items error:", error);
      alert("Không thể tải danh sách món cần đánh giá");
    }
  };

  const handleSubmitReview = async (reviewData) => {
    try {
      await CustomerService.createReview(reviewData);
      alert("Cảm ơn bạn đã đánh giá!");

      // Remove reviewed item from list
      const remaining = reviewableItems.filter(
        (item) => item.menu_item_id !== currentReviewItem.menu_item_id
      );

      if (remaining.length > 0) {
        setReviewableItems(remaining);
        setCurrentReviewItem(remaining[0]);
      } else {
        setReviewModalOpen(false);
        setCurrentReviewItem(null);
        setReviewableItems([]);
      }
    } catch (error) {
      throw error; // Let ReviewModal handle the error
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Đang tải lịch sử đơn hàng...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 font-sans">
      <div className="container mx-auto px-4 max-w-6xl">
        {/* Header - ĐÃ XÓA NÚT QUAY LẠI */}
        <div className="mb-8 text-center md:text-left">
          <h1 className="text-3xl font-bold text-gray-900">Lịch sử đơn hàng</h1>
          <p className="text-gray-500 mt-1">Xem lại những món ăn bạn đã gọi</p>
        </div>

        {/* Content */}
        {orders.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-16 text-center">
            <h3 className="text-xl font-bold text-gray-900 mb-4">
              Bạn chưa có đơn hàng nào
            </h3>
            <Link
              to={fromPath}
              className="inline-block px-8 py-3 bg-orange-600 text-white rounded-xl font-bold hover:bg-orange-700 transition-colors"
            >
              Khám phá menu ngay
            </Link>
          </div>
        ) : (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
                      Ngày đặt
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
                      Vị trí
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
                      Tổng cộng
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
                      Trạng thái
                    </th>
                    <th className="px-6 py-4 text-right text-xs font-bold text-gray-500 uppercase tracking-wider">
                      Thao tác
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {orders.map((order) => (
                    <tr
                      key={order.id}
                      className="hover:bg-orange-50/40 transition-colors group"
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm text-gray-900 font-medium">
                          {formatDate(order.ordered_at)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-orange-100 text-orange-700 border border-orange-200">
                          {tableNames[order.table_id] || "..."}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm font-bold text-orange-600">
                          {formatCurrency(order.total_amount)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          <span className="w-1.5 h-1.5 rounded-full bg-green-500 mr-1.5"></span>
                          Hoàn thành
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right">
                        <div className="flex gap-2 justify-end">
                          <button
                            onClick={() => handleViewDetail(order.id)}
                            className="inline-flex items-center gap-1.5 px-4 py-2 bg-orange-50 text-orange-600 rounded-lg hover:bg-orange-600 hover:text-white transition-all font-semibold active:scale-95 shadow-sm"
                          >
                            <span>Chi tiết</span>
                            <svg
                              className="w-4 h-4 transform group-hover:translate-x-1 transition-transform"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2"
                                d="M9 5l7 7-7 7"
                              />
                            </svg>
                          </button>
                          <button
                            onClick={() => handleOpenReview(order)}
                            className="inline-flex items-center gap-1.5 px-4 py-2 bg-yellow-50 text-yellow-600 rounded-lg hover:bg-yellow-500 hover:text-white transition-all font-semibold active:scale-95 shadow-sm"
                          >
                            <svg
                              className="w-4 h-4"
                              fill="currentColor"
                              viewBox="0 0 20 20"
                            >
                              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                            </svg>
                            Đánh giá
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Review Modal */}
      {reviewModalOpen && currentReviewItem && (
        <ReviewModal
          isOpen={reviewModalOpen}
          onClose={() => {
            setReviewModalOpen(false);
            setCurrentReviewItem(null);
            setReviewableItems([]);
          }}
          menuItem={{
            id: currentReviewItem.menu_item_id,
            name: currentReviewItem.name,
            price: currentReviewItem.price,
          }}
          orderId={selectedOrderForReview?.id}
          onSubmit={handleSubmitReview}
        />
      )}
    </div>
  );
};

export default OrderHistoryPage;
