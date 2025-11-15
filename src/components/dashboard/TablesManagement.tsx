import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Plus, Edit, Trash2 } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

interface Table {
  id: string;
  table_number: string;
  seats: number;
  location: string | null;
  is_available: boolean;
}

interface TablesManagementProps {
  restaurantId: string;
}

export const TablesManagement = ({ restaurantId }: TablesManagementProps) => {
  const { t } = useLanguage();
  const { toast } = useToast();
  const [tables, setTables] = useState<Table[]>([]);
  const [showDialog, setShowDialog] = useState(false);
  const [editingTable, setEditingTable] = useState<Table | null>(null);
  const [tableNumber, setTableNumber] = useState("");
  const [seats, setSeats] = useState("");
  const [location, setLocation] = useState("");
  const [isAvailable, setIsAvailable] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchTables();

    // Subscribe to realtime updates
    const channel = supabase
      .channel('tables-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'restaurant_tables',
          filter: `restaurant_id=eq.${restaurantId}`
        },
        () => {
          fetchTables();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [restaurantId]);

  const fetchTables = async () => {
    const { data, error } = await supabase
      .from('restaurant_tables')
      .select('*')
      .eq('restaurant_id', restaurantId)
      .order('table_number');

    if (!error && data) {
      setTables(data);
    }
  };

  const handleOpenDialog = (table?: Table) => {
    if (table) {
      setEditingTable(table);
      setTableNumber(table.table_number);
      setSeats(table.seats.toString());
      setLocation(table.location || "");
      setIsAvailable(table.is_available);
    } else {
      setEditingTable(null);
      setTableNumber("");
      setSeats("");
      setLocation("");
      setIsAvailable(true);
    }
    setShowDialog(true);
  };

  const handleSave = async () => {
    if (!tableNumber || !seats) {
      toast({
        title: "Errore",
        description: "Compila tutti i campi obbligatori",
        variant: "destructive",
      });
      return;
    }

    setSaving(true);
    try {
      if (editingTable) {
        // Update
        const { error } = await supabase
          .from('restaurant_tables')
          .update({
            table_number: tableNumber,
            seats: parseInt(seats),
            location: location || null,
            is_available: isAvailable,
          })
          .eq('id', editingTable.id);

        if (error) throw error;

        toast({
          title: "Aggiornato",
          description: "Tavolo aggiornato con successo",
        });
      } else {
        // Insert
        const { error } = await supabase
          .from('restaurant_tables')
          .insert({
            restaurant_id: restaurantId,
            table_number: tableNumber,
            seats: parseInt(seats),
            location: location || null,
            is_available: isAvailable,
          });

        if (error) throw error;

        toast({
          title: "Aggiunto",
          description: "Tavolo aggiunto con successo",
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
    if (!confirm("Sei sicuro di voler eliminare questo tavolo?")) return;

    try {
      const { error } = await supabase
        .from('restaurant_tables')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Eliminato",
        description: "Tavolo eliminato con successo",
      });
    } catch (error: any) {
      toast({
        title: "Errore",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const toggleAvailability = async (table: Table) => {
    try {
      const { error } = await supabase
        .from('restaurant_tables')
        .update({ is_available: !table.is_available })
        .eq('id', table.id);

      if (error) throw error;
    } catch (error: any) {
      toast({
        title: "Errore",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">{t('dashboard.manageTables')}</h2>
        <Button onClick={() => handleOpenDialog()}>
          <Plus className="w-4 h-4 mr-2" />
          {t('dashboard.addTable')}
        </Button>
      </div>

      {tables.length === 0 ? (
        <Card className="p-8 text-center">
          <p className="text-muted-foreground">Nessun tavolo aggiunto</p>
        </Card>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {tables.map((table) => (
            <Card key={table.id} className="p-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-xl font-bold">{table.table_number}</h3>
                  <p className="text-sm text-muted-foreground">
                    {table.seats} {table.seats === 1 ? 'posto' : 'posti'}
                  </p>
                  {table.location && (
                    <p className="text-sm text-muted-foreground">{table.location}</p>
                  )}
                </div>
                <div className="flex gap-2">
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => handleOpenDialog(table)}
                  >
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => handleDelete(table.id)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              <div className="flex items-center justify-between pt-4 border-t">
                <span className="text-sm font-medium">Disponibile</span>
                <Switch
                  checked={table.is_available}
                  onCheckedChange={() => toggleAvailability(table)}
                />
              </div>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingTable ? 'Modifica Tavolo' : 'Nuovo Tavolo'}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="tableNumber">Numero Tavolo *</Label>
              <Input
                id="tableNumber"
                value={tableNumber}
                onChange={(e) => setTableNumber(e.target.value)}
                placeholder="Es: T1, A5"
              />
            </div>
            <div>
              <Label htmlFor="seats">Posti *</Label>
              <Input
                id="seats"
                type="number"
                value={seats}
                onChange={(e) => setSeats(e.target.value)}
                min="1"
              />
            </div>
            <div>
              <Label htmlFor="location">Posizione</Label>
              <Input
                id="location"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="Es: Terrazza, Sala VIP"
              />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="available">Disponibile</Label>
              <Switch
                id="available"
                checked={isAvailable}
                onCheckedChange={setIsAvailable}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDialog(false)}>
              Annulla
            </Button>
            <Button onClick={handleSave} disabled={saving}>
              {saving ? 'Salvataggio...' : 'Salva'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
