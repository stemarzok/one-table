import { useState, useEffect } from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Settings, LogOut, Globe, Moon, Sun, Shield, CreditCard, LayoutDashboard, Store, Image as ImageIcon } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { useAdminRole } from "@/hooks/useAdminRole";
import { useBusinessRole } from "@/hooks/useBusinessRole";
import { RestaurantInfo } from "@/components/dashboard/RestaurantInfo";
import { supabase } from "@/integrations/supabase/client";

export const MobileBusinessMenu = () => {
  const { profile, logout } = useAuth();
  const { language, setLanguage } = useLanguage();
  const navigate = useNavigate();
  const { isAdmin } = useAdminRole();
  const { businessRoles } = useBusinessRole();
  const [theme, setTheme] = useState<"light" | "dark">("light");
  const [open, setOpen] = useState(false);
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

  const handleThemeToggle = () => {
    const newTheme = theme === "light" ? "dark" : "light";
    setTheme(newTheme);
    document.documentElement.classList.toggle("dark", newTheme === "dark");
    toast.success(`Tema ${newTheme === "dark" ? "scuro" : "chiaro"} attivato`);
  };

  const handleLogout = async () => {
    await logout();
    setOpen(false);
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

  const menuItems = [
    { icon: LayoutDashboard, label: "Dashboard", path: "/dashboard" },
    { icon: CreditCard, label: "Gestione Abbonamento", path: "/billing" },
    { icon: Settings, label: "Impostazioni", path: "/settings" },
    ...(isAdmin ? [{ icon: Shield, label: "Pannello Admin", path: "/admin" }] : []),
  ];

  return (
    <>
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger asChild>
          <Button variant="ghost" size="icon" className="lg:hidden rounded-full">
            <Avatar className="w-8 h-8">
              <AvatarImage src={profile?.avatar_url || undefined} />
              <AvatarFallback>
                <Store className="w-5 h-5" />
              </AvatarFallback>
            </Avatar>
          </Button>
        </SheetTrigger>
        <SheetContent side="right" className="w-[300px] sm:w-[400px]">
          <SheetHeader>
            <SheetTitle>Menu Business</SheetTitle>
          </SheetHeader>

          <div className="mt-6 space-y-6">
            {/* Business Profile Section - Clickable */}
            <div 
              className="flex items-center gap-4 p-4 bg-muted rounded-lg cursor-pointer hover:bg-muted/80 transition-colors"
              onClick={() => {
                setOpen(false);
                setShowInfoDialog(true);
              }}
            >
              <Avatar className="w-12 h-12">
                <AvatarImage src={profile?.avatar_url || undefined} />
                <AvatarFallback>
                  <Store className="w-6 h-6" />
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="font-semibold truncate">{profile?.name || "Ristoratore"}</p>
                <p className="text-sm text-muted-foreground truncate">{profile?.email}</p>
                <p className="text-xs text-primary font-medium mt-1 flex items-center gap-1">
                  <ImageIcon className="w-3 h-3" />
                  Info e Foto
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
                  <item.icon className="w-5 h-5" />
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
