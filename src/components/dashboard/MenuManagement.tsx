import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Plus, Edit, Trash2, UtensilsCrossed, Euro, Check, X, ChefHat, Soup, Coffee, IceCream } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

interface MenuItem {
  id: string;
  name: string;
  description: string | null;
  category: string;
  price: number;
  is_available: boolean;
  image_url: string | null;
}

interface MenuManagementProps {
  restaurantId: string;
}

const getCategoryIcon = (category: string) => {
  const lowerCategory = category.toLowerCase();
  if (lowerCategory.includes('prim') || lowerCategory.includes('pasta')) return Soup;
  if (lowerCategory.includes('dolc') || lowerCategory.includes('dessert')) return IceCream;
  if (lowerCategory.includes('bevand') || lowerCategory.includes('drink') || lowerCategory.includes('caffè')) return Coffee;
  return ChefHat;
};

export const MenuManagement = ({ restaurantId }: MenuManagementProps) => {
  const { t } = useLanguage();
  const { toast } = useToast();
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [showDialog, setShowDialog] = useState(false);
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [price, setPrice] = useState("");
  const [isAvailable, setIsAvailable] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchMenuItems();

    // Subscribe to realtime updates
    const channel = supabase
      .channel('menu-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'menus',
          filter: `restaurant_id=eq.${restaurantId}`
        },
        () => {
          fetchMenuItems();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [restaurantId]);

  const fetchMenuItems = async () => {
    const { data, error } = await supabase
      .from('menus')
      .select('*')
      .eq('restaurant_id', restaurantId)
      .order('category')
      .order('name');

    if (!error && data) {
      setMenuItems(data);
    }
  };

  const handleOpenDialog = (item?: MenuItem) => {
    if (item) {
      setEditingItem(item);
      setName(item.name);
      setDescription(item.description || "");
      setCategory(item.category);
      setPrice(item.price.toString());
      setIsAvailable(item.is_available);
    } else {
      setEditingItem(null);
      setName("");
      setDescription("");
      setCategory("");
      setPrice("");
      setIsAvailable(true);
    }
    setShowDialog(true);
  };

  const handleSave = async () => {
    if (!name || !category || !price) {
      toast({
        title: "Errore",
        description: "Compila tutti i campi obbligatori",
        variant: "destructive",
      });
      return;
    }

    setSaving(true);
    try {
      if (editingItem) {
        // Update
        const { error } = await supabase
          .from('menus')
          .update({
            name,
            description: description || null,
            category,
            price: parseFloat(price),
            is_available: isAvailable,
          })
          .eq('id', editingItem.id);

        if (error) throw error;

        toast({
          title: "Aggiornato",
          description: "Piatto aggiornato con successo",
        });
      } else {
        // Insert
        const { error } = await supabase
          .from('menus')
          .insert({
            restaurant_id: restaurantId,
            name,
            description: description || null,
            category,
            price: parseFloat(price),
            is_available: isAvailable,
          });

        if (error) throw error;

        toast({
          title: "Aggiunto",
          description: "Piatto aggiunto con successo",
        });
      }

      setShowDialog(false);
    } catch (error: any) {
      toast({
        title: "Errore",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Sei sicuro di voler eliminare questo piatto?")) return;

    try {
      const { error } = await supabase
        .from('menus')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Eliminato",
        description: "Piatto eliminato con successo",
      });
    } catch (error: any) {
      toast({
        title: "Errore",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const toggleAvailability = async (item: MenuItem) => {
    try {
      const { error } = await supabase
        .from('menus')
        .update({ is_available: !item.is_available })
        .eq('id', item.id);

      if (error) throw error;
    } catch (error: any) {
      toast({
        title: "Errore",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  // Group items by category
  const itemsByCategory = menuItems.reduce((acc, item) => {
    if (!acc[item.category]) {
      acc[item.category] = [];
    }
    acc[item.category].push(item);
    return acc;
  }, {} as Record<string, MenuItem[]>);

  const categories = Object.keys(itemsByCategory);
  const availableCount = menuItems.filter(i => i.is_available).length;
  const unavailableCount = menuItems.filter(i => !i.is_available).length;

  return (
    <div className="space-y-6">
      {/* Header with Stats */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <UtensilsCrossed className="w-6 h-6 text-primary" />
            {t('dashboard.manageMenu')}
          </h2>
          <p className="text-muted-foreground mt-1">
            Gestisci i piatti e le categorie del tuo menu
          </p>
        </div>
        <Button onClick={() => handleOpenDialog()} className="gap-2 shadow-lg">
          <Plus className="w-4 h-4" />
          {t('dashboard.addDish')}
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="p-4 bg-gradient-to-br from-card to-muted/30 border-border/50">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-primary/10">
              <ChefHat className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-bold">{menuItems.length}</p>
              <p className="text-xs text-muted-foreground">Piatti totali</p>
            </div>
          </div>
        </Card>
        <Card className="p-4 bg-gradient-to-br from-card to-muted/30 border-border/50">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-green-500/10">
              <Check className="w-5 h-5 text-green-500" />
            </div>
            <div>
              <p className="text-2xl font-bold">{availableCount}</p>
              <p className="text-xs text-muted-foreground">Disponibili</p>
            </div>
          </div>
        </Card>
        <Card className="p-4 bg-gradient-to-br from-card to-muted/30 border-border/50">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-amber-500/10">
              <X className="w-5 h-5 text-amber-500" />
            </div>
            <div>
              <p className="text-2xl font-bold">{unavailableCount}</p>
              <p className="text-xs text-muted-foreground">Non disponibili</p>
            </div>
          </div>
        </Card>
        <Card className="p-4 bg-gradient-to-br from-card to-muted/30 border-border/50">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-blue-500/10">
              <Soup className="w-5 h-5 text-blue-500" />
            </div>
            <div>
              <p className="text-2xl font-bold">{categories.length}</p>
              <p className="text-xs text-muted-foreground">Categorie</p>
            </div>
          </div>
        </Card>
      </div>

      {menuItems.length === 0 ? (
        <Card className="p-12 text-center bg-gradient-to-br from-card to-muted/20 border-dashed">
          <div className="p-4 rounded-full bg-muted/50 w-fit mx-auto mb-4">
            <UtensilsCrossed className="w-8 h-8 text-muted-foreground" />
          </div>
          <p className="text-muted-foreground mb-4">Nessun piatto nel menu</p>
          <Button onClick={() => handleOpenDialog()} variant="outline" className="gap-2">
            <Plus className="w-4 h-4" />
            Aggiungi il primo piatto
          </Button>
        </Card>
      ) : (
        <div className="space-y-8">
          {Object.entries(itemsByCategory).map(([categoryName, items]) => {
            const CategoryIcon = getCategoryIcon(categoryName);
            return (
              <div key={categoryName}>
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 rounded-xl bg-primary/10">
                    <CategoryIcon className="w-5 h-5 text-primary" />
                  </div>
                  <h3 className="text-xl font-bold">{categoryName}</h3>
                  <Badge variant="secondary" className="ml-2">
                    {items.length} piatti
                  </Badge>
                </div>
                <div className="grid md:grid-cols-2 gap-4">
                  {items.map((item) => (
                    <Card 
                      key={item.id} 
                      className={`p-5 transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5 bg-gradient-to-br from-card to-muted/20 ${
                        !item.is_available ? 'opacity-60' : ''
                      }`}
                    >
                      <div className="flex justify-between items-start mb-3">
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <h4 className="text-lg font-semibold">{item.name}</h4>
                            {!item.is_available && (
                              <Badge variant="secondary" className="text-xs">
                                Non disponibile
                              </Badge>
                            )}
                          </div>
                          {item.description && (
                            <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                              {item.description}
                            </p>
                          )}
                        </div>
                        <div className="flex items-center gap-1 ml-3">
                          <Button
                            size="icon"
                            variant="ghost"
                            onClick={() => handleOpenDialog(item)}
                            className="h-8 w-8 hover:bg-primary/10"
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button
                            size="icon"
                            variant="ghost"
                            onClick={() => handleDelete(item.id)}
                            className="h-8 w-8 hover:bg-destructive/10 hover:text-destructive"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>

                      <div className="flex items-center justify-between pt-3 border-t border-border/50">
                        <div className="flex items-center gap-1.5 text-lg font-bold text-primary">
                          <Euro className="w-4 h-4" />
                          {item.price.toFixed(2)}
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-muted-foreground">Disponibile</span>
                          <Switch
                            checked={item.is_available}
                            onCheckedChange={() => toggleAvailability(item)}
                          />
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}

      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {editingItem ? <Edit className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
              {editingItem ? 'Modifica Piatto' : 'Nuovo Piatto'}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nome Piatto *</Label>
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Es: Carbonara"
                  className="h-11"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="category">Categoria *</Label>
                <Input
                  id="category"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  placeholder="Es: Primi Piatti"
                  className="h-11"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Descrizione</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Descrizione del piatto..."
                rows={3}
              />
            </div>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="price">Prezzo (€) *</Label>
                <div className="relative">
                  <Euro className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="price"
                    type="number"
                    step="0.01"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    placeholder="12.50"
                    className="h-11 pl-9"
                  />
                </div>
              </div>
              <div className="flex items-center justify-between p-4 rounded-xl bg-muted/50">
                <Label htmlFor="available" className="cursor-pointer">Disponibile</Label>
                <Switch
                  id="available"
                  checked={isAvailable}
                  onCheckedChange={setIsAvailable}
                />
              </div>
            </div>
          </div>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setShowDialog(false)}>
              Annulla
            </Button>
            <Button onClick={handleSave} disabled={saving} className="gap-2">
              {saving ? 'Salvataggio...' : 'Salva'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
