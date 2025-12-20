import {
	BrowserRouter as Router,
	Routes,
	Route,
	Navigate,
} from "react-router-dom";
import TableList from "./components/TableList";
import MenuPage from "./pages/MenuPage";
import "./App.css";

function App() {
	return (
		<Router>
			<Routes>
				{/* Admin Routes */}
				<Route
					path="/"
					element={<Navigate to="/admin/tables" replace />}
				/>
				<Route path="/admin/tables" element={<TableList />} />

				{/* Public Routes */}
				<Route path="/menu" element={<MenuPage />} />

				{/* 404 Route */}
				<Route path="*" element={<NotFound />} />
			</Routes>
		</Router>
	);
}

// 404 Not Found Component
const NotFound = () => {
	return (
		<div className="min-h-screen flex items-center justify-center bg-gray-50">
			<div className="text-center">
				<h1 className="text-6xl font-bold text-gray-900 mb-4">404</h1>
				<p className="text-xl text-gray-600 mb-8">Page not found</p>
				<a
					href="/admin/tables"
					className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
				>
					Go to Tables
				</a>
			</div>
		</div>
	);
};

export default App;
