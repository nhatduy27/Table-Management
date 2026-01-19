import React from "react";

const CartSidebar = ({
  cart,
  cartTotal,
  isOpen,
  onClose,
  onUpdateQuantity,
  onRemoveItem,
  onClearCart,
  onPlaceOrder,
  orderPlacing,
}) => {
  if (!isOpen || cart.length === 0) return null;

  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);

  // Hàm format tiền tệ Việt Nam
  const formatCurrency = (amount) => {
    // Thêm fallback || 0 để tránh lỗi NaN
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount || 0);
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/40 z-30 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Sidebar Content */}
      <div className="fixed bottom-0 left-0 right-0 md:right-4 md:bottom-4 md:left-auto md:w-96 bg-white shadow-2xl rounded-t-2xl md:rounded-2xl z-40 max-h-[85vh] flex flex-col animate-slide-up">
        {/* HEADER */}
        <div className="p-4 border-b flex items-center justify-between bg-gray-50 rounded-t-2xl">
          <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
            🛒 Giỏ hàng{" "}
            <span className="text-sm font-normal text-gray-500">
              ({totalItems} món)
            </span>
          </h3>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-200 rounded-full transition-colors"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {/* BODY - SCROLLABLE */}
        <div className="overflow-y-auto flex-1 p-4">
          {cart.map((item) => (
            <div
              key={item.cartItemId || item.id}
              className="flex justify-between py-4 border-b border-dashed border-gray-200 last:border-0"
            >
              {/* Thông tin món */}
              <div className="flex-1 pr-3">
                <p className="font-bold text-gray-900">{item.name}</p>

                {/* [FIX] HIỂN THỊ MODIFIERS CHUẨN */}
                {item.modifiers && item.modifiers.length > 0 && (
                  <div className="mt-1 space-y-0.5">
                    {item.modifiers.map((mod, idx) => {
                      // Logic lấy giá fallback 3 lớp để không bị NaN
                      const modPrice =
                        mod.price ||
                        mod.price_adjustment ||
                        mod.priceAdjustment ||
                        0;
                      const modName = mod.name || mod.optionName || "";

                      return (
                        <p
                          key={mod.id || mod.optionId || idx}
                          className="text-xs text-gray-500 flex justify-between"
                        >
                          <span>+ {modName}</span>
                          {/* Chỉ hiện giá nếu > 0 */}
                          {modPrice > 0 && (
                            <span>{formatCurrency(modPrice)}</span>
                          )}
                        </p>
                      );
                    })}
                  </div>
                )}

                {/* Note */}
                {item.note && (
                  <p className="text-xs text-amber-600 bg-amber-50 inline-block px-2 py-0.5 rounded mt-1 border border-amber-100">
                    ✍️ {item.note}
                  </p>
                )}

                <p className="text-sm text-gray-500 mt-1">
                  Đơn giá: {formatCurrency(item.unitPrice)}
                </p>
              </div>

              {/* Điều chỉnh số lượng & Giá tổng */}
              <div className="flex flex-col items-end gap-2">
                {/* [FIX] Item.total được tính từ useCart, nếu useCart đúng thì ở đây sẽ đúng */}
                <span className="font-bold text-gray-900">
                  {formatCurrency(item.total)}
                </span>

                <div className="flex items-center bg-gray-100 rounded-lg p-0.5">
                  <button
                    onClick={() =>
                      onUpdateQuantity(
                        item.cartItemId || item.id,
                        item.quantity - 1,
                      )
                    }
                    className="w-7 h-7 flex items-center justify-center text-gray-600 hover:bg-white hover:shadow-sm rounded transition-all"
                  >
                    -
                  </button>
                  <span className="w-8 text-center text-sm font-bold">
                    {item.quantity}
                  </span>
                  <button
                    onClick={() =>
                      onUpdateQuantity(
                        item.cartItemId || item.id,
                        item.quantity + 1,
                      )
                    }
                    className="w-7 h-7 flex items-center justify-center text-gray-600 hover:bg-white hover:shadow-sm rounded transition-all"
                  >
                    +
                  </button>
                </div>

                <button
                  onClick={() => onRemoveItem(item.cartItemId || item.id)}
                  className="text-xs text-red-500 hover:text-red-700 underline mt-1"
                >
                  Xóa
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* FOOTER - TOTAL & ACTIONS */}
        <div className="p-4 border-t bg-white shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)] rounded-b-2xl">
          <div className="flex justify-between items-end mb-4">
            <span className="text-gray-500 font-medium">
              Tổng cộng tạm tính
            </span>
            <span className="text-2xl font-bold text-orange-600">
              {formatCurrency(cartTotal)}
            </span>
          </div>

          <div className="space-y-3">
            <button
              onClick={onPlaceOrder}
              disabled={orderPlacing}
              className={`w-full py-3.5 px-4 rounded-xl font-bold text-white shadow-lg flex items-center justify-center gap-2 transition-all
                ${
                  orderPlacing
                    ? "bg-gray-400 cursor-not-allowed"
                    : "bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 active:scale-[0.98]"
                }`}
            >
              {orderPlacing ? (
                <>
                  <svg
                    className="animate-spin h-5 w-5 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  Đang gửi đơn...
                </>
              ) : (
                <>🍽️ Xác nhận gọi món</>
              )}
            </button>

            <button
              onClick={onClearCart}
              disabled={orderPlacing}
              className="w-full py-2.5 text-sm font-medium text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            >
              Xóa tất cả món
            </button>
          </div>

          <p className="text-[10px] text-gray-400 text-center mt-3">
            Món ăn sẽ được gửi xuống bếp ngay sau khi xác nhận
          </p>
        </div>
      </div>
    </>
  );
};

export default CartSidebar;
