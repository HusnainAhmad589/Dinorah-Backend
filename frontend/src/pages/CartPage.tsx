import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAppSelector, useAppDispatch } from "../store/store";
import { clearCustomerCart } from "../store/slices/cartSlice";
import { CartItem } from "../components/cart/CartItem";
import { CartSummary } from "../components/cart/CartSummary";
import {
  ArrowBackOutlined,
  DeleteSweepOutlined,
  DiamondOutlined,
} from "@mui/icons-material";
import { Alert } from "@mui/material";

export const CartPage: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  const items = useAppSelector((state) => state.cart.items);
  const totalQuantity = useAppSelector((state) => state.cart.totalQuantity);
  const error = useAppSelector((state) => state.cart.error);

  const handleClearCart = () => {
    if (window.confirm("Are you sure you wish to clear all pieces from your shopping bag?")) {
      dispatch(clearCustomerCart());
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        backgroundColor: "#F8F5F0",
        paddingTop: "40px",
        paddingBottom: "100px",
      }}
    >
      <div style={{ maxWidth: "1380px", margin: "0 auto", padding: "0 24px" }}>
        {/* Navigation & Breadcrumbs */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: "12px",
            marginBottom: "32px",
          }}
        >
          <button
            onClick={() => navigate("/products")}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "8px",
              backgroundColor: "transparent",
              border: "none",
              cursor: "pointer",
              color: "#81766E",
              fontSize: "12px",
              letterSpacing: "0.15em",
              textTransform: "uppercase",
              fontWeight: 600,
              padding: "6px 0",
              transition: "color 0.2s",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.color = "#2B211D")}
            onMouseLeave={(e) => (e.currentTarget.style.color = "#81766E")}
          >
            <ArrowBackOutlined sx={{ fontSize: 16 }} />
            Continue Browsing
          </button>

          <nav style={{ fontSize: "12px", color: "#81766E", letterSpacing: "0.08em" }}>
            <Link to="/" style={{ color: "#81766E", textDecoration: "none" }}>
              Home
            </Link>{" "}
            /{" "}
            <Link to="/products" style={{ color: "#81766E", textDecoration: "none" }}>
              Catalog
            </Link>{" "}
            /{" "}
            <span style={{ color: "#2B211D", fontWeight: 500 }}>Shopping Bag ({totalQuantity})</span>
          </nav>
        </div>

        {/* Page Title & Counter */}
        <div
          style={{
            display: "flex",
            alignItems: "baseline",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: "16px",
            marginBottom: "36px",
            borderBottom: "1px solid #EAE2D7",
            paddingBottom: "20px",
          }}
        >
          <div>
            <h1
              style={{
                fontFamily: "'Cormorant Garamond', Georgia, serif",
                fontSize: "40px",
                fontWeight: 300,
                color: "#2B211D",
                margin: "0 0 6px 0",
              }}
            >
              Your Atelier <span style={{ fontStyle: "italic", color: "#B4935A" }}>Selection</span>
            </h1>
            <p style={{ fontSize: "13px", color: "#81766E", margin: 0 }}>
              Review your curated pieces before completing private reservation.
            </p>
          </div>

          {items.length > 0 && (
            <button
              onClick={handleClearCart}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "6px",
                backgroundColor: "transparent",
                border: "1px solid #E2D9CE",
                borderRadius: "9999px",
                padding: "8px 16px",
                fontSize: "11px",
                fontWeight: 600,
                letterSpacing: "0.14em",
                textTransform: "uppercase",
                color: "#81766E",
                cursor: "pointer",
                transition: "all 0.2s",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.color = "#d32f2f";
                e.currentTarget.style.borderColor = "#d32f2f";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color = "#81766E";
                e.currentTarget.style.borderColor = "#E2D9CE";
              }}
            >
              <DeleteSweepOutlined sx={{ fontSize: 16 }} />
              Clear Selection
            </button>
          )}
        </div>

        {/* Error Alert */}
        {error && (
          <Alert severity="warning" sx={{ mb: 4, borderRadius: "12px" }}>
            {error}
          </Alert>
        )}

        {/* Empty State */}
        {items.length === 0 ? (
          <div
            style={{
              backgroundColor: "#FCFAF8",
              borderRadius: "24px",
              border: "1px solid #EAE2D7",
              padding: "80px 24px",
              textAlign: "center",
              boxShadow: "0 10px 30px rgba(43, 33, 29, 0.03)",
              maxWidth: "680px",
              margin: "40px auto",
            }}
          >
            <div
              style={{
                width: "80px",
                height: "80px",
                borderRadius: "50%",
                backgroundColor: "rgba(180, 147, 90, 0.12)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                margin: "0 auto 24px auto",
              }}
            >
              <DiamondOutlined sx={{ fontSize: 40, color: "#B4935A" }} />
            </div>

            <h2
              style={{
                fontFamily: "'Cormorant Garamond', Georgia, serif",
                fontSize: "32px",
                fontWeight: 400,
                color: "#2B211D",
                marginBottom: "12px",
              }}
            >
              Your Shopping Bag is Empty
            </h2>

            <p
              style={{
                fontSize: "14px",
                color: "#81766E",
                maxWidth: "440px",
                margin: "0 auto 32px auto",
                lineHeight: 1.6,
              }}
            >
              Discover handcrafted solitaire rings, diamond chandelier earrings, and high joaillerie colliers in our atelier catalog.
            </p>

            <button
              onClick={() => navigate("/products")}
              style={{
                backgroundColor: "#2B211D",
                color: "#F8F5F0",
                padding: "14px 32px",
                borderRadius: "9999px",
                fontSize: "12px",
                fontWeight: 600,
                letterSpacing: "0.2em",
                textTransform: "uppercase",
                border: "none",
                cursor: "pointer",
                boxShadow: "0 4px 16px rgba(43, 33, 29, 0.2)",
                transition: "all 0.2s ease",
              }}
            >
              Explore Collection
            </button>
          </div>
        ) : (
          /* Active Cart Grid */
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(340px, 1fr))",
              gap: "40px",
              alignItems: "start",
            }}
          >
            {/* Left Column: List of Items */}
            <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              {items.map((item) => (
                <CartItem key={item.id || item.productId} item={item} />
              ))}
            </div>

            {/* Right Column: Order Summary & Checkout */}
            <div style={{ position: "sticky", top: "100px" }}>
              <CartSummary />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CartPage;
