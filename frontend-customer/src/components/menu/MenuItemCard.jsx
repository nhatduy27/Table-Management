import React from "react";

const MenuItemCard = ({ item, onCustomize, onViewDetail }) => {
  const hasModifiers =
    item.modifierGroups &&
    item.modifierGroups.length > 0 &&
    item.modifierGroups.some((g) => g.options && g.options.length > 0);

  // Kiểm tra xem món có khả dụng không (Hết hàng HOẶC Tạm ngưng)
  const isUnavailable = item.status === 'unavailable' || item.status === 'sold_out';

  // [FIX] Ưu tiên lấy primary_photo.url như code cũ của bạn
  const imageUrl = item.primary_photo?.url || item.image || (item.photos && item.photos.length > 0 ? item.photos[0].url : null);

  // 1. Hàm xử lý khi click vào thẻ -> Mở xem chi tiết
  const handleCardClick = () => {
    if (isUnavailable) return;
    if (onViewDetail) {
        onViewDetail(item);
    }
  };

  // 2. Hàm xử lý khi click nút Thêm -> Mở tùy chọn thêm vào giỏ ngay
  const handleAddButtonClick = (e) => {
    e.stopPropagation(); // QUAN TRỌNG: Ngăn không cho sự kiện click lan ra thẻ cha
    if (isUnavailable) return;
    onCustomize(item);
  };

  // Hàm lấy nhãn hiển thị trạng thái
  const getStatusLabel = () => {
      if (item.status === 'sold_out') return 'Hết hàng';
      if (item.status === 'unavailable') return 'Tạm ngưng';
      return '';
  };

  return (
    <div 
      // Sự kiện click vào thẻ -> Xem chi tiết
      onClick={handleCardClick}
      className={`bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300 cursor-pointer flex flex-col h-full ${isUnavailable ? 'opacity-75 cursor-not-allowed' : ''}`}
    >
      {/* --- PHẦN HÌNH ẢNH (Giữ nguyên logic hiển thị cũ) --- */}
      {imageUrl ? (
        <div className="relative h-48 w-full overflow-hidden bg-gray-100 flex items-center justify-center flex-shrink-0">
          <img
            src={imageUrl}
            alt={item.name}
            className={`w-full h-full object-cover transition-transform duration-500 hover:scale-105 ${isUnavailable ? 'grayscale' : ''}`}
          />
          {item.is_chef_recommended && !isUnavailable && (
            <span className="absolute top-2 right-2 inline-flex items-center gap-1 px-2 py-1 bg-amber-100 text-amber-800 rounded-full text-xs font-medium shadow-sm z-10">
              <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
              Chef's Pick
            </span>
          )}
          
          {/* Lớp phủ khi hết hàng/tạm ngưng */}
          {isUnavailable && (
            <div className="absolute inset-0 bg-black/50 flex items-center justify-center z-20">
              <span className="text-white font-bold text-lg px-4 py-2 border-2 border-white rounded transform -rotate-12 uppercase tracking-wider">
                {getStatusLabel()}
              </span>
            </div>
          )}
        </div>
      ) : (
        <div className="relative h-48 w-full bg-gradient-to-br from-amber-50 to-orange-100 flex items-center justify-center flex-shrink-0">
          <svg
            className={`w-16 h-16 ${isUnavailable ? 'text-gray-400' : 'text-amber-300'}`}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
            />
          </svg>
          
          {isUnavailable && (
            <div className="absolute inset-0 bg-gray-200/50 flex items-center justify-center z-10">
               <span className="text-gray-600 font-bold text-lg uppercase tracking-wider">
                {getStatusLabel()}
              </span>
            </div>
          )}
        </div>
      )}

      {/* --- PHẦN NỘI DUNG --- */}
      <div className="p-5 flex flex-col flex-1">
        <div className="flex justify-between items-start mb-3">
          <div className="flex-1">
            <h3 className={`text-lg font-semibold mb-1 line-clamp-1 ${isUnavailable ? 'text-gray-500' : 'text-gray-900'}`}>
              {item.name}
            </h3>
            <p className="text-gray-500 text-sm mb-3 line-clamp-2 min-h-[2.5rem]">
              {item.description || "\u00A0"}
            </p>
          </div>
        </div>

        <div className="flex items-center justify-between mt-auto pt-2 border-t border-gray-50">
          <div className="flex flex-col">
            <span className={`text-xl font-bold ${isUnavailable ? 'text-gray-400' : 'text-gray-900'}`}>
              {/* Format tiền tệ kiểu Việt Nam */}
              {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(item.price || 0)}
            </span>
            {item.prep_time_minutes > 0 && (
              <span className="text-sm text-gray-400">
                {item.prep_time_minutes} min prep
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleAddButtonClick} // [FIX] Dùng hàm riêng có stopPropagation
              className={`px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-1 
                ${isUnavailable 
                  ? "bg-gray-200 text-gray-500 cursor-not-allowed" 
                  : "bg-amber-600 text-white hover:bg-amber-700 shadow-sm hover:shadow"
                }`}
              disabled={isUnavailable} 
            >
              {!isUnavailable && (
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
              )}
              {isUnavailable ? getStatusLabel() : "Thêm"}
            </button>
          </div>
        </div>

        {/* Show modifier/customization hint */}
        {!isUnavailable && (
            <p className="text-xs text-gray-500 mt-2">
            {hasModifiers
                ? "Có tùy chọn thêm (Size, Topping...)"
                : "Bấm ảnh để xem chi tiết"}
            </p>
        )}
      </div>
    </div>
  );
};

export default MenuItemCard;