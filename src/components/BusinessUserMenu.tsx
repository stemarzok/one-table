import { useState } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Settings, LogOut, Shield, CreditCard, LayoutDashboard, Store, Image as ImageIcon, BarChart3, Megaphone } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { useAdminRole } from "@/hooks/useAdminRole";
import { useBusinessRole } from "@/hooks/useBusinessRole";
import { RestaurantInfo } from "@/components/dashboard/RestaurantInfo";
import { supabase } from "@/integrations/supabase/client";
import { useEffect } from "react";

export const BusinessUserMenu = () => {
  const { profile, logout } = useAuth();
  const navigate = useNavigate();
  const { isAdmin } = useAdminRole();
  const { businessRoles } = useBusinessRole();
  const [showInfoDialog, setShowInfoDialog] = useState(false);
  const [restaurant, setRestaurant] = useState<any>(null);

  useEffect(() => {
    const fetchRestaurant = async () => {
      if (businessRoles.length > 0) {
        const { data } = await supabase
          .from('restaurants')
          .select('*')
          .eq('id', businessRoles[0].restaurant_id)
          .single();
        if (data) setRestaurant(data);
      }
    };
    fetchRestaurant();
  }, [businessRoles]);

  const handleLogout = async () => {
    await logout();
    navigate("/business");
    toast.success("Disconnesso con successo");
  };

  const refreshRestaurant = async () => {
    if (businessRoles.length > 0) {
      const { data } = await supabase
        .from('restaurants')
        .select('*')
        .eq('id', businessRoles[0].restaurant_id)
        .single();
      if (data) setRestaurant(data);
    }
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" className="rounded-full">
            <Avatar className="w-8 h-8">
              <AvatarImage src={profile?.avatar_url || undefined} />
              <AvatarFallback>
                <Store className="w-5 h-5" />
              </AvatarFallback>
            </Avatar>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-80">
          <DropdownMenuLabel 
            className="cursor-pointer hover:bg-muted/50 rounded-sm transition-colors"
            onClick={() => setShowInfoDialog(true)}
          >
            <div className="flex items-center gap-3">
              <Avatar className="w-10 h-10">
                <AvatarImage src={profile?.avatar_url || undefined} />
                <AvatarFallback>
                  <Store className="w-5 h-5" />
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="font-semibold truncate">{profile?.name || "Ristoratore"}</p>
                <p className="text-xs text-muted-foreground truncate">{profile?.email}</p>
                <p className="text-xs text-primary font-medium mt-0.5 flex items-center gap-1">
                  <ImageIcon className="w-3 h-3" />
                  Info e Foto
                </p>
              </div>
            </div>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          
          <DropdownMenuItem onClick={() => navigate("/dashboard")}>
            <LayoutDashboard className="w-4 h-4 mr-2" />
            Dashboard
          </DropdownMenuItem>
          
          <DropdownMenuItem onClick={() => navigate("/analytics")}>
            <BarChart3 className="w-4 h-4 mr-2" />
            Analytics
          </DropdownMenuItem>
          
          <DropdownMenuItem onClick={() => navigate("/promo")}>
            <Megaphone className="w-4 h-4 mr-2" />
            Promozione
          </DropdownMenuItem>
          
          <DropdownMenuItem onClick={() => navigate("/billing")}>
            <CreditCard className="w-4 h-4 mr-2" />
            Gestione Abbonamento
          </DropdownMenuItem>

          {isAdmin && (
            <>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => navigate("/admin")}>
                <Shield className="w-4 h-4 mr-2" />
                Pannello Admin
              </DropdownMenuItem>
            </>
          )}
          
          <DropdownMenuSeparator />
          
          <DropdownMenuItem onClick={() => navigate("/settings")}>
            <Settings className="w-4 h-4 mr-2" />
            Impostazioni
          </DropdownMenuItem>
          
          <DropdownMenuSeparator />
          
          <DropdownMenuItem onClick={handleLogout} className="text-destructive">
            <LogOut className="w-4 h-4 mr-2" />
            Disconnetti
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <Dialog open={showInfoDialog} onOpenChange={setShowInfoDialog}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Info e Foto Ristorante</DialogTitle>
          </DialogHeader>
          {restaurant ? (
            <RestaurantInfo restaurant={restaurant} onUpdate={refreshRestaurant} />
          ) : (
            <p className="text-muted-foreground text-center py-8">Nessun ristorante associato</p>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};
