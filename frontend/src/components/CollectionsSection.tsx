import React from "react";
import { useNavigate } from "react-router-dom";

interface CollectionItem {
  name: string;
  slug: string;
  description: string;
  image: string;
}

const COLLECTIONS: CollectionItem[] = [
  {
    name: "Rings",
    slug: "rings",
    description: "Symbols of eternal commitment",
    image: "/images/collection-rings.jpg",
  },
  {
    name: "Earrings",
    slug: "earrings",
    description: "Graceful accents of elegance",
    image: "/images/collection-earrings.jpg",
  },
  {
    name: "Necklaces",
    slug: "necklaces",
    description: "Delicate chains of beauty",
    image: "/images/collection-necklaces.jpg",
  },
];

export const CollectionsSection: React.FC = () => {
  const navigate = useNavigate();

  const handleCollectionClick = (slug: string) => {
    navigate(`/products?category=${slug}`);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <section id="collections" className="collections">
      <div className="section-header">
        <h2 className="section-title">Curated with Care</h2>
      </div>
      <div className="collections-grid">
        {COLLECTIONS.map((item) => (
          <div
            key={item.slug}
            className="collection-item"
            onClick={() => handleCollectionClick(item.slug)}
            role="button"
            tabIndex={0}
            aria-label={`View ${item.name} collection`}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                handleCollectionClick(item.slug);
              }
            }}
          >
            <div className="collection-image">
              <img src={item.image} alt={item.name} />
            </div>
            <div className="collection-info">
              <h3 className="collection-name">{item.name}</h3>
              <p className="collection-description">{item.description}</p>
              <span className="collection-link">
                Explore {item.name} &rarr;
              </span>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

