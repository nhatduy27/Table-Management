import React, { useState } from 'react';
import { X, Star, ShoppingBag, ChevronLeft, ChevronRight } from 'lucide-react';
import ReviewList from '../review/ReviewList';

const MenuItemDetailModal = ({ item, onClose, onAddToOrder }) => {
  const [activeTab, setActiveTab] = useState('details'); // 'details' or 'reviews'
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  if (!item) return null;

  // Xử lý danh sách ảnh: Ưu tiên mảng photos, nếu không có thì dùng ảnh đại diện, nếu không thì ảnh mặc định
  const images = item.photos && item.photos.length > 0 
    ? item.photos.map(p => p.url) 
    : [item.image || 'https://via.placeholder.com/300?text=No+Image'];

  const handleNextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % images.length);
  };

  const handlePrevImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
        
        {/* --- PHẦN ẢNH (GALLERY) --- */}
        <div className="relative h-64 sm:h-72 bg-gray-100 flex-shrink-0">
          <img 
            src={images[currentImageIndex]} 
            alt={item.name} 
            className="w-full h-full object-cover"
          />
          
          {/* Nút đóng */}
          <button 
            onClick={onClose}
            className="absolute top-4 right-4 bg-black/30 hover:bg-black/50 text-white p-2 rounded-full transition-colors backdrop-blur-md"
          >
            <X size={20} />
          </button>

          {/* Điều hướng ảnh (Chỉ hiện nếu có > 1 ảnh) */}
          {images.length > 1 && (
            <>
              <button 
                onClick={(e) => { e.stopPropagation(); handlePrevImage(); }}
                className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white p-1.5 rounded-full shadow-lg text-gray-800"
              >
                <ChevronLeft size={20} />
              </button>
              <button 
                onClick={(e) => { e.stopPropagation(); handleNextImage(); }}
                className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white p-1.5 rounded-full shadow-lg text-gray-800"
              >
                <ChevronRight size={20} />
              </button>
              
              {/* Dots indicator */}
              <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
                {images.map((_, idx) => (
                  <div 
                    key={idx} 
                    className={`w-2 h-2 rounded-full transition-all ${idx === currentImageIndex ? 'bg-white scale-125' : 'bg-white/50'}`} 
                  />
                ))}
              </div>
            </>
          )}
        </div>

        {/* --- NỘI DUNG --- */}
        <div className="flex flex-col flex-1 overflow-hidden">
          {/* Header Info */}
          <div className="p-5 border-b">
            <div className="flex justify-between items-start mb-2">
              <h2 className="text-2xl font-bold text-gray-900 leading-tight">{item.name}</h2>
              <span className="text-xl font-bold text-orange-600 ml-4">{formatCurrency(item.price)}</span>
            </div>
            
            {/* Tabs Toggle */}
            <div className="flex gap-6 mt-4 border-b border-gray-100">
              <button 
                onClick={() => setActiveTab('details')}
                className={`pb-2 text-sm font-bold transition-colors relative ${activeTab === 'details' ? 'text-orange-600' : 'text-gray-400 hover:text-gray-600'}`}
              >
                Chi tiết
                {activeTab === 'details' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-orange-600 rounded-t-full" />}
              </button>
              <button 
                onClick={() => setActiveTab('reviews')}
                className={`pb-2 text-sm font-bold transition-colors relative ${activeTab === 'reviews' ? 'text-orange-600' : 'text-gray-400 hover:text-gray-600'}`}
              >
                Đánh giá ({item.total_reviews || 0})
                {activeTab === 'reviews' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-orange-600 rounded-t-full" />}
              </button>
            </div>
          </div>

          {/* Scrollable Content */}
          <div className="flex-1 overflow-y-auto p-5 bg-gray-50">
            {activeTab === 'details' ? (
              <div className="space-y-4">
                <div>
                  <h4 className="font-bold text-gray-800 mb-1">Mô tả</h4>
                  <p className="text-gray-600 text-sm leading-relaxed">
                    {item.description || "Chưa có mô tả cho món ăn này."}
                  </p>
                </div>
                
                {/* Thông tin bổ sung (Ví dụ) */}
                <div className="grid grid-cols-2 gap-3 mt-4">
                    <div className="bg-white p-3 rounded-lg border border-gray-100 shadow-sm">
                        <span className="text-xs text-gray-400 block">Thời gian chuẩn bị</span>
                        <span className="text-sm font-medium text-gray-700">~{item.prep_time_minutes || 15} phút</span>
                    </div>
                    <div className="bg-white p-3 rounded-lg border border-gray-100 shadow-sm">
                        <span className="text-xs text-gray-400 block">Danh mục</span>
                        <span className="text-sm font-medium text-gray-700">{item.category?.name}</span>
                    </div>
                </div>
              </div>
            ) : (
              // --- REVIEW SECTION (Live Reviews) ---
              <div>
                <ReviewList menuItemId={item.id} showTitle={false} />
              </div>
            )}
          </div>

          {/* Footer Action */}
          <div className="p-4 bg-white border-t shadow-lg">
            <button 
              onClick={() => onAddToOrder(item)}
              className="w-full py-3.5 bg-gradient-to-r from-orange-500 to-red-600 text-white rounded-xl font-bold shadow-orange-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all flex items-center justify-center gap-2"
            >
              <ShoppingBag size={20} />
              Chọn món này 
            </button>
          </div>

        </div>
      </div>
    </div>
  );
};

export default MenuItemDetailModal;