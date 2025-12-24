import { Clock } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface OpeningHoursDisplayProps {
  openingHours: any;
}

const dayNames: Record<string, string> = {
  monday: "Lunedì",
  tuesday: "Martedì", 
  wednesday: "Mercoledì",
  thursday: "Giovedì",
  friday: "Venerdì",
  saturday: "Sabato",
  sunday: "Domenica",
};

const dayOrder = ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"];

export const OpeningHoursDisplay = ({ openingHours }: OpeningHoursDisplayProps) => {
  if (!openingHours || typeof openingHours !== 'object') {
    return null;
  }

  const today = new Date().toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase();
  const todayHours = openingHours[today];
  
  const isOpenNow = () => {
    if (!todayHours?.isOpen) return false;
    
    const now = new Date();
    const currentTime = now.getHours() * 60 + now.getMinutes();
    
    const parseTime = (timeStr: string) => {
      const [hours, minutes] = timeStr.split(':').map(Number);
      return hours * 60 + minutes;
    };
    
    const openTime = parseTime(todayHours.openTime || "00:00");
    const closeTime = parseTime(todayHours.closeTime || "23:59");
    
    return currentTime >= openTime && currentTime <= closeTime;
  };

  const getNextOpenTime = () => {
    const now = new Date();
    const currentDay = now.toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase();
    const currentDayIndex = dayOrder.indexOf(currentDay);
    
    // Check remaining days
    for (let i = 0; i <= 7; i++) {
      const checkDayIndex = (currentDayIndex + i) % 7;
      const checkDay = dayOrder[checkDayIndex];
      const hours = openingHours[checkDay];
      
      if (hours?.isOpen) {
        if (i === 0) {
          return `Apre alle ${hours.openTime}`;
        } else if (i === 1) {
          return `Apre domani alle ${hours.openTime}`;
        } else {
          return `Apre ${dayNames[checkDay]} alle ${hours.openTime}`;
        }
      }
    }
    return null;
  };

  const open = isOpenNow();

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <Clock className="w-5 h-5 text-primary" />
            Orari
          </CardTitle>
          <Badge variant={open ? "default" : "secondary"} className={open ? "bg-green-600" : ""}>
            {open ? "Aperto ora" : "Chiuso"}
          </Badge>
        </div>
        {!open && (
          <p className="text-sm text-green-600 font-medium">{getNextOpenTime()}</p>
        )}
      </CardHeader>
      <CardContent className="pt-0">
        <div className="space-y-2">
          {dayOrder.map((day) => {
            const hours = openingHours[day];
            const isToday = day === today;
            
            return (
              <div 
                key={day} 
                className={`flex justify-between text-sm py-1 ${isToday ? 'font-medium' : ''}`}
              >
                <span className={isToday ? 'text-primary' : 'text-muted-foreground'}>
                  {dayNames[day]}
                </span>
                <span className={isToday ? '' : 'text-muted-foreground'}>
                  {hours?.isOpen 
                    ? `${hours.openTime}-${hours.closeTime}` 
                    : "Chiuso"}
                </span>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};
