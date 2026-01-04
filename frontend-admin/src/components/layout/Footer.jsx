import React from "react";

const Footer = () => {
  return (
    <footer className="bg-white border-t mt-auto">
      <div className="container mx-auto px-4 py-6">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-sm text-gray-600">
            © 2025 Smart Restaurant. Table Management System.
          </p>
          <div className="flex items-center gap-4 text-sm text-gray-600">
            <span>Version 1.0.0</span>
            <span>•</span>
            <span>Assignment: Table Management Module</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;