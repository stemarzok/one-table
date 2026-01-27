import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { roleCache } from "@/lib/roleCache";

interface BusinessRole {
  restaurant_id: string;
  role: 'owner' | 'manager' | 'staff';
}

export const useBusinessRole = () => {
  const { profile, isLoggedIn } = useAuth();
  const [businessRoles, setBusinessRoles] = useState<BusinessRole[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBusinessRoles = async () => {
      if (!isLoggedIn || !profile?.id) {
        setBusinessRoles([]);
        setLoading(false);
        return;
      }

      try {
        // Use cached roles - this avoids repeated queries
        const cachedRoles = await roleCache.fetchAndCache(profile.id);
        setBusinessRoles(cachedRoles.businessRoles);
      } catch (error) {
        console.error('Error fetching business roles:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchBusinessRoles();
  }, [isLoggedIn, profile]);

  const hasRole = (restaurantId?: string, requiredRole?: 'owner' | 'manager' | 'staff'): boolean => {
    if (!restaurantId) {
      return businessRoles.length > 0;
    }

    const role = businessRoles.find(r => r.restaurant_id === restaurantId);
    if (!role) return false;

    if (!requiredRole) return true;

    // Role hierarchy: owner > manager > staff
    const roleHierarchy = { owner: 3, manager: 2, staff: 1 };
    const userRoleLevel = roleHierarchy[role.role];
    const requiredRoleLevel = roleHierarchy[requiredRole];

    return userRoleLevel >= requiredRoleLevel;
  };

  return { businessRoles, hasRole, loading };
};
