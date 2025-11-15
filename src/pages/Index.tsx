import Header from "@/components/Header";
import Hero from "@/components/Hero";
import HowItWorksEnhanced from "@/components/HowItWorksEnhanced";
import LevelBenefits from "@/components/LevelBenefits";
import RestaurantList from "@/components/RestaurantList";
import Footer from "@/components/Footer";

const Index = () => {
  return (
    <div className="min-h-screen">
      <Header />
      <Hero />
      <HowItWorksEnhanced />
      <LevelBenefits />
      <RestaurantList />
      <Footer />
    </div>
  );
};

export default Index;
