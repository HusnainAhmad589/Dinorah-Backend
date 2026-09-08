import React from "react";
import { Link } from "react-router-dom";
import { CartItem as CartItemType } from "../../types/cart.types";
import { useAppDispatch } from "../../store/store";
import { updateCartItem, removeCartItem } from "../../store/slices/cartSlice";
import { Add, Remove, DeleteOutlined } from "@mui/icons-material";
import { IconButton } from "@mui/material";

interface CartItemProps {
  item: CartItemType;
}

export const CartItem: React.FC<CartItemProps> = ({ item }) => {
  const dispatch = useAppDispatch();

  const handleIncrement = () => {
    if (item.quantity < item.stock) {
      dispatch(
        updateCartItem({
          itemId: item.id,
          productId: item.productId,
          quantity: item.quantity + 1,
        })
      );
    }
  };

  const handleDecrement = () => {
    if (item.quantity > 1) {
      dispatch(
        updateCartItem({
          itemId: item.id,
          productId: item.productId,
          quantity: item.quantity - 1,
        })
      );
    } else {
      handleRemove();
    }
  };

  const handleRemove = () => {
    dispatch(removeCartItem(item.id || item.productId));
  };

  const itemTotal = Number((item.price * item.quantity).toFixed(2));

  return (
    <div
      style={{
        display: "flex",
        gap: "20px",
        padding: "24px",
        backgroundColor: "#FFFFFF",
        borderRadius: "18px",
        border: "1px solid #EAE2D7",
        boxShadow: "0 4px 16px rgba(43, 33, 29, 0.03)",
        alignItems: "center",
        flexWrap: "wrap",
        transition: "all 0.2s ease",
      }}
    >
      {/* Product Image Thumbnail */}
      <Link
        to={`/products/${item.productId}`}
        style={{
          width: "100px",
          height: "100px",
          borderRadius: "12px",
          overflow: "hidden",
          backgroundColor: "#FAF7F2",
          flexShrink: 0,
          display: "block",
          border: "1px solid #EFEAE3",
        }}
      >
        <img
          src={item.image}
          alt={item.name}
          style={{ width: "100%", height: "100%", objectFit: "cover" }}
        />
      </Link>

      {/* Details */}
      <div style={{ flex: "1 1 200px" }}>
        {(item.material || item.gemstone) && (
          <span
            style={{
              fontSize: "10px",
              letterSpacing: "0.18em",
              textTransform: "uppercase",
              color: "#96733E",
              fontWeight: 600,
              display: "block",
              marginBottom: "4px",
            }}
          >
            {[item.material, item.gemstone].filter(Boolean).join(" • ")}
          </span>
        )}

        <Link
          to={`/products/${item.productId}`}
          style={{
            textDecoration: "none",
            color: "#2B211D",
          }}
        >
          <h3
            style={{
              fontFamily: "'Cormorant Garamond', Georgia, serif",
              fontSize: "20px",
              fontWeight: 500,
              margin: "0 0 6px 0",
              lineHeight: 1.25,
            }}
          >
            {item.name}
          </h3>
        </Link>

        <div style={{ fontSize: "14px", color: "#81766E", fontWeight: 400 }}>
          ${Number(item.price).toLocaleString("en-US", { minimumFractionDigits: 2 })} each
        </div>

        {item.stock <= 5 && item.stock > 0 && (
          <span style={{ fontSize: "11px", color: "#C25E00", fontWeight: 500, marginTop: "4px", display: "block" }}>
            Only {item.stock} left in atelier stock
          </span>
        )}
      </div>

      {/* Quantity Selector */}
      <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            border: "1px solid #E2D9CE",
            borderRadius: "9999px",
            backgroundColor: "#FAF7F2",
            padding: "2px",
          }}
        >
          <IconButton
            size="small"
            onClick={handleDecrement}
            title={item.quantity === 1 ? "Remove item" : "Decrease quantity"}
            sx={{
              color: "#2B211D",
              padding: "4px",
              "&:hover": { color: "#96733E" },
            }}
          >
            {item.quantity === 1 ? <DeleteOutlined sx={{ fontSize: 16 }} /> : <Remove sx={{ fontSize: 16 }} />}
          </IconButton>

          <span
            style={{
              minWidth: "28px",
              textAlign: "center",
              fontSize: "13px",
              fontWeight: 600,
              color: "#2B211D",
            }}
          >
            {item.quantity}
          </span>

          <IconButton
            size="small"
            onClick={handleIncrement}
            disabled={item.quantity >= item.stock}
            title={item.quantity >= item.stock ? "Maximum available stock reached" : "Increase quantity"}
            sx={{
              color: item.quantity >= item.stock ? "#C2BAAF" : "#2B211D",
              padding: "4px",
              "&:hover": { color: item.quantity >= item.stock ? "#C2BAAF" : "#96733E" },
            }}
          >
            <Add sx={{ fontSize: 16 }} />
          </IconButton>
        </div>
      </div>

      {/* Item Total */}
      <div
        style={{
          minWidth: "110px",
          textAlign: "right",
          display: "flex",
          flexDirection: "column",
          alignItems: "flex-end",
        }}
      >
        <span
          style={{
            fontFamily: "'Cormorant Garamond', Georgia, serif",
            fontSize: "20px",
            fontWeight: 600,
            color: "#2B211D",
          }}
        >
          ${itemTotal.toLocaleString("en-US", { minimumFractionDigits: 2 })}
        </span>
        <button
          onClick={handleRemove}
          style={{
            background: "none",
            border: "none",
            color: "#998F87",
            fontSize: "11px",
            letterSpacing: "0.08em",
            textTransform: "uppercase",
            cursor: "pointer",
            marginTop: "6px",
            padding: 0,
            transition: "color 0.2s",
          }}
          onMouseEnter={(e) => (e.currentTarget.style.color = "#d32f2f")}
          onMouseLeave={(e) => (e.currentTarget.style.color = "#998F87")}
        >
          Remove
        </button>
      </div>
    </div>
  );
};
