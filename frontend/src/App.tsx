import React, { useState, useEffect } from "react";
import { BrowserRouter, Routes, Route, useNavigate, useLocation } from "react-router-dom";
import { Provider } from "react-redux";
import { ThemeProvider } from "@mui/material/styles";
import { AuthProvider } from "./context/AuthContext";
import { useAuth } from "./hooks/useAuth";
import { luxuryMuiTheme } from "./theme/muiTheme";
import { store, useAppDispatch } from "./store/store";
import { fetchCart } from "./store/slices/cartSlice";
import { Navbar, NavTab } from "./components/Navbar";
import { HomePage } from "./pages/HomePage";
import { ProductsPage } from "./pages/ProductsPage";
import { ProductDetailPage } from "./pages/ProductDetailPage";
import { CartPage } from "./pages/CartPage";
import { Login } from "./pages/Login";
import { Register } from "./pages/Register";
import { AdminPage } from "./pages/AdminPage";
import { ProtectedRoute } from "./routes/ProtectedRoute";
import { Footer } from "./components/Footer";
import { useActivityTracker } from "./hooks/useActivityTracker";

const AppContent: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useAppDispatch();
  const { user } = useAuth();
  useActivityTracker();

  // Load customer's cart whenever authenticated or when app starts
  useEffect(() => {
    dispatch(fetchCart());
  }, [dispatch, user]);

  const getTabFromPath = (path: string): NavTab => {
    if (path === "/login") return "login";
    if (path === "/register") return "register";
    if (path.startsWith("/products")) return "products";
    if (path === "/cart") return "cart";
    if (path === "/admin") return "admin";
    return "home";
  };

  const [currentTab, setCurrentTab] = useState<NavTab>(getTabFromPath(location.pathname));

  useEffect(() => {
    setCurrentTab(getTabFromPath(location.pathname));
  }, [location.pathname]);

  const handleSelectTab = (tab: NavTab) => {
    setCurrentTab(tab);
    if (tab === "home") navigate("/");
    else if (tab === "products") navigate("/products");
    else if (tab === "cart") navigate("/cart");
    else if (tab === "login") navigate("/login");
    else if (tab === "register") navigate("/register");
    else if (tab === "admin") navigate("/admin");
  };

  const isAuthPage = location.pathname === "/login" || location.pathname === "/register";

  return (
    <div className="app-root flex flex-col min-h-screen">
      {!isAuthPage && <Navbar currentTab={currentTab} onSelectTab={handleSelectTab} />}

      <main className="main-content flex-grow" style={{ paddingTop: isAuthPage ? "0px" : "80px" }}>
        <Routes>
          <Route
            path="/"
            element={
              <HomePage
                onNavigateToLogin={() => handleSelectTab("login")}
                onNavigateToRegister={() => handleSelectTab("register")}
              />
            }
          />
          <Route path="/products" element={<ProductsPage />} />
          <Route path="/products/:id" element={<ProductDetailPage />} />
          <Route path="/cart" element={<CartPage />} />
          <Route
            path="/login"
            element={
              <Login
                onNavigateToRegister={() => handleSelectTab("register")}
                onLoginSuccess={() => handleSelectTab("products")}
              />
            }
          />
          <Route
            path="/register"
            element={
              <Register
                onNavigateToLogin={() => handleSelectTab("login")}
                onRegisterSuccess={() => handleSelectTab("products")}
              />
            }
          />
          <Route
            path="/admin"
            element={
              <ProtectedRoute allowedRoles={["admin"]} onNavigateToLogin={() => handleSelectTab("login")}>
                <AdminPage />
              </ProtectedRoute>
            }
          />
        </Routes>
      </main>

      {!isAuthPage && <Footer />}
    </div>
  );
};

export function App() {
  return (
    <Provider store={store}>
      <ThemeProvider theme={luxuryMuiTheme}>
        <AuthProvider>
          <BrowserRouter>
            <AppContent />
          </BrowserRouter>
        </AuthProvider>
      </ThemeProvider>
    </Provider>
  );
}

export default App;

