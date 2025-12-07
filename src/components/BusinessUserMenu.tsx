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
import { Settings, LogOut, Shield, CreditCard, LayoutDashboard, Store } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { useAdminRole } from "@/hooks/useAdminRole";

export const BusinessUserMenu = () => {
  const { profile, logout } = useAuth();
  const navigate = useNavigate();
  const { isAdmin } = useAdminRole();

  const handleLogout = async () => {
    await logout();
    navigate("/business");
    toast.success("Disconnesso con successo");
  };

  return (
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
        <DropdownMenuLabel>
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
              <p className="text-xs text-primary font-medium mt-0.5">
                Account Business
              </p>
            </div>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        
        <DropdownMenuItem onClick={() => navigate("/dashboard")}>
          <LayoutDashboard className="w-4 h-4 mr-2" />
          Dashboard
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
  );
};
