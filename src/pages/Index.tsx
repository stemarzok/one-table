import Hero from "@/components/Hero";
import UserLevel from "@/components/UserLevel";
import HowItWorks from "@/components/HowItWorks";
import LevelBenefits from "@/components/LevelBenefits";
import RestaurantList from "@/components/RestaurantList";

const Index = () => {
  return (
    <div className="min-h-screen">
      <Hero />
      <UserLevel />
      <HowItWorks />
      <LevelBenefits />
      <RestaurantList />
    </div>
  );
};

export default Index;
