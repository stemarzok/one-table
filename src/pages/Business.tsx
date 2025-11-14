import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle, TrendingDown, Users, Calendar, BarChart3, Shield } from "lucide-react";
import heroBusinessImage from "@/assets/hero-business.jpg";

const Business = () => {
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
            <h1 className="text-5xl md:text-7xl font-bold text-primary-foreground mb-6 leading-tight">
              Riduci i No-Show,
              <span className="block bg-gradient-accent bg-clip-text text-transparent">
                Aumenta i Ricavi
              </span>
            </h1>
            
            <p className="text-xl text-primary-foreground/90 mb-8 leading-relaxed">
              Unisciti a OneTable e trasforma i tavoli vuoti in opportunità. Il nostro sistema di 
              reputazione incentiva i clienti affidabili e riduce drasticamente le mancate presentazioni.
            </p>
            
            <div className="bg-background/10 backdrop-blur-sm rounded-lg p-6 mb-8 border border-primary-foreground/20">
              <div className="flex items-center gap-3 mb-2">
                <TrendingDown className="w-8 h-8 text-accent" />
                <div className="text-4xl font-bold text-primary-foreground">€16 Miliardi</div>
              </div>
              <p className="text-primary-foreground/90">
                Perdite annuali in Europa causate dai no-show nei ristoranti
              </p>
            </div>
            
            <Button size="lg" className="bg-accent text-accent-foreground hover:bg-accent/90 shadow-elegant text-lg px-8">
              Richiedi una Demo
            </Button>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20 bg-background">
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
          </div>

          <div className="max-w-4xl mx-auto space-y-8">
            <div className="flex gap-6 items-start">
              <div className="flex-shrink-0 w-12 h-12 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xl font-bold">
                1
              </div>
              <div>
                <h3 className="text-2xl font-bold mb-2">Registrazione e Setup</h3>
                <p className="text-muted-foreground">
                  Crea il tuo profilo aziendale, configura i tavoli, gli orari e le politiche di prenotazione in pochi minuti
                </p>
              </div>
            </div>

            <div className="flex gap-6 items-start">
              <div className="flex-shrink-0 w-12 h-12 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xl font-bold">
                2
              </div>
              <div>
                <h3 className="text-2xl font-bold mb-2">Accetta Prenotazioni</h3>
                <p className="text-muted-foreground">
                  Ricevi prenotazioni dalla piattaforma e vedi automaticamente il livello di reputazione di ogni cliente
                </p>
              </div>
            </div>

            <div className="flex gap-6 items-start">
              <div className="flex-shrink-0 w-12 h-12 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xl font-bold">
                3
              </div>
              <div>
                <h3 className="text-2xl font-bold mb-2">Valuta i Clienti</h3>
                <p className="text-muted-foreground">
                  Dopo ogni prenotazione, valuta semplicemente se il cliente si è presentato e se è stato puntuale
                </p>
              </div>
            </div>

            <div className="flex gap-6 items-start">
              <div className="flex-shrink-0 w-12 h-12 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xl font-bold">
                4
              </div>
              <div>
                <h3 className="text-2xl font-bold mb-2">Premia i Migliori</h3>
                <p className="text-muted-foreground">
                  Offri vantaggi personalizzati ai clienti con reputazione elevata: upgrade tavoli, sconti o drink di benvenuto
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-primary text-primary-foreground">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            Inizia a Ridurre i No-Show Oggi
          </h2>
          <p className="text-xl mb-8 text-primary-foreground/90 max-w-2xl mx-auto">
            Unisciti a centinaia di ristoranti che hanno già aumentato i loro ricavi con OneTable
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            <Button size="lg" className="bg-accent text-accent-foreground hover:bg-accent/90 text-lg px-8">
              Richiedi una Demo Gratuita
            </Button>
            <Button size="lg" variant="outline" className="border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/10 text-lg px-8">
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
