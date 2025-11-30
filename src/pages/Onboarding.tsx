import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";
import { Upload, Check, ArrowRight, Utensils, Table2, ImagePlus } from "lucide-react";
import Header from "@/components/Header";

interface MenuItem {
  name: string;
  description: string;
  category: string;
  price: string;
}

interface TableItem {
  table_number: string;
  seats: string;
  location: string;
}

const Onboarding = () => {
  const navigate = useNavigate();
  const { isLoggedIn, profile } = useAuth();
  const [currentStep, setCurrentStep] = useState(1);
  const [restaurantId, setRestaurantId] = useState<string>("");
  const [loading, setLoading] = useState(false);

  // Step 1: Logo
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string>("");
  const logoInputRef = useRef<HTMLInputElement>(null);

  // Step 2: Menu
  const [menuItems, setMenuItems] = useState<MenuItem[]>([
    { name: "", description: "", category: "", price: "" }
  ]);

  // Step 3: Tables
  const [tables, setTables] = useState<TableItem[]>([
    { table_number: "", seats: "", location: "" }
  ]);

  useEffect(() => {
    if (!isLoggedIn) {
      navigate("/business-login");
      return;
    }

    const checkRestaurant = async () => {
      if (!profile?.id) return;

      const { data } = await supabase
        .from('business_roles')
        .select('restaurant_id')
        .eq('user_id', profile.id)
        .maybeSingle();

      if (data) {
        setRestaurantId(data.restaurant_id);
      } else {
        toast.error("Nessun ristorante associato");
        navigate("/business-registration");
      }
    };

    checkRestaurant();
  }, [isLoggedIn, profile, navigate]);

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setLogoFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setLogoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleStep1Submit = async () => {
    if (!logoFile || !restaurantId) {
      toast.error("Carica il logo per continuare");
      return;
    }

    setLoading(true);
    try {
      const fileExt = logoFile.name.split('.').pop();
      const fileName = `${restaurantId}-logo.${fileExt}`;
      const filePath = `${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('restaurant-images')
        .upload(filePath, logoFile, { upsert: true });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('restaurant-images')
        .getPublicUrl(filePath);

      const { error: updateError } = await supabase
        .from('restaurants')
        .update({ logo_url: publicUrl })
        .eq('id', restaurantId);

      if (updateError) throw updateError;

      toast.success("Logo caricato con successo!");
      setCurrentStep(2);
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  const addMenuItem = () => {
    setMenuItems([...menuItems, { name: "", description: "", category: "", price: "" }]);
  };

  const removeMenuItem = (index: number) => {
    setMenuItems(menuItems.filter((_, i) => i !== index));
  };

  const updateMenuItem = (index: number, field: keyof MenuItem, value: string) => {
    const updated = [...menuItems];
    updated[index][field] = value;
    setMenuItems(updated);
  };

  const handleStep2Submit = async () => {
    const validItems = menuItems.filter(item => item.name && item.price);
    
    if (validItems.length === 0) {
      toast.error("Aggiungi almeno un piatto per continuare");
      return;
    }

    setLoading(true);
    try {
      const itemsToInsert = validItems.map(item => ({
        restaurant_id: restaurantId,
        name: item.name,
        description: item.description || null,
        category: item.category || 'Generale',
        price: parseFloat(item.price),
        is_available: true
      }));

      const { error } = await supabase
        .from('menus')
        .insert(itemsToInsert);

      if (error) throw error;

      toast.success(`${validItems.length} piatti aggiunti con successo!`);
      setCurrentStep(3);
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  const addTable = () => {
    setTables([...tables, { table_number: "", seats: "", location: "" }]);
  };

  const removeTable = (index: number) => {
    setTables(tables.filter((_, i) => i !== index));
  };

  const updateTable = (index: number, field: keyof TableItem, value: string) => {
    const updated = [...tables];
    updated[index][field] = value;
    setTables(updated);
  };

  const handleStep3Submit = async () => {
    const validTables = tables.filter(table => table.table_number && table.seats);
    
    if (validTables.length === 0) {
      toast.error("Aggiungi almeno un tavolo per continuare");
      return;
    }

    setLoading(true);
    try {
      const tablesToInsert = validTables.map(table => ({
        restaurant_id: restaurantId,
        table_number: table.table_number,
        seats: parseInt(table.seats),
        location: table.location || null,
        is_available: true
      }));

      const { error } = await supabase
        .from('restaurant_tables')
        .insert(tablesToInsert);

      if (error) throw error;

      toast.success("Configurazione completata!");
      
      // Mark onboarding as completed
      await supabase
        .from('profiles')
        .update({ 
          avatar_url: 'onboarding_completed' // Flag per indicare che l'onboarding è stato completato
        })
        .eq('id', profile?.id);

      setTimeout(() => {
        navigate('/dashboard');
      }, 1500);
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  const skipStep = () => {
    if (currentStep === 1) {
      setCurrentStep(2);
    } else if (currentStep === 2) {
      setCurrentStep(3);
    } else {
      navigate('/dashboard');
    }
  };

  const progress = (currentStep / 3) * 100;

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="pt-24 pb-16">
        <div className="container mx-auto px-4 max-w-3xl">
          <div className="mb-8">
            <h1 className="text-4xl font-bold mb-2">Benvenuto! 🎉</h1>
            <p className="text-muted-foreground mb-4">
              Completiamo insieme la configurazione del tuo ristorante
            </p>
            <Progress value={progress} className="h-2" />
            <p className="text-sm text-muted-foreground mt-2">
              Passo {currentStep} di 3
            </p>
          </div>

          {/* Step 1: Logo */}
          {currentStep === 1 && (
            <Card className="p-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                  <ImagePlus className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold">Carica il logo del ristorante</h2>
                  <p className="text-muted-foreground">
                    Un'immagine professionale aiuta i clienti a riconoscerti
                  </p>
                </div>
              </div>

              <div className="space-y-6">
                <div className="border-2 border-dashed border-border rounded-lg p-8 text-center">
                  {logoPreview ? (
                    <div className="space-y-4">
                      <img 
                        src={logoPreview} 
                        alt="Logo preview" 
                        className="max-h-48 mx-auto rounded-lg"
                      />
                      <Button
                        variant="outline"
                        onClick={() => logoInputRef.current?.click()}
                      >
                        Cambia logo
                      </Button>
                    </div>
                  ) : (
                    <div 
                      className="cursor-pointer"
                      onClick={() => logoInputRef.current?.click()}
                    >
                      <Upload className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                      <p className="text-lg font-medium mb-2">
                        Clicca per caricare il logo
                      </p>
                      <p className="text-sm text-muted-foreground">
                        PNG, JPG fino a 5MB
                      </p>
                    </div>
                  )}
                  <input
                    ref={logoInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleLogoUpload}
                    className="hidden"
                  />
                </div>

                <div className="flex gap-3">
                  <Button
                    onClick={handleStep1Submit}
                    disabled={!logoFile || loading}
                    className="flex-1"
                  >
                    {loading ? "Caricamento..." : "Continua"}
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                  <Button
                    variant="ghost"
                    onClick={skipStep}
                  >
                    Salta
                  </Button>
                </div>
              </div>
            </Card>
          )}

          {/* Step 2: Menu */}
          {currentStep === 2 && (
            <Card className="p-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                  <Utensils className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold">Aggiungi i piatti del menu</h2>
                  <p className="text-muted-foreground">
                    Mostra ai clienti cosa offri
                  </p>
                </div>
              </div>

              <div className="space-y-4 mb-6">
                {menuItems.map((item, index) => (
                  <Card key={index} className="p-4 bg-muted/50">
                    <div className="grid gap-4">
                      <div className="grid md:grid-cols-2 gap-4">
                        <div>
                          <Label>Nome piatto *</Label>
                          <Input
                            value={item.name}
                            onChange={(e) => updateMenuItem(index, 'name', e.target.value)}
                            placeholder="Es: Carbonara"
                            className="mt-1"
                          />
                        </div>
                        <div>
                          <Label>Categoria</Label>
                          <Input
                            value={item.category}
                            onChange={(e) => updateMenuItem(index, 'category', e.target.value)}
                            placeholder="Es: Primi piatti"
                            className="mt-1"
                          />
                        </div>
                      </div>
                      <div>
                        <Label>Descrizione</Label>
                        <Textarea
                          value={item.description}
                          onChange={(e) => updateMenuItem(index, 'description', e.target.value)}
                          placeholder="Descrivi gli ingredienti..."
                          className="mt-1"
                        />
                      </div>
                      <div className="flex gap-4">
                        <div className="flex-1">
                          <Label>Prezzo (€) *</Label>
                          <Input
                            type="number"
                            step="0.01"
                            value={item.price}
                            onChange={(e) => updateMenuItem(index, 'price', e.target.value)}
                            placeholder="12.50"
                            className="mt-1"
                          />
                        </div>
                        {menuItems.length > 1 && (
                          <Button
                            variant="destructive"
                            onClick={() => removeMenuItem(index)}
                            className="mt-6"
                          >
                            Rimuovi
                          </Button>
                        )}
                      </div>
                    </div>
                  </Card>
                ))}
              </div>

              <Button variant="outline" onClick={addMenuItem} className="w-full mb-6">
                + Aggiungi altro piatto
              </Button>

              <div className="flex gap-3">
                <Button
                  onClick={handleStep2Submit}
                  disabled={loading}
                  className="flex-1"
                >
                  {loading ? "Salvataggio..." : "Continua"}
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
                <Button
                  variant="ghost"
                  onClick={skipStep}
                >
                  Salta
                </Button>
              </div>
            </Card>
          )}

          {/* Step 3: Tables */}
          {currentStep === 3 && (
            <Card className="p-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                  <Table2 className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold">Configura i tavoli</h2>
                  <p className="text-muted-foreground">
                    Gestisci le prenotazioni in modo efficiente
                  </p>
                </div>
              </div>

              <div className="space-y-4 mb-6">
                {tables.map((table, index) => (
                  <Card key={index} className="p-4 bg-muted/50">
                    <div className="grid gap-4">
                      <div className="grid md:grid-cols-3 gap-4">
                        <div>
                          <Label>Numero tavolo *</Label>
                          <Input
                            value={table.table_number}
                            onChange={(e) => updateTable(index, 'table_number', e.target.value)}
                            placeholder="Es: T1"
                            className="mt-1"
                          />
                        </div>
                        <div>
                          <Label>Posti *</Label>
                          <Input
                            type="number"
                            value={table.seats}
                            onChange={(e) => updateTable(index, 'seats', e.target.value)}
                            placeholder="4"
                            className="mt-1"
                          />
                        </div>
                        <div>
                          <Label>Posizione</Label>
                          <Input
                            value={table.location}
                            onChange={(e) => updateTable(index, 'location', e.target.value)}
                            placeholder="Es: Interno, Esterno"
                            className="mt-1"
                          />
                        </div>
                      </div>
                      {tables.length > 1 && (
                        <Button
                          variant="destructive"
                          onClick={() => removeTable(index)}
                          size="sm"
                        >
                          Rimuovi tavolo
                        </Button>
                      )}
                    </div>
                  </Card>
                ))}
              </div>

              <Button variant="outline" onClick={addTable} className="w-full mb-6">
                + Aggiungi altro tavolo
              </Button>

              <div className="flex gap-3">
                <Button
                  onClick={handleStep3Submit}
                  disabled={loading}
                  className="flex-1"
                >
                  {loading ? "Completamento..." : "Completa configurazione"}
                  <Check className="w-4 h-4 ml-2" />
                </Button>
                <Button
                  variant="ghost"
                  onClick={() => navigate('/dashboard')}
                >
                  Salta
                </Button>
              </div>
            </Card>
          )}
        </div>
      </main>
    </div>
  );
};

export default Onboarding;
