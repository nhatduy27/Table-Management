import React from "react";

const CategoryTabs = ({
  categories,
  activeCategory,
  onSelectCategory,
  totalItems,
}) => {
  return (
    <div className="flex flex-wrap gap-2 mb-6 overflow-x-auto pb-2">
      {/* Tab Tất cả */}
      <button
        onClick={() => onSelectCategory("all")}
        className={`px-4 py-2 rounded-lg font-medium transition-all whitespace-nowrap ${
          activeCategory === "all"
            ? "bg-amber-600 text-white shadow-md"
            : "bg-white text-stone-700 hover:bg-amber-50 shadow-sm border border-amber-200"
        }`}
      >
        Tất cả
        {totalItems !== undefined && (
          <span className="ml-2 text-xs opacity-80">({totalItems})</span>
        )}
      </button>
      {categories
        .sort((a, b) => (a.display_order || 0) - (b.display_order || 0))
        .map((category) => (
          <button
            key={category.id}
            onClick={() => onSelectCategory(category.id)}
            className={`px-4 py-2 rounded-lg font-medium transition-all whitespace-nowrap ${
              activeCategory === category.id
                ? "bg-amber-600 text-white shadow-md"
                : "bg-white text-stone-700 hover:bg-amber-50 shadow-sm border border-amber-200"
            }`}
          >
            {category.name}
            {category.items && (
              <span className="ml-2 text-xs opacity-80">
                ({category.items.length})
              </span>
            )}
          </button>
        ))}
    </div>
  );
};

export default CategoryTabs;