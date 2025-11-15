import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { useEffect } from "react";

const Privacy = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="min-h-screen">
      <Header />
      <main className="container mx-auto px-4 py-24 max-w-4xl">
        <h1 className="text-4xl font-bold mb-8">Privacy Policy</h1>
        
        <div className="prose prose-lg max-w-none space-y-6">
          <section>
            <h2 className="text-2xl font-semibold mb-4">1. Informazioni che Raccogliamo</h2>
            <p className="text-muted-foreground">
              OneTable raccoglie informazioni personali quando ti registri, effettui una prenotazione o utilizzi i nostri servizi. 
              Queste informazioni includono nome, email, numero di telefono e preferenze di prenotazione.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">2. Come Utilizziamo le Tue Informazioni</h2>
            <p className="text-muted-foreground">
              Utilizziamo le tue informazioni per:
            </p>
            <ul className="list-disc pl-6 text-muted-foreground space-y-2">
              <li>Gestire le tue prenotazioni presso i ristoranti partner</li>
              <li>Inviarti conferme e promemoria via email</li>
              <li>Migliorare i nostri servizi e la tua esperienza</li>
              <li>Comunicare con te riguardo aggiornamenti e offerte</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">3. Condivisione delle Informazioni</h2>
            <p className="text-muted-foreground">
              Condividiamo le tue informazioni solo con i ristoranti presso cui effettui prenotazioni e con fornitori di servizi 
              terzi che ci aiutano a operare la piattaforma. Non vendiamo mai i tuoi dati personali.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">4. Sicurezza dei Dati</h2>
            <p className="text-muted-foreground">
              Implementiamo misure di sicurezza appropriate per proteggere le tue informazioni personali da accessi non autorizzati, 
              alterazioni, divulgazioni o distruzioni.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">5. I Tuoi Diritti</h2>
            <p className="text-muted-foreground">
              Hai il diritto di accedere, correggere o cancellare i tuoi dati personali in qualsiasi momento. 
              Puoi anche opporti al trattamento dei tuoi dati o richiederne la portabilità.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">6. Contattaci</h2>
            <p className="text-muted-foreground">
              Per domande sulla nostra Privacy Policy, contattaci all'indirizzo: 
              <a href="mailto:privacy@onetable.it" className="text-primary hover:underline ml-1">
                privacy@onetable.it
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

export default Privacy;
