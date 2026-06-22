import { AboutMiniSection } from "@/app/components/home/AboutMiniSection";
import { GoalsSection } from "@/app/components/home/GoalsSection";
import { HeroSection } from "@/app/components/home/HeroSection";
import { ParametersSection } from "@/app/components/home/ParametersSection";
import { PartnersSection } from "@/app/components/home/PartnersSection";
import { ScrollRevealInit } from "@/app/components/home/ScrollRevealInit";
import { SimulationsSection } from "@/app/components/home/SimulationsSection";
import { SiteFooter } from "@/app/components/home/SiteFooter";
import { SiteNav } from "@/app/components/home/SiteNav";
import { TaglineSection } from "@/app/components/home/TaglineSection";
import { WeatherSection } from "@/app/components/home/WeatherSection";
import styles from "./Home.module.css";

export default function Home() {
  return (
    <main className={styles["home-page"]} id="home">
      <ScrollRevealInit />
      <SiteNav />
      <HeroSection />
      <TaglineSection />
      <GoalsSection />
      <AboutMiniSection />
      <ParametersSection />
      <SimulationsSection />
      <WeatherSection />
      <PartnersSection />
      <SiteFooter />
    </main>
  );
}
