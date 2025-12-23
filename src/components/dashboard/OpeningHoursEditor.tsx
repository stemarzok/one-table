import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Clock, Save, Copy } from "lucide-react";
import { Json } from "@/integrations/supabase/types";

interface OpeningHoursEditorProps {
  restaurantId: string;
  initialHours: Json | null;
  onUpdate: () => void;
}

interface DaySchedule {
  open: boolean;
  openTime: string;
  closeTime: string;
  breakStart?: string;
  breakEnd?: string;
  hasBreak: boolean;
}

interface WeekSchedule {
  [key: string]: DaySchedule;
}

const DAYS = [
  { key: "monday", label: "Lunedì" },
  { key: "tuesday", label: "Martedì" },
  { key: "wednesday", label: "Mercoledì" },
  { key: "thursday", label: "Giovedì" },
  { key: "friday", label: "Venerdì" },
  { key: "saturday", label: "Sabato" },
  { key: "sunday", label: "Domenica" },
];

const DEFAULT_SCHEDULE: DaySchedule = {
  open: true,
  openTime: "12:00",
  closeTime: "23:00",
  breakStart: "15:00",
  breakEnd: "19:00",
  hasBreak: false,
};

export const OpeningHoursEditor = ({ restaurantId, initialHours, onUpdate }: OpeningHoursEditorProps) => {
  const [schedule, setSchedule] = useState<WeekSchedule>({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    // Initialize schedule from database or defaults
    const initial: WeekSchedule = {};
    DAYS.forEach((day) => {
      const saved = initialHours && typeof initialHours === 'object' && !Array.isArray(initialHours) 
        ? (initialHours as Record<string, unknown>)[day.key] as DaySchedule | undefined
        : undefined;
      initial[day.key] = saved || { ...DEFAULT_SCHEDULE };
    });
    setSchedule(initial);
  }, [initialHours]);

  const updateDay = (dayKey: string, updates: Partial<DaySchedule>) => {
    setSchedule((prev) => ({
      ...prev,
      [dayKey]: { ...prev[dayKey], ...updates },
    }));
  };

  const copyToAll = (sourceDay: string) => {
    const source = schedule[sourceDay];
    const newSchedule: WeekSchedule = {};
    DAYS.forEach((day) => {
      newSchedule[day.key] = { ...source };
    });
    setSchedule(newSchedule);
    toast.success("Orari copiati su tutti i giorni");
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const { error } = await supabase
        .from("restaurants")
        .update({ opening_hours: schedule as unknown as Json })
        .eq("id", restaurantId);

      if (error) throw error;

      toast.success("Orari di apertura salvati con successo");
      onUpdate();
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Card className="overflow-hidden">
      <div className="p-6 border-b bg-gradient-to-r from-primary/5 to-transparent">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-primary/10">
            <Clock className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h3 className="text-lg font-semibold">Orari di Apertura</h3>
            <p className="text-sm text-muted-foreground">
              Configura gli orari del tuo ristorante per ogni giorno della settimana
            </p>
          </div>
        </div>
      </div>

      <div className="p-6 space-y-4">
        {DAYS.map((day) => {
          const daySchedule = schedule[day.key] || DEFAULT_SCHEDULE;
          
          return (
            <div
              key={day.key}
              className={`p-4 rounded-xl border transition-all ${
                daySchedule.open 
                  ? "bg-card border-border" 
                  : "bg-muted/30 border-transparent"
              }`}
            >
              <div className="flex flex-col md:flex-row md:items-center gap-4">
                {/* Day name and toggle */}
                <div className="flex items-center justify-between md:w-40">
                  <Label className="font-semibold">{day.label}</Label>
                  <Switch
                    checked={daySchedule.open}
                    onCheckedChange={(open) => updateDay(day.key, { open })}
                  />
                </div>

                {daySchedule.open ? (
                  <div className="flex-1 flex flex-wrap items-center gap-3">
                    {/* Main hours */}
                    <div className="flex items-center gap-2">
                      <Input
                        type="time"
                        value={daySchedule.openTime}
                        onChange={(e) => updateDay(day.key, { openTime: e.target.value })}
                        className="w-28"
                      />
                      <span className="text-muted-foreground">-</span>
                      <Input
                        type="time"
                        value={daySchedule.closeTime}
                        onChange={(e) => updateDay(day.key, { closeTime: e.target.value })}
                        className="w-28"
                      />
                    </div>

                    {/* Break toggle */}
                    <div className="flex items-center gap-2">
                      <Switch
                        checked={daySchedule.hasBreak}
                        onCheckedChange={(hasBreak) => updateDay(day.key, { hasBreak })}
                        className="scale-75"
                      />
                      <span className="text-xs text-muted-foreground">Pausa</span>
                    </div>

                    {/* Break hours */}
                    {daySchedule.hasBreak && (
                      <div className="flex items-center gap-2 pl-2 border-l">
                        <span className="text-xs text-muted-foreground">Chiuso:</span>
                        <Input
                          type="time"
                          value={daySchedule.breakStart || "15:00"}
                          onChange={(e) => updateDay(day.key, { breakStart: e.target.value })}
                          className="w-24 h-8 text-sm"
                        />
                        <span className="text-muted-foreground">-</span>
                        <Input
                          type="time"
                          value={daySchedule.breakEnd || "19:00"}
                          onChange={(e) => updateDay(day.key, { breakEnd: e.target.value })}
                          className="w-24 h-8 text-sm"
                        />
                      </div>
                    )}

                    {/* Copy button */}
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => copyToAll(day.key)}
                      className="ml-auto text-xs"
                    >
                      <Copy className="w-3 h-3 mr-1" />
                      Copia su tutti
                    </Button>
                  </div>
                ) : (
                  <span className="text-sm text-muted-foreground italic">Chiuso</span>
                )}
              </div>
            </div>
          );
        })}

        <Button onClick={handleSave} disabled={saving} className="w-full" size="lg">
          <Save className="w-4 h-4 mr-2" />
          {saving ? "Salvataggio..." : "Salva Orari"}
        </Button>
      </div>
    </Card>
  );
};
