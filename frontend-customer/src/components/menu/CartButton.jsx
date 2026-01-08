import React from "react";

// [FIX 1] Thêm prop 'className' vào danh sách nhận
const CartButton = ({ totalItems, cartTotal, onClick, className }) => {
  if (totalItems === 0) return null;

  return (
    <button
      onClick={onClick}
      className={`fixed right-4 ${className || 'bottom-4'} bg-amber-600 text-white px-4 py-3 rounded-full shadow-lg z-50 flex items-center gap-3 hover:bg-amber-700 transition-all duration-300`}
    >
      <div className="relative">
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
            d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
          />
        </svg>
        <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold animate-bounce">
          {totalItems}
        </span>
      </div>
      <span className="font-medium">
        {/* [FIX 3] Format tiền Việt cho đồng bộ luôn nhé */}
        {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(cartTotal)}
      </span>
    </button>
  );
};

export default CartButton;