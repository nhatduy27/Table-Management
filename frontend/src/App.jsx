// App.jsx
import React from "react";
import {
	BrowserRouter as Router,  
	Routes,
	Route,
	Navigate,
} from "react-router-dom";
import Layout from "./components/layout/Layout";
import TableList from "./components/tables/TableList";
import TableForm from "./components/tables/TableForm";
import QRCodePage from "./components/tables/QRCodePage";
import MenuPage from "./components/menu/MenuPage";
import "./App.css";

function App() {
	return (
		<Router>
			<Routes>
				{/* Customer-facing menu route (no layout) */}
				<Route path="/menu" element={<MenuPage />} />

				{/* Admin routes with layout */}
				<Route element={<Layout />}>
					{/* Redirect root to tables */}
					<Route
						path="/"
						element={<Navigate to="/tables" replace />}
					/>

					{/* Table routes */}
					<Route path="/tables" element={<TableList />} />
					<Route path="/tables/new" element={<TableForm />} />
					<Route path="/tables/:id" element={<TableForm />} />
					<Route path="/tables/:id/qr" element={<QRCodePage />} />

					{/* 404 route */}
					<Route
						path="*"
						element={
							<div className="container mx-auto px-4 py-16 text-center">
								<h1 className="text-6xl font-bold text-gray-900 mb-4">
									404
								</h1>
								<p className="text-xl text-gray-600 mb-8">
									Page not found
								</p>
								<a
									href="/tables"
									className="text-blue-600 hover:text-blue-700 font-medium"
								>
									Go back to Tables
								</a>
							</div>
						}
					/>
				</Route>
			</Routes>
		</Router>
	);
}

export default App;