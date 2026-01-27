import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useBusinessRole } from "@/hooks/useBusinessRole";
import { useAdminRole } from "@/hooks/useAdminRole";
import Header from "@/components/Header";
import Hero from "@/components/Hero";
import ValueProposition from "@/components/ValueProposition";
import HowItWorksEnhanced from "@/components/HowItWorksEnhanced";
import LevelBenefits from "@/components/LevelBenefits";
import FinalCTA from "@/components/FinalCTA";
import Footer from "@/components/Footer";

const Index = () => {
  const { isLoggedIn } = useAuth();
  const navigate = useNavigate();
  const { hasRole: hasBusinessRole, loading: businessRoleLoading } = useBusinessRole();
  const { isAdmin, loading: adminRoleLoading } = useAdminRole();

  useEffect(() => {
    if (isLoggedIn && !businessRoleLoading && !adminRoleLoading) {
      if (hasBusinessRole() || isAdmin) {
        navigate("/dashboard");
      } else {
        navigate("/restaurants");
      }
    }
  }, [isLoggedIn, hasBusinessRole, isAdmin, businessRoleLoading, adminRoleLoading, navigate]);

  if (isLoggedIn) {
    return null;
  }

  return (
    <div className="min-h-screen">
      <Header />
      <Hero />
      <ValueProposition />
      <HowItWorksEnhanced />
      <LevelBenefits />
      <FinalCTA />
      <Footer />
    </div>
  );
};

export default Index;
