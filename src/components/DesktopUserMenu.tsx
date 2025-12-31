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
import { Badge } from "@/components/ui/badge";
import { User, Calendar, Heart, Settings, LogOut, Shield, Crown } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { useAdminRole } from "@/hooks/useAdminRole";

export const DesktopUserMenu = () => {
  const { profile, logout } = useAuth();
  const navigate = useNavigate();
  const { isAdmin, isSuperAdmin, adminRole } = useAdminRole();

  const handleLogout = async () => {
    await logout();
    navigate("/");
    toast.success("Disconnesso con successo");
  };

  const getAdminBadge = () => {
    if (isSuperAdmin) {
      return (
        <Badge variant="default" className="bg-amber-500 hover:bg-amber-600 text-white gap-1">
          <Crown className="w-3 h-3" />
          Super Admin
        </Badge>
      );
    }
    if (isAdmin) {
      return (
        <Badge variant="secondary" className="bg-primary/10 text-primary gap-1">
          <Shield className="w-3 h-3" />
          Admin
        </Badge>
      );
    }
    return null;
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="rounded-full relative">
          <Avatar className="w-8 h-8">
            <AvatarImage src={profile?.avatar_url || undefined} />
            <AvatarFallback>
              <User className="w-5 h-5" />
            </AvatarFallback>
          </Avatar>
          {isAdmin && (
            <span className="absolute -top-1 -right-1 w-3 h-3 bg-amber-500 rounded-full border-2 border-background" />
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80">
        <DropdownMenuLabel>
          <div 
            className="flex items-center gap-3 cursor-pointer hover:opacity-80 transition-opacity" 
            onClick={() => navigate("/profile")}
          >
            <Avatar className="w-10 h-10">
              <AvatarImage src={profile?.avatar_url || undefined} />
              <AvatarFallback>
                <User className="w-5 h-5" />
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <p className="font-semibold truncate">{profile?.name || "Utente"}</p>
                {getAdminBadge()}
              </div>
              <p className="text-xs text-muted-foreground truncate">{profile?.email}</p>
              <p className="text-xs text-primary font-medium mt-0.5">
                {profile?.level || "Bronze"} • {profile?.points || 0} punti
              </p>
            </div>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => navigate("/my-bookings")}>
          <Calendar className="w-4 h-4 mr-2" />
          Le Mie Prenotazioni
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => navigate("/favorites")}>
          <Heart className="w-4 h-4 mr-2" />
          Preferiti
        </DropdownMenuItem>

        {isAdmin && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => navigate("/admin")}>
              {isSuperAdmin ? <Crown className="w-4 h-4 mr-2 text-amber-500" /> : <Shield className="w-4 h-4 mr-2" />}
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
