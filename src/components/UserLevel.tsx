import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Trophy, TrendingUp } from "lucide-react";

const UserLevel = () => {
  const currentPoints = 245;
  const nextLevelPoints = 300;
  const progress = (currentPoints / nextLevelPoints) * 100;

  return (
    <section className="py-16 bg-gradient-hero">
      <div className="container mx-auto px-4">
        <Card className="max-w-4xl mx-auto bg-card/95 backdrop-blur border-primary/20 shadow-elegant">
          <div className="p-8">
            <div className="flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="flex items-center gap-6">
                <div className="w-20 h-20 rounded-2xl bg-gradient-accent flex items-center justify-center shadow-lg">
                  <Trophy className="w-10 h-10 text-accent-foreground" />
                </div>
                
                <div>
                  <h3 className="text-2xl font-bold text-card-foreground mb-2">Il Tuo Livello</h3>
                  <p className="text-muted-foreground">Continua così per sbloccare nuovi vantaggi!</p>
                </div>
              </div>
              
              <div className="flex items-center gap-4">
                <Badge className="bg-slate-100 dark:bg-slate-900 text-slate-500 text-lg px-4 py-2">Argento</Badge>
                <div className="flex items-center gap-3 bg-muted/50 px-6 py-4 rounded-xl">
                  <TrendingUp className="w-6 h-6 text-accent" />
                  <div>
                    <div className="text-3xl font-bold text-card-foreground">{currentPoints}</div>
                    <div className="text-sm text-muted-foreground">Punti Totali</div>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="mt-8">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-medium text-card-foreground">
                  Progresso verso Oro
                </span>
                <span className="text-sm font-bold text-accent">
                  {currentPoints}/{nextLevelPoints} punti
                </span>
              </div>
              <Progress value={progress} className="h-3" />
              <p className="text-xs text-muted-foreground mt-2">
                Ancora {nextLevelPoints - currentPoints} punti per raggiungere il livello Oro
              </p>
            </div>
          </div>
        </Card>
      </div>
    </section>
  );
};

export default UserLevel;
