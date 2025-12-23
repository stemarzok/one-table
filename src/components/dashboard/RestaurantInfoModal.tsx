import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { RestaurantInfo } from "./RestaurantInfo";
import { OpeningHoursEditor } from "./OpeningHoursEditor";
import { Image, Clock, FileText } from "lucide-react";

interface RestaurantInfoModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  restaurant: any;
  onUpdate: () => void;
  defaultTab?: string;
}

export const RestaurantInfoModal = ({ 
  open, 
  onOpenChange, 
  restaurant, 
  onUpdate,
  defaultTab = "info"
}: RestaurantInfoModalProps) => {
  const [activeTab, setActiveTab] = useState(defaultTab);

  useEffect(() => {
    if (open) {
      setActiveTab(defaultTab);
    }
  }, [open, defaultTab]);

  const handleUpdate = () => {
    onUpdate();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl">Gestione Ristorante</DialogTitle>
        </DialogHeader>
        
        <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-4">
          <TabsList className="grid w-full grid-cols-2 mb-6">
            <TabsTrigger value="info" className="gap-2">
              <Image className="w-4 h-4" />
              Info e Foto
            </TabsTrigger>
            <TabsTrigger value="hours" className="gap-2">
              <Clock className="w-4 h-4" />
              Orari di Apertura
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="info" className="mt-0">
            {restaurant && (
              <RestaurantInfo restaurant={restaurant} onUpdate={handleUpdate} />
            )}
          </TabsContent>
          
          <TabsContent value="hours" className="mt-0">
            {restaurant && (
              <OpeningHoursEditor 
                restaurantId={restaurant.id} 
                initialHours={restaurant.opening_hours}
                onUpdate={handleUpdate}
              />
            )}
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};
