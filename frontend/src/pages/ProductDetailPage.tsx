import React, { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { Product } from "../types/product.types";
import { fetchProductById } from "../services/product.service";
import { useAuth } from "../hooks/useAuth";
import { useAppDispatch } from "../store/store";
import { addItemToCart } from "../store/slices/cartSlice";
import {
  ArrowBack as ArrowBackIcon,
  VerifiedUserOutlined,
  CheckCircleOutlined,
  AutoAwesomeOutlined,
  LocalShippingOutlined,
  ShieldOutlined,
  DiamondOutlined,
  WorkspacePremiumOutlined,
  ChatBubbleOutlineOutlined,
  LocalMallOutlined,
  Add,
  Remove,
} from "@mui/icons-material";
import { CircularProgress, Alert, TextField, IconButton } from "@mui/material";

export const ProductDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { user } = useAuth();

  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Cart selection state
  const [selectedQuantity, setSelectedQuantity] = useState<number>(1);
  const [addedToCartToast, setAddedToCartToast] = useState<boolean>(false);

  // Gallery state
  const [activeImageIndex, setActiveImageIndex] = useState<number>(0);

  // Inquiry form state
  const [inquiryName, setInquiryName] = useState<string>(user?.name || "");
  const [inquiryEmail, setInquiryEmail] = useState<string>(user?.email || "");
  const [inquiryPhone, setInquiryPhone] = useState<string>("");
  const [inquiryNotes, setInquiryNotes] = useState<string>("");
  const [inquirySent, setInquirySent] = useState<boolean>(false);
  const [submittingInquiry, setSubmittingInquiry] = useState<boolean>(false);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
    async function loadProduct() {
      if (!id) return;
      try {
        setLoading(true);
        setError(null);
        const data = await fetchProductById(Number(id));
        setProduct(data);
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : "Unable to load piece details.");
      } finally {
        setLoading(false);
      }
    }
    loadProduct();
  }, [id]);

  useEffect(() => {
    if (user) {
      if (!inquiryName) setInquiryName(user.name);
      if (!inquiryEmail) setInquiryEmail(user.email);
    }
  }, [user]);

  const handleInquirySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmittingInquiry(true);
    setTimeout(() => {
      setSubmittingInquiry(false);
      setInquirySent(true);
      setInquiryNotes("");
    }, 800);
  };

  const handleAddToCart = () => {
    if (!product || product.stock <= 0) return;
    dispatch(
      addItemToCart({
        productId: product.id,
        quantity: selectedQuantity,
        productSnapshot: {
          name: product.name,
          slug: product.slug,
          image: product.imageUrl,
          price: product.price,
          stock: product.stock,
          material: product.material,
          gemstone: product.gemstone,
        },
      })
    );
    setAddedToCartToast(true);
    setTimeout(() => setAddedToCartToast(false), 5000);
  };

  if (loading) {
    return (
      <div
        style={{
          minHeight: "80vh",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#F8F5F0",
          gap: "18px",
        }}
      >
        <CircularProgress sx={{ color: "#B4935A" }} size={42} />
        <p
          style={{
            fontFamily: "'Cormorant Garamond', Georgia, serif",
            fontStyle: "italic",
            fontSize: "20px",
            color: "#96733E",
          }}
        >
          Presenting Atelier Creation...
        </p>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div
        style={{
          minHeight: "70vh",
          backgroundColor: "#F8F5F0",
          padding: "80px 24px",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <div
          style={{
            maxWidth: "540px",
            textAlign: "center",
            backgroundColor: "#FFFFFF",
            padding: "48px 32px",
            borderRadius: "20px",
            border: "1px solid #E5DCD1",
            boxShadow: "0 10px 30px rgba(43,33,29,0.06)",
          }}
        >
          <DiamondOutlined sx={{ fontSize: 50, color: "#B4935A", mb: 2 }} />
          <h2
            style={{
              fontFamily: "'Cormorant Garamond', Georgia, serif",
              fontSize: "30px",
              color: "#2B211D",
              marginBottom: "12px",
              fontWeight: 400,
            }}
          >
            Piece Not Found
          </h2>
          <p style={{ color: "#81766E", fontSize: "14px", lineHeight: 1.6, marginBottom: "28px" }}>
            {error || "The requested jewelry piece could not be retrieved from our active vault."}
          </p>
          <button
            onClick={() => navigate("/products")}
            style={{
              backgroundColor: "#2B211D",
              color: "#F8F5F0",
              padding: "12px 28px",
              borderRadius: "9999px",
              fontSize: "12px",
              fontWeight: 600,
              letterSpacing: "0.2em",
              textTransform: "uppercase",
              border: "none",
              cursor: "pointer",
            }}
          >
            Return to Catalog
          </button>
        </div>
      </div>
    );
  }

  // Gallery images (main image + multiple luxury presentation perspectives)
  const galleryImages = [
    { label: "Studio Portrait", url: product.imageUrl },
    { label: "Gemstone Focus", url: product.imageUrl },
    { label: "Goldsmith Angle", url: product.imageUrl },
  ];

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
            marginBottom: "36px",
          }}
        >
          <button
            onClick={() => navigate(-1)}
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
            <ArrowBackIcon sx={{ fontSize: 16 }} />
            Back to Collection
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
            {product.categoryName && (
              <>
                <Link
                  to={`/products?category=${product.categorySlug || product.categoryName.toLowerCase()}`}
                  style={{ color: "#81766E", textDecoration: "none" }}
                >
                  {product.categoryName}
                </Link>{" "}
                /{" "}
              </>
            )}
            <span style={{ color: "#2B211D", fontWeight: 500 }}>{product.name}</span>
          </nav>
        </div>

        {/* Main Product Showcase Grid */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(340px, 1fr))",
            gap: "48px",
            alignItems: "start",
          }}
        >
          {/* LEFT: Multi-Image Showcase & Gallery */}
          <div>
            {/* Primary Featured Image Frame */}
            <div
              style={{
                position: "relative",
                width: "100%",
                aspectRatio: "1 / 1",
                backgroundColor: "#FCFAF8",
                borderRadius: "24px",
                overflow: "hidden",
                border: "1px solid #EAE2D7",
                boxShadow: "0 12px 36px rgba(43, 33, 29, 0.05)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <img
                src={galleryImages[activeImageIndex].url}
                alt={product.name}
                style={{
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                  transition: "transform 0.5s ease",
                }}
              />

              {/* Atelier Badge */}
              <div
                style={{
                  position: "absolute",
                  bottom: "16px",
                  left: "16px",
                  right: "16px",
                  backgroundColor: "rgba(255, 255, 255, 0.94)",
                  backdropFilter: "blur(10px)",
                  padding: "10px 16px",
                  borderRadius: "12px",
                  border: "1px solid rgba(180, 147, 90, 0.25)",
                  display: "flex",
                  alignItems: "center",
                  gap: "10px",
                  boxShadow: "0 4px 16px rgba(43,33,29,0.08)",
                }}
              >
                <VerifiedUserOutlined sx={{ color: "#B4935A", fontSize: 20 }} />
                <span style={{ fontSize: "11px", color: "#2B211D", fontWeight: 500, letterSpacing: "0.04em" }}>
                  Dinorah Atelier Hallmarked & Certificate of Authenticity Guaranteed
                </span>
              </div>

              {/* Featured Ribbon */}
              {product.isFeatured && (
                <div
                  style={{
                    position: "absolute",
                    top: "16px",
                    left: "16px",
                    backgroundColor: "#2B211D",
                    color: "#F8F5F0",
                    fontSize: "10px",
                    fontWeight: 600,
                    letterSpacing: "0.2em",
                    textTransform: "uppercase",
                    padding: "6px 12px",
                    borderRadius: "6px",
                  }}
                >
                  Featured Haute Piece
                </div>
              )}
            </div>

            {/* Gallery Thumbnail Strip */}
            <div
              style={{
                display: "flex",
                gap: "14px",
                marginTop: "18px",
                justifyContent: "flex-start",
              }}
            >
              {galleryImages.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveImageIndex(idx)}
                  style={{
                    width: "84px",
                    height: "84px",
                    borderRadius: "14px",
                    overflow: "hidden",
                    border: activeImageIndex === idx ? "2px solid #B4935A" : "1px solid #EAE2D7",
                    padding: 0,
                    cursor: "pointer",
                    backgroundColor: "#FCFAF8",
                    boxShadow: activeImageIndex === idx ? "0 4px 12px rgba(180, 147, 90, 0.25)" : "none",
                    opacity: activeImageIndex === idx ? 1 : 0.7,
                    transition: "all 0.2s ease",
                  }}
                >
                  <img src={img.url} alt={img.label} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                </button>
              ))}
            </div>

            {/* Luxury Service Highlights */}
            <div
              style={{
                marginTop: "32px",
                display: "grid",
                gridTemplateColumns: "repeat(3, 1fr)",
                gap: "12px",
                backgroundColor: "#FCFAF8",
                padding: "20px 16px",
                borderRadius: "16px",
                border: "1px solid #EAE2D7",
                textAlign: "center",
              }}
            >
              <div>
                <LocalShippingOutlined sx={{ color: "#B4935A", fontSize: 24, mb: 0.5 }} />
                <div style={{ fontSize: "11px", fontWeight: 600, color: "#2B211D" }}>Discreet Shipping</div>
                <div style={{ fontSize: "10px", color: "#81766E" }}>Insured White-Glove</div>
              </div>
              <div>
                <ShieldOutlined sx={{ color: "#B4935A", fontSize: 24, mb: 0.5 }} />
                <div style={{ fontSize: "11px", fontWeight: 600, color: "#2B211D" }}>Lifetime Atelier</div>
                <div style={{ fontSize: "10px", color: "#81766E" }}>Cleaning & Care</div>
              </div>
              <div>
                <WorkspacePremiumOutlined sx={{ color: "#B4935A", fontSize: 24, mb: 0.5 }} />
                <div style={{ fontSize: "11px", fontWeight: 600, color: "#2B211D" }}>Bespoke Resizing</div>
                <div style={{ fontSize: "10px", color: "#81766E" }}>Complimentary</div>
              </div>
            </div>
          </div>

          {/* RIGHT: Clear Description, Full Specs & Concierge Inquiry */}
          <div
            style={{
              backgroundColor: "#FCFAF8",
              padding: "36px 40px",
              borderRadius: "24px",
              border: "1px solid #EAE2D7",
              boxShadow: "0 12px 36px rgba(43, 33, 29, 0.04)",
            }}
          >
            {/* Category Tag & Carat Weight */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "12px" }}>
              <span
                style={{
                  fontSize: "11px",
                  fontWeight: 600,
                  letterSpacing: "0.24em",
                  textTransform: "uppercase",
                  color: "#96733E",
                }}
              >
                {product.categoryName || "Fine Haute Joaillerie"}
              </span>
              {product.caratWeight && (
                <span
                  style={{
                    backgroundColor: "rgba(180, 147, 90, 0.12)",
                    border: "1px solid rgba(180, 147, 90, 0.3)",
                    padding: "4px 10px",
                    borderRadius: "6px",
                    fontSize: "11px",
                    fontWeight: 600,
                    color: "#96733E",
                  }}
                >
                  {product.caratWeight}
                </span>
              )}
            </div>

            {/* Product Title */}
            <h1
              style={{
                fontFamily: "'Cormorant Garamond', Georgia, serif",
                fontSize: "36px",
                fontWeight: 400,
                color: "#2B211D",
                lineHeight: 1.2,
                margin: "0 0 16px 0",
              }}
            >
              {product.name}
            </h1>

            {/* Price Presentation */}
            <div
              style={{
                display: "flex",
                alignItems: "baseline",
                gap: "12px",
                marginBottom: "20px",
                paddingBottom: "20px",
                borderBottom: "1px solid #EAE2D7",
              }}
            >
              <span
                style={{
                  fontFamily: "'Cormorant Garamond', Georgia, serif",
                  fontSize: "34px",
                  fontWeight: 600,
                  color: "#2B211D",
                }}
              >
                ${Number(product.price).toLocaleString("en-US", { minimumFractionDigits: 2 })}
              </span>
              <span style={{ fontSize: "11px", color: "#81766E", letterSpacing: "0.15em", textTransform: "uppercase" }}>
                USD • Tax Included
              </span>
            </div>

            {/* Added to Bag Toast */}
            {addedToCartToast && (
              <div
                style={{
                  marginBottom: "20px",
                  backgroundColor: "rgba(46, 125, 50, 0.08)",
                  border: "1px solid rgba(46, 125, 50, 0.25)",
                  borderRadius: "14px",
                  padding: "12px 18px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: "12px",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <CheckCircleOutlined sx={{ color: "#2E7D32", fontSize: 18 }} />
                  <span style={{ fontSize: "12px", color: "#1B5E20", fontWeight: 500 }}>
                    Piece added to your shopping bag!
                  </span>
                </div>
                <button
                  onClick={() => navigate("/cart")}
                  style={{
                    backgroundColor: "#2B211D",
                    color: "#F8F5F0",
                    border: "none",
                    padding: "6px 14px",
                    borderRadius: "9999px",
                    fontSize: "10px",
                    fontWeight: 600,
                    letterSpacing: "0.14em",
                    textTransform: "uppercase",
                    cursor: "pointer",
                  }}
                >
                  View Bag
                </button>
              </div>
            )}

            {/* Add to Shopping Bag Section */}
            <div
              style={{
                marginBottom: "32px",
                padding: "20px",
                backgroundColor: "#F8F5F0",
                borderRadius: "18px",
                border: "1px solid #EAE2D7",
                display: "flex",
                flexDirection: "column",
                gap: "16px",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <span style={{ fontSize: "11px", letterSpacing: "0.15em", textTransform: "uppercase", fontWeight: 600, color: "#2B211D" }}>
                  Acquisition Quantity
                </span>
                <span
                  style={{
                    fontSize: "11px",
                    fontWeight: 600,
                    color: product.stock > 0 ? "#2E7D32" : "#d32f2f",
                  }}
                >
                  {product.stock > 0 ? `In Stock (${product.stock} available)` : "Currently Unavailable"}
                </span>
              </div>

              <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
                {/* Quantity Stepper */}
                <div
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    border: "1px solid #D5CBBF",
                    borderRadius: "9999px",
                    backgroundColor: "#FFFFFF",
                    padding: "4px",
                  }}
                >
                  <IconButton
                    size="small"
                    onClick={() => setSelectedQuantity((q) => Math.max(1, q - 1))}
                    disabled={selectedQuantity <= 1 || product.stock <= 0}
                    sx={{ color: "#2B211D", padding: "4px" }}
                  >
                    <Remove sx={{ fontSize: 16 }} />
                  </IconButton>

                  <span style={{ minWidth: "32px", textAlign: "center", fontSize: "14px", fontWeight: 600, color: "#2B211D" }}>
                    {selectedQuantity}
                  </span>

                  <IconButton
                    size="small"
                    onClick={() => setSelectedQuantity((q) => Math.min(product.stock, q + 1))}
                    disabled={selectedQuantity >= product.stock}
                    sx={{ color: "#2B211D", padding: "4px" }}
                  >
                    <Add sx={{ fontSize: 16 }} />
                  </IconButton>
                </div>

                {/* Add to Cart Button */}
                <button
                  onClick={handleAddToCart}
                  disabled={product.stock <= 0}
                  style={{
                    flex: 1,
                    backgroundColor: product.stock <= 0 ? "#C2BAAF" : "#2B211D",
                    color: "#F8F5F0",
                    padding: "14px 24px",
                    borderRadius: "9999px",
                    fontSize: "11px",
                    fontWeight: 600,
                    letterSpacing: "0.2em",
                    textTransform: "uppercase",
                    border: "none",
                    cursor: product.stock <= 0 ? "not-allowed" : "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "10px",
                    boxShadow: product.stock > 0 ? "0 4px 16px rgba(43, 33, 29, 0.2)" : "none",
                    transition: "all 0.25s ease",
                  }}
                >
                  <LocalMallOutlined sx={{ fontSize: 16, color: "#B4935A" }} />
                  {product.stock > 0 ? "Add to Shopping Bag" : "Out of Stock"}
                </button>
              </div>
            </div>

            {/* Clear Description Section */}
            <div style={{ marginBottom: "32px" }}>
              <h3
                style={{
                  fontSize: "11px",
                  fontWeight: 600,
                  letterSpacing: "0.2em",
                  textTransform: "uppercase",
                  color: "#81766E",
                  marginBottom: "10px",
                }}
              >
                Atelier Description & Design Story
              </h3>
              <p
                style={{
                  fontSize: "15px",
                  lineHeight: "1.8",
                  color: "#3E332D",
                  fontWeight: 300,
                  margin: 0,
                }}
              >
                {product.description}
              </p>
            </div>

            {/* Detailed Technical Specifications Table */}
            <div style={{ marginBottom: "36px" }}>
              <h3
                style={{
                  fontSize: "11px",
                  fontWeight: 600,
                  letterSpacing: "0.2em",
                  textTransform: "uppercase",
                  color: "#81766E",
                  marginBottom: "14px",
                }}
              >
                Technical Specifications
              </h3>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(2, 1fr)",
                  gap: "14px",
                  backgroundColor: "#F8F5F0",
                  padding: "20px",
                  borderRadius: "16px",
                  border: "1px solid #EAE2D7",
                }}
              >
                <div>
                  <span style={{ fontSize: "10px", color: "#81766E", textTransform: "uppercase", letterSpacing: "0.14em", display: "block", marginBottom: "2px" }}>
                    Precious Metal
                  </span>
                  <strong style={{ fontSize: "13px", color: "#2B211D", fontWeight: 600 }}>
                    {product.material || "18K Solid Yellow Gold"}
                  </strong>
                </div>

                <div>
                  <span style={{ fontSize: "10px", color: "#81766E", textTransform: "uppercase", letterSpacing: "0.14em", display: "block", marginBottom: "2px" }}>
                    Gemstone Specification
                  </span>
                  <strong style={{ fontSize: "13px", color: "#2B211D", fontWeight: 600 }}>
                    {product.gemstone || "Brilliant Cut Diamond"}
                  </strong>
                </div>

                <div>
                  <span style={{ fontSize: "10px", color: "#81766E", textTransform: "uppercase", letterSpacing: "0.14em", display: "block", marginBottom: "2px" }}>
                    Total Carat Weight
                  </span>
                  <strong style={{ fontSize: "13px", color: "#2B211D", fontWeight: 600 }}>
                    {product.caratWeight || "Certified Cut"}
                  </strong>
                </div>

                <div>
                  <span style={{ fontSize: "10px", color: "#81766E", textTransform: "uppercase", letterSpacing: "0.14em", display: "block", marginBottom: "2px" }}>
                    Atelier Availability
                  </span>
                  <strong style={{ fontSize: "13px", color: product.inStock ? "#2E7D32" : "#96733E", fontWeight: 600 }}>
                    {product.inStock ? "Available for Immediate Acquisition" : "Bespoke Made to Order"}
                  </strong>
                </div>
              </div>
            </div>

            {/* Concierge Inquiry & Viewing Reservation Form */}
            <div
              style={{
                backgroundColor: "#FFFFFF",
                padding: "26px 28px",
                borderRadius: "18px",
                border: "1px solid #E5DDD2",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "6px" }}>
                <ChatBubbleOutlineOutlined sx={{ color: "#B4935A", fontSize: 18 }} />
                <h3
                  style={{
                    fontFamily: "'Cormorant Garamond', Georgia, serif",
                    fontSize: "20px",
                    fontWeight: 500,
                    color: "#2B211D",
                    margin: 0,
                  }}
                >
                  Reserve & Inquire with Concierge
                </h3>
              </div>
              <p style={{ fontSize: "12px", color: "#81766E", margin: "0 0 18px 0" }}>
                Connect with our jewelry specialist for private viewings, custom ring sizing, or bespoke customizations.
              </p>

              {inquirySent ? (
                <Alert
                  icon={<CheckCircleOutlined fontSize="inherit" />}
                  severity="success"
                  sx={{
                    bgcolor: "rgba(180, 147, 90, 0.12)",
                    color: "#2B211D",
                    border: "1px solid rgba(180, 147, 90, 0.3)",
                    borderRadius: "12px",
                  }}
                >
                  Thank you! Your private viewing request for <strong>{product.name}</strong> has been received. Our atelier concierge will contact you within 24 hours.
                </Alert>
              ) : (
                <form onSubmit={handleInquirySubmit} style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                    <TextField
                      size="small"
                      label="Your Name"
                      required
                      value={inquiryName}
                      onChange={(e) => setInquiryName(e.target.value)}
                      sx={{
                        "& .MuiOutlinedInput-root": {
                          borderRadius: "10px",
                          fontSize: "13px",
                        },
                      }}
                    />
                    <TextField
                      size="small"
                      label="Email Address"
                      type="email"
                      required
                      value={inquiryEmail}
                      onChange={(e) => setInquiryEmail(e.target.value)}
                      sx={{
                        "& .MuiOutlinedInput-root": {
                          borderRadius: "10px",
                          fontSize: "13px",
                        },
                      }}
                    />
                  </div>

                  <TextField
                    size="small"
                    label="Phone Number (Optional)"
                    value={inquiryPhone}
                    onChange={(e) => setInquiryPhone(e.target.value)}
                    sx={{
                      "& .MuiOutlinedInput-root": {
                        borderRadius: "10px",
                        fontSize: "13px",
                      },
                    }}
                  />

                  <TextField
                    size="small"
                    label="Special requests, sizing requirements, or questions"
                    multiline
                    rows={2}
                    value={inquiryNotes}
                    onChange={(e) => setInquiryNotes(e.target.value)}
                    sx={{
                      "& .MuiOutlinedInput-root": {
                        borderRadius: "10px",
                        fontSize: "13px",
                      },
                    }}
                  />

                  <button
                    type="submit"
                    disabled={submittingInquiry}
                    style={{
                      backgroundColor: "#B4935A",
                      color: "#FFFFFF",
                      padding: "13px 24px",
                      borderRadius: "9999px",
                      fontSize: "11px",
                      fontWeight: 600,
                      letterSpacing: "0.2em",
                      textTransform: "uppercase",
                      border: "none",
                      cursor: submittingInquiry ? "not-allowed" : "pointer",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: "8px",
                      boxShadow: "0 4px 14px rgba(180, 147, 90, 0.3)",
                      transition: "all 0.2s ease",
                      marginTop: "4px",
                    }}
                  >
                    {submittingInquiry ? (
                      <CircularProgress size={16} sx={{ color: "#FFFFFF" }} />
                    ) : (
                      <>
                        <AutoAwesomeOutlined sx={{ fontSize: 15 }} />
                        Inquire with Concierge
                      </>
                    )}
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetailPage;
