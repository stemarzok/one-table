import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";

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
        // Get the admin role type
        const { data: roleData, error } = await supabase
          .rpc('get_admin_role', { _user_id: profile.id });

        if (!error && roleData) {
          setAdminRole(roleData as AdminRoleType);
          setIsAdmin(true);
          setIsSuperAdmin(roleData === 'superadmin');
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
