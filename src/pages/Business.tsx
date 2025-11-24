import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle, TrendingDown, Users, Calendar, BarChart3, Shield } from "lucide-react";
import heroBusinessImage from "@/assets/hero-business.jpg";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

const Business = () => {
  const navigate = useNavigate();
  const { isLoggedIn } = useAuth();
  
  useEffect(() => {
    if (!isLoggedIn) {
      navigate('/auth');
      return;
    }
    window.scrollTo(0, 0);
  }, [isLoggedIn, navigate]);

  return (
    <div className="min-h-screen">
      <Header />
      
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center overflow-hidden pt-16">
        <div 
          className="absolute inset-0 z-0"
          style={{
            backgroundImage: `linear-gradient(135deg, rgba(38, 38, 38, 0.88), rgba(38, 38, 38, 0.75)), url(${heroBusinessImage})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        />
        
        <div className="container mx-auto px-4 z-10 relative">
          <div className="max-w-3xl">
            <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 leading-tight">
              Riduci i No-Show,
              <span className="block text-primary drop-shadow-lg">
                Aumenta i Ricavi
              </span>
            </h1>
            
            <p className="text-xl text-white/90 mb-8 leading-relaxed">
              Unisciti a OneTable e trasforma i tavoli vuoti in opportunità. Il nostro sistema di 
              reputazione incentiva i clienti affidabili e riduce drasticamente le mancate presentazioni.
            </p>
            
            <div className="bg-background/10 backdrop-blur-sm rounded-lg p-6 mb-8 border border-white/20">
              <div className="flex items-center gap-3 mb-2">
                <TrendingDown className="w-8 h-8 text-primary" />
                <div className="text-4xl font-bold text-white">€16 Miliardi</div>
              </div>
              <p className="text-white/90">
                Perdite annuali in Europa causate dai no-show nei ristoranti
              </p>
            </div>
            
            <div className="flex flex-wrap gap-4">
              <Button 
                size="lg" 
                className="bg-primary text-primary-foreground hover:bg-primary/90 shadow-elegant text-lg px-8"
                onClick={() => navigate('/business-registration')}
              >
                Registra il Tuo Ristorante
              </Button>
              <Button 
                size="lg" 
                variant="outline" 
                className="border-white text-white hover:bg-white/10 text-lg px-8"
                onClick={() => document.getElementById('benefits')?.scrollIntoView({ behavior: 'smooth' })}
              >
                Scopri di Più
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section id="benefits" className="py-20 bg-background">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              Perché Scegliere OneTable
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Una soluzione completa per gestire le prenotazioni e premiare i clienti migliori
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card className="shadow-card">
              <CardHeader>
                <CheckCircle className="w-12 h-12 text-primary mb-4" />
                <CardTitle>Riduzione No-Show</CardTitle>
                <CardDescription>
                  Sistema di reputazione che penalizza chi non si presenta, riducendo fino al 60% le mancate prenotazioni
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="shadow-card">
              <CardHeader>
                <Users className="w-12 h-12 text-primary mb-4" />
                <CardTitle>Clienti di Qualità</CardTitle>
                <CardDescription>
                  Attrai e premia i clienti più affidabili e puntuali con vantaggi esclusivi personalizzati
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="shadow-card">
              <CardHeader>
                <Calendar className="w-12 h-12 text-primary mb-4" />
                <CardTitle>Gestione Semplificata</CardTitle>
                <CardDescription>
                  Piattaforma intuitiva per gestire prenotazioni, valutazioni clienti e disponibilità in tempo reale
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="shadow-card">
              <CardHeader>
                <BarChart3 className="w-12 h-12 text-primary mb-4" />
                <CardTitle>Analytics Avanzate</CardTitle>
                <CardDescription>
                  Dashboard completa con statistiche dettagliate su prenotazioni, tassi di presentazione e ricavi
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="shadow-card">
              <CardHeader>
                <Shield className="w-12 h-12 text-primary mb-4" />
                <CardTitle>Protezione Garantita</CardTitle>
                <CardDescription>
                  Sistema di verifica clienti e possibilità di richiedere depositi per prenotazioni di alto valore
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="shadow-card">
              <CardHeader>
                <TrendingDown className="w-12 h-12 text-primary mb-4" />
                <CardTitle>Costi Ridotti</CardTitle>
                <CardDescription>
                  Elimina sprechi e ottimizza il personale grazie a previsioni accurate sulle effettive presenze
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              Come Funziona per le Aziende
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Quattro semplici passaggi per iniziare a ridurre i no-show
            </p>
          </div>

          <div className="max-w-5xl mx-auto grid md:grid-cols-2 gap-6">
            <Card className="shadow-card hover:shadow-elegant transition-shadow">
              <CardHeader>
                <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                  <div className="text-3xl font-bold text-primary">1</div>
                </div>
                <CardTitle className="text-2xl mb-2">Registrazione e Setup</CardTitle>
                <CardDescription className="text-base">
                  Crea il tuo profilo aziendale, configura i tavoli, gli orari e le politiche di prenotazione in pochi minuti. 
                  Il nostro sistema intuitivo ti guiderà in ogni passaggio.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="shadow-card hover:shadow-elegant transition-shadow">
              <CardHeader>
                <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                  <div className="text-3xl font-bold text-primary">2</div>
                </div>
                <CardTitle className="text-2xl mb-2">Accetta Prenotazioni</CardTitle>
                <CardDescription className="text-base">
                  Ricevi prenotazioni dalla piattaforma e vedi automaticamente il livello di reputazione di ogni cliente. 
                  Dai priorità ai clienti più affidabili.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="shadow-card hover:shadow-elegant transition-shadow">
              <CardHeader>
                <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                  <div className="text-3xl font-bold text-primary">3</div>
                </div>
                <CardTitle className="text-2xl mb-2">Valuta i Clienti</CardTitle>
                <CardDescription className="text-base">
                  Dopo ogni prenotazione, valuta semplicemente se il cliente si è presentato e se è stato puntuale. 
                  Il sistema aggiorna automaticamente la loro reputazione.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="shadow-card hover:shadow-elegant transition-shadow">
              <CardHeader>
                <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                  <div className="text-3xl font-bold text-primary">4</div>
                </div>
                <CardTitle className="text-2xl mb-2">Premia i Migliori</CardTitle>
                <CardDescription className="text-base">
                  Offri vantaggi personalizzati ai clienti con reputazione elevata: upgrade tavoli, sconti o drink di benvenuto. 
                  Fidelizza i clienti migliori.
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative py-32 overflow-hidden">
        <div 
          className="absolute inset-0 z-0"
          style={{
            backgroundImage: `linear-gradient(135deg, rgba(38, 38, 38, 0.88), rgba(38, 38, 38, 0.75)), url(${heroBusinessImage})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        />
        <div className="container mx-auto px-4 text-center relative z-10">
          <h2 className="text-4xl md:text-5xl font-bold mb-6 text-white">
            Inizia a Ridurre i No-Show Oggi
          </h2>
          <p className="text-xl mb-10 text-white/90 max-w-2xl mx-auto leading-relaxed">
            Unisciti a centinaia di ristoranti che hanno già aumentato i loro ricavi con OneTable
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            <Button 
              size="lg" 
              className="bg-primary text-primary-foreground hover:bg-primary/90 shadow-elegant text-lg px-8"
              onClick={() => navigate('/business-registration')}
            >
              Registra il Tuo Ristorante
            </Button>
            <Button 
              size="lg" 
              variant="outline" 
              className="border-white/30 text-white hover:bg-white/10 text-lg px-8"
              onClick={() => window.open('/brochure.pdf', '_blank')}
            >
              Scarica la Brochure
            </Button>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Business;
