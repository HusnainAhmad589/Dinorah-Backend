import React, { useEffect, useState, useMemo } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { Product, Category } from "../types/product.types";
import { fetchProducts, fetchCategories } from "../services/product.service";
import { useAuth } from "../hooks/useAuth";
import { useAppDispatch } from "../store/store";
import { addItemToCart } from "../store/slices/cartSlice";
import {
  Search as SearchIcon,
  DiamondOutlined,
  AutoAwesomeOutlined,
  LocalMallOutlined,
  CheckCircleOutlined,
} from "@mui/icons-material";
import {
  CircularProgress,
  TextField,
  InputAdornment,
  MenuItem,
  Select,
  FormControl,
  Alert,
} from "@mui/material";

export const ProductsPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>(searchParams.get("category") || "all");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [priceRange, setPriceRange] = useState<string>("all");
  const [justAddedId, setJustAddedId] = useState<number | null>(null);
  const [sortBy, setSortBy] = useState<"featured" | "price_asc" | "price_desc" | "name_asc">("featured");
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Sync state if URL query param changes
  useEffect(() => {
    const categoryParam = searchParams.get("category");
    setSelectedCategory(categoryParam || "all");
  }, [searchParams]);

  const handleCategoryChange = (slug: string) => {
    setSelectedCategory(slug);
    const newParams = new URLSearchParams(searchParams);
    if (slug === "all") {
      newParams.delete("category");
    } else {
      newParams.set("category", slug);
    }
    setSearchParams(newParams);
  };

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        const [cats, prods] = await Promise.all([
          fetchCategories().catch(() => []),
          fetchProducts(),
        ]);
        setCategories(cats);
        setProducts(prods);
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : "Failed to load collection catalog.");
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  // Filter and sort products client-side for ultra-fast responsiveness
  const filteredProducts = useMemo(() => {
    let result = [...products];

    if (selectedCategory !== "all") {
      const target = selectedCategory.toLowerCase().trim();
      result = result.filter((p) => {
        const pSlug = (p.categorySlug || "").toLowerCase();
        const pName = (p.categoryName || "").toLowerCase();

        return (
          pSlug === target ||
          pName === target ||
          (target === "rings" && (pSlug.includes("ring") || pName.includes("ring"))) ||
          (target === "earrings" && (pSlug.includes("earring") || pName.includes("earring"))) ||
          (target === "necklaces" && (pSlug.includes("necklace") || pName.includes("necklace")))
        );
      });
    }

    if (priceRange === "under5k") {
      result = result.filter((p) => p.price < 5000);
    } else if (priceRange === "5k-10k") {
      result = result.filter((p) => p.price >= 5000 && p.price <= 10000);
    } else if (priceRange === "10k-25k") {
      result = result.filter((p) => p.price > 10000 && p.price <= 25000);
    } else if (priceRange === "above25k") {
      result = result.filter((p) => p.price > 25000);
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.description.toLowerCase().includes(q) ||
          p.material.toLowerCase().includes(q) ||
          p.gemstone.toLowerCase().includes(q)
      );
    }

    if (sortBy === "price_asc") {
      result.sort((a, b) => a.price - b.price);
    } else if (sortBy === "price_desc") {
      result.sort((a, b) => b.price - a.price);
    } else if (sortBy === "name_asc") {
      result.sort((a, b) => a.name.localeCompare(b.name));
    } else {
      result.sort((a, b) => (b.isFeatured ? 1 : 0) - (a.isFeatured ? 1 : 0));
    }

    return result;
  }, [products, selectedCategory, searchQuery, priceRange, sortBy]);

  const handleQuickAddToCart = (e: React.MouseEvent, product: Product) => {
    e.stopPropagation();
    if (product.stock <= 0) return;
    dispatch(
      addItemToCart({
        productId: product.id,
        quantity: 1,
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
    setJustAddedId(product.id);
    setTimeout(() => setJustAddedId(null), 2500);
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        backgroundColor: "#F8F5F0",
        paddingTop: "60px",
        paddingBottom: "100px",
        paddingLeft: "24px",
        paddingRight: "24px",
        boxSizing: "border-box",
        width: "100%",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
      }}
    >
      <div style={{ width: "100%", maxWidth: "1680px", margin: "0 auto" }}>
        
        {/* CENTERED Page Header */}
        <div
          style={{
            textAlign: "center",
            maxWidth: "760px",
            margin: "0 auto 44px auto",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            animation: "luxuryFadeInUp 0.6s cubic-bezier(0.16, 1, 0.3, 1) both",
          }}
        >
          {/* Atelier Badge */}
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "8px",
              padding: "6px 16px",
              backgroundColor: "rgba(180, 147, 90, 0.12)",
              border: "1px solid rgba(180, 147, 90, 0.3)",
              borderRadius: "9999px",
              fontSize: "11px",
              fontWeight: 600,
              color: "#96733E",
              letterSpacing: "0.22em",
              textTransform: "uppercase",
              marginBottom: "16px",
            }}
          >
            <AutoAwesomeOutlined sx={{ fontSize: 13, color: "#B4935A" }} />
            <span>
              {user ? `Privileged Client Vault • Welcome ${user.name}` : "Exclusive Atelier Showcase"}
            </span>
          </div>

          {/* Centered Title */}
          <h1
            style={{
              fontFamily: "'Cormorant Garamond', Georgia, serif",
              fontSize: "46px",
              fontWeight: 300,
              color: "#2B211D",
              margin: "0 0 12px 0",
              letterSpacing: "-0.01em",
              textAlign: "center",
              lineHeight: 1.15,
            }}
          >
            The Dinorah <span style={{ fontStyle: "italic", fontWeight: 400, color: "#B4935A" }}>Collection</span>
          </h1>

          {/* Centered Subtitle */}
          <p
            style={{
              fontSize: "14px",
              color: "#81766E",
              fontWeight: 300,
              lineHeight: 1.65,
              maxWidth: "600px",
              margin: "0 auto",
              textAlign: "center",
              fontFamily: "'Montserrat', sans-serif",
            }}
          >
            Discover our curated portfolio of handcrafted fine jewelry, featuring certified natural gemstones,
            ethically sourced diamonds, and master goldsmith craftsmanship.
          </p>
        </div>

        {/* Filter and Search Controls Bar */}
        <div
          style={{
            marginBottom: "36px",
            backgroundColor: "#FCFAF8",
            padding: "16px 20px",
            borderRadius: "16px",
            border: "1px solid #E8E1D8",
            boxShadow: "0 4px 20px rgba(43, 33, 29, 0.03)",
            display: "flex",
            flexWrap: "wrap",
            gap: "16px",
            justifyContent: "space-between",
            alignItems: "center",
            animation: "luxuryFadeInUp 0.6s cubic-bezier(0.16, 1, 0.3, 1) 0.1s both",
          }}
        >
          {/* Category Navigation Pills */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "6px",
              overflowX: "auto",
              paddingBottom: "4px",
            }}
          >
            <button
              onClick={() => handleCategoryChange("all")}
              style={{
                padding: "7px 16px",
                borderRadius: "9999px",
                fontSize: "11px",
                fontWeight: 600,
                letterSpacing: "0.16em",
                textTransform: "uppercase",
                cursor: "pointer",
                border: "none",
                transition: "all 0.2s",
                backgroundColor: selectedCategory === "all" ? "#2B211D" : "transparent",
                color: selectedCategory === "all" ? "#F8F5F0" : "#81766E",
                boxShadow: selectedCategory === "all" ? "0 2px 8px rgba(43,33,29,0.15)" : "none",
              }}
            >
              All Pieces
            </button>
            {categories.map((cat) => {
              const isSelected =
                selectedCategory.toLowerCase() === cat.slug.toLowerCase() ||
                selectedCategory.toLowerCase() === cat.name.toLowerCase() ||
                (selectedCategory.toLowerCase() === "rings" && cat.slug.toLowerCase().includes("ring")) ||
                (selectedCategory.toLowerCase() === "earrings" && cat.slug.toLowerCase().includes("earring")) ||
                (selectedCategory.toLowerCase() === "necklaces" && cat.slug.toLowerCase().includes("necklace"));

              return (
                <button
                  key={cat.id}
                  onClick={() => handleCategoryChange(cat.slug)}
                  style={{
                    padding: "7px 16px",
                    borderRadius: "9999px",
                    fontSize: "11px",
                    fontWeight: 600,
                    letterSpacing: "0.16em",
                    textTransform: "uppercase",
                    cursor: "pointer",
                    border: "none",
                    transition: "all 0.2s",
                    backgroundColor: isSelected ? "#2B211D" : "transparent",
                    color: isSelected ? "#F8F5F0" : "#81766E",
                    boxShadow: isSelected ? "0 2px 8px rgba(43,33,29,0.15)" : "none",
                  }}
                >
                  {cat.name}
                </button>
              );
            })}
          </div>

          {/* Search & Sort Controls */}
          <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap" }}>
            <TextField
              size="small"
              placeholder="Search diamonds, emeralds..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              sx={{
                width: { xs: "100%", sm: "220px" },
                "& .MuiOutlinedInput-root": {
                  bgcolor: "#FFFFFF",
                  borderRadius: "9999px",
                  fontSize: "0.825rem",
                  border: "1px solid #E2DAD0",
                  "& fieldset": { border: "none" },
                },
              }}
              slotProps={{
                input: {
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon sx={{ color: "#81766E", fontSize: 18 }} />
                    </InputAdornment>
                  ),
                },
              }}
            />

            {/* Price Filter Selector */}
            <FormControl size="small" sx={{ width: "145px" }}>
              <Select
                value={priceRange}
                onChange={(e) => setPriceRange(e.target.value)}
                displayEmpty
                sx={{
                  bgcolor: "#FFFFFF",
                  borderRadius: "9999px",
                  fontSize: "0.78rem",
                  border: "1px solid #E2DAD0",
                  "& fieldset": { border: "none" },
                }}
              >
                <MenuItem value="all">All Prices</MenuItem>
                <MenuItem value="under5k">Under $5,000</MenuItem>
                <MenuItem value="5k-10k">$5,000 – $10,000</MenuItem>
                <MenuItem value="10k-25k">$10,000 – $25,000</MenuItem>
                <MenuItem value="above25k">$25,000+</MenuItem>
              </Select>
            </FormControl>

            <FormControl size="small" sx={{ width: "135px" }}>
              <Select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                displayEmpty
                sx={{
                  bgcolor: "#FFFFFF",
                  borderRadius: "9999px",
                  fontSize: "0.78rem",
                  border: "1px solid #E2DAD0",
                  "& fieldset": { border: "none" },
                }}
              >
                <MenuItem value="featured">Featured</MenuItem>
                <MenuItem value="price_asc">Price: Low - High</MenuItem>
                <MenuItem value="price_desc">Price: High - Low</MenuItem>
                <MenuItem value="name_asc">Name: A - Z</MenuItem>
              </Select>
            </FormControl>
          </div>
        </div>

        {/* Catalog Grid — AT LEAST 4 COMPACT CARDS PER ROW ON DESKTOP */}
        {loading ? (
          <div
            style={{
              minHeight: "40vh",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              gap: "16px",
            }}
          >
            <CircularProgress sx={{ color: "#B4935A" }} size={38} />
            <p
              style={{
                fontFamily: "'Cormorant Garamond', Georgia, serif",
                fontStyle: "italic",
                fontSize: "19px",
                color: "#B4935A",
              }}
            >
              Accessing Dinorah fine jewellery vault...
            </p>
          </div>
        ) : error ? (
          <Alert severity="error" sx={{ my: 4 }}>
            {error}
          </Alert>
        ) : filteredProducts.length === 0 ? (
          <div
            style={{
              textAlign: "center",
              padding: "60px 24px",
              backgroundColor: "#FCFAF8",
              borderRadius: "20px",
              border: "1px solid #E8E1D8",
            }}
          >
            <DiamondOutlined sx={{ fontSize: 44, color: "#B4935A", mb: 2 }} />
            <h3
              style={{
                fontFamily: "'Cormorant Garamond', Georgia, serif",
                fontSize: "24px",
                color: "#2B211D",
                marginBottom: "8px",
                fontWeight: 400,
              }}
            >
              No matching pieces found
            </h3>
            <p style={{ fontSize: "13px", color: "#81766E", maxWidth: "380px", margin: "0 auto 24px auto" }}>
              Try adjusting your search criteria or explore our complete catalog.
            </p>
            <button
              onClick={() => {
                handleCategoryChange("all");
                setSearchQuery("");
                setPriceRange("all");
              }}
              style={{
                backgroundColor: "#2B211D",
                color: "#F8F5F0",
                padding: "10px 22px",
                borderRadius: "9999px",
                fontSize: "11px",
                fontWeight: 600,
                letterSpacing: "0.2em",
                textTransform: "uppercase",
                cursor: "pointer",
                border: "none",
              }}
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
              gap: "24px",
              width: "100%",
            }}
          >
            {filteredProducts.map((product, index) => (
              <div
                key={product.id}
                onClick={() => navigate(`/products/${product.id}`)}
                className="group"
                style={{
                  cursor: "pointer",
                  display: "flex",
                  flexDirection: "column",
                  backgroundColor: "#FCFAF8",
                  borderRadius: "16px",
                  overflow: "hidden",
                  border: "1px solid #E8E1D8",
                  boxShadow: "0 4px 16px rgba(43, 33, 29, 0.03)",
                  transition: "all 0.35s cubic-bezier(0.16, 1, 0.3, 1)",
                  animation: `luxuryFadeInUp 0.5s cubic-bezier(0.16, 1, 0.3, 1) ${Math.min(index * 0.06, 0.5)}s both`,
                  boxSizing: "border-box",
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLElement).style.transform = "translateY(-4px)";
                  (e.currentTarget as HTMLElement).style.boxShadow = "0 12px 32px rgba(43, 33, 29, 0.08)";
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLElement).style.transform = "translateY(0)";
                  (e.currentTarget as HTMLElement).style.boxShadow = "0 4px 16px rgba(43, 33, 29, 0.03)";
                }}
              >
                {/* 1:1 / 4:5 Aspect Ratio Image Container */}
                <div
                  style={{
                    position: "relative",
                    aspectRatio: "1 / 1",
                    overflow: "hidden",
                    backgroundColor: "#F2EDE4",
                    width: "100%",
                  }}
                >
                  <img
                    src={product.imageUrl}
                    alt={product.name}
                    style={{
                      width: "100%",
                      height: "100%",
                      objectFit: "cover",
                      transition: "transform 0.6s cubic-bezier(0.16, 1, 0.3, 1)",
                    }}
                    className="group-hover:scale-105"
                  />

                  {/* Hover "VIEW PIECE DETAILS" Button Overlay */}
                  <div
                    style={{
                      position: "absolute",
                      inset: 0,
                      background: "linear-gradient(to top, rgba(0,0,0,0.35) 0%, transparent 60%)",
                      opacity: 0,
                      transition: "opacity 0.25s ease",
                      display: "flex",
                      alignItems: "flex-end",
                      justifyContent: "center",
                      padding: "16px",
                    }}
                    className="group-hover:opacity-100"
                  >
                    <span
                      style={{
                        backgroundColor: "#B4935A",
                        color: "#FCFAF8",
                        fontSize: "10px",
                        fontWeight: 600,
                        letterSpacing: "0.2em",
                        textTransform: "uppercase",
                        padding: "8px 18px",
                        borderRadius: "6px",
                        boxShadow: "0 4px 12px rgba(0,0,0,0.2)",
                      }}
                    >
                      View Piece Details
                    </span>
                  </div>

                  {/* Featured Badge */}
                  {product.isFeatured && (
                    <div
                      style={{
                        position: "absolute",
                        top: "12px",
                        left: "12px",
                        backgroundColor: "rgba(43, 33, 29, 0.9)",
                        color: "#F8F5F0",
                        fontSize: "9px",
                        letterSpacing: "0.2em",
                        textTransform: "uppercase",
                        fontWeight: 600,
                        padding: "4px 8px",
                        borderRadius: "4px",
                      }}
                    >
                      FEATURED
                    </div>
                  )}

                  {/* Carat Weight Badge */}
                  {product.caratWeight && (
                    <div
                      style={{
                        position: "absolute",
                        top: "12px",
                        right: "12px",
                        backgroundColor: "rgba(252, 250, 248, 0.95)",
                        color: "#96733E",
                        fontSize: "10px",
                        fontWeight: 600,
                        padding: "3px 8px",
                        borderRadius: "4px",
                        border: "1px solid #E0D7CC",
                      }}
                    >
                      {product.caratWeight}
                    </div>
                  )}
                </div>

                {/* Card Content with Crisp Alignment */}
                <div
                  style={{
                    padding: "18px 20px 20px 20px",
                    display: "flex",
                    flexDirection: "column",
                    flex: 1,
                    textAlign: "center",
                    justifyContent: "space-between",
                    boxSizing: "border-box",
                  }}
                >
                  <div>
                    {/* Material & Gemstone kicker */}
                    <span
                      style={{
                        fontSize: "9.5px",
                        letterSpacing: "0.22em",
                        textTransform: "uppercase",
                        color: "#B4935A",
                        fontWeight: 600,
                        display: "block",
                        marginBottom: "6px",
                      }}
                    >
                      {product.material} • {product.gemstone}
                    </span>

                    {/* Product Name */}
                    <h3
                      style={{
                        fontFamily: "'Cormorant Garamond', Georgia, serif",
                        fontSize: "20px",
                        fontWeight: 500,
                        color: "#2B211D",
                        margin: "0 0 6px 0",
                        lineHeight: 1.25,
                      }}
                    >
                      {product.name}
                    </h3>

                    {/* Short Description */}
                    <p
                      style={{
                        fontSize: "12px",
                        color: "#81766E",
                        fontWeight: 300,
                        lineHeight: 1.5,
                        margin: "0 0 14px 0",
                        display: "-webkit-box",
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: "vertical",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                      }}
                    >
                      {product.description}
                    </p>
                  </div>

                  {/* Divider & Price Row with Quick Add to Bag */}
                  <div
                    style={{
                      paddingTop: "12px",
                      borderTop: "1px solid #EAE2D7",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      width: "100%",
                      marginTop: "auto",
                    }}
                  >
                    <div style={{ textAlign: "left" }}>
                      <span
                        style={{
                          fontSize: "8.5px",
                          color: "#81766E",
                          letterSpacing: "0.18em",
                          textTransform: "uppercase",
                          fontWeight: 600,
                          display: "block",
                        }}
                      >
                        PRICE (USD)
                      </span>
                      <span
                        style={{
                          fontFamily: "'Cormorant Garamond', Georgia, serif",
                          fontSize: "17px",
                          fontWeight: 600,
                          color: "#2B211D",
                        }}
                      >
                        ${Number(product.price).toLocaleString("en-US", { minimumFractionDigits: 2 })}
                      </span>
                    </div>

                    <button
                      onClick={(e) => handleQuickAddToCart(e, product)}
                      disabled={product.stock <= 0}
                      title={product.stock <= 0 ? "Out of stock" : "Quick Add to Shopping Bag"}
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "5px",
                        backgroundColor: justAddedId === product.id ? "#2E7D32" : product.stock <= 0 ? "#D5CBBF" : "#2B211D",
                        color: "#F8F5F0",
                        border: "none",
                        borderRadius: "9999px",
                        padding: "6px 12px",
                        fontSize: "10px",
                        fontWeight: 600,
                        letterSpacing: "0.12em",
                        textTransform: "uppercase",
                        cursor: product.stock <= 0 ? "not-allowed" : "pointer",
                        transition: "all 0.2s ease",
                        boxShadow: product.stock > 0 ? "0 2px 8px rgba(43,33,29,0.12)" : "none",
                      }}
                    >
                      {justAddedId === product.id ? (
                        <>
                          <CheckCircleOutlined sx={{ fontSize: 13 }} />
                          Added
                        </>
                      ) : (
                        <>
                          <LocalMallOutlined sx={{ fontSize: 13, color: "#B4935A" }} />
                          Add
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
export default ProductsPage;
