import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import Header from "@/components/Header";
import RestaurantList from "@/components/RestaurantList";
import Footer from "@/components/Footer";

const RestaurantsApp = () => {
  const { isLoggedIn, isBusinessMode } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    // Business users cannot access client pages
    if (isBusinessMode) {
      navigate("/dashboard");
      return;
    }
    if (!isLoggedIn) {
      navigate("/auth");
    }
  }, [isLoggedIn, isBusinessMode, navigate]);

  if (!isLoggedIn || isBusinessMode) {
    return null;
  }

  return (
    <div className="min-h-screen">
      <Header />
      <main className="pt-16">
        <RestaurantList />
      </main>
      <Footer />
    </div>
  );
};

export default RestaurantsApp;
