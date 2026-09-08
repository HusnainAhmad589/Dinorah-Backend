import React from "react";
import { HeroSection } from "../components/HeroSection";
import { CollectionsSection } from "../components/CollectionsSection";
import { AboutSection } from "../components/AboutSection";
import { ContactSection } from "../components/ContactSection";

interface HomePageProps {
  onNavigateToRegister?: () => void;
  onNavigateToLogin?: () => void;
}

export const HomePage: React.FC<HomePageProps> = () => {
  const handleScrollToCollections = () => {
    const el = document.getElementById("collections");
    if (el) {
      el.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <>
      <HeroSection onExploreClick={handleScrollToCollections} />
      <CollectionsSection />
      <AboutSection />
      <ContactSection />
    </>
  );
};
