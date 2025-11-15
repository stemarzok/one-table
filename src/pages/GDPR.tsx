import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Shield, Eye, Download, Trash2, Lock, UserX } from "lucide-react";

const GDPR = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="min-h-screen">
      <Header />
      <main className="container mx-auto px-4 py-24 max-w-5xl">
        <h1 className="text-4xl font-bold mb-4">GDPR - I Tuoi Diritti</h1>
        <p className="text-xl text-muted-foreground mb-12">
          In conformità con il Regolamento Generale sulla Protezione dei Dati (GDPR), 
          garantiamo la tutela dei tuoi diritti sulla privacy.
        </p>
        
        <div className="grid md:grid-cols-2 gap-6 mb-12">
          <Card>
            <CardHeader>
              <Eye className="w-10 h-10 text-primary mb-2" />
              <CardTitle>Diritto di Accesso</CardTitle>
              <CardDescription>
                Hai il diritto di sapere quali dati personali deteniamo su di te e come li utilizziamo. 
                Puoi richiedere una copia completa dei tuoi dati in qualsiasi momento.
              </CardDescription>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader>
              <Download className="w-10 h-10 text-primary mb-2" />
              <CardTitle>Diritto alla Portabilità</CardTitle>
              <CardDescription>
                Puoi richiedere di ricevere i tuoi dati personali in un formato strutturato, 
                di uso comune e leggibile da dispositivo automatico.
              </CardDescription>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader>
              <Lock className="w-10 h-10 text-primary mb-2" />
              <CardTitle>Diritto di Rettifica</CardTitle>
              <CardDescription>
                Hai il diritto di richiedere la correzione di dati personali inesatti o incompleti 
                che ti riguardano.
              </CardDescription>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader>
              <Trash2 className="w-10 h-10 text-primary mb-2" />
              <CardTitle>Diritto alla Cancellazione</CardTitle>
              <CardDescription>
                Puoi richiedere la cancellazione dei tuoi dati personali quando non sono più necessari 
                per le finalità per cui sono stati raccolti.
              </CardDescription>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader>
              <UserX className="w-10 h-10 text-primary mb-2" />
              <CardTitle>Diritto di Opposizione</CardTitle>
              <CardDescription>
                Hai il diritto di opporti al trattamento dei tuoi dati personali per motivi legittimi 
                o per finalità di marketing diretto.
              </CardDescription>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader>
              <Shield className="w-10 h-10 text-primary mb-2" />
              <CardTitle>Diritto alla Limitazione</CardTitle>
              <CardDescription>
                Puoi richiedere la limitazione del trattamento dei tuoi dati in determinate circostanze, 
                ad esempio durante la verifica dell'esattezza dei dati.
              </CardDescription>
            </CardHeader>
          </Card>
        </div>

        <div className="prose prose-lg max-w-none space-y-6">
          <section>
            <h2 className="text-2xl font-semibold mb-4">Come Esercitare i Tuoi Diritti</h2>
            <p className="text-muted-foreground">
              Per esercitare uno qualsiasi dei tuoi diritti GDPR, puoi contattarci tramite:
            </p>
            <ul className="list-disc pl-6 text-muted-foreground space-y-2">
              <li>Email: <a href="mailto:privacy@onetable.it" className="text-primary hover:underline">privacy@onetable.it</a></li>
              <li>Telefono: +39 02 1234 5678</li>
              <li>Posta: Via della Innovazione, 42 - 20121 Milano, Italia</li>
            </ul>
            <p className="text-muted-foreground mt-4">
              Risponderemo alla tua richiesta entro 30 giorni dal ricevimento. 
              In alcuni casi, potremmo richiedere informazioni aggiuntive per verificare la tua identità.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">Base Giuridica del Trattamento</h2>
            <p className="text-muted-foreground">
              Trattiamo i tuoi dati personali sulla base di:
            </p>
            <ul className="list-disc pl-6 text-muted-foreground space-y-2">
              <li><strong>Consenso:</strong> per l'invio di comunicazioni marketing e newsletter</li>
              <li><strong>Esecuzione del contratto:</strong> per gestire le tue prenotazioni e il tuo account</li>
              <li><strong>Obbligo legale:</strong> per adempiere a obblighi fiscali e contabili</li>
              <li><strong>Interesse legittimo:</strong> per migliorare i nostri servizi e prevenire frodi</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">Conservazione dei Dati</h2>
            <p className="text-muted-foreground">
              Conserviamo i tuoi dati personali solo per il tempo necessario a soddisfare le finalità 
              per cui sono stati raccolti, inclusi eventuali obblighi legali, contabili o di reportistica.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">Reclami all'Autorità Garante</h2>
            <p className="text-muted-foreground">
              Se ritieni che il trattamento dei tuoi dati personali violi il GDPR, hai il diritto di 
              presentare un reclamo all'Autorità Garante per la Protezione dei Dati Personali.
            </p>
            <p className="text-muted-foreground mt-2">
              <strong>Garante per la Protezione dei Dati Personali</strong><br />
              Piazza Venezia, 11 - 00187 Roma<br />
              Tel: +39 06 696771<br />
              Email: garante@gpdp.it
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

export default GDPR;
