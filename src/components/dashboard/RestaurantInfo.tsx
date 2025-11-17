import { useState, useRef } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Upload, Image as ImageIcon, Save } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface RestaurantInfoProps {
  restaurant: any;
  onUpdate: () => void;
}

export const RestaurantInfo = ({ restaurant, onUpdate }: RestaurantInfoProps) => {
  const [uploading, setUploading] = useState(false);
  const [name, setName] = useState(restaurant?.name || "");
  const [description, setDescription] = useState(restaurant?.description || "");
  const [cuisineType, setCuisineType] = useState(restaurant?.cuisine_type || "");
  const [priceRange, setPriceRange] = useState(restaurant?.price_range || "");
  const [address, setAddress] = useState(restaurant?.address || "");
  const [city, setCity] = useState(restaurant?.city || "");
  const [phone, setPhone] = useState(restaurant?.phone || "");
  const [email, setEmail] = useState(restaurant?.email || "");
  
  const coverInputRef = useRef<HTMLInputElement>(null);
  const logoInputRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = async (file: File, type: 'cover' | 'logo') => {
    if (!restaurant?.id) return;

    setUploading(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${restaurant.id}/${type}-${Math.random()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('restaurant-images')
        .upload(fileName, file, { upsert: true });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('restaurant-images')
        .getPublicUrl(fileName);

      const updateField = type === 'cover' ? 'cover_image_url' : 'logo_url';
      const { error: updateError } = await supabase
        .from('restaurants')
        .update({ [updateField]: publicUrl })
        .eq('id', restaurant.id);

      if (updateError) throw updateError;

      toast.success(`${type === 'cover' ? 'Immagine di copertina' : 'Logo'} aggiornato con successo`);
      onUpdate();
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setUploading(false);
    }
  };

  const handleInfoUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const { error } = await supabase
        .from('restaurants')
        .update({
          name,
          description,
          cuisine_type: cuisineType,
          price_range: priceRange,
          address,
          city,
          phone,
          email,
        })
        .eq('id', restaurant.id);

      if (error) throw error;

      toast.success("Informazioni aggiornate con successo");
      onUpdate();
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <ImageIcon className="w-5 h-5" />
          Immagini del Ristorante
        </h3>
        
        <div className="grid md:grid-cols-2 gap-6">
          {/* Cover Image */}
          <div className="space-y-3">
            <Label>Immagine di Copertina</Label>
            {restaurant?.cover_image_url && (
              <img 
                src={restaurant.cover_image_url} 
                alt="Cover" 
                className="w-full h-48 object-cover rounded-lg border border-border"
              />
            )}
            <input
              type="file"
              ref={coverInputRef}
              onChange={(e) => e.target.files?.[0] && handleImageUpload(e.target.files[0], 'cover')}
              accept="image/*"
              className="hidden"
            />
            <Button
              type="button"
              variant="outline"
              onClick={() => coverInputRef.current?.click()}
              disabled={uploading}
              className="w-full"
            >
              <Upload className="w-4 h-4 mr-2" />
              {uploading ? "Caricamento..." : "Carica Copertina"}
            </Button>
          </div>

          {/* Logo */}
          <div className="space-y-3">
            <Label>Logo Ristorante</Label>
            {restaurant?.logo_url && (
              <img 
                src={restaurant.logo_url} 
                alt="Logo" 
                className="w-full h-48 object-contain rounded-lg border border-border bg-muted"
              />
            )}
            <input
              type="file"
              ref={logoInputRef}
              onChange={(e) => e.target.files?.[0] && handleImageUpload(e.target.files[0], 'logo')}
              accept="image/*"
              className="hidden"
            />
            <Button
              type="button"
              variant="outline"
              onClick={() => logoInputRef.current?.click()}
              disabled={uploading}
              className="w-full"
            >
              <Upload className="w-4 h-4 mr-2" />
              {uploading ? "Caricamento..." : "Carica Logo"}
            </Button>
          </div>
        </div>
      </Card>

      <Card className="p-6">
        <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <Save className="w-5 h-5" />
          Informazioni Ristorante
        </h3>
        
        <form onSubmit={handleInfoUpdate} className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nome Ristorante *</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="cuisineType">Tipo di Cucina</Label>
              <Input
                id="cuisineType"
                value={cuisineType}
                onChange={(e) => setCuisineType(e.target.value)}
                placeholder="Es: Italiana, Giapponese, Mediterranea"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="priceRange">Fascia di Prezzo</Label>
              <Select value={priceRange} onValueChange={setPriceRange}>
                <SelectTrigger>
                  <SelectValue placeholder="Seleziona fascia" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="€">€ - Economico</SelectItem>
                  <SelectItem value="€€">€€ - Medio</SelectItem>
                  <SelectItem value="€€€">€€€ - Costoso</SelectItem>
                  <SelectItem value="€€€€">€€€€ - Molto Costoso</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Telefono *</Label>
              <Input
                id="phone"
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email *</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="city">Città *</Label>
              <Input
                id="city"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="address">Indirizzo Completo *</Label>
            <Input
              id="address"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Descrizione</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
              placeholder="Racconta la storia del tuo ristorante..."
            />
          </div>

          <Button type="submit" className="w-full">
            <Save className="w-4 h-4 mr-2" />
            Salva Modifiche
          </Button>
        </form>
      </Card>
    </div>
  );
};
