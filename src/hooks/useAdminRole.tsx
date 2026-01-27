import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { roleCache } from "@/lib/roleCache";

export type AdminRoleType = 'superadmin' | 'admin' | null;

export const useAdminRole = () => {
  const { profile, isLoggedIn } = useAuth();
  const [isAdmin, setIsAdmin] = useState(false);
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);
  const [adminRole, setAdminRole] = useState<AdminRoleType>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAdminStatus = async () => {
      if (!isLoggedIn || !profile?.id) {
        setIsAdmin(false);
        setIsSuperAdmin(false);
        setAdminRole(null);
        setLoading(false);
        return;
      }

      try {
        // Use cached roles - this avoids repeated queries
        const cachedRoles = await roleCache.fetchAndCache(profile.id);
        
        if (cachedRoles.adminRole) {
          setAdminRole(cachedRoles.adminRole);
          setIsAdmin(true);
          setIsSuperAdmin(cachedRoles.adminRole === 'superadmin');
        } else {
          setIsAdmin(false);
          setIsSuperAdmin(false);
          setAdminRole(null);
        }
      } catch (error) {
        console.error('Error checking admin status:', error);
        setIsAdmin(false);
        setIsSuperAdmin(false);
        setAdminRole(null);
      } finally {
        setLoading(false);
      }
    };

    checkAdminStatus();
  }, [isLoggedIn, profile]);

  return { isAdmin, isSuperAdmin, adminRole, loading };
};
