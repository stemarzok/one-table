import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { TrendingUp, Users, DollarSign, BarChart3, Shield, Clock } from "lucide-react";

const BusinessSection = () => {
  return (
    <section id="business" className="py-24 bg-gradient-to-br from-primary/5 via-background to-accent/5">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
            Per Ristoratori e Aziende
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Unisciti alla rivoluzione della ristorazione e riduci drasticamente i costi dei no-show
          </p>
        </div>

        {/* Statistics Section */}
        <div className="max-w-4xl mx-auto mb-16">
          <Card className="bg-gradient-card p-8 md:p-12 border-primary/20 shadow-elegant">
            <div className="text-center mb-8">
              <h3 className="text-3xl md:text-4xl font-bold text-card-foreground mb-4">
                I No-Show Costano Miliardi
              </h3>
              <p className="text-lg text-muted-foreground">
                Nel settore della ristorazione globale, i clienti che prenotano ma non si presentano 
                causano perdite stimate in
              </p>
            </div>
            
            <div className="text-center mb-8">
              <div className="text-6xl md:text-7xl font-bold bg-gradient-hero bg-clip-text text-transparent mb-2">
                €16 MLD
              </div>
              <p className="text-xl text-muted-foreground">
                di perdite annuali nell'industria della ristorazione europea
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
              <div className="text-center p-6 bg-background/50 rounded-xl">
                <div className="text-4xl font-bold text-primary mb-2">15-20%</div>
                <p className="text-sm text-muted-foreground">delle prenotazioni risultano in no-show</p>
              </div>
              <div className="text-center p-6 bg-background/50 rounded-xl">
                <div className="text-4xl font-bold text-accent mb-2">€150-200</div>
                <p className="text-sm text-muted-foreground">perdita media per tavolo non presentato</p>
              </div>
              <div className="text-center p-6 bg-background/50 rounded-xl">
                <div className="text-4xl font-bold text-primary mb-2">30%</div>
                <p className="text-sm text-muted-foreground">riduzione dei no-show con il nostro sistema</p>
              </div>
            </div>
          </Card>
        </div>

        {/* Benefits Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          <Card className="p-6 hover:shadow-elegant transition-all duration-300 hover:-translate-y-1">
            <div className="w-12 h-12 rounded-xl bg-gradient-hero flex items-center justify-center mb-4">
              <TrendingUp className="w-6 h-6 text-primary-foreground" />
            </div>
            <h3 className="text-xl font-bold text-card-foreground mb-2">
              Aumenta i Ricavi
            </h3>
            <p className="text-muted-foreground">
              Riduci i tavoli vuoti e aumenta il tasso di occupazione fino al 30%, 
              trasformando ogni prenotazione in un'opportunità di guadagno reale.
            </p>
          </Card>

          <Card className="p-6 hover:shadow-elegant transition-all duration-300 hover:-translate-y-1">
            <div className="w-12 h-12 rounded-xl bg-gradient-accent flex items-center justify-center mb-4">
              <Users className="w-6 h-6 text-accent-foreground" />
            </div>
            <h3 className="text-xl font-bold text-card-foreground mb-2">
              Clienti Affidabili
            </h3>
            <p className="text-muted-foreground">
              Accedi a una community di utenti verificati e valutati, con un sistema 
              di reputazione che incentiva puntualità e affidabilità.
            </p>
          </Card>

          <Card className="p-6 hover:shadow-elegant transition-all duration-300 hover:-translate-y-1">
            <div className="w-12 h-12 rounded-xl bg-gradient-hero flex items-center justify-center mb-4">
              <DollarSign className="w-6 h-6 text-primary-foreground" />
            </div>
            <h3 className="text-xl font-bold text-card-foreground mb-2">
              Riduci le Perdite
            </h3>
            <p className="text-muted-foreground">
              Elimina migliaia di euro di perdite annuali causate dai no-show 
              grazie al nostro sistema di prenotazione intelligente.
            </p>
          </Card>

          <Card className="p-6 hover:shadow-elegant transition-all duration-300 hover:-translate-y-1">
            <div className="w-12 h-12 rounded-xl bg-gradient-accent flex items-center justify-center mb-4">
              <BarChart3 className="w-6 h-6 text-accent-foreground" />
            </div>
            <h3 className="text-xl font-bold text-card-foreground mb-2">
              Analytics Avanzate
            </h3>
            <p className="text-muted-foreground">
              Dashboard completa con statistiche in tempo reale su prenotazioni, 
              no-show, clienti fedeli e performance del ristorante.
            </p>
          </Card>

          <Card className="p-6 hover:shadow-elegant transition-all duration-300 hover:-translate-y-1">
            <div className="w-12 h-12 rounded-xl bg-gradient-hero flex items-center justify-center mb-4">
              <Shield className="w-6 h-6 text-primary-foreground" />
            </div>
            <h3 className="text-xl font-bold text-card-foreground mb-2">
              Garanzia di Presenza
            </h3>
            <p className="text-muted-foreground">
              Sistema di penalità progressive per utenti inaffidabili e meccanismi 
              di conferma che assicurano la presenza effettiva.
            </p>
          </Card>

          <Card className="p-6 hover:shadow-elegant transition-all duration-300 hover:-translate-y-1">
            <div className="w-12 h-12 rounded-xl bg-gradient-accent flex items-center justify-center mb-4">
              <Clock className="w-6 h-6 text-accent-foreground" />
            </div>
            <h3 className="text-xl font-bold text-card-foreground mb-2">
              Gestione Semplificata
            </h3>
            <p className="text-muted-foreground">
              Piattaforma intuitiva e facile da usare, con integrazione rapida 
              e supporto dedicato per il tuo team.
            </p>
          </Card>
        </div>

        {/* CTA Section */}
        <div className="text-center">
          <Card className="max-w-2xl mx-auto p-8 bg-gradient-to-br from-primary/10 to-accent/10 border-primary/30">
            <h3 className="text-2xl font-bold text-card-foreground mb-4">
              Pronto a Rivoluzionare il Tuo Ristorante?
            </h3>
            <p className="text-muted-foreground mb-6">
              Unisciti a centinaia di ristoranti che hanno già ridotto i no-show 
              e aumentato i loro ricavi con OneTable.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" className="bg-gradient-hero text-primary-foreground hover:opacity-90">
                Richiedi una Demo
              </Button>
              <Button size="lg" variant="outline">
                Contatta il Team
              </Button>
            </div>
          </Card>
        </div>
      </div>
    </section>
  );
};

export default BusinessSection;
