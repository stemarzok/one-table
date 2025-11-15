import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { useEffect } from "react";

const Cookies = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="min-h-screen">
      <Header />
      <main className="container mx-auto px-4 py-24 max-w-4xl">
        <h1 className="text-4xl font-bold mb-8">Cookie Policy</h1>
        
        <div className="prose prose-lg max-w-none space-y-6">
          <section>
            <h2 className="text-2xl font-semibold mb-4">1. Cosa Sono i Cookie</h2>
            <p className="text-muted-foreground">
              I cookie sono piccoli file di testo che vengono memorizzati sul tuo dispositivo quando visiti un sito web. 
              Ci aiutano a fornire un servizio migliore e a personalizzare la tua esperienza.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">2. Cookie Utilizzati da OneTable</h2>
            
            <h3 className="text-xl font-semibold mb-3 mt-6">Cookie Essenziali</h3>
            <p className="text-muted-foreground">
              Questi cookie sono necessari per il funzionamento del sito e non possono essere disattivati. 
              Includono cookie per la gestione della sessione e l'autenticazione.
            </p>

            <h3 className="text-xl font-semibold mb-3 mt-6">Cookie di Preferenze</h3>
            <p className="text-muted-foreground">
              Questi cookie permettono al sito di ricordare le tue scelte (come la lingua o la regione) 
              per fornirti un'esperienza più personalizzata.
            </p>

            <h3 className="text-xl font-semibold mb-3 mt-6">Cookie Analitici</h3>
            <p className="text-muted-foreground">
              Utilizziamo cookie analitici per capire come i visitatori utilizzano il nostro sito. 
              Queste informazioni ci aiutano a migliorare il servizio.
            </p>

            <h3 className="text-xl font-semibold mb-3 mt-6">Cookie di Marketing</h3>
            <p className="text-muted-foreground">
              Questi cookie vengono utilizzati per mostrarti annunci pertinenti ai tuoi interessi 
              e per misurare l'efficacia delle nostre campagne pubblicitarie.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">3. Gestione dei Cookie</h2>
            <p className="text-muted-foreground">
              Puoi controllare e/o eliminare i cookie come desideri. Puoi eliminare tutti i cookie già presenti 
              sul tuo computer e impostare la maggior parte dei browser per impedire che vengano memorizzati. 
              Tuttavia, se lo fai, potresti dover regolare manualmente alcune preferenze ogni volta che visiti il sito 
              e alcuni servizi e funzionalità potrebbero non funzionare.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">4. Cookie di Terze Parti</h2>
            <p className="text-muted-foreground">
              Alcune funzionalità del nostro sito utilizzano cookie di terze parti. Ad esempio, quando condividi 
              contenuti sui social media, questi servizi possono impostare i propri cookie.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">5. Aggiornamenti alla Cookie Policy</h2>
            <p className="text-muted-foreground">
              Potremmo aggiornare questa Cookie Policy periodicamente. Ti consigliamo di controllare questa pagina 
              regolarmente per eventuali modifiche.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">6. Contatti</h2>
            <p className="text-muted-foreground">
              Per domande sulla nostra Cookie Policy, contattaci all'indirizzo: 
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

export default Cookies;
