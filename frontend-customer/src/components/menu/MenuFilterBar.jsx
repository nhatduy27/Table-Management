import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  Search,
  X,
  SlidersHorizontal,
  Sparkles,
  Flame,
  ChevronDown,
} from "lucide-react";

const MenuFilterBar = ({
  searchQuery,
  onSearchChange,
  chefRecommended,
  onChefRecommendedChange,
  sortBy,
  onSortChange,
  onResetFilters,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [localSearch, setLocalSearch] = useState(searchQuery || "");
  const searchTimeout = useRef(null);

  // Memoize callback để tránh re-render
  const handleSearchDebounced = useCallback(
    (value) => {
      onSearchChange(value);
    },
    [onSearchChange],
  );

  // Debounce search input
  useEffect(() => {
    if (searchTimeout.current) {
      clearTimeout(searchTimeout.current);
    }

    searchTimeout.current = setTimeout(() => {
      handleSearchDebounced(localSearch);
    }, 300);

    return () => {
      if (searchTimeout.current) {
        clearTimeout(searchTimeout.current);
      }
    };
  }, [localSearch, handleSearchDebounced]);

  // Hàm clear search (được gọi từ UI)
  const handleClearSearch = () => {
    setLocalSearch("");
    // Gọi trực tiếp không cần debounce
    if (searchTimeout.current) {
      clearTimeout(searchTimeout.current);
    }
    onSearchChange("");
  };

  const sortOptions = [
    { value: "", label: "Mặc định" },
    { value: "popularity", label: "Phổ biến nhất" },
    { value: "price", label: "Giá: Thấp → Cao" },
    { value: "price_desc", label: "Giá: Cao → Thấp" },
    { value: "name", label: "Tên A-Z" },
  ];

  const hasActiveFilters = searchQuery || chefRecommended || sortBy;

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 mb-4">
      {/* Search Bar - Always visible */}
      <div className="p-3">
        <div className="flex items-center gap-2">
          {/* Search Input */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Tìm kiếm món ăn..."
              value={localSearch}
              onChange={(e) => setLocalSearch(e.target.value)}
              className="w-full pl-10 pr-10 py-2.5 bg-gray-50 border border-gray-200 rounded-lg 
                       focus:ring-2 focus:ring-orange-500 focus:border-orange-500 
                       text-sm transition-all"
            />
            {localSearch && (
              <button
                onClick={handleClearSearch}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>

          {/* Filter Toggle Button */}
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className={`flex items-center gap-1.5 px-3 py-2.5 rounded-lg border transition-all
              ${
                isExpanded || hasActiveFilters
                  ? "bg-orange-50 border-orange-200 text-orange-600"
                  : "bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100"
              }`}
          >
            <SlidersHorizontal className="w-5 h-5" />
            <span className="text-sm font-medium hidden sm:inline">Lọc</span>
            {hasActiveFilters && (
              <span className="w-2 h-2 bg-orange-500 rounded-full" />
            )}
            <ChevronDown
              className={`w-4 h-4 transition-transform ${isExpanded ? "rotate-180" : ""}`}
            />
          </button>
        </div>
      </div>

      {/* Expandable Filter Options */}
      <div
        className={`overflow-hidden transition-all duration-300 ease-in-out
          ${isExpanded ? "max-h-96 opacity-100" : "max-h-0 opacity-0"}`}
      >
        <div className="px-3 pb-3 pt-0 border-t border-gray-100">
          <div className="pt-3 space-y-3">
            {/* Quick Filters */}
            <div className="flex flex-wrap gap-2">
              {/* Chef Recommended Toggle */}
              <button
                onClick={() => onChefRecommendedChange(!chefRecommended)}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-full text-sm font-medium
                  transition-all border
                  ${
                    chefRecommended
                      ? "bg-amber-100 border-amber-300 text-amber-700"
                      : "bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100"
                  }`}
              >
                <Sparkles className="w-4 h-4" />
                Chef đề xuất
              </button>

              {/* Popularity Sort Toggle */}
              <button
                onClick={() =>
                  onSortChange(sortBy === "popularity" ? "" : "popularity")
                }
                className={`flex items-center gap-1.5 px-3 py-2 rounded-full text-sm font-medium
                  transition-all border
                  ${
                    sortBy === "popularity"
                      ? "bg-red-100 border-red-300 text-red-700"
                      : "bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100"
                  }`}
              >
                <Flame className="w-4 h-4" />
                Phổ biến
              </button>
            </div>

            {/* Sort Dropdown */}
            <div className="flex items-center gap-2">
              <label className="text-sm text-gray-500 whitespace-nowrap">
                Sắp xếp:
              </label>
              <select
                value={sortBy}
                onChange={(e) => onSortChange(e.target.value)}
                className="flex-1 px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg 
                         text-sm focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
              >
                {sortOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Reset Filters */}
            {hasActiveFilters && (
              <button
                onClick={onResetFilters}
                className="w-full py-2 text-sm text-gray-500 hover:text-gray-700 
                         hover:bg-gray-50 rounded-lg transition-colors"
              >
                Xóa tất cả bộ lọc
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Active Filters Summary (when collapsed) */}
      {!isExpanded && hasActiveFilters && (
        <div className="px-3 pb-3 flex flex-wrap gap-2">
          {searchQuery && (
            <span
              className="inline-flex items-center gap-1 px-2 py-1 bg-blue-50 
                           text-blue-700 text-xs rounded-full"
            >
              Tìm: "{searchQuery}"
              <button onClick={handleClearSearch}>
                <X className="w-3 h-3" />
              </button>
            </span>
          )}
          {chefRecommended && (
            <span
              className="inline-flex items-center gap-1 px-2 py-1 bg-amber-50 
                           text-amber-700 text-xs rounded-full"
            >
              <Sparkles className="w-3 h-3" />
              Chef đề xuất
              <button onClick={() => onChefRecommendedChange(false)}>
                <X className="w-3 h-3" />
              </button>
            </span>
          )}
          {sortBy && (
            <span
              className="inline-flex items-center gap-1 px-2 py-1 bg-purple-50 
                           text-purple-700 text-xs rounded-full"
            >
              {sortOptions.find((o) => o.value === sortBy)?.label}
              <button onClick={() => onSortChange("")}>
                <X className="w-3 h-3" />
              </button>
            </span>
          )}
        </div>
      )}
    </div>
  );
};

export default MenuFilterBar;
