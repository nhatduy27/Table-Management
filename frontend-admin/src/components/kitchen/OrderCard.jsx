import React, { useState, useEffect } from "react";
import OrderTimer, { getElapsedSeconds, getTimeStatus } from "./OrderTimer";

// Component Card Order
const OrderCard = ({ order, onStartOrder, onReadyOrder, isUpdating }) => {
  const [checkedItems, setCheckedItems] = useState({});
  const timeStatus = getTimeStatus(getElapsedSeconds(order.ordered_at));

  // Khởi tạo checked state cho tất cả items
  useEffect(() => {
    const initialChecked = {};
    order.items?.forEach((item) => {
      if (checkedItems[item.id] === undefined) {
        initialChecked[item.id] = false;
      } else {
        initialChecked[item.id] = checkedItems[item.id];
      }
    });
    if (Object.keys(initialChecked).length > 0) {
      setCheckedItems((prev) => ({ ...prev, ...initialChecked }));
    }
  }, [order.items]);

  // Kiểm tra tất cả items đã check chưa
  const allItemsChecked =
    order.items?.length > 0 &&
    order.items.every((item) => checkedItems[item.id] === true);

  // Toggle checkbox
  const handleToggleItem = (itemId) => {
    setCheckedItems((prev) => ({
      ...prev,
      [itemId]: !prev[itemId],
    }));
  };

  const cardBorderColors = {
    ontime: "border-gray-200",
    warning: "border-yellow-400 bg-yellow-50",
    overdue: "border-red-400 bg-red-50",
  };

  const statusBadgeColors = {
    pending: "bg-gray-100 text-gray-800",
    confirmed: "bg-blue-100 text-blue-800",
    preparing: "bg-orange-100 text-orange-800",
    ready: "bg-green-100 text-green-800",
  };

  // Tạo order number ngắn gọn từ ID
  const shortOrderId = order.id.slice(-4).toUpperCase();

  // Kiểm tra có thể bấm Ready không
  const canMarkReady =
    order.status === "preparing" && allItemsChecked && !isUpdating;

  return (
    <div
      className={`bg-white rounded-lg shadow-md border-2 ${cardBorderColors[timeStatus]} overflow-hidden transition-all duration-300 hover:shadow-lg h-[420px] flex flex-col`}
    >
      {/* Header */}
      <div className="bg-gray-800 text-white px-4 py-3 flex-shrink-0">
        <div className="flex justify-between items-center">
          <div>
            <h3 className="font-bold text-lg">Order #{shortOrderId}</h3>
            <p className="text-gray-300 text-sm">
              Bàn {order.table?.table_number || "N/A"}
              {order.table?.location && ` - ${order.table.location}`}
            </p>
          </div>
          <span
            className={`px-2 py-1 rounded text-xs font-semibold uppercase ${
              statusBadgeColors[order.status]
            }`}
          >
            {order.status}
          </span>
        </div>
      </div>

      {/* Timer */}
      <div className="px-4 py-2 border-b border-gray-100 flex-shrink-0">
        <OrderTimer orderedAt={order.ordered_at} status={order.status} />
        {timeStatus === "overdue" && (
          <div className="text-red-600 text-sm font-semibold mt-1 flex items-center gap-1">
            <span>⚠️</span> OVERDUE
          </div>
        )}
      </div>

      {/* Items - Scrollable */}
      <div className="px-4 py-3 flex-1 overflow-y-auto min-h-0">
        <div className="space-y-3">
          {order.items?.map((item, index) => (
            <div
              key={item.id || index}
              className={`flex items-start gap-2 p-2 rounded-lg transition-colors ${
                order.status === "preparing"
                  ? checkedItems[item.id]
                    ? "bg-green-50 border border-green-200 cursor-pointer"
                    : "hover:bg-gray-50 cursor-pointer"
                  : order.status === "ready"
                  ? "bg-green-50 border border-green-200"
                  : ""
              }`}
              onClick={() =>
                order.status === "preparing" && handleToggleItem(item.id)
              }
            >
              {/* Checkbox - chỉ hiện khi status là preparing */}
              {order.status === "preparing" && (
                <div className="flex-shrink-0 mt-0.5">
                  <input
                    type="checkbox"
                    checked={checkedItems[item.id] || false}
                    onChange={() => handleToggleItem(item.id)}
                    className="w-5 h-5 rounded border-gray-300 text-green-600 focus:ring-green-500 cursor-pointer"
                    onClick={(e) => e.stopPropagation()}
                  />
                </div>
              )}
              {/* Icon cho status khác */}
              {order.status !== "preparing" && (
                <span className="text-gray-400 mt-0.5">
                  {order.status === "ready" ? "☑" : "▸"}
                </span>
              )}
              <div className="flex-1">
                <div
                  className={`font-medium ${
                    order.status === "preparing" && checkedItems[item.id]
                      ? "text-green-700 line-through"
                      : order.status === "ready"
                      ? "text-green-700 line-through"
                      : "text-gray-800"
                  }`}
                >
                  {item.menu_item?.name || "Unknown Item"}
                  {item.quantity > 1 && (
                    <span
                      className={`ml-1 ${
                        (order.status === "preparing" &&
                          checkedItems[item.id]) ||
                        order.status === "ready"
                          ? "text-green-600"
                          : "text-blue-600"
                      }`}
                    >
                      x{item.quantity}
                    </span>
                  )}
                </div>
                {/* Modifiers */}
                {item.modifiers?.length > 0 && (
                  <div
                    className={`text-sm ml-2 ${
                      (order.status === "preparing" && checkedItems[item.id]) ||
                      order.status === "ready"
                        ? "text-green-500"
                        : "text-gray-500"
                    }`}
                  >
                    {item.modifiers.map((mod, mIndex) => (
                      <span key={mIndex} className="block">
                        + {mod.modifier_option?.name || "Option"}
                      </span>
                    ))}
                  </div>
                )}
                {/* Notes */}
                {item.notes && (
                  <div
                    className={`text-sm italic mt-1 ${
                      (order.status === "preparing" && checkedItems[item.id]) ||
                      order.status === "ready"
                        ? "text-green-500"
                        : "text-orange-600"
                    }`}
                  >
                    "{item.notes}"
                  </div>
                )}
              </div>
              {/* Check icon - chỉ hiện khi status là preparing và item đã check */}
              {order.status === "preparing" && checkedItems[item.id] && (
                <span className="text-green-500 text-lg">✓</span>
              )}
            </div>
          ))}
          {(!order.items || order.items.length === 0) && (
            <p className="text-gray-400 text-center py-2">Không có món</p>
          )}
        </div>
      </div>

      {/* Progress indicator - chỉ hiện khi status là preparing */}
      {order.status === "preparing" && order.items?.length > 0 && (
        <div className="px-4 py-2 bg-gray-50 border-t border-gray-100 flex-shrink-0">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600">
              Hoàn thành: {Object.values(checkedItems).filter(Boolean).length}/
              {order.items.length} món
            </span>
            {allItemsChecked && (
              <span className="text-green-600 font-semibold flex items-center gap-1">
                <span>✓</span> Sẵn sàng!
              </span>
            )}
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
            <div
              className="bg-green-500 h-2 rounded-full transition-all duration-300"
              style={{
                width: `${
                  (Object.values(checkedItems).filter(Boolean).length /
                    order.items.length) *
                  100
                }%`,
              }}
            ></div>
          </div>
        </div>
      )}

      {/* Actions - Always at bottom */}
      <div className="px-4 py-3 bg-gray-50 border-t border-gray-100 flex gap-2 flex-shrink-0 mt-auto">
        <button
          onClick={() => onStartOrder(order.id)}
          disabled={
            isUpdating ||
            order.status === "preparing" ||
            order.status === "ready"
          }
          className={`flex-1 py-2 px-4 rounded font-semibold transition-colors ${
            order.status === "preparing" || order.status === "ready"
              ? "bg-gray-200 text-gray-400 cursor-not-allowed"
              : "bg-orange-500 hover:bg-orange-600 text-white"
          }`}
        >
          {isUpdating ? "..." : "Start"}
        </button>
        <button
          onClick={() => onReadyOrder(order.id)}
          disabled={!canMarkReady}
          title={
            !allItemsChecked && order.status === "preparing"
              ? "Check tất cả món trước khi đánh dấu Ready"
              : ""
          }
          className={`flex-1 py-2 px-4 rounded font-semibold transition-colors ${
            canMarkReady
              ? "bg-green-500 hover:bg-green-600 text-white"
              : "bg-gray-200 text-gray-400 cursor-not-allowed"
          }`}
        >
          {isUpdating ? "..." : allItemsChecked ? "✓ Ready" : "Ready"}
        </button>
      </div>
    </div>
  );
};

export default OrderCard;
