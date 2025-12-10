import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { Calendar, TrendingUp, Users, Clock, DollarSign } from "lucide-react";
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface AnalyticsProps {
  restaurantId: string;
}

interface BookingStats {
  date: string;
  bookings: number;
  confirmed: number;
  cancelled: number;
  completed: number;
}

interface TimeSlotStats {
  time: string;
  count: number;
}

export const RestaurantAnalytics = ({ restaurantId }: AnalyticsProps) => {
  const [dateRange, setDateRange] = useState<string>("30");
  const [bookingTrends, setBookingTrends] = useState<BookingStats[]>([]);
  const [timeSlotData, setTimeSlotData] = useState<TimeSlotStats[]>([]);
  const [stats, setStats] = useState({
    totalBookings: 0,
    avgGuests: 0,
    occupancyRate: 0,
    revenue: 0,
    peakHour: "",
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalytics();
  }, [restaurantId, dateRange]);

  const fetchAnalytics = async () => {
    try {
      const days = parseInt(dateRange);
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);

      // Fetch bookings data
      const { data: bookings } = await supabase
        .from('bookings')
        .select('*')
        .eq('restaurant_id', restaurantId)
        .gte('booking_date', startDate.toISOString().split('T')[0])
        .order('booking_date');

      // Fetch tables for occupancy calculation
      const { data: tables } = await supabase
        .from('restaurant_tables')
        .select('seats')
        .eq('restaurant_id', restaurantId);

      // Fetch restaurant price range for revenue estimation
      const { data: restaurant } = await supabase
        .from('restaurants')
        .select('price_range')
        .eq('id', restaurantId)
        .single();

      if (!bookings) return;

      // Calculate booking trends by date
      const trendsMap = new Map<string, BookingStats>();
      for (let i = 0; i < days; i++) {
        const date = new Date();
        date.setDate(date.getDate() - (days - 1 - i));
        const dateStr = date.toISOString().split('T')[0];
        trendsMap.set(dateStr, {
          date: new Date(dateStr).toLocaleDateString('it-IT', { day: '2-digit', month: '2-digit' }),
          bookings: 0,
          confirmed: 0,
          cancelled: 0,
          completed: 0,
        });
      }

      // Calculate time slot distribution
      const timeSlotsMap = new Map<string, number>();
      let totalGuests = 0;
      let completedBookings = 0;

      bookings.forEach((booking) => {
        const stats = trendsMap.get(booking.booking_date);
        if (stats) {
          stats.bookings++;
          if (booking.status === 'confirmed') stats.confirmed++;
          if (booking.status === 'cancelled') stats.cancelled++;
          if (booking.status === 'completed') stats.completed++;
          trendsMap.set(booking.booking_date, stats);
        }

        // Time slots
        const hour = booking.booking_time.split(':')[0];
        const timeSlot = `${hour}:00`;
        timeSlotsMap.set(timeSlot, (timeSlotsMap.get(timeSlot) || 0) + 1);

        totalGuests += booking.guests_count;
        if (booking.status === 'completed') completedBookings++;
      });

      setBookingTrends(Array.from(trendsMap.values()));

      // Sort time slots and get top peak hours
      const timeSlots = Array.from(timeSlotsMap.entries())
        .map(([time, count]) => ({ time, count }))
        .sort((a, b) => parseInt(a.time) - parseInt(b.time));
      
      setTimeSlotData(timeSlots);

      // Calculate stats
      const totalSeats = tables?.reduce((sum, t) => sum + t.seats, 0) || 0;
      const avgPrice = restaurant?.price_range === '€' ? 15 :
                      restaurant?.price_range === '€€' ? 30 :
                      restaurant?.price_range === '€€€' ? 50 : 80;

      const peakSlot = timeSlots.reduce((max, slot) => slot.count > max.count ? slot : max, { time: "20:00", count: 0 });

      setStats({
        totalBookings: bookings.length,
        avgGuests: bookings.length > 0 ? Math.round(totalGuests / bookings.length) : 0,
        occupancyRate: totalSeats > 0 ? Math.round((totalGuests / (totalSeats * days)) * 100) : 0,
        revenue: completedBookings * avgPrice * (totalGuests / (bookings.length || 1)),
        peakHour: peakSlot.time,
      });

    } catch (error) {
      console.error("Error fetching analytics:", error);
    } finally {
      setLoading(false);
    }
  };

  const COLORS = ['hsl(142, 71%, 45%)', 'hsl(142, 60%, 55%)', 'hsl(142, 50%, 65%)', 'hsl(0, 84%, 60%)', 'hsl(217, 91%, 60%)'];

  if (loading) {
    return <div className="text-center py-8">Caricamento analytics...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-foreground">Analytics Ristorante</h2>
        <Select value={dateRange} onValueChange={setDateRange}>
          <SelectTrigger className="w-[180px] bg-card border-border">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="7">Ultimi 7 giorni</SelectItem>
            <SelectItem value="30">Ultimi 30 giorni</SelectItem>
            <SelectItem value="90">Ultimi 90 giorni</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* KPI Cards */}
      <div className="grid md:grid-cols-2 lg:grid-cols-5 gap-4">
        <Card className="bg-card border-border hover:border-primary/30 transition-all duration-300">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2 text-muted-foreground">
              <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                <Calendar className="w-4 h-4 text-primary" />
              </div>
              Prenotazioni
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-foreground">{stats.totalBookings}</div>
            <p className="text-xs text-muted-foreground mt-1">Totali nel periodo</p>
          </CardContent>
        </Card>

        <Card className="bg-card border-border hover:border-primary/30 transition-all duration-300">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2 text-muted-foreground">
              <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                <Users className="w-4 h-4 text-primary" />
              </div>
              Media Ospiti
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-foreground">{stats.avgGuests}</div>
            <p className="text-xs text-muted-foreground mt-1">Per prenotazione</p>
          </CardContent>
        </Card>

        <Card className="bg-card border-border hover:border-primary/30 transition-all duration-300">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2 text-muted-foreground">
              <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                <TrendingUp className="w-4 h-4 text-primary" />
              </div>
              Tasso Occupazione
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-foreground">{stats.occupancyRate}%</div>
            <p className="text-xs text-muted-foreground mt-1">Media periodo</p>
          </CardContent>
        </Card>

        <Card className="bg-card border-border hover:border-primary/30 transition-all duration-300">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2 text-muted-foreground">
              <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                <Clock className="w-4 h-4 text-primary" />
              </div>
              Orario di Picco
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-foreground">{stats.peakHour}</div>
            <p className="text-xs text-muted-foreground mt-1">Più prenotato</p>
          </CardContent>
        </Card>

        <Card className="bg-card border-border hover:border-primary/30 transition-all duration-300">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2 text-muted-foreground">
              <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                <DollarSign className="w-4 h-4 text-primary" />
              </div>
              Revenue (stima)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-foreground">€{Math.round(stats.revenue).toLocaleString()}</div>
            <p className="text-xs text-muted-foreground mt-1">Totale stimato</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Booking Trends */}
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="text-foreground">Trend Prenotazioni</CardTitle>
            <CardDescription>Andamento giornaliero delle prenotazioni</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={bookingTrends}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="date" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'hsl(var(--card))', 
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px'
                  }} 
                />
                <Legend />
                <Line type="monotone" dataKey="bookings" stroke="hsl(142, 71%, 45%)" strokeWidth={2} name="Totali" />
                <Line type="monotone" dataKey="confirmed" stroke="hsl(142, 60%, 55%)" strokeWidth={2} name="Confermate" />
                <Line type="monotone" dataKey="cancelled" stroke="hsl(0, 84%, 60%)" strokeWidth={2} name="Cancellate" />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Status Distribution */}
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="text-foreground">Distribuzione Status</CardTitle>
            <CardDescription>Stato delle prenotazioni nel periodo</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={bookingTrends}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="date" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'hsl(var(--card))', 
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px'
                  }} 
                />
                <Legend />
                <Bar dataKey="confirmed" stackId="a" fill="hsl(142, 71%, 45%)" name="Confermate" radius={[4, 4, 0, 0]} />
                <Bar dataKey="completed" stackId="a" fill="hsl(217, 91%, 60%)" name="Completate" radius={[4, 4, 0, 0]} />
                <Bar dataKey="cancelled" stackId="a" fill="hsl(0, 84%, 60%)" name="Cancellate" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Peak Hours */}
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="text-foreground">Orari di Picco</CardTitle>
            <CardDescription>Distribuzione prenotazioni per fascia oraria</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={timeSlotData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="time" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'hsl(var(--card))', 
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px'
                  }} 
                />
                <Bar dataKey="count" fill="hsl(142, 71%, 45%)" name="Prenotazioni" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Occupancy Pie */}
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="text-foreground">Analisi Comparativa</CardTitle>
            <CardDescription>Confronto stato prenotazioni</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={[
                    { name: 'Confermate', value: bookingTrends.reduce((sum, d) => sum + d.confirmed, 0) },
                    { name: 'Completate', value: bookingTrends.reduce((sum, d) => sum + d.completed, 0) },
                    { name: 'Cancellate', value: bookingTrends.reduce((sum, d) => sum + d.cancelled, 0) },
                  ].filter(item => item.value > 0)}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={100}
                  fill="hsl(142, 71%, 45%)"
                  dataKey="value"
                >
                  {COLORS.map((color, index) => (
                    <Cell key={`cell-${index}`} fill={color} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'hsl(var(--card))', 
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px'
                  }} 
                />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
