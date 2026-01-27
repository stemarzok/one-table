import { supabase } from "@/integrations/supabase/client";

interface CachedRoles {
  adminRole: 'superadmin' | 'admin' | null;
  businessRoles: Array<{
    restaurant_id: string;
    role: 'owner' | 'manager' | 'staff';
  }>;
  timestamp: number;
}

const CACHE_KEY = 'user_roles_cache';
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

let memoryCache: CachedRoles | null = null;
let currentUserId: string | null = null;

export const roleCache = {
  get(userId: string): CachedRoles | null {
    // If user changed, invalidate cache
    if (currentUserId !== userId) {
      this.clear();
      currentUserId = userId;
      return null;
    }

    // Try memory cache first (fastest)
    if (memoryCache && Date.now() - memoryCache.timestamp < CACHE_DURATION) {
      return memoryCache;
    }

    // Try sessionStorage (persists across page navigations)
    try {
      const cached = sessionStorage.getItem(CACHE_KEY);
      if (cached) {
        const parsed: CachedRoles = JSON.parse(cached);
        if (Date.now() - parsed.timestamp < CACHE_DURATION) {
          memoryCache = parsed;
          return parsed;
        }
      }
    } catch {
      // Ignore storage errors
    }

    return null;
  },

  set(roles: Omit<CachedRoles, 'timestamp'>): void {
    const cached: CachedRoles = {
      ...roles,
      timestamp: Date.now(),
    };

    memoryCache = cached;

    try {
      sessionStorage.setItem(CACHE_KEY, JSON.stringify(cached));
    } catch {
      // Ignore storage errors
    }
  },

  clear(): void {
    memoryCache = null;
    currentUserId = null;
    try {
      sessionStorage.removeItem(CACHE_KEY);
    } catch {
      // Ignore storage errors
    }
  },

  async fetchAndCache(userId: string): Promise<CachedRoles> {
    // Check cache first
    const cached = this.get(userId);
    if (cached) {
      return cached;
    }

    // Fetch both roles in parallel
    const [adminResult, businessResult] = await Promise.all([
      supabase.rpc('get_admin_role', { _user_id: userId }),
      supabase
        .from('business_roles')
        .select('restaurant_id, role')
        .eq('user_id', userId)
    ]);

    const roles: Omit<CachedRoles, 'timestamp'> = {
      adminRole: adminResult.data as 'superadmin' | 'admin' | null,
      businessRoles: businessResult.data || [],
    };

    this.set(roles);
    currentUserId = userId;

    return {
      ...roles,
      timestamp: Date.now(),
    };
  },

  // Quick check methods that use cache
  isAdmin(userId: string): boolean | null {
    const cached = this.get(userId);
    if (!cached) return null;
    return cached.adminRole !== null;
  },

  isSuperAdmin(userId: string): boolean | null {
    const cached = this.get(userId);
    if (!cached) return null;
    return cached.adminRole === 'superadmin';
  },

  hasBusinessRole(userId: string): boolean | null {
    const cached = this.get(userId);
    if (!cached) return null;
    return cached.businessRoles.length > 0;
  },
};

// Clear cache on logout
supabase.auth.onAuthStateChange((event) => {
  if (event === 'SIGNED_OUT') {
    roleCache.clear();
  }
});
