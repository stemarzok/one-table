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
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { User, Calendar, Heart, Settings, LogOut, Globe, Moon, Sun, Shield, CreditCard } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { useAdminRole } from "@/hooks/useAdminRole";
import { useBusinessRole } from "@/hooks/useBusinessRole";

export const DesktopUserMenu = () => {
  const { profile, logout } = useAuth();
  const { language, setLanguage } = useLanguage();
  const navigate = useNavigate();
  const { isAdmin } = useAdminRole();
  const { hasRole: hasBusinessRole } = useBusinessRole();
  const [theme, setTheme] = useState<"light" | "dark">("light");
  const [showSettings, setShowSettings] = useState(false);

  const handleThemeToggle = () => {
    const newTheme = theme === "light" ? "dark" : "light";
    setTheme(newTheme);
    document.documentElement.classList.toggle("dark", newTheme === "dark");
    toast.success(`Tema ${newTheme === "dark" ? "scuro" : "chiaro"} attivato`);
  };

  const handleLogout = async () => {
    await logout();
    navigate("/");
    toast.success("Disconnesso con successo");
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="rounded-full">
          <Avatar className="w-8 h-8">
            <AvatarImage src={profile?.avatar_url || undefined} />
            <AvatarFallback>
              <User className="w-5 h-5" />
            </AvatarFallback>
          </Avatar>
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
              <p className="font-semibold truncate">{profile?.name || "Utente"}</p>
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
        {(hasBusinessRole() || isAdmin) && (
          <DropdownMenuItem onClick={() => navigate("/billing")}>
            <CreditCard className="w-4 h-4 mr-2" />
            Gestione Abbonamento
          </DropdownMenuItem>
        )}

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
        
        <DropdownMenuItem onSelect={(e) => {
          e.preventDefault();
          setShowSettings(!showSettings);
        }}>
          <Settings className="w-4 h-4 mr-2" />
          Impostazioni
        </DropdownMenuItem>
        
        {showSettings && (
          <div className="px-2 py-2 space-y-3">
            <div className="space-y-2">
              <Label className="flex items-center gap-2 text-xs">
                <Globe className="w-3 h-3" />
                Lingua
              </Label>
              <Select value={language} onValueChange={setLanguage}>
                <SelectTrigger className="h-8">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="it">🇮🇹 Italiano</SelectItem>
                  <SelectItem value="en">🇬🇧 English</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center justify-between">
              <Label className="flex items-center gap-2 text-xs">
                {theme === "light" ? <Sun className="w-3 h-3" /> : <Moon className="w-3 h-3" />}
                Tema Scuro
              </Label>
              <Switch
                checked={theme === "dark"}
                onCheckedChange={handleThemeToggle}
              />
            </div>

            <div className="flex items-center justify-between opacity-50">
              <Label className="text-xs">Notifiche</Label>
              <Switch disabled />
            </div>
          </div>
        )}
        
        <DropdownMenuSeparator />
        
        <DropdownMenuItem onClick={handleLogout} className="text-destructive">
          <LogOut className="w-4 h-4 mr-2" />
          Disconnetti
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
