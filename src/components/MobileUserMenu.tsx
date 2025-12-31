import { useState } from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { User, Calendar, Heart, Settings, LogOut, Globe, Moon, Sun, Shield, Crown } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { useAdminRole } from "@/hooks/useAdminRole";

export const MobileUserMenu = () => {
  const { profile, logout } = useAuth();
  const { language, setLanguage } = useLanguage();
  const navigate = useNavigate();
  const { isAdmin, isSuperAdmin } = useAdminRole();
  const [theme, setTheme] = useState<"light" | "dark">("light");
  const [open, setOpen] = useState(false);

  const handleThemeToggle = () => {
    const newTheme = theme === "light" ? "dark" : "light";
    setTheme(newTheme);
    document.documentElement.classList.toggle("dark", newTheme === "dark");
    toast.success(`Tema ${newTheme === "dark" ? "scuro" : "chiaro"} attivato`);
  };

  const handleLogout = async () => {
    await logout();
    setOpen(false);
    navigate("/");
    toast.success("Disconnesso con successo");
  };

  const menuItems = [
    { icon: Calendar, label: "Le Mie Prenotazioni", path: "/my-bookings" },
    { icon: Heart, label: "Preferiti", path: "/favorites" },
    { icon: Settings, label: "Impostazioni", path: "/settings" },
    ...(isAdmin ? [{ icon: isSuperAdmin ? Crown : Shield, label: "Pannello Admin", path: "/admin" }] : []),
  ];

  const getAdminBadge = () => {
    if (isSuperAdmin) {
      return (
        <Badge variant="default" className="bg-amber-500 hover:bg-amber-600 text-white gap-1 text-xs">
          <Crown className="w-3 h-3" />
          Super Admin
        </Badge>
      );
    }
    if (isAdmin) {
      return (
        <Badge variant="secondary" className="bg-primary/10 text-primary gap-1 text-xs">
          <Shield className="w-3 h-3" />
          Admin
        </Badge>
      );
    }
    return null;
  };

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="lg:hidden rounded-full relative">
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
      </SheetTrigger>
      <SheetContent side="right" className="w-[300px] sm:w-[400px]">
        <SheetHeader>
          <SheetTitle>Menu Utente</SheetTitle>
        </SheetHeader>

        <div className="mt-6 space-y-6">
          {/* User Profile Section */}
          <div 
            className="flex items-center gap-4 p-4 bg-muted rounded-lg cursor-pointer hover:bg-muted/80 transition-colors" 
            onClick={() => {
              navigate("/profile");
              setOpen(false);
            }}
          >
            <Avatar className="w-12 h-12">
              <AvatarImage src={profile?.avatar_url || undefined} />
              <AvatarFallback>
                <User className="w-6 h-6" />
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <p className="font-semibold truncate">{profile?.name || "Utente"}</p>
                {getAdminBadge()}
              </div>
              <p className="text-sm text-muted-foreground truncate">{profile?.email}</p>
              <p className="text-xs text-primary font-medium mt-1">
                {profile?.level || "Bronze"} • {profile?.points || 0} punti
              </p>
            </div>
          </div>

          <Separator />

          {/* Navigation Items */}
          <div className="space-y-2">
            {menuItems.map((item) => (
              <Button
                key={item.path}
                variant="ghost"
                className="w-full justify-start gap-3"
                onClick={() => {
                  navigate(item.path);
                  setOpen(false);
                }}
              >
                <item.icon className={`w-5 h-5 ${item.path === '/admin' && isSuperAdmin ? 'text-amber-500' : ''}`} />
                {item.label}
              </Button>
            ))}
          </div>

          <Separator />

          {/* Quick Settings */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Globe className="w-5 h-5" />
              <h3 className="font-semibold">Preferenze Rapide</h3>
            </div>

            {/* Language Selector */}
            <div className="space-y-2">
              <Label>Lingua</Label>
              <Select value={language} onValueChange={setLanguage}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="it">🇮🇹 Italiano</SelectItem>
                  <SelectItem value="en">🇬🇧 English</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Theme Toggle */}
            <div className="flex items-center justify-between">
              <Label className="flex items-center gap-2">
                {theme === "light" ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
                Tema Scuro
              </Label>
              <Switch
                checked={theme === "dark"}
                onCheckedChange={handleThemeToggle}
              />
            </div>
          </div>

          <Separator />

          {/* Logout Button */}
          <Button
            variant="destructive"
            className="w-full gap-2"
            onClick={handleLogout}
          >
            <LogOut className="w-4 h-4" />
            Disconnetti
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
};
