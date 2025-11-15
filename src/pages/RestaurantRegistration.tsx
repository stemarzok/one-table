import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useState, useEffect, useRef } from "react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Upload, Plus, Trash2 } from "lucide-react";

interface MenuItem {
  name: string;
  description: string;
  category: string;
  price: string;
}

interface Table {
  table_number: string;
  seats: string;
  location: string;
}

const RestaurantRegistration = () => {
  const { toast } = useToast();
  const { isLoggedIn, profile } = useAuth();
  const navigate = useNavigate();
  const coverInputRef = useRef<HTMLInputElement>(null);
  const logoInputRef = useRef<HTMLInputElement>(null);

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [cuisineType, setCuisineType] = useState("");
  const [priceRange, setPriceRange] = useState("");
  const [coverImage, setCoverImage] = useState<File | null>(null);
  const [logoImage, setLogoImage] = useState<File | null>(null);
  const [coverPreview, setCoverPreview] = useState("");
  const [logoPreview, setLogoPreview] = useState("");
  
  const [menuItems, setMenuItems] = useState<MenuItem[]>([
    { name: "", description: "", category: "", price: "" }
  ]);
  
  const [tables, setTables] = useState<Table[]>([
    { table_number: "", seats: "", location: "" }
  ]);

  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!isLoggedIn) {
      navigate("/auth");
      return;
    }
  }, [isLoggedIn, navigate]);

  const handleCoverImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setCoverImage(file);
      setCoverPreview(URL.createObjectURL(file));
    }
  };

  const handleLogoImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setLogoImage(file);
      setLogoPreview(URL.createObjectURL(file));
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

  const addTable = () => {
    setTables([...tables, { table_number: "", seats: "", location: "" }]);
  };

  const removeTable = (index: number) => {
    setTables(tables.filter((_, i) => i !== index));
  };

  const updateTable = (index: number, field: keyof Table, value: string) => {
    const updated = [...tables];
    updated[index][field] = value;
    setTables(updated);
  };

  const uploadImage = async (file: File, type: 'cover' | 'logo') => {
    if (!profile?.id) return null;

    const fileExt = file.name.split('.').pop();
    const fileName = `${profile.id}/${type}-${Math.random()}.${fileExt}`;

    const { error: uploadError } = await supabase.storage
      .from('restaurant-images')
      .upload(fileName, file, { upsert: true });

    if (uploadError) throw uploadError;

    const { data: { publicUrl } } = supabase.storage
      .from('restaurant-images')
      .getPublicUrl(fileName);

    return publicUrl;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!profile?.id) {
      toast({
        title: "Errore",
        description: "Devi essere autenticato per registrare un ristorante",
        variant: "destructive",
      });
      return;
    }

    setSubmitting(true);

    try {
      // Upload images
      let coverUrl = null;
      let logoUrl = null;

      if (coverImage) {
        coverUrl = await uploadImage(coverImage, 'cover');
      }

      if (logoImage) {
        logoUrl = await uploadImage(logoImage, 'logo');
      }

      // Create restaurant
      const { data: restaurant, error: restaurantError } = await supabase
        .from('restaurants')
        .insert({
          owner_id: profile.id,
          name,
          description,
          address,
          city,
          phone,
          email,
          cuisine_type: cuisineType,
          price_range: priceRange,
          cover_image_url: coverUrl,
          logo_url: logoUrl,
        })
        .select()
        .single();

      if (restaurantError) throw restaurantError;

      // Insert menu items
      const validMenuItems = menuItems.filter(item => item.name && item.price);
      if (validMenuItems.length > 0) {
        const { error: menuError } = await supabase
          .from('menus')
          .insert(
            validMenuItems.map(item => ({
              restaurant_id: restaurant.id,
              name: item.name,
              description: item.description,
              category: item.category,
              price: parseFloat(item.price),
            }))
          );

        if (menuError) throw menuError;
      }

      // Insert tables
      const validTables = tables.filter(table => table.table_number && table.seats);
      if (validTables.length > 0) {
        const { error: tablesError } = await supabase
          .from('restaurant_tables')
          .insert(
            validTables.map(table => ({
              restaurant_id: restaurant.id,
              table_number: table.table_number,
              seats: parseInt(table.seats),
              location: table.location,
            }))
          );

        if (tablesError) throw tablesError;
      }

      toast({
        title: "Successo!",
        description: "Ristorante registrato con successo",
      });

      navigate("/");
    } catch (error: any) {
      toast({
        title: "Errore",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="pt-24 pb-16">
        <div className="container mx-auto px-4 max-w-4xl">
          <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-2">
            Registra il Tuo Ristorante
          </h1>
          <p className="text-muted-foreground mb-8">
            Compila il modulo per aggiungere il tuo ristorante a OneTable
          </p>
          
          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Informazioni Base */}
            <Card className="p-8">
              <h2 className="text-2xl font-bold mb-6">Informazioni Base</h2>
              
              <div className="space-y-4">
                <div>
                  <Label htmlFor="name">Nome Ristorante *</Label>
                  <Input
                    id="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    className="mt-2"
                  />
                </div>

                <div>
                  <Label htmlFor="description">Descrizione</Label>
                  <Textarea
                    id="description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="mt-2"
                    rows={4}
                  />
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="cuisineType">Tipo di Cucina</Label>
                    <Input
                      id="cuisineType"
                      value={cuisineType}
                      onChange={(e) => setCuisineType(e.target.value)}
                      placeholder="Es: Italiana, Giapponese"
                      className="mt-2"
                    />
                  </div>

                  <div>
                    <Label htmlFor="priceRange">Fascia di Prezzo</Label>
                    <Input
                      id="priceRange"
                      value={priceRange}
                      onChange={(e) => setPriceRange(e.target.value)}
                      placeholder="Es: €€, €€€"
                      className="mt-2"
                    />
                  </div>
                </div>
              </div>
            </Card>

            {/* Contatti e Posizione */}
            <Card className="p-8">
              <h2 className="text-2xl font-bold mb-6">Contatti e Posizione</h2>
              
              <div className="space-y-4">
                <div>
                  <Label htmlFor="address">Indirizzo *</Label>
                  <Input
                    id="address"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    required
                    className="mt-2"
                  />
                </div>

                <div>
                  <Label htmlFor="city">Città *</Label>
                  <Input
                    id="city"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    required
                    className="mt-2"
                  />
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="phone">Telefono *</Label>
                    <Input
                      id="phone"
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      required
                      className="mt-2"
                    />
                  </div>

                  <div>
                    <Label htmlFor="email">Email *</Label>
                    <Input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      className="mt-2"
                    />
                  </div>
                </div>
              </div>
            </Card>

            {/* Immagini */}
            <Card className="p-8">
              <h2 className="text-2xl font-bold mb-6">Immagini</h2>
              
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <Label>Immagine di Copertina</Label>
                  <div className="mt-2">
                    {coverPreview && (
                      <img src={coverPreview} alt="Cover preview" className="w-full h-40 object-cover rounded-lg mb-2" />
                    )}
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => coverInputRef.current?.click()}
                      className="w-full"
                    >
                      <Upload className="w-4 h-4 mr-2" />
                      Carica Copertina
                    </Button>
                    <input
                      ref={coverInputRef}
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleCoverImageChange}
                    />
                  </div>
                </div>

                <div>
                  <Label>Logo</Label>
                  <div className="mt-2">
                    {logoPreview && (
                      <img src={logoPreview} alt="Logo preview" className="w-full h-40 object-contain rounded-lg mb-2 bg-muted" />
                    )}
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => logoInputRef.current?.click()}
                      className="w-full"
                    >
                      <Upload className="w-4 h-4 mr-2" />
                      Carica Logo
                    </Button>
                    <input
                      ref={logoInputRef}
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleLogoImageChange}
                    />
                  </div>
                </div>
              </div>
            </Card>

            {/* Menu */}
            <Card className="p-8">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold">Menu</h2>
                <Button type="button" onClick={addMenuItem} variant="outline">
                  <Plus className="w-4 h-4 mr-2" />
                  Aggiungi Piatto
                </Button>
              </div>
              
              <div className="space-y-4">
                {menuItems.map((item, index) => (
                  <div key={index} className="border rounded-lg p-4 relative">
                    {menuItems.length > 1 && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="absolute top-2 right-2"
                        onClick={() => removeMenuItem(index)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    )}
                    
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <Label>Nome Piatto</Label>
                        <Input
                          value={item.name}
                          onChange={(e) => updateMenuItem(index, 'name', e.target.value)}
                          className="mt-2"
                        />
                      </div>
                      
                      <div>
                        <Label>Categoria</Label>
                        <Input
                          value={item.category}
                          onChange={(e) => updateMenuItem(index, 'category', e.target.value)}
                          placeholder="Es: Antipasti, Primi"
                          className="mt-2"
                        />
                      </div>
                      
                      <div>
                        <Label>Prezzo (€)</Label>
                        <Input
                          type="number"
                          step="0.01"
                          value={item.price}
                          onChange={(e) => updateMenuItem(index, 'price', e.target.value)}
                          className="mt-2"
                        />
                      </div>
                      
                      <div>
                        <Label>Descrizione</Label>
                        <Input
                          value={item.description}
                          onChange={(e) => updateMenuItem(index, 'description', e.target.value)}
                          className="mt-2"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            {/* Tavoli */}
            <Card className="p-8">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold">Tavoli</h2>
                <Button type="button" onClick={addTable} variant="outline">
                  <Plus className="w-4 h-4 mr-2" />
                  Aggiungi Tavolo
                </Button>
              </div>
              
              <div className="space-y-4">
                {tables.map((table, index) => (
                  <div key={index} className="border rounded-lg p-4 relative">
                    {tables.length > 1 && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="absolute top-2 right-2"
                        onClick={() => removeTable(index)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    )}
                    
                    <div className="grid md:grid-cols-3 gap-4">
                      <div>
                        <Label>Numero Tavolo</Label>
                        <Input
                          value={table.table_number}
                          onChange={(e) => updateTable(index, 'table_number', e.target.value)}
                          placeholder="Es: T1, A5"
                          className="mt-2"
                        />
                      </div>
                      
                      <div>
                        <Label>Posti</Label>
                        <Input
                          type="number"
                          value={table.seats}
                          onChange={(e) => updateTable(index, 'seats', e.target.value)}
                          className="mt-2"
                        />
                      </div>
                      
                      <div>
                        <Label>Posizione</Label>
                        <Input
                          value={table.location}
                          onChange={(e) => updateTable(index, 'location', e.target.value)}
                          placeholder="Es: Terrazza, Sala VIP"
                          className="mt-2"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            <Button type="submit" size="lg" className="w-full" disabled={submitting}>
              {submitting ? "Registrazione in corso..." : "Registra Ristorante"}
            </Button>
          </form>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default RestaurantRegistration;
