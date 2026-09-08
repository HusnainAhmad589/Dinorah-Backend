import React, { useState } from "react";
import { useAppSelector, useAppDispatch } from "../../store/store";
import { clearCustomerCart } from "../../store/slices/cartSlice";
import {
  LockOutlined,
  LocalShippingOutlined,
  VerifiedUserOutlined,
  CheckCircleOutlined,
} from "@mui/icons-material";
import { Dialog, DialogContent, CircularProgress } from "@mui/material";

export const CartSummary: React.FC = () => {
  const dispatch = useAppDispatch();
  const subtotal = useAppSelector((state) => state.cart.subtotal);
  const totalQuantity = useAppSelector((state) => state.cart.totalQuantity);

  const [checkoutModalOpen, setCheckoutModalOpen] = useState(false);
  const [orderProcessing, setOrderProcessing] = useState(false);
  const [orderCompleted, setOrderCompleted] = useState(false);

  const handleCheckout = () => {
    setCheckoutModalOpen(true);
    setOrderProcessing(true);
    setTimeout(() => {
      setOrderProcessing(false);
      setOrderCompleted(true);
      dispatch(clearCustomerCart());
    }, 1800);
  };

  return (
    <div
      style={{
        backgroundColor: "#FCFAF8",
        borderRadius: "20px",
        border: "1px solid #EAE2D7",
        padding: "32px",
        boxShadow: "0 10px 30px rgba(43, 33, 29, 0.04)",
      }}
    >
      <h3
        style={{
          fontFamily: "'Cormorant Garamond', Georgia, serif",
          fontSize: "24px",
          fontWeight: 400,
          color: "#2B211D",
          margin: "0 0 20px 0",
          borderBottom: "1px solid #EAE2D7",
          paddingBottom: "16px",
        }}
      >
        Acquisition Summary
      </h3>

      {/* Breakdown Rows */}
      <div style={{ display: "flex", flexDirection: "column", gap: "14px", marginBottom: "24px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", fontSize: "14px", color: "#81766E" }}>
          <span>Selected Pieces ({totalQuantity})</span>
          <span style={{ color: "#2B211D", fontWeight: 500 }}>
            ${subtotal.toLocaleString("en-US", { minimumFractionDigits: 2 })}
          </span>
        </div>

        <div style={{ display: "flex", justifyContent: "space-between", fontSize: "14px", color: "#81766E" }}>
          <span>Insured Armored Courier</span>
          <span style={{ color: "#2E7D32", fontWeight: 600 }}>COMPLIMENTARY</span>
        </div>

        <div style={{ display: "flex", justifyContent: "space-between", fontSize: "14px", color: "#81766E" }}>
          <span>Estimated Sales Tax</span>
          <span style={{ color: "#2B211D" }}>Calculated at checkout</span>
        </div>
      </div>

      <div
        style={{
          borderTop: "1px solid #EAE2D7",
          paddingTop: "20px",
          marginBottom: "28px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "baseline",
        }}
      >
        <span style={{ fontSize: "12px", letterSpacing: "0.15em", textTransform: "uppercase", fontWeight: 600, color: "#2B211D" }}>
          Estimated Total
        </span>
        <span
          style={{
            fontFamily: "'Cormorant Garamond', Georgia, serif",
            fontSize: "28px",
            fontWeight: 600,
            color: "#2B211D",
          }}
        >
          ${subtotal.toLocaleString("en-US", { minimumFractionDigits: 2 })}
        </span>
      </div>

      {/* Checkout Button */}
      <button
        onClick={handleCheckout}
        disabled={totalQuantity === 0}
        style={{
          width: "100%",
          backgroundColor: totalQuantity === 0 ? "#C2BAAF" : "#2B211D",
          color: "#F8F5F0",
          padding: "16px",
          borderRadius: "9999px",
          fontSize: "12px",
          fontWeight: 600,
          letterSpacing: "0.22em",
          textTransform: "uppercase",
          border: "none",
          cursor: totalQuantity === 0 ? "not-allowed" : "pointer",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: "8px",
          boxShadow: totalQuantity > 0 ? "0 4px 18px rgba(43, 33, 29, 0.2)" : "none",
          transition: "all 0.25s ease",
        }}
      >
        <LockOutlined sx={{ fontSize: 16 }} />
        Proceed to Private Checkout
      </button>

      {/* Luxury Trust Indicators */}
      <div
        style={{
          marginTop: "24px",
          paddingTop: "20px",
          borderTop: "1px solid #EFEAE3",
          display: "flex",
          flexDirection: "column",
          gap: "10px",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "11px", color: "#81766E" }}>
          <VerifiedUserOutlined sx={{ fontSize: 16, color: "#B4935A" }} />
          <span>Dinorah Certified Atelier Authenticity Guarantee</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "11px", color: "#81766E" }}>
          <LocalShippingOutlined sx={{ fontSize: 16, color: "#B4935A" }} />
          <span>Complimentary 30-Day Atelier Returns & Resizing</span>
        </div>
      </div>

      {/* Checkout Success Modal Dialog */}
      <Dialog
        open={checkoutModalOpen}
        onClose={() => setCheckoutModalOpen(false)}
        maxWidth="sm"
        fullWidth
        slotProps={{
          paper: {
            sx: {
              borderRadius: "20px",
              padding: "24px",
              backgroundColor: "#FCFAF8",
            },
          },
        }}
      >
        <DialogContent sx={{ textAlign: "center", py: 4 }}>
          {orderProcessing ? (
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "16px" }}>
              <CircularProgress sx={{ color: "#B4935A" }} size={42} />
              <h3 style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: "24px", color: "#2B211D" }}>
                Securing Your Atelier Selection...
              </h3>
              <p style={{ fontSize: "13px", color: "#81766E" }}>
                Validating inventory reservation and insured dispatch parameters.
              </p>
            </div>
          ) : orderCompleted ? (
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "14px" }}>
              <CheckCircleOutlined sx={{ fontSize: 56, color: "#2E7D32" }} />
              <h3 style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: "28px", color: "#2B211D", margin: 0 }}>
                Acquisition Reserved
              </h3>
              <p style={{ fontSize: "14px", color: "#61564F", lineHeight: 1.6, maxWidth: "420px", margin: "0 auto" }}>
                Thank you! Your private acquisition request has been registered. Our salon concierge will connect with you immediately regarding white-glove courier delivery and authentication documentation.
              </p>
              <button
                onClick={() => setCheckoutModalOpen(false)}
                style={{
                  marginTop: "16px",
                  backgroundColor: "#2B211D",
                  color: "#F8F5F0",
                  padding: "12px 28px",
                  borderRadius: "9999px",
                  border: "none",
                  fontSize: "11px",
                  fontWeight: 600,
                  letterSpacing: "0.2em",
                  textTransform: "uppercase",
                  cursor: "pointer",
                }}
              >
                Return to Collection
              </button>
            </div>
          ) : null}
        </DialogContent>
      </Dialog>
    </div>
  );
};
