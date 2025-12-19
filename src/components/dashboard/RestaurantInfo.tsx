import { useState, useRef } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Upload, Image as ImageIcon, Save, ChefHat, Utensils, Calendar, Sparkles, X, Images } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CUISINE_TYPES, SPECIALIZATIONS, OCCASIONS, EXTRA_FEATURES } from "@/lib/restaurantCategories";

interface RestaurantInfoProps {
  restaurant: any;
  onUpdate: () => void;
}

export const RestaurantInfo = ({ restaurant, onUpdate }: RestaurantInfoProps) => {
  const [uploading, setUploading] = useState(false);
  const [uploadingGallery, setUploadingGallery] = useState(false);
  const [name, setName] = useState(restaurant?.name || "");
  const [description, setDescription] = useState(restaurant?.description || "");
  const [priceRange, setPriceRange] = useState(restaurant?.price_range || "");
  const [address, setAddress] = useState(restaurant?.address || "");
  const [city, setCity] = useState(restaurant?.city || "");
  const [phone, setPhone] = useState(restaurant?.phone || "");
  const [email, setEmail] = useState(restaurant?.email || "");
  const [galleryImages, setGalleryImages] = useState<string[]>(restaurant?.gallery_images || []);
  
  // Stati per le categorie
  const [cuisineTypes, setCuisineTypes] = useState<string[]>(restaurant?.cuisine_types || []);
  const [specializations, setSpecializations] = useState<string[]>(restaurant?.specializations || []);
  const [occasions, setOccasions] = useState<string[]>(restaurant?.occasions || []);
  const [extraFeatures, setExtraFeatures] = useState<string[]>(restaurant?.extra_features || []);
  
  const coverInputRef = useRef<HTMLInputElement>(null);
  const logoInputRef = useRef<HTMLInputElement>(null);
  const galleryInputRef = useRef<HTMLInputElement>(null);

  const toggleCategory = (
    category: string, 
    current: string[], 
    setter: React.Dispatch<React.SetStateAction<string[]>>
  ) => {
    if (current.includes(category)) {
      setter(current.filter(c => c !== category));
    } else {
      setter([...current, category]);
    }
  };

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

  const handleGalleryUpload = async (files: FileList) => {
    if (!restaurant?.id) return;
    
    const currentCount = galleryImages.length;
    const remainingSlots = 10 - currentCount;
    
    if (remainingSlots <= 0) {
      toast.error("Hai raggiunto il limite massimo di 10 immagini");
      return;
    }

    const filesToUpload = Array.from(files).slice(0, remainingSlots);
    
    setUploadingGallery(true);
    try {
      const uploadedUrls: string[] = [];
      
      for (const file of filesToUpload) {
        const fileExt = file.name.split('.').pop();
        const fileName = `${restaurant.id}/gallery-${Date.now()}-${Math.random()}.${fileExt}`;

        const { error: uploadError } = await supabase.storage
          .from('restaurant-images')
          .upload(fileName, file);

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
          .from('restaurant-images')
          .getPublicUrl(fileName);
          
        uploadedUrls.push(publicUrl);
      }

      const newGallery = [...galleryImages, ...uploadedUrls];
      
      const { error: updateError } = await supabase
        .from('restaurants')
        .update({ gallery_images: newGallery })
        .eq('id', restaurant.id);

      if (updateError) throw updateError;

      setGalleryImages(newGallery);
      toast.success(`${uploadedUrls.length} immagini caricate con successo`);
      onUpdate();
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setUploadingGallery(false);
    }
  };

  const removeGalleryImage = async (indexToRemove: number) => {
    const newGallery = galleryImages.filter((_, i) => i !== indexToRemove);
    
    try {
      const { error } = await supabase
        .from('restaurants')
        .update({ gallery_images: newGallery })
        .eq('id', restaurant.id);

      if (error) throw error;

      setGalleryImages(newGallery);
      toast.success("Immagine rimossa");
      onUpdate();
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  // Genera la stringa cuisine_type dalla selezione
  const generateCuisineTypeString = () => {
    const allSelected = [...cuisineTypes, ...specializations.slice(0, 1)];
    return allSelected.slice(0, 2).join(" • ") || "";
  };

  const handleInfoUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const { error } = await supabase
        .from('restaurants')
        .update({
          name,
          description,
          cuisine_type: generateCuisineTypeString(),
          price_range: priceRange,
          address,
          city,
          phone,
          email,
          cuisine_types: cuisineTypes,
          specializations: specializations,
          occasions: occasions,
          extra_features: extraFeatures,
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

      {/* Gallery Images Card */}
      <Card className="p-6">
        <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <Images className="w-5 h-5" />
          Galleria Immagini (Carosello)
        </h3>
        <p className="text-sm text-muted-foreground mb-4">
          Carica fino a 10 immagini che verranno mostrate come carosello sulla card del ristorante. Se caricate, sostituiranno l'immagine di copertina sulla card.
        </p>
        
        {/* Gallery Grid */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-4">
          {galleryImages.map((img, index) => (
            <div key={index} className="relative group">
              <img 
                src={img} 
                alt={`Gallery ${index + 1}`}
                className="w-full h-24 object-cover rounded-lg border border-border"
              />
              <button
                type="button"
                onClick={() => removeGalleryImage(index)}
                className="absolute -top-2 -right-2 p-1 rounded-full bg-destructive text-destructive-foreground opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <X className="w-3 h-3" />
              </button>
              <span className="absolute bottom-1 left-1 text-xs bg-black/60 text-white px-1.5 py-0.5 rounded">
                {index + 1}
              </span>
            </div>
          ))}
          
          {galleryImages.length < 10 && (
            <button
              type="button"
              onClick={() => galleryInputRef.current?.click()}
              disabled={uploadingGallery}
              className="w-full h-24 border-2 border-dashed border-border rounded-lg flex flex-col items-center justify-center text-muted-foreground hover:border-primary hover:text-primary transition-colors"
            >
              <Upload className="w-5 h-5 mb-1" />
              <span className="text-xs">Aggiungi</span>
            </button>
          )}
        </div>
        
        <input
          type="file"
          ref={galleryInputRef}
          onChange={(e) => e.target.files && handleGalleryUpload(e.target.files)}
          accept="image/*"
          multiple
          className="hidden"
        />
        
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">
            {galleryImages.length}/10 immagini
          </span>
          <Button
            type="button"
            variant="outline"
            onClick={() => galleryInputRef.current?.click()}
            disabled={uploadingGallery || galleryImages.length >= 10}
          >
            <Upload className="w-4 h-4 mr-2" />
            {uploadingGallery ? "Caricamento..." : "Carica Immagini"}
          </Button>
        </div>
      </Card>

      <Card className="p-6">
        <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <Save className="w-5 h-5" />
          Informazioni Ristorante
        </h3>
        
        <form onSubmit={handleInfoUpdate} className="space-y-6">
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

            <div className="space-y-2">
              <Label htmlFor="address">Indirizzo Completo *</Label>
              <Input
                id="address"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Descrizione</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              placeholder="Racconta la storia del tuo ristorante..."
            />
          </div>

          {/* Categorie Selezionabili */}
          <div className="space-y-6 pt-4 border-t border-border">
            <div>
              <h4 className="text-lg font-semibold mb-2">Categorie e Tag</h4>
              <p className="text-sm text-muted-foreground">
                Seleziona le categorie che descrivono meglio il tuo ristorante. Questi tag aiuteranno i clienti a trovarti.
              </p>
            </div>

            {/* Tipo di Cucina */}
            <div className="space-y-3">
              <Label className="flex items-center gap-2 text-base">
                <ChefHat className="w-4 h-4 text-primary" />
                Tipo di Cucina
              </Label>
              <div className="flex flex-wrap gap-2">
                {CUISINE_TYPES.map((type) => (
                  <Badge
                    key={type}
                    variant={cuisineTypes.includes(type) ? "default" : "outline"}
                    className="cursor-pointer hover:bg-primary/80 transition-colors py-1.5 px-3"
                    onClick={() => toggleCategory(type, cuisineTypes, setCuisineTypes)}
                  >
                    {type}
                  </Badge>
                ))}
              </div>
              {cuisineTypes.length > 0 && (
                <p className="text-xs text-muted-foreground">
                  Selezionati: {cuisineTypes.join(", ")}
                </p>
              )}
            </div>

            {/* Specializzazione */}
            <div className="space-y-3">
              <Label className="flex items-center gap-2 text-base">
                <Utensils className="w-4 h-4 text-primary" />
                Specializzazione / Format
              </Label>
              <div className="flex flex-wrap gap-2">
                {SPECIALIZATIONS.map((spec) => (
                  <Badge
                    key={spec}
                    variant={specializations.includes(spec) ? "default" : "outline"}
                    className="cursor-pointer hover:bg-primary/80 transition-colors py-1.5 px-3"
                    onClick={() => toggleCategory(spec, specializations, setSpecializations)}
                  >
                    {spec}
                  </Badge>
                ))}
              </div>
              {specializations.length > 0 && (
                <p className="text-xs text-muted-foreground">
                  Selezionati: {specializations.join(", ")}
                </p>
              )}
            </div>

            {/* Occasioni */}
            <div className="space-y-3">
              <Label className="flex items-center gap-2 text-base">
                <Calendar className="w-4 h-4 text-primary" />
                Occasione e Contesto
              </Label>
              <div className="flex flex-wrap gap-2">
                {OCCASIONS.map((occasion) => (
                  <Badge
                    key={occasion}
                    variant={occasions.includes(occasion) ? "default" : "outline"}
                    className="cursor-pointer hover:bg-primary/80 transition-colors py-1.5 px-3"
                    onClick={() => toggleCategory(occasion, occasions, setOccasions)}
                  >
                    {occasion}
                  </Badge>
                ))}
              </div>
              {occasions.length > 0 && (
                <p className="text-xs text-muted-foreground">
                  Selezionati: {occasions.join(", ")}
                </p>
              )}
            </div>

            {/* Extra Features */}
            <div className="space-y-3">
              <Label className="flex items-center gap-2 text-base">
                <Sparkles className="w-4 h-4 text-primary" />
                Extra e Servizi
              </Label>
              <div className="flex flex-wrap gap-2">
                {EXTRA_FEATURES.map((feature) => (
                  <Badge
                    key={feature}
                    variant={extraFeatures.includes(feature) ? "default" : "outline"}
                    className="cursor-pointer hover:bg-primary/80 transition-colors py-1.5 px-3"
                    onClick={() => toggleCategory(feature, extraFeatures, setExtraFeatures)}
                  >
                    {feature}
                  </Badge>
                ))}
              </div>
              {extraFeatures.length > 0 && (
                <p className="text-xs text-muted-foreground">
                  Selezionati: {extraFeatures.join(", ")}
                </p>
              )}
            </div>
          </div>

          <Button type="submit" className="w-full" size="lg">
            <Save className="w-4 h-4 mr-2" />
            Salva Modifiche
          </Button>
        </form>
      </Card>
    </div>
  );
};