import React from "react";
import { useNavigate } from "react-router-dom";
import { useAppSelector } from "../../store/store";
import { LocalMallOutlined } from "@mui/icons-material";
import { IconButton, Badge } from "@mui/material";

interface CartBadgeProps {
  className?: string;
}

export const CartBadge: React.FC<CartBadgeProps> = ({ className = "" }) => {
  const navigate = useNavigate();
  const totalQuantity = useAppSelector((state) => state.cart.totalQuantity);

  return (
    <IconButton
      onClick={() => navigate("/cart")}
      title="Shopping Bag"
      className={className}
      sx={{
        color: "var(--foreground, #2B211D)",
        padding: "6px",
        transition: "all 0.2s ease",
        "&:hover": {
          color: "var(--gold, #B4935A)",
          transform: "scale(1.05)",
        },
      }}
    >
      <Badge
        badgeContent={totalQuantity}
        sx={{
          "& .MuiBadge-badge": {
            backgroundColor: "#B4935A",
            color: "#FFFFFF",
            fontSize: "10px",
            fontWeight: 700,
            height: "18px",
            minWidth: "18px",
            borderRadius: "9px",
            padding: "0 4px",
            boxShadow: "0 2px 6px rgba(180, 147, 90, 0.4)",
          },
        }}
      >
        <LocalMallOutlined sx={{ fontSize: 22 }} />
      </Badge>
    </IconButton>
  );
};
