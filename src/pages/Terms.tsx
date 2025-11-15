import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { useEffect } from "react";

const Terms = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="min-h-screen">
      <Header />
      <main className="container mx-auto px-4 py-24 max-w-4xl">
        <h1 className="text-4xl font-bold mb-8">Termini e Condizioni</h1>
        
        <div className="prose prose-lg max-w-none space-y-6">
          <section>
            <h2 className="text-2xl font-semibold mb-4">1. Accettazione dei Termini</h2>
            <p className="text-muted-foreground">
              Utilizzando la piattaforma OneTable, accetti di essere vincolato da questi Termini e Condizioni. 
              Se non accetti questi termini, ti preghiamo di non utilizzare i nostri servizi.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">2. Registrazione e Account</h2>
            <p className="text-muted-foreground">
              Per utilizzare OneTable, devi creare un account fornendo informazioni accurate e complete. 
              Sei responsabile della sicurezza del tuo account e delle attività che vi si svolgono.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">3. Sistema di Punti e Livelli</h2>
            <p className="text-muted-foreground">
              OneTable utilizza un sistema di punti per premiare la tua affidabilità. I punti vengono assegnati o rimossi 
              in base alle tue azioni (prenotazioni confermate, no-show, cancellazioni). I livelli e i relativi vantaggi 
              possono essere modificati in qualsiasi momento.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">4. Prenotazioni</h2>
            <p className="text-muted-foreground">
              Effettuando una prenotazione, ti impegni a presentarti all'orario concordato o a cancellarla con almeno 24 ore di anticipo. 
              Il mancato rispetto può comportare la perdita di punti e limitazioni dell'account.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">5. Comportamento dell'Utente</h2>
            <p className="text-muted-foreground">
              Ti impegni a utilizzare OneTable in modo responsabile e a non creare prenotazioni false o fraudolente. 
              Ci riserviamo il diritto di sospendere o chiudere account che violano queste norme.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">6. Limitazione di Responsabilità</h2>
            <p className="text-muted-foreground">
              OneTable agisce come intermediario tra utenti e ristoranti. Non siamo responsabili per la qualità del servizio, 
              del cibo o dell'esperienza presso i ristoranti partner.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">7. Modifiche ai Termini</h2>
            <p className="text-muted-foreground">
              Ci riserviamo il diritto di modificare questi termini in qualsiasi momento. Le modifiche saranno comunicate 
              tramite email e/o notifica sulla piattaforma.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">8. Contatti</h2>
            <p className="text-muted-foreground">
              Per domande sui Termini e Condizioni, contattaci all'indirizzo: 
              <a href="mailto:info@onetable.it" className="text-primary hover:underline ml-1">
                info@onetable.it
              </a>
            </p>
          </section>

          <p className="text-sm text-muted-foreground mt-8">
            Ultimo aggiornamento: {new Date().toLocaleDateString('it-IT')}
          </p>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Terms;
