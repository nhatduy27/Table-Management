import React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

const Pagination = ({
  currentPage,
  totalPages,
  totalItems,
  limit,
  onPageChange,
  hasNextPage,
  hasPrevPage,
}) => {
  // Không ẩn component khi chỉ có 1 trang - luôn hiển thị

  const handlePrevious = () => {
    if (hasPrevPage) {
      onPageChange(currentPage - 1);
    }
  };

  const handleNext = () => {
    if (hasNextPage) {
      onPageChange(currentPage + 1);
    }
  };

  // Tạo danh sách số trang để hiển thị
  const getPageNumbers = () => {
    const pages = [];
    const maxVisiblePages = 5;

    if (totalPages <= maxVisiblePages) {
      // Hiển thị tất cả nếu ít trang
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Luôn hiển thị trang đầu
      pages.push(1);

      // Tính toán range
      let start = Math.max(2, currentPage - 1);
      let end = Math.min(totalPages - 1, currentPage + 1);

      // Điều chỉnh nếu gần đầu hoặc cuối
      if (currentPage <= 3) {
        end = 4;
      } else if (currentPage >= totalPages - 2) {
        start = totalPages - 3;
      }

      // Thêm dấu ... nếu cần
      if (start > 2) {
        pages.push("...");
      }

      // Thêm các trang giữa
      for (let i = start; i <= end; i++) {
        pages.push(i);
      }

      // Thêm dấu ... nếu cần
      if (end < totalPages - 1) {
        pages.push("...");
      }

      // Luôn hiển thị trang cuối
      pages.push(totalPages);
    }

    return pages;
  };

  const startItem = (currentPage - 1) * limit + 1;
  const endItem = Math.min(currentPage * limit, totalItems);

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-6 px-2">
      {/* Info hiển thị */}
      <div className="text-sm text-gray-500">
        Hiển thị <span className="font-medium text-gray-700">{startItem}</span>{" "}
        - <span className="font-medium text-gray-700">{endItem}</span> trong{" "}
        <span className="font-medium text-gray-700">{totalItems}</span> món
      </div>

      {/* Navigation buttons */}
      <div className="flex items-center gap-1">
        {/* Previous button */}
        <button
          onClick={handlePrevious}
          disabled={!hasPrevPage}
          className={`p-2 rounded-lg border transition-colors ${
            hasPrevPage
              ? "border-gray-200 text-gray-700 hover:bg-gray-50 hover:border-gray-300"
              : "border-gray-100 text-gray-300 cursor-not-allowed"
          }`}
          aria-label="Trang trước"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>

        {/* Page numbers */}
        <div className="flex items-center gap-1">
          {getPageNumbers().map((page, index) =>
            page === "..." ? (
              <span
                key={`ellipsis-${index}`}
                className="px-2 py-1 text-gray-400"
              >
                ...
              </span>
            ) : (
              <button
                key={page}
                onClick={() => onPageChange(page)}
                className={`min-w-[36px] h-9 px-3 rounded-lg text-sm font-medium transition-colors ${
                  currentPage === page
                    ? "bg-orange-500 text-white shadow-sm"
                    : "border border-gray-200 text-gray-700 hover:bg-gray-50 hover:border-gray-300"
                }`}
              >
                {page}
              </button>
            ),
          )}
        </div>

        {/* Next button */}
        <button
          onClick={handleNext}
          disabled={!hasNextPage}
          className={`p-2 rounded-lg border transition-colors ${
            hasNextPage
              ? "border-gray-200 text-gray-700 hover:bg-gray-50 hover:border-gray-300"
              : "border-gray-100 text-gray-300 cursor-not-allowed"
          }`}
          aria-label="Trang sau"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};

export default Pagination;
