import React, { useEffect, useState, useCallback } from "react";
import { useAuth } from "../hooks/useAuth";
import {
  fetchOverviewInsights,
  fetchSalesInsights,
  fetchOrderInsights,
  fetchProductSalesInsights,
  fetchActiveUsers,
  fetchProductViews,
} from "../services/admin.service";
import {
  fetchProducts,
  fetchCategories,
  createProduct,
  updateProduct,
  deleteProduct,
  createCategory,
  updateCategory,
  deleteCategory,
} from "../services/product.service";
import {
  OverviewInsights,
  SalesInsight,
  OrderInsights,
  ProductSalesInsight,
  ActiveUsersInsight,
  ProductViewerSummary,
} from "../types/admin.types";
import {
  Product,
  Category,
  CreateProductRequest,
  CreateCategoryRequest,
} from "../types/product.types";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";
import {
  AdminPanelSettingsOutlined,
  TrendingUpOutlined,
  ShoppingCartOutlined,
  PeopleAltOutlined,
  DiamondOutlined,
  CategoryOutlined,
  VisibilityOutlined,
  AddOutlined,
  EditOutlined,
  DeleteOutlined,
  RefreshOutlined,
  WarningAmberOutlined,
  CheckCircleOutlined,
} from "@mui/icons-material";
import {
  CircularProgress,
  Alert,
  Dialog,
  DialogContent,
  DialogTitle,
  TextField,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Switch,
  FormControlLabel,
  IconButton,
} from "@mui/material";

type AdminTab = "overview" | "sales" | "orders" | "products" | "categories" | "activity";

const PIE_COLORS = ["#10B981", "#3B82F6", "#F59E0B", "#B4935A", "#EF4444"];

export const AdminPage: React.FC = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<AdminTab>("overview");
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Insights State
  const [overview, setOverview] = useState<OverviewInsights | null>(null);
  const [salesData, setSalesData] = useState<SalesInsight[]>([]);
  const [salesPeriod, setSalesPeriod] = useState<"daily" | "weekly" | "monthly" | "yearly">("monthly");
  const [orderStats, setOrderStats] = useState<OrderInsights | null>(null);
  const [productSales, setProductSales] = useState<ProductSalesInsight[]>([]);
  const [activeUsersData, setActiveUsersData] = useState<ActiveUsersInsight | null>(null);
  const [productViewers, setProductViewers] = useState<ProductViewerSummary[]>([]);

  // Catalog Management State
  const [productsList, setProductsList] = useState<Product[]>([]);
  const [categoriesList, setCategoriesList] = useState<Category[]>([]);

  // Product Modal State
  const [productModalOpen, setProductModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [productForm, setProductForm] = useState<CreateProductRequest>({
    name: "",
    description: "",
    price: 0,
    categoryId: 1,
    imageUrl: "/images/collection-rings.jpg",
    material: "18K Yellow Gold",
    gemstone: "Natural Diamond",
    caratWeight: "1.00 ct",
    stock: 10,
    isFeatured: false,
    isActive: true,
  });

  // Category Modal State
  const [categoryModalOpen, setCategoryModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [categoryForm, setCategoryForm] = useState<CreateCategoryRequest>({
    name: "",
    description: "",
    imageUrl: "/images/hero-bg.jpg",
  });

  // Delete Confirmation Dialog
  const [deleteConfirm, setDeleteConfirm] = useState<{
    open: boolean;
    type: "product" | "category";
    id: number;
    name: string;
  }>({ open: false, type: "product", id: 0, name: "" });

  const loadAllData = useCallback(async (isSilent = false) => {
    try {
      if (!isSilent) setLoading(true);
      else setRefreshing(true);
      setError(null);

      const [
        overviewRes,
        salesRes,
        ordersRes,
        prodSalesRes,
        activeUsersRes,
        prodViewsRes,
        productsRes,
        categoriesRes,
      ] = await Promise.all([
        fetchOverviewInsights(),
        fetchSalesInsights(salesPeriod),
        fetchOrderInsights(),
        fetchProductSalesInsights(),
        fetchActiveUsers(),
        fetchProductViews(),
        fetchProducts({ active: false }),
        fetchCategories(),
      ]);

      setOverview(overviewRes);
      setSalesData(salesRes);
      setOrderStats(ordersRes);
      setProductSales(prodSalesRes);
      setActiveUsersData(activeUsersRes);
      setProductViewers(prodViewsRes);
      setProductsList(productsRes);
      setCategoriesList(categoriesRes);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to load admin analytics.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [salesPeriod]);

  useEffect(() => {
    loadAllData();
  }, [loadAllData]);

  // Polling for live activity every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      fetchActiveUsers().then(setActiveUsersData).catch(() => {});
      fetchProductViews().then(setProductViewers).catch(() => {});
    }, 30000);
    return () => clearInterval(interval);
  }, []);

  const handlePeriodChange = async (period: "daily" | "weekly" | "monthly" | "yearly") => {
    setSalesPeriod(period);
    try {
      const data = await fetchSalesInsights(period);
      setSalesData(data);
    } catch (e) {
      // Handled
    }
  };

  // Product CRUD Handlers
  const handleOpenProductModal = (product?: Product) => {
    if (product) {
      setEditingProduct(product);
      setProductForm({
        name: product.name,
        description: product.description,
        price: product.price,
        categoryId: product.categoryId,
        imageUrl: product.imageUrl,
        material: product.material,
        gemstone: product.gemstone,
        caratWeight: product.caratWeight || "1.00 ct",
        stock: product.stock,
        isFeatured: product.isFeatured,
        isActive: product.isActive,
      });
    } else {
      setEditingProduct(null);
      setProductForm({
        name: "",
        description: "",
        price: 1500,
        categoryId: categoriesList[0]?.id || 1,
        imageUrl: "/images/collection-rings.jpg",
        material: "18K Yellow Gold",
        gemstone: "Natural Diamond",
        caratWeight: "1.00 ct",
        stock: 10,
        isFeatured: false,
        isActive: true,
      });
    }
    setProductModalOpen(true);
  };

  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingProduct) {
        await updateProduct(editingProduct.id, productForm);
        setSuccessMessage(`Updated product "${productForm.name}" successfully.`);
      } else {
        await createProduct(productForm);
        setSuccessMessage(`Created jewellery piece "${productForm.name}" successfully.`);
      }
      setProductModalOpen(false);
      loadAllData(true);
      setTimeout(() => setSuccessMessage(null), 4000);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to save product");
    }
  };

  // Category CRUD Handlers
  const handleOpenCategoryModal = (category?: Category) => {
    if (category) {
      setEditingCategory(category);
      setCategoryForm({
        name: category.name,
        description: category.description || "",
        imageUrl: category.imageUrl || "/images/hero-bg.jpg",
      });
    } else {
      setEditingCategory(null);
      setCategoryForm({
        name: "",
        description: "",
        imageUrl: "/images/hero-bg.jpg",
      });
    }
    setCategoryModalOpen(true);
  };

  const handleSaveCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingCategory) {
        await updateCategory(editingCategory.id, categoryForm);
        setSuccessMessage(`Updated category "${categoryForm.name}" successfully.`);
      } else {
        await createCategory(categoryForm);
        setSuccessMessage(`Created category "${categoryForm.name}" successfully.`);
      }
      setCategoryModalOpen(false);
      loadAllData(true);
      setTimeout(() => setSuccessMessage(null), 4000);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to save category");
    }
  };

  // Delete Action
  const handleConfirmDelete = async () => {
    try {
      if (deleteConfirm.type === "product") {
        await deleteProduct(deleteConfirm.id);
        setSuccessMessage(`Deleted piece "${deleteConfirm.name}" successfully.`);
      } else {
        await deleteCategory(deleteConfirm.id);
        setSuccessMessage(`Deleted category "${deleteConfirm.name}" successfully.`);
      }
      setDeleteConfirm({ open: false, type: "product", id: 0, name: "" });
      loadAllData(true);
      setTimeout(() => setSuccessMessage(null), 4000);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to delete record");
    }
  };

  // Prepare Order Status Pie Data
  const orderPieData = orderStats
    ? [
        { name: "Delivered", value: orderStats.delivered },
        { name: "Shipped", value: orderStats.shipped },
        { name: "Confirmed", value: orderStats.confirmed },
        { name: "Pending", value: orderStats.pending },
        { name: "Cancelled", value: orderStats.cancelled },
      ].filter((item) => item.value > 0)
    : [];

  return (
    <div
      style={{
        minHeight: "100vh",
        backgroundColor: "#F8F5F0",
        padding: "36px 24px 80px 24px",
        boxSizing: "border-box",
        fontFamily: "'Montserrat', sans-serif",
      }}
    >
      <div style={{ maxWidth: "1600px", margin: "0 auto" }}>
        {/* Header Title & Admin Badge */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: "16px",
            marginBottom: "32px",
          }}
        >
          <div>
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "8px",
                padding: "6px 14px",
                backgroundColor: "rgba(180, 147, 90, 0.12)",
                border: "1px solid rgba(180, 147, 90, 0.3)",
                borderRadius: "9999px",
                fontSize: "11px",
                fontWeight: 600,
                color: "#96733E",
                letterSpacing: "0.2em",
                textTransform: "uppercase",
                marginBottom: "8px",
              }}
            >
              <AdminPanelSettingsOutlined sx={{ fontSize: 14, color: "#B4935A" }} />
              <span>Executive Atelier Administration Suite</span>
            </div>
            <h1
              style={{
                fontFamily: "'Cormorant Garamond', Georgia, serif",
                fontSize: "36px",
                fontWeight: 400,
                color: "#2B211D",
                margin: 0,
                letterSpacing: "-0.01em",
              }}
            >
              Dinorah <span style={{ fontStyle: "italic", color: "#B4935A" }}>Executive Dashboard</span>
            </h1>
            <p style={{ fontSize: "13px", color: "#81766E", margin: "4px 0 0 0", fontWeight: 300 }}>
              Logged in as <strong style={{ color: "#2B211D" }}>{user?.name}</strong> ({user?.email}) • Role: Administrator
            </p>
          </div>

          <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
            <button
              onClick={() => loadAllData(true)}
              disabled={refreshing}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "6px",
                padding: "9px 18px",
                backgroundColor: "#FCFAF8",
                border: "1px solid #E2DAD0",
                borderRadius: "9999px",
                fontSize: "12px",
                fontWeight: 600,
                color: "#2B211D",
                cursor: refreshing ? "not-allowed" : "pointer",
                boxShadow: "0 2px 8px rgba(43,33,29,0.03)",
                transition: "all 0.2s",
              }}
            >
              <RefreshOutlined sx={{ fontSize: 16, color: "#B4935A", animation: refreshing ? "spin 1s linear infinite" : "none" }} />
              <span>{refreshing ? "Refreshing..." : "Refresh Data"}</span>
            </button>
          </div>
        </div>

        {/* Success Alert */}
        {successMessage && (
          <Alert
            icon={<CheckCircleOutlined fontSize="inherit" />}
            severity="success"
            sx={{
              mb: 3,
              borderRadius: "12px",
              bgcolor: "rgba(180, 147, 90, 0.12)",
              color: "#2B211D",
              border: "1px solid rgba(180, 147, 90, 0.3)",
            }}
          >
            {successMessage}
          </Alert>
        )}

        {/* Error Alert */}
        {error && (
          <Alert
            severity="error"
            sx={{
              mb: 3,
              borderRadius: "12px",
            }}
          >
            {error}
          </Alert>
        )}

        {/* Navigation Tabs Bar */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
            overflowX: "auto",
            paddingBottom: "12px",
            marginBottom: "28px",
            borderBottom: "1px solid #EAE2D7",
          }}
        >
          {[
            { id: "overview", label: "Executive Overview", icon: <TrendingUpOutlined sx={{ fontSize: 16 }} /> },
            { id: "sales", label: "Sales & Revenue", icon: <TrendingUpOutlined sx={{ fontSize: 16 }} /> },
            { id: "orders", label: "Order Distribution", icon: <ShoppingCartOutlined sx={{ fontSize: 16 }} /> },
            { id: "products", label: "Product Management", icon: <DiamondOutlined sx={{ fontSize: 16 }} /> },
            { id: "categories", label: "Categories", icon: <CategoryOutlined sx={{ fontSize: 16 }} /> },
            { id: "activity", label: "Live Visitor Activity", icon: <PeopleAltOutlined sx={{ fontSize: 16 }} /> },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as AdminTab)}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                padding: "10px 20px",
                borderRadius: "9999px",
                fontSize: "12px",
                fontWeight: 600,
                letterSpacing: "0.14em",
                textTransform: "uppercase",
                cursor: "pointer",
                border: "none",
                transition: "all 0.2s",
                backgroundColor: activeTab === tab.id ? "#2B211D" : "transparent",
                color: activeTab === tab.id ? "#F8F5F0" : "#81766E",
                boxShadow: activeTab === tab.id ? "0 4px 12px rgba(43,33,29,0.15)" : "none",
                whiteSpace: "nowrap",
              }}
            >
              <span style={{ color: activeTab === tab.id ? "#B4935A" : "#81766E" }}>{tab.icon}</span>
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Tab Content Rendering */}
        {loading ? (
          <div style={{ minHeight: "50vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "16px" }}>
            <CircularProgress sx={{ color: "#B4935A" }} size={40} />
            <p style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontStyle: "italic", fontSize: "18px", color: "#B4935A" }}>
              Loading executive intelligence & sales analytics...
            </p>
          </div>
        ) : (
          <>
            {/* ========================================================================= */}
            {/* TAB 1: EXECUTIVE OVERVIEW */}
            {/* ========================================================================= */}
            {activeTab === "overview" && overview && (
              <div style={{ display: "flex", flexDirection: "column", gap: "28px" }}>
                {/* 4 Primary Metric KPI Cards */}
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: "20px" }}>
                  <div style={{ backgroundColor: "#FCFAF8", border: "1px solid #E8E1D8", borderRadius: "16px", padding: "24px", boxShadow: "0 4px 20px rgba(43,33,29,0.03)" }}>
                    <span style={{ fontSize: "11px", color: "#81766E", letterSpacing: "0.18em", textTransform: "uppercase", fontWeight: 600, display: "block", marginBottom: "8px" }}>
                      TOTAL REVENUE
                    </span>
                    <div style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: "36px", fontWeight: 600, color: "#2B211D", lineHeight: 1.1 }}>
                      ${overview.totalRevenue.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                    </div>
                    <span style={{ fontSize: "12px", color: "#10B981", marginTop: "8px", display: "block", fontWeight: 500 }}>
                      ✦ Excludes cancelled orders
                    </span>
                  </div>

                  <div style={{ backgroundColor: "#FCFAF8", border: "1px solid #E8E1D8", borderRadius: "16px", padding: "24px", boxShadow: "0 4px 20px rgba(43,33,29,0.03)" }}>
                    <span style={{ fontSize: "11px", color: "#81766E", letterSpacing: "0.18em", textTransform: "uppercase", fontWeight: 600, display: "block", marginBottom: "8px" }}>
                      TOTAL ORDERS
                    </span>
                    <div style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: "36px", fontWeight: 600, color: "#2B211D", lineHeight: 1.1 }}>
                      {overview.totalOrders}
                    </div>
                    <span style={{ fontSize: "12px", color: "#81766E", marginTop: "8px", display: "block" }}>
                      {overview.completedOrders} completed • {overview.pendingOrders} pending
                    </span>
                  </div>

                  <div style={{ backgroundColor: "#FCFAF8", border: "1px solid #E8E1D8", borderRadius: "16px", padding: "24px", boxShadow: "0 4px 20px rgba(43,33,29,0.03)" }}>
                    <span style={{ fontSize: "11px", color: "#81766E", letterSpacing: "0.18em", textTransform: "uppercase", fontWeight: 600, display: "block", marginBottom: "8px" }}>
                      ACTIVE CLIENTS
                    </span>
                    <div style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: "36px", fontWeight: 600, color: "#2B211D", lineHeight: 1.1 }}>
                      {overview.totalCustomers}
                    </div>
                    <span style={{ fontSize: "12px", color: "#81766E", marginTop: "8px", display: "block" }}>
                      Registered client profiles
                    </span>
                  </div>

                  <div style={{ backgroundColor: "#FCFAF8", border: "1px solid #E8E1D8", borderRadius: "16px", padding: "24px", boxShadow: "0 4px 20px rgba(43,33,29,0.03)" }}>
                    <span style={{ fontSize: "11px", color: "#81766E", letterSpacing: "0.18em", textTransform: "uppercase", fontWeight: 600, display: "block", marginBottom: "8px" }}>
                      LIVE VISITOR SESSIONS
                    </span>
                    <div style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: "36px", fontWeight: 600, color: "#96733E", lineHeight: 1.1 }}>
                      {overview.activeUsers}
                    </div>
                    <span style={{ fontSize: "12px", color: "#10B981", marginTop: "8px", display: "block", fontWeight: 500 }}>
                      ● {overview.activeProductViewers} viewing products currently
                    </span>
                  </div>
                </div>

                {/* Sales Chart Preview + Order Status Split */}
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(460px, 1fr))", gap: "24px" }}>
                  {/* Revenue Curve */}
                  <div style={{ backgroundColor: "#FCFAF8", border: "1px solid #E8E1D8", borderRadius: "18px", padding: "26px", boxShadow: "0 4px 20px rgba(43,33,29,0.03)" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
                      <h3 style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: "22px", margin: 0, color: "#2B211D" }}>
                        Revenue Trajectory
                      </h3>
                      <span style={{ fontSize: "11px", color: "#B4935A", fontWeight: 600, letterSpacing: "0.14em", textTransform: "uppercase" }}>
                        USD ($)
                      </span>
                    </div>
                    <div style={{ width: "100%", height: "260px" }}>
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={salesData}>
                          <defs>
                            <linearGradient id="goldGrad" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#B4935A" stopOpacity={0.4} />
                              <stop offset="95%" stopColor="#B4935A" stopOpacity={0.0} />
                            </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" stroke="#EAE2D7" />
                          <XAxis dataKey="date" stroke="#81766E" fontSize={11} />
                          <YAxis stroke="#81766E" fontSize={11} />
                          <Tooltip contentStyle={{ backgroundColor: "#2B211D", color: "#F8F5F0", borderRadius: "8px", border: "none", fontSize: "12px" }} />
                          <Area type="monotone" dataKey="revenue" stroke="#B4935A" strokeWidth={2.5} fillOpacity={1} fill="url(#goldGrad)" />
                        </AreaChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                  {/* Order Status Distribution */}
                  <div style={{ backgroundColor: "#FCFAF8", border: "1px solid #E8E1D8", borderRadius: "18px", padding: "26px", boxShadow: "0 4px 20px rgba(43,33,29,0.03)" }}>
                    <h3 style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: "22px", margin: "0 0 20px 0", color: "#2B211D" }}>
                      Order Fulfillment Breakdown
                    </h3>
                    <div style={{ width: "100%", height: "260px", display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie data={orderPieData} cx="50%" cy="50%" innerRadius={60} outerRadius={90} paddingAngle={4} dataKey="value">
                            {orderPieData.map((_entry, index) => (
                              <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                            ))}
                          </Pie>
                          <Tooltip contentStyle={{ backgroundColor: "#2B211D", color: "#F8F5F0", borderRadius: "8px", border: "none", fontSize: "12px" }} />
                          <Legend wrapperStyle={{ fontSize: "12px", color: "#81766E" }} />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                </div>

                {/* Best Selling Products Mini Table */}
                <div style={{ backgroundColor: "#FCFAF8", border: "1px solid #E8E1D8", borderRadius: "18px", padding: "26px", boxShadow: "0 4px 20px rgba(43,33,29,0.03)" }}>
                  <h3 style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: "22px", margin: "0 0 16px 0", color: "#2B211D" }}>
                    Top Performing Atelier Creations
                  </h3>
                  <div style={{ overflowX: "auto" }}>
                    <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left", fontSize: "13px" }}>
                      <thead>
                        <tr style={{ borderBottom: "1px solid #EAE2D7", color: "#81766E" }}>
                          <th style={{ padding: "12px 14px", fontWeight: 600 }}>PIECE</th>
                          <th style={{ padding: "12px 14px", fontWeight: 600 }}>COLLECTION</th>
                          <th style={{ padding: "12px 14px", fontWeight: 600 }}>UNITS SOLD</th>
                          <th style={{ padding: "12px 14px", fontWeight: 600 }}>REVENUE</th>
                          <th style={{ padding: "12px 14px", fontWeight: 600 }}>STOCK</th>
                        </tr>
                      </thead>
                      <tbody>
                        {productSales.slice(0, 5).map((p) => (
                          <tr key={p.productId} style={{ borderBottom: "1px solid #F0ECE4" }}>
                            <td style={{ padding: "12px 14px", fontWeight: 500, color: "#2B211D" }}>{p.productName}</td>
                            <td style={{ padding: "12px 14px", color: "#81766E" }}>{p.categoryName}</td>
                            <td style={{ padding: "12px 14px", color: "#2B211D", fontWeight: 600 }}>{p.quantitySold}</td>
                            <td style={{ padding: "12px 14px", color: "#96733E", fontWeight: 600 }}>${p.revenue.toLocaleString()}</td>
                            <td style={{ padding: "12px 14px" }}>
                              <span style={{ padding: "3px 8px", borderRadius: "4px", fontSize: "11px", fontWeight: 600, backgroundColor: p.currentStock > 5 ? "rgba(16,185,129,0.12)" : "rgba(239,68,68,0.12)", color: p.currentStock > 5 ? "#10B981" : "#EF4444" }}>
                                {p.currentStock} in stock
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* ========================================================================= */}
            {/* TAB 2: SALES & REVENUE INSIGHTS */}
            {/* ========================================================================= */}
            {activeTab === "sales" && (
              <div style={{ display: "flex", flexDirection: "column", gap: "28px" }}>
                {/* Controls Bar */}
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", backgroundColor: "#FCFAF8", padding: "16px 22px", borderRadius: "14px", border: "1px solid #E8E1D8", flexWrap: "wrap", gap: "12px" }}>
                  <h2 style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: "24px", margin: 0, color: "#2B211D" }}>
                    Sales Analytics & Period Filtering
                  </h2>
                  <div style={{ display: "flex", gap: "6px" }}>
                    {(["daily", "weekly", "monthly", "yearly"] as const).map((period) => (
                      <button
                        key={period}
                        onClick={() => handlePeriodChange(period)}
                        style={{
                          padding: "6px 14px",
                          borderRadius: "9999px",
                          fontSize: "11px",
                          fontWeight: 600,
                          letterSpacing: "0.14em",
                          textTransform: "uppercase",
                          border: "none",
                          cursor: "pointer",
                          backgroundColor: salesPeriod === period ? "#2B211D" : "transparent",
                          color: salesPeriod === period ? "#F8F5F0" : "#81766E",
                          transition: "all 0.2s",
                        }}
                      >
                        {period}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Sales Volume & Revenue Dual Charts */}
                <div style={{ backgroundColor: "#FCFAF8", border: "1px solid #E8E1D8", borderRadius: "18px", padding: "26px", boxShadow: "0 4px 20px rgba(43,33,29,0.03)" }}>
                  <h3 style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: "22px", margin: "0 0 20px 0", color: "#2B211D" }}>
                    Revenue & Order Velocity ({salesPeriod.toUpperCase()})
                  </h3>
                  <div style={{ width: "100%", height: "320px" }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={salesData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#EAE2D7" />
                        <XAxis dataKey="date" stroke="#81766E" fontSize={11} />
                        <YAxis yAxisId="left" stroke="#81766E" fontSize={11} />
                        <YAxis yAxisId="right" orientation="right" stroke="#81766E" fontSize={11} />
                        <Tooltip contentStyle={{ backgroundColor: "#2B211D", color: "#F8F5F0", borderRadius: "8px", border: "none", fontSize: "12px" }} />
                        <Legend />
                        <Bar yAxisId="left" dataKey="revenue" name="Revenue ($)" fill="#B4935A" radius={[4, 4, 0, 0]} />
                        <Bar yAxisId="right" dataKey="ordersCount" name="Orders Count" fill="#2B211D" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Detailed Sales Data Table */}
                <div style={{ backgroundColor: "#FCFAF8", border: "1px solid #E8E1D8", borderRadius: "18px", padding: "26px", boxShadow: "0 4px 20px rgba(43,33,29,0.03)" }}>
                  <h3 style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: "22px", margin: "0 0 16px 0", color: "#2B211D" }}>
                    Period Breakdown Summary
                  </h3>
                  <div style={{ overflowX: "auto" }}>
                    <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left", fontSize: "13px" }}>
                      <thead>
                        <tr style={{ borderBottom: "1px solid #EAE2D7", color: "#81766E" }}>
                          <th style={{ padding: "12px 14px", fontWeight: 600 }}>PERIOD DATE</th>
                          <th style={{ padding: "12px 14px", fontWeight: 600 }}>TOTAL ORDERS</th>
                          <th style={{ padding: "12px 14px", fontWeight: 600 }}>ITEMS SOLD</th>
                          <th style={{ padding: "12px 14px", fontWeight: 600 }}>TOTAL REVENUE</th>
                        </tr>
                      </thead>
                      <tbody>
                        {salesData.map((row, idx) => (
                          <tr key={idx} style={{ borderBottom: "1px solid #F0ECE4" }}>
                            <td style={{ padding: "12px 14px", fontWeight: 500, color: "#2B211D" }}>{row.date}</td>
                            <td style={{ padding: "12px 14px", color: "#2B211D" }}>{row.ordersCount}</td>
                            <td style={{ padding: "12px 14px", color: "#2B211D" }}>{row.itemsSold}</td>
                            <td style={{ padding: "12px 14px", color: "#96733E", fontWeight: 600 }}>
                              ${Number(row.revenue).toLocaleString("en-US", { minimumFractionDigits: 2 })}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* ========================================================================= */}
            {/* TAB 3: ORDER DISTRIBUTION INSIGHTS */}
            {/* ========================================================================= */}
            {activeTab === "orders" && orderStats && (
              <div style={{ display: "flex", flexDirection: "column", gap: "28px" }}>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "16px" }}>
                  {[
                    { label: "Delivered", count: orderStats.delivered, color: "#10B981" },
                    { label: "Shipped", count: orderStats.shipped, color: "#3B82F6" },
                    { label: "Confirmed", count: orderStats.confirmed, color: "#F59E0B" },
                    { label: "Pending", count: orderStats.pending, color: "#B4935A" },
                    { label: "Cancelled", count: orderStats.cancelled, color: "#EF4444" },
                  ].map((st) => (
                    <div key={st.label} style={{ backgroundColor: "#FCFAF8", border: `1px solid ${st.color}40`, borderLeft: `4px solid ${st.color}`, borderRadius: "14px", padding: "20px", boxShadow: "0 4px 16px rgba(43,33,29,0.02)" }}>
                      <span style={{ fontSize: "11px", color: "#81766E", letterSpacing: "0.14em", textTransform: "uppercase", fontWeight: 600, display: "block", marginBottom: "4px" }}>
                        {st.label}
                      </span>
                      <div style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: "32px", fontWeight: 600, color: "#2B211D" }}>
                        {st.count}
                      </div>
                    </div>
                  ))}
                </div>

                <div style={{ backgroundColor: "#FCFAF8", border: "1px solid #E8E1D8", borderRadius: "18px", padding: "26px", boxShadow: "0 4px 20px rgba(43,33,29,0.03)" }}>
                  <h3 style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: "22px", margin: "0 0 20px 0", color: "#2B211D" }}>
                    Fulfillment Status Ratio
                  </h3>
                  <div style={{ width: "100%", height: "300px" }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={orderPieData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#EAE2D7" />
                        <XAxis dataKey="name" stroke="#81766E" fontSize={12} />
                        <YAxis stroke="#81766E" fontSize={12} />
                        <Tooltip contentStyle={{ backgroundColor: "#2B211D", color: "#F8F5F0", borderRadius: "8px", border: "none", fontSize: "12px" }} />
                        <Bar dataKey="value" name="Order Count" fill="#B4935A" radius={[6, 6, 0, 0]}>
                          {orderPieData.map((_entry, index) => (
                            <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>
            )}

            {/* ========================================================================= */}
            {/* TAB 4: PRODUCT MANAGEMENT & INVENTORY */}
            {/* ========================================================================= */}
            {activeTab === "products" && (
              <div style={{ display: "flex", flexDirection: "column", gap: "28px" }}>
                {/* Actions & Low Stock Alerts */}
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "12px" }}>
                  <div>
                    <h2 style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: "26px", margin: 0, color: "#2B211D" }}>
                      Jewellery Pieces Catalog ({productsList.length})
                    </h2>
                    <p style={{ fontSize: "12.5px", color: "#81766E", margin: "2px 0 0 0" }}>
                      Create, update, and manage fine jewellery inventory and pricing.
                    </p>
                  </div>
                  <button
                    onClick={() => handleOpenProductModal()}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "6px",
                      padding: "10px 22px",
                      backgroundColor: "#2B211D",
                      color: "#F8F5F0",
                      borderRadius: "9999px",
                      fontSize: "11.5px",
                      fontWeight: 600,
                      letterSpacing: "0.18em",
                      textTransform: "uppercase",
                      border: "none",
                      cursor: "pointer",
                      boxShadow: "0 4px 14px rgba(43,33,29,0.15)",
                    }}
                  >
                    <AddOutlined sx={{ fontSize: 16, color: "#B4935A" }} />
                    <span>Add New Jewellery Piece</span>
                  </button>
                </div>

                {/* Low Stock Warning Box */}
                {productsList.filter((p) => p.stock <= 5).length > 0 && (
                  <div style={{ backgroundColor: "rgba(245, 158, 11, 0.08)", border: "1px solid rgba(245, 158, 11, 0.25)", borderRadius: "14px", padding: "16px 20px", display: "flex", alignItems: "center", gap: "12px" }}>
                    <WarningAmberOutlined sx={{ color: "#D97706", fontSize: 24 }} />
                    <div>
                      <strong style={{ color: "#92400E", fontSize: "13px" }}>Low Stock Alert:</strong>
                      <span style={{ fontSize: "12.5px", color: "#78350F", marginLeft: "6px" }}>
                        {productsList.filter((p) => p.stock <= 5).length} jewellery pieces have 5 or fewer units available.
                      </span>
                    </div>
                  </div>
                )}

                {/* Products Table */}
                <div style={{ backgroundColor: "#FCFAF8", border: "1px solid #E8E1D8", borderRadius: "18px", padding: "20px", boxShadow: "0 4px 20px rgba(43,33,29,0.03)", overflowX: "auto" }}>
                  <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left", fontSize: "13px" }}>
                    <thead>
                      <tr style={{ borderBottom: "1px solid #EAE2D7", color: "#81766E" }}>
                        <th style={{ padding: "12px 14px", fontWeight: 600 }}>IMAGE</th>
                        <th style={{ padding: "12px 14px", fontWeight: 600 }}>NAME & GEMSTONE</th>
                        <th style={{ padding: "12px 14px", fontWeight: 600 }}>CATEGORY</th>
                        <th style={{ padding: "12px 14px", fontWeight: 600 }}>PRICE</th>
                        <th style={{ padding: "12px 14px", fontWeight: 600 }}>STOCK</th>
                        <th style={{ padding: "12px 14px", fontWeight: 600 }}>STATUS</th>
                        <th style={{ padding: "12px 14px", fontWeight: 600, textAlign: "right" }}>ACTIONS</th>
                      </tr>
                    </thead>
                    <tbody>
                      {productsList.map((prod) => (
                        <tr key={prod.id} style={{ borderBottom: "1px solid #F0ECE4" }}>
                          <td style={{ padding: "12px 14px" }}>
                            <img src={prod.imageUrl} alt={prod.name} style={{ width: "48px", height: "48px", objectFit: "cover", borderRadius: "8px", border: "1px solid #EAE2D7" }} />
                          </td>
                          <td style={{ padding: "12px 14px" }}>
                            <strong style={{ color: "#2B211D", display: "block" }}>{prod.name}</strong>
                            <span style={{ fontSize: "11px", color: "#96733E" }}>{prod.material} • {prod.gemstone} ({prod.caratWeight})</span>
                          </td>
                          <td style={{ padding: "12px 14px", color: "#81766E" }}>{prod.categoryName || "General"}</td>
                          <td style={{ padding: "12px 14px", fontWeight: 600, color: "#2B211D" }}>
                            ${Number(prod.price).toLocaleString("en-US", { minimumFractionDigits: 2 })}
                          </td>
                          <td style={{ padding: "12px 14px" }}>
                            <span style={{ padding: "3px 8px", borderRadius: "4px", fontSize: "11px", fontWeight: 600, backgroundColor: prod.stock > 5 ? "rgba(16,185,129,0.1)" : "rgba(239,68,68,0.1)", color: prod.stock > 5 ? "#10B981" : "#EF4444" }}>
                              {prod.stock} units
                            </span>
                          </td>
                          <td style={{ padding: "12px 14px" }}>
                            {prod.isActive ? (
                              <span style={{ color: "#10B981", fontSize: "11px", fontWeight: 600 }}>● Active</span>
                            ) : (
                              <span style={{ color: "#81766E", fontSize: "11px" }}>○ Inactive</span>
                            )}
                            {prod.isFeatured && (
                              <span style={{ display: "block", fontSize: "10px", color: "#B4935A", fontWeight: 600 }}>✦ Featured</span>
                            )}
                          </td>
                          <td style={{ padding: "12px 14px", textAlign: "right" }}>
                            <IconButton onClick={() => handleOpenProductModal(prod)} size="small" sx={{ color: "#B4935A" }}>
                              <EditOutlined fontSize="small" />
                            </IconButton>
                            <IconButton onClick={() => setDeleteConfirm({ open: true, type: "product", id: prod.id, name: prod.name })} size="small" sx={{ color: "#EF4444" }}>
                              <DeleteOutlined fontSize="small" />
                            </IconButton>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* ========================================================================= */}
            {/* TAB 5: CATEGORY MANAGEMENT */}
            {/* ========================================================================= */}
            {activeTab === "categories" && (
              <div style={{ display: "flex", flexDirection: "column", gap: "28px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "12px" }}>
                  <div>
                    <h2 style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: "26px", margin: 0, color: "#2B211D" }}>
                      Atelier Collections & Categories ({categoriesList.length})
                    </h2>
                    <p style={{ fontSize: "12.5px", color: "#81766E", margin: "2px 0 0 0" }}>
                      Organize jewellery pieces into curated salon categories.
                    </p>
                  </div>
                  <button
                    onClick={() => handleOpenCategoryModal()}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "6px",
                      padding: "10px 22px",
                      backgroundColor: "#2B211D",
                      color: "#F8F5F0",
                      borderRadius: "9999px",
                      fontSize: "11.5px",
                      fontWeight: 600,
                      letterSpacing: "0.18em",
                      textTransform: "uppercase",
                      border: "none",
                      cursor: "pointer",
                      boxShadow: "0 4px 14px rgba(43,33,29,0.15)",
                    }}
                  >
                    <AddOutlined sx={{ fontSize: 16, color: "#B4935A" }} />
                    <span>Create New Category</span>
                  </button>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: "20px" }}>
                  {categoriesList.map((cat) => (
                    <div key={cat.id} style={{ backgroundColor: "#FCFAF8", border: "1px solid #E8E1D8", borderRadius: "16px", padding: "20px", display: "flex", flexDirection: "column", justifyContent: "space-between", boxShadow: "0 4px 16px rgba(43,33,29,0.03)" }}>
                      <div>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "10px" }}>
                          <h3 style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: "22px", margin: 0, color: "#2B211D" }}>
                            {cat.name}
                          </h3>
                          <span style={{ fontSize: "11px", color: "#B4935A", fontWeight: 600, backgroundColor: "rgba(180,147,90,0.1)", padding: "2px 8px", borderRadius: "4px" }}>
                            slug: {cat.slug}
                          </span>
                        </div>
                        <p style={{ fontSize: "12.5px", color: "#81766E", lineHeight: 1.5, margin: "0 0 16px 0" }}>
                          {cat.description || "No description provided."}
                        </p>
                      </div>

                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderTop: "1px solid #EAE2D7", paddingTop: "12px" }}>
                        <span style={{ fontSize: "11px", color: "#81766E" }}>
                          {productsList.filter((p) => p.categoryId === cat.id).length} pieces assigned
                        </span>
                        <div>
                          <IconButton onClick={() => handleOpenCategoryModal(cat)} size="small" sx={{ color: "#B4935A" }}>
                            <EditOutlined fontSize="small" />
                          </IconButton>
                          <IconButton onClick={() => setDeleteConfirm({ open: true, type: "category", id: cat.id, name: cat.name })} size="small" sx={{ color: "#EF4444" }}>
                            <DeleteOutlined fontSize="small" />
                          </IconButton>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ========================================================================= */}
            {/* TAB 6: LIVE VISITOR ACTIVITY & PRODUCT VIEWERS */}
            {/* ========================================================================= */}
            {activeTab === "activity" && activeUsersData && (
              <div style={{ display: "flex", flexDirection: "column", gap: "28px" }}>
                {/* Active Users Summary Banner */}
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: "20px" }}>
                  <div style={{ backgroundColor: "#FCFAF8", border: "1px solid #E8E1D8", borderRadius: "16px", padding: "22px" }}>
                    <span style={{ fontSize: "11px", color: "#81766E", letterSpacing: "0.14em", textTransform: "uppercase", fontWeight: 600, display: "block" }}>
                      ACTIVE VISITORS (LAST 5 MIN)
                    </span>
                    <div style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: "38px", fontWeight: 600, color: "#10B981" }}>
                      {activeUsersData.activeUsers}
                    </div>
                  </div>

                  <div style={{ backgroundColor: "#FCFAF8", border: "1px solid #E8E1D8", borderRadius: "16px", padding: "22px" }}>
                    <span style={{ fontSize: "11px", color: "#81766E", letterSpacing: "0.14em", textTransform: "uppercase", fontWeight: 600, display: "block" }}>
                      AUTHENTICATED CLIENTS
                    </span>
                    <div style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: "38px", fontWeight: 600, color: "#2B211D" }}>
                      {activeUsersData.authenticatedUsers}
                    </div>
                  </div>

                  <div style={{ backgroundColor: "#FCFAF8", border: "1px solid #E8E1D8", borderRadius: "16px", padding: "22px" }}>
                    <span style={{ fontSize: "11px", color: "#81766E", letterSpacing: "0.14em", textTransform: "uppercase", fontWeight: 600, display: "block" }}>
                      ANONYMOUS VISITORS
                    </span>
                    <div style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: "38px", fontWeight: 600, color: "#81766E" }}>
                      {activeUsersData.anonymousVisitors}
                    </div>
                  </div>
                </div>

                {/* Currently Viewed Products */}
                <div style={{ backgroundColor: "#FCFAF8", border: "1px solid #E8E1D8", borderRadius: "18px", padding: "26px", boxShadow: "0 4px 20px rgba(43,33,29,0.03)" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "18px" }}>
                    <VisibilityOutlined sx={{ color: "#B4935A" }} />
                    <h3 style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: "22px", margin: 0, color: "#2B211D" }}>
                      Pieces Currently Watched Live
                    </h3>
                  </div>

                  {productViewers.length === 0 ? (
                    <p style={{ fontSize: "13px", color: "#81766E", fontStyle: "italic" }}>
                      No active product page interactions in the last 5 minutes.
                    </p>
                  ) : (
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: "16px" }}>
                      {productViewers.map((pv) => (
                        <div key={pv.productId} style={{ backgroundColor: "#FFFFFF", border: "1px solid #EAE2D7", borderRadius: "12px", padding: "14px", display: "flex", alignItems: "center", gap: "12px" }}>
                          <img src={pv.imageUrl} alt={pv.productName} style={{ width: "48px", height: "48px", borderRadius: "8px", objectFit: "cover" }} />
                          <div style={{ flex: 1 }}>
                            <strong style={{ color: "#2B211D", fontSize: "13px", display: "block" }}>{pv.productName}</strong>
                            <span style={{ fontSize: "11px", color: "#B4935A" }}>{pv.categoryName} • ${pv.price}</span>
                          </div>
                          <span style={{ backgroundColor: "rgba(16,185,129,0.12)", color: "#10B981", fontSize: "11px", fontWeight: 700, padding: "4px 8px", borderRadius: "9999px" }}>
                            ● {pv.activeViewersCount} viewing
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Real-time Visitor Stream Table */}
                <div style={{ backgroundColor: "#FCFAF8", border: "1px solid #E8E1D8", borderRadius: "18px", padding: "26px", boxShadow: "0 4px 20px rgba(43,33,29,0.03)" }}>
                  <h3 style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: "22px", margin: "0 0 16px 0", color: "#2B211D" }}>
                    Active Visitor Stream & Route Traversal
                  </h3>
                  <div style={{ overflowX: "auto" }}>
                    <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left", fontSize: "12.5px" }}>
                      <thead>
                        <tr style={{ borderBottom: "1px solid #EAE2D7", color: "#81766E" }}>
                          <th style={{ padding: "10px 14px", fontWeight: 600 }}>SESSION ID</th>
                          <th style={{ padding: "10px 14px", fontWeight: 600 }}>VISITOR TYPE</th>
                          <th style={{ padding: "10px 14px", fontWeight: 600 }}>ACTIVE ROUTE</th>
                          <th style={{ padding: "10px 14px", fontWeight: 600 }}>VIEWED PRODUCT</th>
                          <th style={{ padding: "10px 14px", fontWeight: 600 }}>LAST ACTIVITY</th>
                        </tr>
                      </thead>
                      <tbody>
                        {activeUsersData.users.map((u, idx) => (
                          <tr key={idx} style={{ borderBottom: "1px solid #F0ECE4" }}>
                            <td style={{ padding: "10px 14px", fontFamily: "monospace", color: "#81766E" }}>{u.sessionId}</td>
                            <td style={{ padding: "10px 14px" }}>
                              {u.userId ? (
                                <span style={{ color: "#B4935A", fontWeight: 600 }}>Client: {u.userName}</span>
                              ) : (
                                <span style={{ color: "#81766E" }}>Anonymous Guest</span>
                              )}
                            </td>
                            <td style={{ padding: "10px 14px", color: "#2B211D", fontWeight: 500 }}>{u.currentPage}</td>
                            <td style={{ padding: "10px 14px", color: "#96733E" }}>{u.productName || "—"}</td>
                            <td style={{ padding: "10px 14px", color: "#81766E" }}>
                              {new Date(u.lastActivityAt).toLocaleTimeString()}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}
          </>
        )}

        {/* ========================================================================= */}
        {/* PRODUCT CREATE / EDIT MODAL */}
        {/* ========================================================================= */}
        <Dialog open={productModalOpen} onClose={() => setProductModalOpen(false)} maxWidth="sm" fullWidth>
          <DialogTitle sx={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: "24px", color: "#2B211D", pb: 1 }}>
            {editingProduct ? "Edit Jewellery Piece" : "Create New Jewellery Piece"}
          </DialogTitle>
          <DialogContent>
            <form onSubmit={handleSaveProduct} style={{ display: "flex", flexDirection: "column", gap: "16px", paddingTop: "10px" }}>
              <TextField
                label="Product Name"
                size="small"
                required
                fullWidth
                value={productForm.name}
                onChange={(e) => setProductForm({ ...productForm, name: e.target.value })}
              />

              <TextField
                label="Description"
                size="small"
                required
                multiline
                rows={3}
                fullWidth
                value={productForm.description}
                onChange={(e) => setProductForm({ ...productForm, description: e.target.value })}
              />

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                <TextField
                  label="Price (USD)"
                  type="number"
                  size="small"
                  required
                  fullWidth
                  value={productForm.price}
                  onChange={(e) => setProductForm({ ...productForm, price: Number(e.target.value) })}
                />
                <TextField
                  label="Stock Inventory"
                  type="number"
                  size="small"
                  required
                  fullWidth
                  value={productForm.stock}
                  onChange={(e) => setProductForm({ ...productForm, stock: Number(e.target.value) })}
                />
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                <FormControl size="small" fullWidth>
                  <InputLabel>Category</InputLabel>
                  <Select
                    value={productForm.categoryId}
                    label="Category"
                    onChange={(e) => setProductForm({ ...productForm, categoryId: Number(e.target.value) })}
                  >
                    {categoriesList.map((cat) => (
                      <MenuItem key={cat.id} value={cat.id}>{cat.name}</MenuItem>
                    ))}
                  </Select>
                </FormControl>

                <TextField
                  label="Carat Weight"
                  size="small"
                  fullWidth
                  value={productForm.caratWeight}
                  onChange={(e) => setProductForm({ ...productForm, caratWeight: e.target.value })}
                />
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                <TextField
                  label="Material"
                  size="small"
                  fullWidth
                  value={productForm.material}
                  onChange={(e) => setProductForm({ ...productForm, material: e.target.value })}
                />
                <TextField
                  label="Gemstone"
                  size="small"
                  fullWidth
                  value={productForm.gemstone}
                  onChange={(e) => setProductForm({ ...productForm, gemstone: e.target.value })}
                />
              </div>

              <TextField
                label="Image URL"
                size="small"
                required
                fullWidth
                value={productForm.imageUrl}
                onChange={(e) => setProductForm({ ...productForm, imageUrl: e.target.value })}
              />

              <div style={{ display: "flex", gap: "20px" }}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={productForm.isFeatured}
                      onChange={(e) => setProductForm({ ...productForm, isFeatured: e.target.checked })}
                    />
                  }
                  label="Featured Piece"
                />
                <FormControlLabel
                  control={
                    <Switch
                      checked={productForm.isActive}
                      onChange={(e) => setProductForm({ ...productForm, isActive: e.target.checked })}
                    />
                  }
                  label="Active in Catalog"
                />
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "10px" }}>
                <button
                  type="button"
                  onClick={() => setProductModalOpen(false)}
                  style={{ padding: "8px 18px", borderRadius: "9999px", border: "1px solid #E2DAD0", backgroundColor: "#FCFAF8", cursor: "pointer", fontSize: "12px" }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  style={{ padding: "8px 22px", borderRadius: "9999px", border: "none", backgroundColor: "#2B211D", color: "#F8F5F0", cursor: "pointer", fontSize: "12px", fontWeight: 600 }}
                >
                  {editingProduct ? "Update Piece" : "Save Piece"}
                </button>
              </div>
            </form>
          </DialogContent>
        </Dialog>

        {/* ========================================================================= */}
        {/* CATEGORY CREATE / EDIT MODAL */}
        {/* ========================================================================= */}
        <Dialog open={categoryModalOpen} onClose={() => setCategoryModalOpen(false)} maxWidth="xs" fullWidth>
          <DialogTitle sx={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: "24px", color: "#2B211D", pb: 1 }}>
            {editingCategory ? "Edit Category" : "Create New Category"}
          </DialogTitle>
          <DialogContent>
            <form onSubmit={handleSaveCategory} style={{ display: "flex", flexDirection: "column", gap: "16px", paddingTop: "10px" }}>
              <TextField
                label="Category Name"
                size="small"
                required
                fullWidth
                value={categoryForm.name}
                onChange={(e) => setCategoryForm({ ...categoryForm, name: e.target.value })}
              />
              <TextField
                label="Description"
                size="small"
                multiline
                rows={2}
                fullWidth
                value={categoryForm.description}
                onChange={(e) => setCategoryForm({ ...categoryForm, description: e.target.value })}
              />
              <TextField
                label="Image URL"
                size="small"
                fullWidth
                value={categoryForm.imageUrl}
                onChange={(e) => setCategoryForm({ ...categoryForm, imageUrl: e.target.value })}
              />

              <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "10px" }}>
                <button
                  type="button"
                  onClick={() => setCategoryModalOpen(false)}
                  style={{ padding: "8px 18px", borderRadius: "9999px", border: "1px solid #E2DAD0", backgroundColor: "#FCFAF8", cursor: "pointer", fontSize: "12px" }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  style={{ padding: "8px 22px", borderRadius: "9999px", border: "none", backgroundColor: "#2B211D", color: "#F8F5F0", cursor: "pointer", fontSize: "12px", fontWeight: 600 }}
                >
                  {editingCategory ? "Update Category" : "Create Category"}
                </button>
              </div>
            </form>
          </DialogContent>
        </Dialog>

        {/* ========================================================================= */}
        {/* DELETE CONFIRMATION DIALOG */}
        {/* ========================================================================= */}
        <Dialog open={deleteConfirm.open} onClose={() => setDeleteConfirm({ ...deleteConfirm, open: false })}>
          <DialogTitle sx={{ color: "#EF4444", display: "flex", alignItems: "center", gap: "8px" }}>
            <WarningAmberOutlined /> Confirm Deletion
          </DialogTitle>
          <DialogContent>
            <p style={{ fontSize: "14px", color: "#2B211D", margin: "0 0 16px 0" }}>
              Are you sure you want to permanently delete the {deleteConfirm.type} <strong>"{deleteConfirm.name}"</strong>?
            </p>
            <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px" }}>
              <button
                onClick={() => setDeleteConfirm({ ...deleteConfirm, open: false })}
                style={{ padding: "8px 18px", borderRadius: "9999px", border: "1px solid #E2DAD0", backgroundColor: "#FCFAF8", cursor: "pointer", fontSize: "12px" }}
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmDelete}
                style={{ padding: "8px 22px", borderRadius: "9999px", border: "none", backgroundColor: "#EF4444", color: "#FFFFFF", cursor: "pointer", fontSize: "12px", fontWeight: 600 }}
              >
                Delete Permanently
              </button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default AdminPage;
