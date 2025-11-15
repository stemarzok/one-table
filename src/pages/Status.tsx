import Header from "@/components/Header";
import Footer from "@/components/Footer";

const BUILD_VERSION = `v${new Date().toISOString().slice(0, 16).replace('T', '-')}`;
const BUILD_DATE = new Date().toISOString();

const Status = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-16">
        <div className="max-w-2xl mx-auto">
          <h1 className="text-4xl font-bold text-foreground mb-8">System Status</h1>
          
          <div className="bg-card border border-border rounded-lg p-6 space-y-4">
            <div className="flex justify-between items-center border-b border-border pb-4">
              <span className="text-muted-foreground">Application</span>
              <span className="font-semibold text-foreground">OneTable</span>
            </div>
            
            <div className="flex justify-between items-center border-b border-border pb-4">
              <span className="text-muted-foreground">Build Version</span>
              <span className="font-mono text-sm text-foreground">{BUILD_VERSION}</span>
            </div>
            
            <div className="flex justify-between items-center border-b border-border pb-4">
              <span className="text-muted-foreground">Build Date</span>
              <span className="font-mono text-sm text-foreground">{BUILD_DATE}</span>
            </div>
            
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Environment</span>
              <span className="font-semibold text-primary">Production</span>
            </div>
          </div>

          <div className="mt-8 text-center">
            <a href="/" className="text-primary hover:underline">
              ← Torna alla Home
            </a>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Status;
