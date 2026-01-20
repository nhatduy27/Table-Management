import React, { useState, useEffect } from "react";
import {
  X,
  Star,
  ShoppingBag,
  ChevronLeft,
  ChevronRight,
  User,
  ChevronLeftCircle,
  ChevronRightCircle,
  Flame,
} from "lucide-react";
// 👇 Check lại đường dẫn import service
import customerService from "../../services/customerService";

const MenuItemDetailModal = ({
  item,
  onClose,
  onAddToOrder,
  relatedItems = [],
  onViewRelatedItem,
}) => {
  const [activeTab, setActiveTab] = useState("details");
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  // --- STATE CHO REVIEWS & PAGINATION ---
  const [reviews, setReviews] = useState([]);
  const [pagination, setPagination] = useState({
    page: 1,
    totalPages: 1,
    total: 0,
  });
  const [stats, setStats] = useState(null); // Lưu thông tin rating trung bình
  const [currentPage, setCurrentPage] = useState(1); // Trang hiện tại user đang xem
  const [isLoadingReviews, setIsLoadingReviews] = useState(false);

  // --- LOGIC GỌI API ---
  useEffect(() => {
    if (activeTab === "reviews" && item?.id) {
      fetchReviews(currentPage);
    }
  }, [activeTab, item, currentPage]); // Gọi lại khi đổi Tab hoặc đổi Trang

  const fetchReviews = async (page) => {
    setIsLoadingReviews(true);
    try {
      // Gọi API với tham số phân trang (Limit = 5 comment mỗi trang cho gọn Modal)
      const response = await customerService.getMenuItemReviews(item.id, {
        page: page,
        limit: 5,
      });

      // LOGIC XỬ LÝ DỮ LIỆU TỪ BACKEND (Dựa trên log bạn gửi)
      // Structure: { success: true, data: { reviews: [], pagination: {}, stats: {} } }

      const data = response.data || {}; // Lấy cục data bên trong

      if (data.reviews && Array.isArray(data.reviews)) {
        setReviews(data.reviews);
      } else {
        setReviews([]);
      }

      if (data.pagination) {
        setPagination(data.pagination);
      }

      if (data.stats) {
        setStats(data.stats);
      }
    } catch (error) {
      console.error("Lỗi tải review:", error);
      setReviews([]);
    } finally {
      setIsLoadingReviews(false);
    }
  };

  // Hàm chuyển trang
  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= pagination.totalPages) {
      setCurrentPage(newPage);
    }
  };

  if (!item) return null;

  // Logic ảnh & format tiền
  const images =
    item.photos && item.photos.length > 0
      ? item.photos.map((p) => p.url)
      : [item.image || "https://placehold.co/300x300?text=No+Image"];

  const handleNextImage = () =>
    setCurrentImageIndex((prev) => (prev + 1) % images.length);
  const handlePrevImage = () =>
    setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length);
  const formatCurrency = (amount) =>
    new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount);

  const renderStars = (rating) => {
    return [...Array(5)].map((_, i) => (
      <Star
        key={i}
        size={14}
        className={`${i < rating ? "fill-yellow-400 text-yellow-400" : "text-gray-300"}`}
      />
    ));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
        {/* --- ẢNH HEADER --- */}
        <div className="relative h-44 sm:h-48 bg-gray-100 flex-shrink-0">
          <img
            src={images[currentImageIndex]}
            alt={item.name}
            className="w-full h-full object-cover"
          />
          <button
            onClick={onClose}
            className="absolute top-4 right-4 bg-black/30 hover:bg-black/50 text-white p-2 rounded-full transition-colors backdrop-blur-md"
          >
            <X size={20} />
          </button>
          {images.length > 1 && (
            <>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handlePrevImage();
                }}
                className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white p-1.5 rounded-full shadow-lg text-gray-800"
              >
                <ChevronLeft size={20} />
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleNextImage();
                }}
                className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white p-1.5 rounded-full shadow-lg text-gray-800"
              >
                <ChevronRight size={20} />
              </button>
              <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
                {images.map((_, idx) => (
                  <div
                    key={idx}
                    className={`w-2 h-2 rounded-full transition-all ${idx === currentImageIndex ? "bg-white scale-125" : "bg-white/50"}`}
                  />
                ))}
              </div>
            </>
          )}
        </div>

        {/* --- BODY --- */}
        <div className="flex flex-col flex-1 overflow-hidden">
          <div className="p-5 border-b">
            <div className="flex justify-between items-start mb-2">
              <h2 className="text-2xl font-bold text-gray-900 leading-tight">
                {item.name}
              </h2>
              <span className="text-xl font-bold text-orange-600 ml-4">
                {formatCurrency(item.price)}
              </span>
            </div>

            {/* Tabs */}
            <div className="flex gap-6 mt-4 border-b border-gray-100">
              <button
                onClick={() => setActiveTab("details")}
                className={`pb-2 text-sm font-bold transition-colors relative ${activeTab === "details" ? "text-orange-600" : "text-gray-400 hover:text-gray-600"}`}
              >
                Chi tiết
                {activeTab === "details" && (
                  <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-orange-600 rounded-t-full" />
                )}
              </button>
              <button
                onClick={() => setActiveTab("reviews")}
                className={`pb-2 text-sm font-bold transition-colors relative ${activeTab === "reviews" ? "text-orange-600" : "text-gray-400 hover:text-gray-600"}`}
              >
                Đánh giá {pagination.total > 0 && `(${pagination.total})`}
                {activeTab === "reviews" && (
                  <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-orange-600 rounded-t-full" />
                )}
              </button>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-5 bg-gray-50">
            {activeTab === "details" ? (
              // --- TAB CHI TIẾT ---
              <div className="space-y-4">
                <div>
                  <h4 className="font-bold text-gray-800 mb-1">Mô tả</h4>
                  <p className="text-gray-600 text-sm leading-relaxed">
                    {item.description || "Chưa có mô tả."}
                  </p>
                </div>
                <div className="grid grid-cols-2 gap-3 mt-4">
                  <div className="bg-white p-3 rounded-lg border border-gray-100 shadow-sm">
                    <span className="text-xs text-gray-400 block">
                      Thời gian chuẩn bị
                    </span>
                    <span className="text-sm font-medium text-gray-700">
                      ~{item.prep_time_minutes || 15} phút
                    </span>
                  </div>
                  <div className="bg-white p-3 rounded-lg border border-gray-100 shadow-sm">
                    <span className="text-xs text-gray-400 block">
                      Danh mục
                    </span>
                    <span className="text-sm font-medium text-gray-700">
                      {item.category?.name}
                    </span>
                  </div>
                </div>

                {/* --- MÓN ĂN LIÊN QUAN --- */}
                {relatedItems.length > 0 && (
                  <div className="mt-6 pt-4 border-t border-gray-200">
                    <h4 className="font-bold text-gray-800 mb-3 flex items-center gap-2">
                      <Flame size={16} className="text-orange-500" />
                      Món tương tự
                    </h4>
                    <div className="flex gap-3 overflow-x-auto pb-2 -mx-1 px-1 scrollbar-hide">
                      {relatedItems.map((relatedItem) => (
                        <div
                          key={relatedItem.id}
                          onClick={() =>
                            onViewRelatedItem && onViewRelatedItem(relatedItem)
                          }
                          className="flex-shrink-0 w-32 cursor-pointer group"
                        >
                          <div className="relative w-32 h-24 rounded-lg overflow-hidden mb-2 bg-gray-100">
                            <img
                              src={
                                relatedItem.primary_photo?.url ||
                                relatedItem.photos?.[0]?.url ||
                                "https://placehold.co/128x96?text=No+Image"
                              }
                              alt={relatedItem.name}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                            />
                            {relatedItem.is_chef_recommended && (
                              <div className="absolute top-1 right-1 bg-orange-500 text-white text-[8px] px-1.5 py-0.5 rounded-full font-bold">
                                Chef ⭐
                              </div>
                            )}
                          </div>
                          <p className="text-xs font-medium text-gray-800 line-clamp-2 group-hover:text-orange-600 transition-colors">
                            {relatedItem.name}
                          </p>
                          <p className="text-xs font-bold text-orange-600 mt-0.5">
                            {formatCurrency(relatedItem.price)}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              // --- TAB ĐÁNH GIÁ ---
              <div className="space-y-4">
                {isLoadingReviews ? (
                  <div className="flex justify-center items-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
                  </div>
                ) : !reviews || reviews.length === 0 ? (
                  <div className="text-center py-8">
                    <div className="bg-white p-6 rounded-xl shadow-sm inline-block mb-4">
                      <Star size={40} className="text-gray-300 mx-auto mb-2" />
                      <p className="text-gray-500 font-medium">
                        Chưa có đánh giá nào
                      </p>
                      <p className="text-xs text-gray-400 mt-1">
                        Hãy là người đầu tiên thưởng thức và đánh giá!
                      </p>
                    </div>
                  </div>
                ) : (
                  <>
                    {/* Header Thống kê (Dựa trên stats từ API) */}
                    {stats && (
                      <div className="flex items-center gap-4 bg-orange-50 p-4 rounded-xl mb-4">
                        <div className="text-center px-2">
                          <span className="text-3xl font-bold text-orange-600 block">
                            {Number(stats.average_rating).toFixed(1)}
                          </span>
                          <div className="flex gap-0.5 justify-center mt-1">
                            {renderStars(
                              Math.round(Number(stats.average_rating)),
                            )}
                          </div>
                          <span className="text-[10px] text-gray-500 mt-1 block">
                            {stats.total_reviews} đánh giá
                          </span>
                        </div>
                        <div className="h-10 w-[1px] bg-orange-200"></div>
                        <div className="text-xs text-gray-600 flex-1">
                          <p>
                            Được đánh giá cao bởi khách hàng về hương vị và chất
                            lượng phục vụ.
                          </p>
                        </div>
                      </div>
                    )}

                    {/* Danh sách Review */}
                    <div className="space-y-3">
                      {reviews.map((review) => (
                        <div
                          key={review.id}
                          className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 animate-fade-in-up"
                        >
                          <div className="flex justify-between items-start mb-2">
                            <div className="flex items-center gap-2">
                              <div className="w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center text-orange-600 font-bold text-xs">
                                {review.customer_name ? (
                                  review.customer_name.charAt(0).toUpperCase()
                                ) : (
                                  <User size={16} />
                                )}
                              </div>
                              <div>
                                <p className="text-sm font-bold text-gray-800">
                                  {review.customer_name || "Khách hàng"}
                                </p>
                                <p className="text-[10px] text-gray-400">
                                  {review.created_at
                                    ? new Date(
                                        review.created_at,
                                      ).toLocaleDateString("vi-VN")
                                    : ""}
                                  {review.is_verified_purchase && (
                                    <span className="ml-2 text-green-600 bg-green-50 px-1.5 py-0.5 rounded text-[9px] font-semibold">
                                      Đã mua
                                    </span>
                                  )}
                                </p>
                              </div>
                            </div>
                            <div className="flex gap-0.5">
                              {renderStars(review.rating)}
                            </div>
                          </div>

                          {review.comment && (
                            <p className="text-sm text-gray-600 pl-10 mt-1">
                              {review.comment}
                            </p>
                          )}

                          {review.admin_response && (
                            <div className="mt-3 ml-10 p-3 bg-gray-50 rounded-lg border-l-2 border-orange-400 text-xs">
                              <span className="font-bold text-gray-800 block mb-1">
                                Phản hồi từ nhà hàng:
                              </span>
                              <span className="text-gray-600">
                                {review.admin_response}
                              </span>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>

                    {/* --- THANH PHÂN TRANG (Pagination) --- */}
                    {pagination.totalPages >= 1 && (
                      <div className="flex justify-center items-center gap-4 pt-4 border-t border-gray-100 mt-4">
                        <button
                          onClick={() => handlePageChange(currentPage - 1)}
                          disabled={currentPage === 1}
                          className={`p-2 rounded-full transition-colors ${currentPage === 1 ? "text-gray-300 cursor-not-allowed" : "text-orange-600 hover:bg-orange-50"}`}
                        >
                          <ChevronLeftCircle size={24} />
                        </button>

                        <span className="text-sm font-medium text-gray-600">
                          Trang{" "}
                          <span className="text-orange-600 font-bold">
                            {currentPage}
                          </span>{" "}
                          / {pagination.totalPages}
                        </span>

                        <button
                          onClick={() => handlePageChange(currentPage + 1)}
                          disabled={currentPage === pagination.totalPages}
                          className={`p-2 rounded-full transition-colors ${currentPage === pagination.totalPages ? "text-gray-300 cursor-not-allowed" : "text-orange-600 hover:bg-orange-50"}`}
                        >
                          <ChevronRightCircle size={24} />
                        </button>
                      </div>
                    )}
                  </>
                )}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="p-4 bg-white border-t shadow-lg">
            <button
              onClick={() => onAddToOrder(item)}
              className="w-full py-3.5 bg-gradient-to-r from-orange-500 to-red-600 text-white rounded-xl font-bold shadow-orange-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all flex items-center justify-center gap-2"
            >
              <ShoppingBag size={20} /> Chọn món này
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MenuItemDetailModal;
