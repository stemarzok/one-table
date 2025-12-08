import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import RestaurantList from "@/components/RestaurantList";

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
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="pt-16 pb-16 flex-1">
        <RestaurantList />
      </main>
      <Footer />
    </div>
  );
};

export default RestaurantsApp;
