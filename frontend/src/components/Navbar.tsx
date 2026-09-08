import React, { useState } from "react";
import { useAuth } from "../hooks/useAuth";
import {
  Menu as MenuIcon,
  Close as CloseIcon,
  LogoutOutlined,
} from "@mui/icons-material";
import {
  IconButton,
  Drawer,
  Avatar,
  Box,
} from "@mui/material";
import { CartBadge } from "./cart/CartBadge";

export type NavTab = "home" | "products" | "login" | "register" | "admin" | "cart";

interface NavbarProps {
  currentTab: NavTab;
  onSelectTab: (tab: NavTab) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentTab,
  onSelectTab,
}) => {
  const { user, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleNavClick = (sectionId: string) => {
    if (currentTab !== "home") {
      onSelectTab("home");
      setTimeout(() => {
        const el = document.getElementById(sectionId);
        if (el) el.scrollIntoView({ behavior: "smooth" });
      }, 100);
    } else {
      const el = document.getElementById(sectionId);
      if (el) el.scrollIntoView({ behavior: "smooth" });
    }
    setMobileMenuOpen(false);
  };

  return (
    <header className="site-header">
      <div className="header-content">
        {/* Logo */}
        <a
          href="/"
          className="logo"
          onClick={(e) => {
            e.preventDefault();
            onSelectTab("home");
            window.scrollTo({ top: 0, behavior: "smooth" });
          }}
        >
          DINORAH
        </a>

        {/* Desktop Nav */}
        <nav className="header-nav">
          <a
            href="/products"
            onClick={(e) => {
              e.preventDefault();
              onSelectTab("products");
            }}
            className="nav-link relative py-1 outline-none focus:outline-none"
            style={{
              color: currentTab === "products" ? "var(--foreground)" : "var(--muted)",
              fontWeight: currentTab === "products" ? 600 : 400,
            }}
          >
            Catalog
            {currentTab === "products" && (
              <span className="absolute bottom-0 left-0 right-0 h-[1.5px] bg-[#2B211D] animate-fade-in" />
            )}
          </a>
          <a
            href="#collections"
            onClick={(e) => {
              e.preventDefault();
              handleNavClick("collections");
            }}
          >
            Collections
          </a>
          <a
            href="#about"
            onClick={(e) => {
              e.preventDefault();
              handleNavClick("about");
            }}
          >
            About
          </a>
          <a
            href="#contact"
            onClick={(e) => {
              e.preventDefault();
              handleNavClick("contact");
            }}
          >
            Contact
          </a>

          {!user ? (
            <div className="flex items-center gap-5 ml-4">
              <button
                className="nav-link relative py-1"
                onClick={() => onSelectTab("login")}
                style={{
                  color: currentTab === "login" ? "var(--foreground)" : "var(--muted)",
                  fontWeight: currentTab === "login" ? 600 : 400,
                }}
              >
                Sign In
                {currentTab === "login" && (
                  <span className="absolute bottom-0 left-0 right-0 h-[1.5px] bg-[#2B211D] animate-fade-in" />
                )}
              </button>
              <button
                className="nav-link relative py-1"
                onClick={() => onSelectTab("register")}
                style={{
                  color: currentTab === "register" ? "var(--foreground)" : "var(--muted)",
                  fontWeight: currentTab === "register" ? 600 : 400,
                }}
              >
                Join
                {currentTab === "register" && (
                  <span className="absolute bottom-0 left-0 right-0 h-[1.5px] bg-[#2B211D] animate-fade-in" />
                )}
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-4 ml-4">
              {user.role === "admin" && (
                <button
                  className="nav-link"
                  onClick={() => onSelectTab("admin")}
                  style={{
                    color: currentTab === "admin" ? "var(--gold)" : "var(--muted)",
                    fontWeight: 600,
                  }}
                >
                  Admin
                </button>
              )}

              <div className="flex items-center gap-2 pl-2 border-l border-[rgba(46,36,32,0.1)]">
                <Avatar
                  sx={{
                    width: 28,
                    height: 28,
                    bgcolor: "var(--gold)",
                    fontSize: "0.75rem",
                    fontWeight: 600,
                    color: "var(--background)",
                  }}
                >
                  {user.name.charAt(0).toUpperCase()}
                </Avatar>
                <span className="text-xs text-[#2E2420] font-medium hidden sm:inline">
                  {user.name.split(" ")[0]}
                </span>
                <IconButton
                  size="small"
                  title="Sign Out"
                  onClick={() => {
                    logout();
                    onSelectTab("home");
                  }}
                  sx={{
                    color: "var(--muted)",
                    "&:hover": { color: "#d32f2f" },
                  }}
                >
                  <LogoutOutlined sx={{ fontSize: 16 }} />
                </IconButton>
              </div>
            </div>
          )}

          {/* Luxury Shopping Bag Badge */}
          <div className="ml-2">
            <CartBadge />
          </div>
        </nav>

        {/* Mobile Header Actions */}
        <div className="md:hidden flex items-center gap-1">
          <CartBadge />
          {user && (
            <Avatar
              sx={{
                width: 28,
                height: 28,
                bgcolor: "var(--gold)",
                fontSize: "0.75rem",
                color: "var(--background)",
              }}
            >
              {user.name.charAt(0).toUpperCase()}
            </Avatar>
          )}
          <IconButton
            onClick={() => setMobileMenuOpen(true)}
            sx={{ color: "var(--foreground)", p: 1 }}
          >
            <MenuIcon />
          </IconButton>
        </div>
      </div>

      {/* Mobile Drawer */}
      <Drawer
        anchor="right"
        open={mobileMenuOpen}
        onClose={() => setMobileMenuOpen(false)}
        slotProps={{
          paper: {
            sx: {
              width: 280,
              bgcolor: "var(--background)",
              p: 3,
            },
          },
        }}
      >
        <Box className="flex justify-between items-center mb-8 border-b border-[rgba(46,36,32,0.1)] pb-4">
          <span className="logo" style={{ fontSize: "1.25rem" }}>
            DINORAH
          </span>
          <IconButton onClick={() => setMobileMenuOpen(false)}>
            <CloseIcon />
          </IconButton>
        </Box>

        <div className="flex flex-col gap-6">
          <a
            href="/"
            onClick={(e) => {
              e.preventDefault();
              onSelectTab("home");
              setMobileMenuOpen(false);
            }}
            className="nav-link text-left"
            style={{ fontSize: "0.85rem", letterSpacing: "0.3em", textTransform: "uppercase", color: "var(--foreground)", textDecoration: "none" }}
          >
            Home
          </a>
          <a
            href="/products"
            onClick={(e) => {
              e.preventDefault();
              onSelectTab("products");
              setMobileMenuOpen(false);
            }}
            className="nav-link text-left"
            style={{ fontSize: "0.85rem", letterSpacing: "0.3em", textTransform: "uppercase", color: "var(--muted)", textDecoration: "none" }}
          >
            Catalog
          </a>
          <a
            href="/cart"
            onClick={(e) => {
              e.preventDefault();
              onSelectTab("cart");
              setMobileMenuOpen(false);
            }}
            className="nav-link text-left"
            style={{ fontSize: "0.85rem", letterSpacing: "0.3em", textTransform: "uppercase", color: "var(--muted)", textDecoration: "none" }}
          >
            Shopping Bag
          </a>
          <a
            href="#collections"
            onClick={(e) => {
              e.preventDefault();
              handleNavClick("collections");
            }}
            className="nav-link text-left"
            style={{ fontSize: "0.85rem", letterSpacing: "0.3em", textTransform: "uppercase", color: "var(--muted)", textDecoration: "none" }}
          >
            Collections
          </a>
          <a
            href="#about"
            onClick={(e) => {
              e.preventDefault();
              handleNavClick("about");
            }}
            className="nav-link text-left"
            style={{ fontSize: "0.85rem", letterSpacing: "0.3em", textTransform: "uppercase", color: "var(--muted)", textDecoration: "none" }}
          >
            About
          </a>
          <a
            href="#contact"
            onClick={(e) => {
              e.preventDefault();
              handleNavClick("contact");
            }}
            className="nav-link text-left"
            style={{ fontSize: "0.85rem", letterSpacing: "0.3em", textTransform: "uppercase", color: "var(--muted)", textDecoration: "none" }}
          >
            Contact
          </a>

          <hr className="border-[rgba(46,36,32,0.1)] my-2" />

          {!user ? (
            <div className="flex flex-col gap-3">
              <button
                className="button text-center w-full"
                onClick={() => {
                  onSelectTab("login");
                  setMobileMenuOpen(false);
                }}
              >
                Sign In
              </button>
              <button
                className="button button-gold text-center w-full"
                onClick={() => {
                  onSelectTab("register");
                  setMobileMenuOpen(false);
                }}
              >
                Join Dinorah
              </button>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              <div className="p-3 bg-[rgba(184,147,92,0.1)] rounded mb-2">
                <div className="text-sm font-semibold">{user.name}</div>
                <div className="text-xs text-[#8B7F76]">{user.email}</div>
              </div>

              <button
                className="button text-center w-full"
                onClick={() => {
                  onSelectTab("products");
                  setMobileMenuOpen(false);
                }}
              >
                Browse Catalog
              </button>

              {user.role === "admin" && (
                <button
                  className="button text-center w-full"
                  onClick={() => {
                    onSelectTab("admin");
                    setMobileMenuOpen(false);
                  }}
                >
                  Admin Suite
                </button>
              )}

              <button
                className="button button-gold text-center w-full mt-2"
                onClick={() => {
                  logout();
                  onSelectTab("home");
                  setMobileMenuOpen(false);
                }}
              >
                Sign Out
              </button>
            </div>
          )}
        </div>
      </Drawer>
    </header>
  );
};
