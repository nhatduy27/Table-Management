import React, { useState, useEffect } from "react";
import { useSearchParams, useNavigate, useLocation } from "react-router-dom";
import Swal from "sweetalert2";
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

const MenuPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const location = useLocation();

  const tableId = searchParams.get("table");
  const token = searchParams.get("token");

  const [loading, setLoading] = useState(true);
  const [menuLoading, setMenuLoading] = useState(false);
  const [error, setError] = useState(null);
  const [menuError, setMenuError] = useState(null);
  const [tableInfo, setTableInfo] = useState(null);
  const [categories, setCategories] = useState([]);
  const [activeCategory, setActiveCategory] = useState(null);
  const [selectedItem, setSelectedItem] = useState(null);
  const [orderPlacing, setOrderPlacing] = useState(false);

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
  } = useCart();

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

  // Hàm format tiền tệ sang "đ"
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("vi-VN").format(amount) + "đ";
  };

  useEffect(() => {
    const verifyQRCode = async () => {
      if (!tableId || !token) {
        setError("Mã QR không hợp lệ hoặc thiếu thông tin.");
        setLoading(false);
        return;
      }
      try {
        const response = await tableService.verifyQRToken(tableId, token);
        if (response.success) {
          setTableInfo(response.data);
        } else {
          setError(response.message || "Xác thực mã QR thất bại.");
        }
      } catch (err) {
        setError("Lỗi kết nối máy chủ.");
      } finally {
        setLoading(false);
      }
    };
    verifyQRCode();
  }, [tableId, token]);

  useEffect(() => {
    if (!tableInfo) return;

    setMenuLoading(true);
    try {
      const rawCategories = tableInfo.categories || [];
      const items = tableInfo.items || [];

      const itemsByCategory = items.reduce((acc, item) => {
        const catId = item.category?.id;
        if (catId) {
          if (!acc[catId]) acc[catId] = [];
          acc[catId].push(item);
        }
        return acc;
      }, {});

      const categoriesWithItems = rawCategories.map((cat) => ({
        ...cat,
        items: itemsByCategory[cat.id] || [],
      }));

      setCategories(categoriesWithItems);
      if (categoriesWithItems.length > 0) {
        setActiveCategory(categoriesWithItems[0].id);
      }
    } catch (err) {
      setMenuError("Không thể hiển thị thực đơn.");
    } finally {
      setMenuLoading(false);
    }
  }, [tableInfo]);

  const handlePlaceOrder = async () => {
    if (cart.length === 0) {
      Swal.fire({
        icon: "warning",
        title: "Giỏ hàng trống!",
        text: "Vui lòng thêm món vào giỏ trước khi đặt hàng.",
        confirmButtonColor: "#ea580c",
      });
      return;
    }

    const targetTableId = tableInfo?.table?.id || tableId;
    const isLoggedIn = CustomerService.isLoggedIn();

    if (!isLoggedIn) {
      const result = await Swal.fire({
        title: "Tiếp tục với tư cách Khách?",
        html: "Bạn chưa đăng nhập. Bạn sẽ không thể xem lại lịch sử đơn hàng sau khi đóng trình duyệt.<br><br><b>Đăng nhập ngay để tích điểm thưởng!</b>",
        icon: "info",
        showCancelButton: true,
        confirmButtonText: "Tiếp tục đặt món",
        cancelButtonText: "Đăng nhập ngay",
        confirmButtonColor: "#9ca3af",
        cancelButtonColor: "#ea580c",
        reverseButtons: true,
      });

      if (result.isDismissed) {
        navigate("/customer/login", {
          state: { from: location.pathname + location.search },
        });
        return;
      }
    }

    setOrderPlacing(true);

    try {
      const cartItems = cart.map((item) => ({
        id: item.id,
        price: item.unitPrice,
        quantity: item.quantity,
        name: item.name,
        notes: item.note || "",
        modifiers: item.modifiers || [],
      }));

      const orderResponse = await CustomerService.createOrderWithItems(
        targetTableId,
        cartItems
      );

      if (orderResponse.success) {
        await Swal.fire({
          icon: "success",
          title: "Đặt món thành công!",
          html: `
                        <div style="text-align: center;">
                            <p>Bàn số: <b>${
                              tableInfo?.table?.table_number
                            }</b></p>
                            <p>Mã đơn: <b>#${orderResponse.orderId
                              ?.toString()
                              .substring(0, 8)
                              .toUpperCase()}</b></p>
                            <hr style="margin: 10px 0;">
                            <p>Tổng tiền: <b style="color: #ea580c;">${formatCurrency(
                              orderResponse.totalAmount
                            )}</b></p>
                            <p style="font-size: 0.9em; color: #666;">Nhân viên sẽ phục vụ bạn ngay!</p>
                        </div>
                    `,
          confirmButtonColor: "#ea580c",
        });

        clearCart();
        setIsCartOpen(false);
      } else {
        throw new Error(orderResponse.message || "Đặt món thất bại");
      }
    } catch (err) {
      Swal.fire({
        icon: "error",
        title: "Lỗi hệ thống",
        text: err.message || "Không thể gửi đơn hàng lúc này.",
        confirmButtonColor: "#ef4444",
      });
    } finally {
      setOrderPlacing(false);
    }
  };

  const handleCustomize = (item) => setSelectedItem(item);

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

  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loading size="lg" text="Đang xác thực thông tin bàn..." />
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
    <div className="min-h-screen bg-gray-50">
      <MenuHeader
        tableNumber={tableInfo?.table?.table_number}
        cartItemCount={getTotalItems()}
      />

      <main className="container mx-auto px-4 py-6 mb-24">
        {menuError && <Alert type="warning" message={menuError} />}

        <CategoryTabs
          categories={categories}
          activeCategory={activeCategory}
          onSelectCategory={setActiveCategory}
        />

        {menuLoading ? (
          <div className="py-20">
            <Loading text="Đang tải thực đơn..." />
          </div>
        ) : (
          <div className="mt-6">
            <h3 className="text-xl font-bold mb-4 text-gray-800">
              {activeCategoryData?.name || "Thực đơn"}
            </h3>

            {/* Kiểm tra nếu danh mục không có item */}
            {activeCategoryData && activeCategoryData.items.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {activeCategoryData.items.map((item) => (
                  <MenuItemCard
                    key={item.id}
                    item={item}
                    onCustomize={handleCustomize}
                  />
                ))}
              </div>
            ) : (
              <div className="py-20 text-center bg-white rounded-2xl border border-dashed border-gray-300">
                <p className="text-gray-500 italic">
                  Hiện tại danh mục này chưa có món ăn nào.
                </p>
              </div>
            )}
          </div>
        )}

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

        {!isCartOpen && getTotalItems() > 0 && (
          <CartButton
            totalItems={getTotalItems()}
            cartTotal={cartTotal}
            onClick={() => setIsCartOpen(true)}
          />
        )}

        <ModifierModal
          item={selectedItem}
          isOpen={!!selectedItem}
          onClose={() => setSelectedItem(null)}
          onAddToCart={handleAddFromModal}
        />
      </main>
      <MenuFooter />
    </div>
  );
};

export default MenuPage;
