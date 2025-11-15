import { useParams, useNavigate } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Star, MapPin, Phone, Mail, Clock } from "lucide-react";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

const RestaurantDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
  const [review, setReview] = useState("");
  const [rating, setRating] = useState(5);

  // Dati mock del ristorante
  const restaurant = {
    name: "La Terrazza del Sole",
    cuisine: "Cucina Italiana Gourmet",
    location: "Centro Storico, Milano",
    rating: 4.8,
    priceRange: "€€€",
    image: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=1200&q=80",
    phone: "+39 02 1234 5678",
    email: "info@terrazzadelsole.it",
    address: "Via Roma 42, 20121 Milano",
    hours: "Mar-Dom: 12:00-15:00, 19:00-23:00",
    description: "Un'esperienza culinaria unica nel cuore di Milano. La nostra cucina combina tradizione e innovazione.",
  };

  const availableSlots = [
    "12:00", "12:30", "13:00", "13:30", "14:00",
    "19:00", "19:30", "20:00", "20:30", "21:00", "21:30"
  ];

  const menuItems = [
    { category: "Antipasti", items: ["Carpaccio di manzo", "Burrata con pomodorini", "Tartare di salmone"] },
    { category: "Primi", items: ["Risotto alla milanese", "Tagliatelle al tartufo", "Ravioli burro e salvia"] },
    { category: "Secondi", items: ["Filetto di manzo", "Branzino al forno", "Ossobuco con gremolata"] },
    { category: "Dolci", items: ["Tiramisù", "Panna cotta", "Torta della casa"] }
  ];

  const reviews = [
    { author: "Marco R.", rating: 5, date: "2 giorni fa", text: "Esperienza fantastica! Cibo eccellente e servizio impeccabile." },
    { author: "Laura B.", rating: 4, date: "1 settimana fa", text: "Ottimo ristorante, ambiente elegante. Prezzi un po' alti ma ne vale la pena." },
    { author: "Giuseppe T.", rating: 5, date: "2 settimane fa", text: "Il miglior ristorante di Milano! Tornerò sicuramente." }
  ];

  const handleBooking = () => {
    if (!selectedSlot) {
      toast({
        title: "Seleziona un orario",
        description: "Scegli uno slot disponibile per procedere con la prenotazione.",
        variant: "destructive"
      });
      return;
    }
    
    toast({
      title: "Prenotazione confermata!",
      description: `Il tuo tavolo è prenotato per le ${selectedSlot}. Riceverai una email di conferma.`,
    });
  };

  const handleReviewSubmit = () => {
    if (!review.trim()) return;
    
    toast({
      title: "Recensione pubblicata!",
      description: "Grazie per il tuo feedback.",
    });
    setReview("");
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="pt-16">
        {/* Hero Image */}
        <div 
          className="h-96 bg-cover bg-center relative"
          style={{ backgroundImage: `url(${restaurant.image})` }}
        >
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/50 to-transparent" />
        </div>

        <div className="container mx-auto px-4 -mt-32 relative z-10 pb-16">
          <Card className="p-8 mb-8">
            <div className="flex flex-col md:flex-row justify-between items-start gap-6">
              <div className="flex-1">
                <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-2">
                  {restaurant.name}
                </h1>
                <p className="text-xl text-muted-foreground mb-4">{restaurant.cuisine}</p>
                
                <div className="flex flex-wrap gap-4 mb-6">
                  <div className="flex items-center gap-1">
                    <Star className="w-5 h-5 text-primary fill-primary" />
                    <span className="font-bold text-foreground">{restaurant.rating}</span>
                  </div>
                  <Badge variant="outline">{restaurant.priceRange}</Badge>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <MapPin className="w-4 h-4" />
                    <span>{restaurant.location}</span>
                  </div>
                </div>
                
                <p className="text-muted-foreground leading-relaxed">
                  {restaurant.description}
                </p>
              </div>
              
              <Button 
                size="lg" 
                className="bg-primary hover:bg-primary/90 min-w-[200px]"
                onClick={() => document.getElementById('booking')?.scrollIntoView({ behavior: 'smooth' })}
              >
                Prenota Ora
              </Button>
            </div>
          </Card>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Colonna principale */}
            <div className="md:col-span-2 space-y-8">
              <Tabs defaultValue="menu" className="w-full">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="menu">Menu</TabsTrigger>
                  <TabsTrigger value="booking">Prenotazione</TabsTrigger>
                  <TabsTrigger value="reviews">Recensioni</TabsTrigger>
                </TabsList>
                
                <TabsContent value="menu" className="mt-6">
                  <Card className="p-6">
                    <h2 className="text-2xl font-bold text-foreground mb-6">Il Nostro Menu</h2>
                    <div className="space-y-6">
                      {menuItems.map((section, idx) => (
                        <div key={idx}>
                          <h3 className="text-xl font-bold text-primary mb-3">{section.category}</h3>
                          <ul className="space-y-2">
                            {section.items.map((item, i) => (
                              <li key={i} className="text-muted-foreground pl-4 border-l-2 border-primary/20">
                                {item}
                              </li>
                            ))}
                          </ul>
                        </div>
                      ))}
                    </div>
                  </Card>
                </TabsContent>
                
                <TabsContent value="booking" id="booking" className="mt-6">
                  <Card className="p-6">
                    <h2 className="text-2xl font-bold text-foreground mb-6">Prenota il Tuo Tavolo</h2>
                    
                    <div className="space-y-6">
                      <div>
                        <h3 className="font-semibold text-foreground mb-3">Seleziona Orario</h3>
                        <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                          {availableSlots.map((slot) => (
                            <Button
                              key={slot}
                              variant={selectedSlot === slot ? "default" : "outline"}
                              onClick={() => setSelectedSlot(slot)}
                              className="w-full"
                            >
                              {slot}
                            </Button>
                          ))}
                        </div>
                      </div>
                      
                      <Button 
                        onClick={handleBooking}
                        className="w-full bg-primary hover:bg-primary/90"
                        size="lg"
                      >
                        Conferma Prenotazione
                      </Button>
                    </div>
                  </Card>
                </TabsContent>
                
                <TabsContent value="reviews" className="mt-6">
                  <Card className="p-6">
                    <h2 className="text-2xl font-bold text-foreground mb-6">Recensioni</h2>
                    
                    {/* Form nuova recensione (solo per utenti loggati) */}
                    <div className="mb-8 p-4 bg-muted/30 rounded-lg">
                      <h3 className="font-semibold text-foreground mb-3">Lascia una recensione</h3>
                      <div className="flex gap-1 mb-3">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star
                            key={star}
                            className={`w-6 h-6 cursor-pointer ${
                              star <= rating ? "text-primary fill-primary" : "text-muted-foreground"
                            }`}
                            onClick={() => setRating(star)}
                          />
                        ))}
                      </div>
                      <Textarea
                        placeholder="Condividi la tua esperienza..."
                        value={review}
                        onChange={(e) => setReview(e.target.value)}
                        className="mb-3"
                      />
                      <Button onClick={handleReviewSubmit} className="bg-primary hover:bg-primary/90">
                        Pubblica Recensione
                      </Button>
                    </div>
                    
                    {/* Lista recensioni */}
                    <div className="space-y-4">
                      {reviews.map((rev, idx) => (
                        <div key={idx} className="border-b border-border pb-4 last:border-0">
                          <div className="flex items-center justify-between mb-2">
                            <span className="font-semibold text-foreground">{rev.author}</span>
                            <span className="text-sm text-muted-foreground">{rev.date}</span>
                          </div>
                          <div className="flex gap-1 mb-2">
                            {[...Array(rev.rating)].map((_, i) => (
                              <Star key={i} className="w-4 h-4 text-primary fill-primary" />
                            ))}
                          </div>
                          <p className="text-muted-foreground">{rev.text}</p>
                        </div>
                      ))}
                    </div>
                  </Card>
                </TabsContent>
              </Tabs>
            </div>

            {/* Sidebar contatti */}
            <div className="space-y-6">
              <Card className="p-6">
                <h3 className="font-bold text-foreground mb-4">Contatti</h3>
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <Phone className="w-5 h-5 text-primary mt-0.5" />
                    <div>
                      <p className="text-sm text-muted-foreground">Telefono</p>
                      <a href={`tel:${restaurant.phone}`} className="text-foreground hover:text-primary">
                        {restaurant.phone}
                      </a>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3">
                    <Mail className="w-5 h-5 text-primary mt-0.5" />
                    <div>
                      <p className="text-sm text-muted-foreground">Email</p>
                      <a href={`mailto:${restaurant.email}`} className="text-foreground hover:text-primary break-all">
                        {restaurant.email}
                      </a>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3">
                    <MapPin className="w-5 h-5 text-primary mt-0.5" />
                    <div>
                      <p className="text-sm text-muted-foreground">Indirizzo</p>
                      <p className="text-foreground">{restaurant.address}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3">
                    <Clock className="w-5 h-5 text-primary mt-0.5" />
                    <div>
                      <p className="text-sm text-muted-foreground">Orari</p>
                      <p className="text-foreground">{restaurant.hours}</p>
                    </div>
                  </div>
                </div>
              </Card>
              
              <Card className="p-6 bg-primary/5 border-primary/20">
                <h3 className="font-bold text-foreground mb-2">Vantaggi OneTable</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Prenota con OneTable e ottieni vantaggi esclusivi basati sul tuo livello!
                </p>
                <Button variant="outline" className="w-full" onClick={() => navigate('/auth')}>
                  Accedi per i Vantaggi
                </Button>
              </Card>
            </div>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default RestaurantDetail;
