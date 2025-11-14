import Header from "@/components/Header";
import Hero from "@/components/Hero";
import UserLevel from "@/components/UserLevel";
import HowItWorks from "@/components/HowItWorks";
import LevelBenefits from "@/components/LevelBenefits";
import RestaurantList from "@/components/RestaurantList";
import Footer from "@/components/Footer";

const Index = () => {
  return (
    <div className="min-h-screen">
      <Header />
      <Hero />
      <UserLevel />
      <HowItWorks />
      <LevelBenefits />
      <RestaurantList />
      <Footer />
    </div>
  );
};

export default Index;
