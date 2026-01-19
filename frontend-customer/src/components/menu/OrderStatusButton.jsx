import React from "react";

const OrderStatusButton = ({ onClick, hasOrders }) => {
  return (
    <button
      onClick={onClick}
      className="fixed bottom-24 right-4 bg-blue-600 text-white px-4 py-3 rounded-full shadow-lg z-20 hover:bg-blue-700 transition-colors flex items-center gap-2"
      title="Xem trạng thái đơn hàng"
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
          d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
        />
      </svg>
      <span className="font-medium text-sm">My orders</span>
      {hasOrders && (
        <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
          {hasOrders}
        </span>
      )}
    </button>
  );
};

export default OrderStatusButton;
