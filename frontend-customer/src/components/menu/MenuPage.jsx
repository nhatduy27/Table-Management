import React, { useState, useEffect, useRef } from "react";
import { useSearchParams, useNavigate, useLocation } from "react-router-dom";
import Swal from "sweetalert2";
import { io } from "socket.io-client";

import Loading from "../common/Loading";
import Alert from "../common/Alert";
import tableService from "../../services/tableService";
import CustomerService from "../../services/customerService";
import MenuHeader from "./MenuHeader";
import MenuFooter from "./MenuFooter";
import CategoryTabs from "./CategoryTabs";
import MenuItemCard from "./MenuItemCard";
import CartSidebar from "./CartSidebar";
import CartButton from "./CartButton";
import ModifierModal from "./ModifierModal";
import useCart from "./hooks/useCart";

import OrderDetailModal from "./OrderDetailModal";
import MenuItemDetailModal from "./MenuItemDetailModal";
import FloatingOrderButton from "./FloatingOrderButton";
import BillModal from "./BillModal";

const SOCKET_URL = "http://localhost:5000";

const MenuPage = () => {
  // --- 1. CONFIG & STATE ---
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const location = useLocation();

  // Lấy params từ URL
  const tableId = searchParams.get("table");
  const token = searchParams.get("token");

  const socketRef = useRef();

  // State hiển thị
  const [loading, setLoading] = useState(true);
  const [menuLoading, setMenuLoading] = useState(false);
  const [error, setError] = useState(null);
  const [menuError, setMenuError] = useState(null);

  // Data
  const [tableInfo, setTableInfo] = useState(null);
  const [categories, setCategories] = useState([]);
  const [activeCategory, setActiveCategory] = useState(null);

  // Modal & Selection
  const [detailItem, setDetailItem] = useState(null);
  const [selectedItem, setSelectedItem] = useState(null); // Cho Modifier Modal
  const [orderPlacing, setOrderPlacing] = useState(false);

  // Active Order (Để check xem bàn này đang ăn gì)
  const [activeOrder, setActiveOrder] = useState(null);
  const [showOrderDetail, setShowOrderDetail] = useState(false);
  const [showBillModal, setShowBillModal] = useState(false);

  // Lấy Cart từ Hook (CHỈ GỌI 1 LẦN DUY NHẤT Ở ĐÂY)
  const {
    cart,
    cartTotal,
    isCartOpen,
    setIsCartOpen,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    getTotalItems,
  } = useCart(tableId);

  // --- 2. HELPER ---
  const showToast = (icon, title) => {
    Swal.fire({
      icon,
      title,
      toast: true,
      position: "top-end",
      showConfirmButton: false,
      timer: 2000,
      timerProgressBar: true,
    });
  };

  // Handler: Yêu cầu thanh toán
  const handleRequestPayment = async (orderId, paymentMethod) => {
    try {
      const response = await CustomerService.requestPayment(
        orderId,
        paymentMethod
      );

      if (response.success) {
        showToast("success", "Đã gửi yêu cầu thanh toán!");
        setShowBillModal(false);

        // Cập nhật active order với status mới
        if (response.data) {
          setActiveOrder(response.data);
        }

        // Hiển thị thông báo đang xử lý
        Swal.fire({
          title: "Đang xử lý thanh toán",
          text: `Phương thức: ${paymentMethod}`,
          icon: "info",
          timer: 3000,
          showConfirmButton: false,
        });
      }
    } catch (error) {
      console.error("Payment request error:", error);
      throw error; // Re-throw để BillModal xử lý
    }
  };

  // --- 3. EFFECTS (Xử lý logic khi vào trang) ---

  // A. Kết nối Socket & Lắng nghe cập nhật đơn hàng
  useEffect(() => {
    if (!tableId) return;

    socketRef.current = io(SOCKET_URL);

    // Khi Bếp/Waiter cập nhật đơn -> Client nhận tin ở đây
    socketRef.current.on(`order_update_table_${tableId}`, (updatedOrder) => {
      console.log("Socket Update:", updatedOrder);
      setActiveOrder(updatedOrder);

      // Nếu đơn hoàn thành (Completed) -> Mời đánh giá
      if (updatedOrder.status === "completed") {
        Swal.fire({
          title: "Cảm ơn quý khách!",
          text: "Bữa ăn đã hoàn tất. Bạn có muốn đánh giá món ăn không?",
          icon: "success",
          showCancelButton: true,
          confirmButtonText: "Đánh giá ngay",
          cancelButtonText: "Để sau",
          confirmButtonColor: "#ea580c",
          cancelButtonColor: "#9ca3af",
        }).then((result) => {
          if (result.isConfirmed) {
            // Navigate đến OrderDetailPage nơi có nút review cho từng món
            navigate(`/customer/orders/${updatedOrder.id}`);
          }
          setActiveOrder(null); // Reset trạng thái bàn trống
        });
      }
      // Nếu đơn thay đổi trạng thái (VD: Confirmed -> Preparing) -> Báo nhẹ
      else if (activeOrder && activeOrder.status !== updatedOrder.status) {
        const statusMap = {
          confirmed: "Đã xác nhận",
          preparing: "Đang nấu",
          ready: "Món đã xong",
          served: "Đã phục vụ",
          payment: "Đang thanh toán",
        };
        showToast(
          "info",
          `Đơn hàng: ${statusMap[updatedOrder.status] || updatedOrder.status}`
        );
      }
    });

    return () => {
      if (socketRef.current) socketRef.current.disconnect();
    };
  }, [tableId, navigate, activeOrder]);

  // B. Xác thực Token & Lấy thông tin bàn
  useEffect(() => {
    const initPage = async () => {
      if (!tableId || !token) {
        setError("Mã QR không hợp lệ hoặc thiếu thông tin.");
        setLoading(false);
        return;
      }
      try {
        // 1. Verify Table Token
        const response = await tableService.verifyQRToken(tableId, token);
        if (response.success) {
          setTableInfo(response.data);

          // Lưu tableId và token vào localStorage để dùng sau khi thanh toán redirect về
          localStorage.setItem("current_table_id", tableId);
          localStorage.setItem("current_qr_token", token);

          // 2. Check xem bàn này có đơn chưa (Active Order)
          try {
            const activeOrderRes = await CustomerService.getActiveOrder(
              tableId
            );
            if (activeOrderRes.success && activeOrderRes.data) {
              setActiveOrder(activeOrderRes.data);
            }
          } catch (e) {
            // Không có đơn active là bình thường
          }
        } else {
          setError(response.message || "Xác thực mã QR thất bại.");
        }
      } catch (err) {
        console.error(err);
        setError("Lỗi kết nối máy chủ.");
      } finally {
        setLoading(false);
      }
    };
    initPage();
  }, [tableId, token]);

  // C. Xử lý dữ liệu Menu (Chia Category)
  useEffect(() => {
    if (!tableInfo) return;

    setMenuLoading(true);
    try {
      const rawCategories = tableInfo.categories || [];
      const items = tableInfo.items || [];

      // Gom nhóm món ăn theo Category ID
      const itemsByCategory = items.reduce((acc, item) => {
        const catId = item.category?.id;
        if (catId) {
          if (!acc[catId]) acc[catId] = [];
          acc[catId].push(item);
        }
        return acc;
      }, {});

      // Map lại cấu trúc Category
      const categoriesWithItems = rawCategories.map((cat) => ({
        ...cat,
        items: itemsByCategory[cat.id] || [],
      }));

      setCategories(categoriesWithItems);
      // Mặc định chọn tab đầu tiên có món
      const firstValidCat = categoriesWithItems.find((c) => c.items.length > 0);
      if (firstValidCat) {
        setActiveCategory(firstValidCat.id);
      } else if (categoriesWithItems.length > 0) {
        setActiveCategory(categoriesWithItems[0].id);
      }
    } catch (err) {
      setMenuError("Không thể hiển thị thực đơn.");
    } finally {
      setMenuLoading(false);
    }
  }, [tableInfo]);

  // --- 4. HANDLERS (Sự kiện người dùng) ---

  const handleCustomize = (item) => setSelectedItem(item);
  const handleViewDetail = (item) => setDetailItem(item);

  const handleAddFromDetail = (item) => {
    setDetailItem(null);
    handleCustomize(item);
  };

  const handleAddFromModal = (
    item,
    modifiers,
    quantity,
    modifiersTotalPrice,
    note
  ) => {
    addToCart(item, modifiers, quantity, modifiersTotalPrice, note);
    setSelectedItem(null);
    showToast("success", `Đã thêm ${item.name} vào giỏ`);
  };

  const handlePlaceOrder = async () => {
    if (cart.length === 0) {
      Swal.fire({
        icon: "warning",
        title: "Giỏ hàng trống!",
        confirmButtonColor: "#ea580c",
      });
      return;
    }

    const isLoggedIn = CustomerService.isLoggedIn();
    if (!isLoggedIn) {
      const result = await Swal.fire({
        title: "Bạn chưa đăng nhập?",
        text: "Đăng nhập để tích điểm và nhận ưu đãi!",
        icon: "info",
        showCancelButton: true,
        confirmButtonText: "Tiếp tục đặt (Khách)",
        cancelButtonText: "Đăng nhập ngay",
        confirmButtonColor: "#9ca3af",
        cancelButtonColor: "#ea580c",
        reverseButtons: true,
      });

      if (result.isDismissed) {
        // Người dùng bấm "Đăng nhập ngay"
        navigate("/customer/login", {
          state: { from: location.pathname + location.search },
        });
        return;
      }
    }

    setOrderPlacing(true);
    try {
      // Chuẩn bị dữ liệu gửi lên Server
      const cartItems = cart.map((item) => ({
        id: item.id, // menuItemId
        price: item.unitPrice,
        quantity: item.quantity,
        name: item.name,
        notes: item.note || "",
        modifiers: item.modifiers || [],
      }));

      let orderResponse;
      const targetTableId = tableInfo?.table?.id || tableId;

      // Logic: Nếu đang có Active Order -> Gọi API thêm món (Gộp đơn)
      if (activeOrder) {
        try {
          orderResponse = await CustomerService.addItemsToOrder(
            activeOrder.id,
            cartItems
          );
        } catch (err) {
          // ✅ NẾU ORDER CŨ KHÔNG TỒN TẠI/ĐÃ ĐÓNG -> TẠO ĐƠN MỚI
          if (err.shouldCreateNewOrder) {
            console.log("⚠️ Order cũ không hợp lệ, tạo đơn mới...");
            setActiveOrder(null); // Clear order cũ
            orderResponse = await CustomerService.createOrderWithItems(
              targetTableId,
              cartItems
            );
          } else {
            throw err; // Throw lại lỗi khác
          }
        }
      } else {
        // Nếu chưa có -> Gọi API tạo đơn mới
        orderResponse = await CustomerService.createOrderWithItems(
          targetTableId,
          cartItems
        );
      }

      if (orderResponse.success) {
        if (orderResponse.data) setActiveOrder(orderResponse.data);

        await Swal.fire({
          icon: "success",
          title: "Đã gửi yêu cầu!",
          text: "Vui lòng đợi nhân viên xác nhận.",
          showConfirmButton: false,
          timer: 2000,
        });

        clearCart();
        setIsCartOpen(false);
      } else {
        throw new Error(orderResponse.message);
      }
    } catch (err) {
      Swal.fire({
        icon: "error",
        title: "Lỗi",
        text: err.message || "Không thể gửi đơn hàng.",
      });
    } finally {
      setOrderPlacing(false);
    }
  };

  const handleRequestBill = async () => {
    if (!activeOrder) return;
    const confirm = await Swal.fire({
      title: "Gọi thanh toán?",
      text: "Nhân viên sẽ mang hóa đơn đến bàn.",
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "Xác nhận",
      confirmButtonColor: "#16a34a",
    });

    if (confirm.isConfirmed) {
      try {
        await CustomerService.requestBill(activeOrder.id);
        // Fake update UI để phản hồi nhanh
        setActiveOrder((prev) => ({ ...prev, status: "payment" }));
        Swal.fire("Đã gọi!", "Vui lòng đợi nhân viên.", "success");
      } catch (err) {
        Swal.fire("Lỗi", "Thử lại sau.", "error");
      }
    }
  };

  // --- 5. RENDER ---

  if (loading)
    return (
      <div className="h-screen flex items-center justify-center">
        <Loading />
      </div>
    );
  if (error)
    return (
      <div className="p-4 container mx-auto">
        <Alert type="error" message={error} />
      </div>
    );

  const activeCategoryData = categories.find(
    (cat) => cat.id === activeCategory
  );

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      <MenuHeader
        tableNumber={tableInfo?.table?.table_number}
        cartItemCount={getTotalItems()}
      />

      <main className="container mx-auto px-4 py-6">
        {menuError && <Alert type="warning" message={menuError} />}

        {/* Danh sách Categories */}
        <CategoryTabs
          categories={categories}
          activeCategory={activeCategory}
          onSelectCategory={setActiveCategory}
        />

        {/* Danh sách Món ăn */}
        {menuLoading ? (
          <Loading />
        ) : (
          <div className="mt-6">
            <h3 className="text-xl font-bold mb-4 text-gray-800">
              {activeCategoryData?.name || "Thực đơn"}
            </h3>
            {activeCategoryData && activeCategoryData.items.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {activeCategoryData.items.map((item) => (
                  <MenuItemCard
                    key={item.id}
                    item={item}
                    onViewDetail={handleViewDetail}
                    onCustomize={handleCustomize}
                  />
                ))}
              </div>
            ) : (
              <div className="py-10 text-center text-gray-500 bg-white rounded-xl border border-dashed">
                Chưa có món ăn trong danh mục này.
              </div>
            )}
          </div>
        )}

        {/* Sidebar Giỏ hàng */}
        <CartSidebar
          cart={cart}
          cartTotal={cartTotal}
          isOpen={isCartOpen}
          onClose={() => setIsCartOpen(false)}
          onUpdateQuantity={updateQuantity}
          onRemoveItem={removeFromCart}
          onClearCart={clearCart}
          onPlaceOrder={handlePlaceOrder}
          orderPlacing={orderPlacing}
        />

        {/* Nút Giỏ hàng trôi nổi (Chỉ hiện khi chưa mở giỏ và không xem chi tiết đơn) */}
        {!isCartOpen && !showOrderDetail && getTotalItems() > 0 && (
          <CartButton
            totalItems={getTotalItems()}
            cartTotal={cartTotal}
            onClick={() => setIsCartOpen(true)}
            className={activeOrder ? "bottom-24" : "bottom-6"} // Nếu có ActiveBar thì đẩy nút lên
          />
        )}

        {/* Modals */}
        <ModifierModal
          item={selectedItem}
          isOpen={!!selectedItem}
          onClose={() => setSelectedItem(null)}
          onAddToCart={handleAddFromModal}
        />

        <MenuItemDetailModal
          item={detailItem}
          onClose={() => setDetailItem(null)}
          onAddToOrder={handleAddFromDetail}
        />
      </main>

      {/* --- ACTIVE ORDER BAR (Thanh trạng thái đơn hàng) --- */}
      {/* Thay thế Footer mặc định nếu bàn đang có đơn */}
      {activeOrder && !isCartOpen && (
        <FloatingOrderButton
          order={activeOrder}
          onClick={() => setShowOrderDetail(true)}
        />
      )}

      {/* Modal Chi tiết đơn hàng */}
      {showOrderDetail && activeOrder && (
        <OrderDetailModal
          order={activeOrder}
          onClose={() => setShowOrderDetail(false)}
          onRequestBill={() => {
            setShowOrderDetail(false);
            setShowBillModal(true);
          }}
        />
      )}

      {/* Modal Hóa đơn thanh toán */}
      <BillModal
        isOpen={showBillModal}
        onClose={() => setShowBillModal(false)}
        order={activeOrder}
        onRequestPayment={handleRequestPayment}
      />

      {/* Chỉ hiện Footer mặc định khi CHƯA có đơn active */}
      {!activeOrder && <MenuFooter />}
    </div>
  );
};

export default MenuPage;