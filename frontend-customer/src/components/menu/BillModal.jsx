import React, { useState, useMemo } from "react";
import {
  X,
  Receipt,
  CreditCard,
  CheckCircle,
  AlertCircle,
  Loader,
} from "lucide-react";
import Swal from "sweetalert2"; // Import Swal
import CustomerService from "../../services/customerService";

const BillModal = ({ isOpen, onClose, order, onRequestPayment }) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState("cash");

  // --- 1. CONFIG: Sửa lỗi Tailwind bằng cách khai báo full class ---
  const paymentMethods = [
    {
      id: "cash",
      name: "Tiền mặt",
      icon: "💵",
      activeClass: "border-green-500 bg-green-50 text-green-700",
    },
    {
      id: "momo",
      name: "MoMo",
      icon: "🟣",
      activeClass: "border-pink-500 bg-pink-50 text-pink-700",
    },
    {
      id: "vnpay",
      name: "VNPay",
      icon: "🔵",
      activeClass: "border-blue-500 bg-blue-50 text-blue-700",
    },
    {
      id: "zalopay",
      name: "ZaloPay",
      icon: "🔷",
      activeClass: "border-cyan-500 bg-cyan-50 text-cyan-700",
    },
    {
      id: "stripe",
      name: "Stripe",
      icon: "💳",
      activeClass: "border-indigo-500 bg-indigo-50 text-indigo-700",
    },
  ];

  const getPaymentMethodName = (methodId) => {
    const method = paymentMethods.find((p) => p.id === methodId);
    return method ? method.name : methodId;
  };

  // --- 2. LOGIC KIỂM TRA MÓN ---
  const allItemsServed = useMemo(() => {
    if (!order) return false;
    const items = order.items || [];
    if (items.length === 0) return false;
    const activeItems = items.filter((i) => i.status !== "cancelled");
    if (activeItems.length === 0) return false;
    return activeItems.every((i) => i.status === "served");
  }, [order]);

  // Early return
  if (!isOpen || !order) return null;

  // --- 3. FORMATTER ---
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount || 0);
  };

  const formatDateTime = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // --- 4. HANDLERS ---

  // Xử lý thanh toán Online (MoMo thật + Mock các cái khác)
  const handleOnlinePayment = async (method, orderId, amount) => {
    // A. MOMO THẬT
    if (method === "momo") {
      try {
        // Hiện loading đẹp
        Swal.fire({
          title: "Đang kết nối MoMo...",
          text: "Vui lòng đợi giây lát",
          allowOutsideClick: false,
          didOpen: () => Swal.showLoading(),
        });

        const response = await CustomerService.createMomoPayment(
          orderId,
          amount
        );

        if (response && response.payUrl) {
          // Redirect
          window.location.href = response.payUrl;
        } else if (response && response.resultCode === 0) {
          Swal.fire("Thành công", "Thanh toán MoMo thành công!", "success");
          onClose();
        } else {
          throw new Error(response?.message || "Không thể tạo thanh toán MoMo");
        }
      } catch (error) {
        console.error("MoMo payment error:", error);
        Swal.fire({
          icon: "error",
          title: "Lỗi MoMo",
          text: error.message || "Vui lòng thử lại",
        });
      }
      return;
    }

    // B. CÁC CỔNG KHÁC (MOCK - Giả lập không dùng localhost)
    Swal.fire({
      title: `Đang chuyển đến ${getPaymentMethodName(method)}...`,
      text: "(MOCK: Giả lập thanh toán thành công sau 2s)",
      allowOutsideClick: false,
      didOpen: () => Swal.showLoading(),
    });

    setTimeout(async () => {
      try {
        await CustomerService.completePayment(
          orderId,
          `${method.toUpperCase()}_${Date.now()}`,
          method
        );
        Swal.fire({
          icon: "success",
          title: "Thanh toán thành công!",
          timer: 1500,
          showConfirmButton: false,
        });
        onClose();
      } catch (err) {
        Swal.fire("Lỗi", "Hoàn tất thanh toán thất bại", "error");
      }
    }, 2000);
  };

  const handlePaymentRequest = async () => {
    if (!allItemsServed) {
      Swal.fire({
        icon: "warning",
        title: "Chưa thể thanh toán",
        text: "Vui lòng đợi tất cả món được phục vụ (Trạng thái: Served)!",
        confirmButtonColor: "#ea580c",
      });
      return;
    }

    // Xác nhận bằng Swal
    const result = await Swal.fire({
      title: "Xác nhận thanh toán?",
      text: `Tổng tiền: ${formatCurrency(
        order.total_amount
      )} - Qua: ${getPaymentMethodName(selectedPaymentMethod)}`,
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "Thanh toán ngay",
      cancelButtonText: "Hủy",
      confirmButtonColor: "#16a34a",
      cancelButtonColor: "#d1d5db",
    });

    if (!result.isConfirmed) return;

    setIsProcessing(true);
    try {
      // 1. Gửi request báo backend (MenuPage update UI status)
      await onRequestPayment(order.id, selectedPaymentMethod);

      // 2. Xử lý phân luồng
      if (selectedPaymentMethod === "cash") {
        Swal.fire({
          icon: "success",
          title: "Đã gọi thanh toán",
          text: "Vui lòng chờ nhân viên đến thu tiền mặt.",
          confirmButtonColor: "#16a34a",
        });
        onClose();
      } else {
        await handleOnlinePayment(
          selectedPaymentMethod,
          order.id,
          order.total_amount
        );
      }
    } catch (error) {
      console.error("Payment error:", error);
      Swal.fire("Lỗi", error.message || "Có lỗi xảy ra", "error");
    } finally {
      setIsProcessing(false);
    }
  };

  // Tính toán hiển thị (chỉ để show chi tiết, Total lấy từ Backend)
  const activeItems = (order.items || []).filter(
    (i) => i.status !== "cancelled"
  );
  const subtotal = activeItems.reduce((sum, item) => {
    const itemPrice = parseFloat(item.price_at_order || item.unit_price || 0);
    const modifierPrice = (item.modifiers || []).reduce(
      (modSum, mod) =>
        modSum + parseFloat(mod.price || mod.modifier_option?.price || 0),
      0
    );
    return sum + (itemPrice + modifierPrice) * item.quantity;
  }, 0);

  const tax = subtotal * 0.1;
  const serviceCharge = subtotal * 0.05;
  // Ưu tiên lấy total từ Backend
  const totalDisplay = order.total_amount || subtotal + tax + serviceCharge;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-hidden flex flex-col animate-fade-in">
        {/* HEADER */}
        <div className="bg-gradient-to-r from-purple-600 to-blue-600 text-white p-5 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white/20 rounded-lg backdrop-blur-md">
              <Receipt size={24} />
            </div>
            <div>
              <h2 className="text-lg font-bold">Thanh toán hóa đơn</h2>
              <p className="text-xs text-purple-100 opacity-90">
                Bàn {order.table?.table_number} • #
                {order.id?.slice(-6).toUpperCase()}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-white hover:bg-white/20 rounded-full p-2 transition-all"
          >
            <X size={24} />
          </button>
        </div>

        {/* BODY - SCROLLABLE */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-gray-50/30">
          {/* THÔNG TIN ĐƠN */}
          <div className="bg-white border border-gray-100 rounded-xl p-4 shadow-sm text-sm">
            <div className="flex justify-between items-center mb-2">
              <span className="text-gray-500">Thời gian đặt:</span>
              <span className="font-medium">
                {formatDateTime(order.created_at)}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-500">Trạng thái:</span>
              <span
                className={`px-2 py-0.5 rounded text-xs font-bold ${
                  order.status === "payment"
                    ? "bg-purple-100 text-purple-700"
                    : "bg-gray-100 text-gray-700"
                }`}
              >
                {order.status === "payment"
                  ? "ĐANG THANH TOÁN"
                  : order.status.toUpperCase()}
              </span>
            </div>
          </div>

          {/* DANH SÁCH MÓN */}
          <div className="bg-white border border-gray-100 rounded-xl shadow-sm overflow-hidden">
            <div className="bg-gray-50 px-4 py-2 border-b border-gray-100 flex items-center gap-2">
              <Receipt size={14} className="text-gray-400" />
              <span className="text-xs font-bold text-gray-500 uppercase">
                Chi tiết món ({activeItems.length})
              </span>
            </div>

            <div className="divide-y divide-gray-50 p-4">
              {activeItems.map((item, idx) => {
                const itemPrice = parseFloat(
                  item.price_at_order || item.unit_price || 0
                );
                const modifierPrice = (item.modifiers || []).reduce(
                  (sum, mod) =>
                    sum +
                    parseFloat(mod.price || mod.modifier_option?.price || 0),
                  0
                );
                const itemTotal = (itemPrice + modifierPrice) * item.quantity;

                return (
                  <div key={idx} className="py-2 first:pt-0 last:pb-0">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <p className="font-medium text-gray-800 text-sm">
                          <span className="font-bold text-gray-900 mr-1">
                            {item.quantity}x
                          </span>
                          {item.menu_item?.name || item.name}
                        </p>

                        {/* Status Món */}
                        <div className="mt-1">
                          <span
                            className={`text-[10px] px-1.5 py-0.5 rounded ${
                              item.status === "served"
                                ? "bg-green-100 text-green-700"
                                : "bg-gray-100 text-gray-600"
                            }`}
                          >
                            {item.status === "served"
                              ? "✓ Đã lên"
                              : item.status}
                          </span>
                        </div>

                        {/* Modifiers */}
                        {item.modifiers?.length > 0 && (
                          <div className="ml-4 mt-1 space-y-0.5">
                            {item.modifiers.map((mod, i) => (
                              <p key={i} className="text-[11px] text-gray-500">
                                + {mod.modifier_option?.name || mod.name}
                              </p>
                            ))}
                          </div>
                        )}
                      </div>
                      <span className="font-medium text-gray-900 text-sm ml-2">
                        {formatCurrency(itemTotal)}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* TỔNG CỘNG */}
            <div className="bg-gray-50 p-4 space-y-2 border-t border-gray-100">
              <div className="flex justify-between text-xs text-gray-500">
                <span>Tạm tính</span>
                <span>{formatCurrency(subtotal)}</span>
              </div>
              <div className="flex justify-between items-center pt-2 border-t border-gray-200 mt-2">
                <span className="font-bold text-gray-800">TỔNG CỘNG</span>
                <span className="text-xl font-bold text-purple-600">
                  {formatCurrency(totalDisplay)}
                </span>
              </div>
            </div>
          </div>

          {/* CẢNH BÁO NẾU CHƯA SERVED HẾT */}
          {!allItemsServed && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 flex gap-3">
              <div className="bg-yellow-100 p-2 rounded-full h-fit">
                <AlertCircle size={18} className="text-yellow-700" />
              </div>
              <div className="text-sm">
                <p className="font-bold text-yellow-800">Chưa thể thanh toán</p>
                <p className="text-yellow-700 mt-0.5">
                  Vui lòng đợi tất cả món được phục vụ (Status: Served) trước
                  khi thanh toán.
                </p>
              </div>
            </div>
          )}

          {/* PHƯƠNG THỨC THANH TOÁN */}
          {allItemsServed && (
            <div>
              <h3 className="font-bold text-gray-700 mb-3 flex items-center gap-2 text-sm uppercase tracking-wider">
                <CreditCard size={16} /> Phương thức thanh toán
              </h3>

              <div className="grid grid-cols-2 gap-3">
                {paymentMethods.map((method) => (
                  <button
                    key={method.id}
                    onClick={() => setSelectedPaymentMethod(method.id)}
                    disabled={isProcessing}
                    className={`p-3 rounded-xl border-2 transition-all flex flex-col items-center gap-2 relative ${
                      selectedPaymentMethod === method.id
                        ? method.activeClass // 🔥 SỬ DỤNG CLASS ĐÃ FIX
                        : "border-gray-100 bg-white hover:border-gray-200 text-gray-500"
                    } ${
                      isProcessing
                        ? "opacity-50 cursor-not-allowed"
                        : "cursor-pointer active:scale-[0.98]"
                    }`}
                  >
                    {selectedPaymentMethod === method.id && (
                      <div className="absolute top-2 right-2 text-current">
                        <CheckCircle size={14} />
                      </div>
                    )}
                    <div className="text-2xl">{method.icon}</div>
                    <div className="text-sm font-bold">{method.name}</div>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* FOOTER */}
        <div className="p-5 bg-white border-t border-gray-100 shrink-0">
          {allItemsServed ? (
            <button
              onClick={handlePaymentRequest}
              disabled={isProcessing}
              className={`w-full py-3.5 rounded-xl font-bold text-white flex items-center justify-center gap-2 shadow-lg shadow-purple-200 transition-all ${
                isProcessing
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 active:scale-[0.98]"
              }`}
            >
              {isProcessing ? (
                <>
                  <Loader size={20} className="animate-spin" />
                  Đang xử lý...
                </>
              ) : (
                <>
                  <span>Xác nhận thanh toán</span>
                  <span className="bg-white/20 px-2 py-0.5 rounded text-sm ml-1">
                    {formatCurrency(totalDisplay)}
                  </span>
                </>
              )}
            </button>
          ) : (
            <button
              disabled
              className="w-full py-3.5 rounded-xl font-bold text-gray-400 bg-gray-100 cursor-not-allowed flex items-center justify-center gap-2"
            >
              <Loader size={18} className="animate-spin text-gray-400" />
              Đang chờ món lên đủ...
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default BillModal;
