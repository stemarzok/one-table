import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Plus, Edit, Trash2, Users, MapPin, CheckCircle, XCircle, Table2 } from "lucide-react";
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

  // Group tables by location
  const tablesByLocation = tables.reduce((acc, table) => {
    const loc = table.location || 'Generale';
    if (!acc[loc]) acc[loc] = [];
    acc[loc].push(table);
    return acc;
  }, {} as Record<string, Table[]>);

  const totalSeats = tables.reduce((sum, t) => sum + t.seats, 0);
  const availableTables = tables.filter(t => t.is_available).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold">{t('dashboard.manageTables')}</h2>
          <p className="text-sm text-muted-foreground mt-1">
            {tables.length} tavoli • {totalSeats} posti totali • {availableTables} disponibili
          </p>
        </div>
        <Button 
          onClick={() => handleOpenDialog()}
          className="rounded-xl shadow-md hover:shadow-lg transition-all gap-2"
        >
          <Plus className="w-4 h-4" />
          {t('dashboard.addTable')}
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-4 border-0 shadow-lg bg-gradient-to-br from-card to-card/80">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-primary/10">
              <Table2 className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-bold">{tables.length}</p>
              <p className="text-xs text-muted-foreground">Tavoli totali</p>
            </div>
          </div>
        </Card>
        <Card className="p-4 border-0 shadow-lg bg-gradient-to-br from-card to-card/80">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-blue-500/10">
              <Users className="w-5 h-5 text-blue-500" />
            </div>
            <div>
              <p className="text-2xl font-bold">{totalSeats}</p>
              <p className="text-xs text-muted-foreground">Posti totali</p>
            </div>
          </div>
        </Card>
        <Card className="p-4 border-0 shadow-lg bg-gradient-to-br from-card to-card/80">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-green-500/10">
              <CheckCircle className="w-5 h-5 text-green-500" />
            </div>
            <div>
              <p className="text-2xl font-bold">{availableTables}</p>
              <p className="text-xs text-muted-foreground">Disponibili</p>
            </div>
          </div>
        </Card>
        <Card className="p-4 border-0 shadow-lg bg-gradient-to-br from-card to-card/80">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-amber-500/10">
              <XCircle className="w-5 h-5 text-amber-500" />
            </div>
            <div>
              <p className="text-2xl font-bold">{tables.length - availableTables}</p>
              <p className="text-xs text-muted-foreground">Non disponibili</p>
            </div>
          </div>
        </Card>
      </div>

      {tables.length === 0 ? (
        <Card className="p-12 text-center border-0 shadow-lg bg-gradient-to-br from-card to-card/80">
          <div className="w-16 h-16 rounded-2xl bg-muted/50 flex items-center justify-center mx-auto mb-4">
            <Table2 className="w-8 h-8 text-muted-foreground" />
          </div>
          <p className="text-xl font-medium text-muted-foreground">Nessun tavolo configurato</p>
          <p className="text-sm text-muted-foreground/70 mt-1 mb-4">Aggiungi i tavoli del tuo ristorante</p>
          <Button onClick={() => handleOpenDialog()} className="rounded-xl">
            <Plus className="w-4 h-4 mr-2" />
            Aggiungi il primo tavolo
          </Button>
        </Card>
      ) : (
        <div className="space-y-6">
          {Object.entries(tablesByLocation).map(([location, locationTables]) => (
            <div key={location}>
              <div className="flex items-center gap-2 mb-3">
                <MapPin className="w-4 h-4 text-muted-foreground" />
                <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wider">{location}</h3>
                <Badge variant="secondary" className="text-xs">{locationTables.length}</Badge>
              </div>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {locationTables.map((table) => (
                  <Card 
                    key={table.id} 
                    className={`overflow-hidden border-0 shadow-lg transition-all duration-300 hover:shadow-xl hover:-translate-y-0.5 ${
                      table.is_available 
                        ? 'bg-gradient-to-br from-card to-card/80' 
                        : 'bg-gradient-to-br from-muted/50 to-muted/30'
                    }`}
                  >
                    <div className="p-5">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <div className={`w-12 h-12 rounded-xl flex items-center justify-center font-bold text-lg ${
                            table.is_available 
                              ? 'bg-primary/10 text-primary' 
                              : 'bg-muted text-muted-foreground'
                          }`}>
                            {table.table_number}
                          </div>
                          <div>
                            <p className="font-semibold">Tavolo {table.table_number}</p>
                            <div className="flex items-center gap-1 text-sm text-muted-foreground">
                              <Users className="w-3.5 h-3.5" />
                              <span>{table.seats} {table.seats === 1 ? 'posto' : 'posti'}</span>
                            </div>
                          </div>
                        </div>
                        <Badge 
                          variant="outline" 
                          className={`text-xs ${
                            table.is_available 
                              ? 'bg-green-500/10 text-green-600 border-green-500/20' 
                              : 'bg-amber-500/10 text-amber-600 border-amber-500/20'
                          }`}
                        >
                          {table.is_available ? 'Disponibile' : 'Occupato'}
                        </Badge>
                      </div>

                      <div className="flex items-center justify-between pt-4 border-t border-border/50">
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-muted-foreground">Disponibile</span>
                          <Switch
                            checked={table.is_available}
                            onCheckedChange={() => toggleAvailability(table)}
                            className="data-[state=checked]:bg-primary"
                          />
                        </div>
                        <div className="flex gap-1">
                          <Button
                            size="icon"
                            variant="ghost"
                            onClick={() => handleOpenDialog(table)}
                            className="h-8 w-8 rounded-lg hover:bg-primary/10 hover:text-primary"
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button
                            size="icon"
                            variant="ghost"
                            onClick={() => handleDelete(table.id)}
                            className="h-8 w-8 rounded-lg hover:bg-destructive/10 hover:text-destructive"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Dialog */}
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-xl">
              {editingTable ? 'Modifica Tavolo' : 'Nuovo Tavolo'}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-5 py-4">
            <div className="space-y-2">
              <Label htmlFor="tableNumber" className="text-sm font-medium">Numero/Nome Tavolo *</Label>
              <Input
                id="tableNumber"
                value={tableNumber}
                onChange={(e) => setTableNumber(e.target.value)}
                placeholder="Es: T1, A5, VIP"
                className="h-11 rounded-xl"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="seats" className="text-sm font-medium">Numero Posti *</Label>
              <Input
                id="seats"
                type="number"
                value={seats}
                onChange={(e) => setSeats(e.target.value)}
                min="1"
                placeholder="Es: 4"
                className="h-11 rounded-xl"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="location" className="text-sm font-medium">Posizione</Label>
              <Input
                id="location"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="Es: Terrazza, Sala VIP, Esterno"
                className="h-11 rounded-xl"
              />
            </div>
            <div className="flex items-center justify-between p-4 bg-muted/30 rounded-xl">
              <div>
                <Label htmlFor="available" className="text-sm font-medium">Disponibile</Label>
                <p className="text-xs text-muted-foreground mt-0.5">Il tavolo può ricevere prenotazioni</p>
              </div>
              <Switch
                id="available"
                checked={isAvailable}
                onCheckedChange={setIsAvailable}
              />
            </div>
          </div>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button 
              variant="outline" 
              onClick={() => setShowDialog(false)}
              className="rounded-xl"
            >
              Annulla
            </Button>
            <Button 
              onClick={handleSave} 
              disabled={saving}
              className="rounded-xl shadow-md"
            >
              {saving ? 'Salvataggio...' : 'Salva'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
