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

  const COLORS = ['#8b5cf6', '#10b981', '#f59e0b', '#ef4444', '#3b82f6'];

  if (loading) {
    return <div className="text-center py-8">Caricamento analytics...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Analytics Ristorante</h2>
        <Select value={dateRange} onValueChange={setDateRange}>
          <SelectTrigger className="w-[150px]">
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
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Calendar className="w-4 h-4 text-blue-500" />
              Prenotazioni
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalBookings}</div>
            <p className="text-xs text-muted-foreground">Totali nel periodo</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Users className="w-4 h-4 text-green-500" />
              Media Ospiti
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.avgGuests}</div>
            <p className="text-xs text-muted-foreground">Per prenotazione</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-purple-500" />
              Tasso Occupazione
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.occupancyRate}%</div>
            <p className="text-xs text-muted-foreground">Media periodo</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Clock className="w-4 h-4 text-orange-500" />
              Orario di Picco
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.peakHour}</div>
            <p className="text-xs text-muted-foreground">Più prenotato</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <DollarSign className="w-4 h-4 text-yellow-500" />
              Revenue (stima)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">€{Math.round(stats.revenue).toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Totale stimato</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Booking Trends */}
        <Card>
          <CardHeader>
            <CardTitle>Trend Prenotazioni</CardTitle>
            <CardDescription>Andamento giornaliero delle prenotazioni</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={bookingTrends}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="bookings" stroke="#8b5cf6" strokeWidth={2} name="Totali" />
                <Line type="monotone" dataKey="confirmed" stroke="#10b981" strokeWidth={2} name="Confermate" />
                <Line type="monotone" dataKey="cancelled" stroke="#ef4444" strokeWidth={2} name="Cancellate" />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Status Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Distribuzione Status</CardTitle>
            <CardDescription>Stato delle prenotazioni nel periodo</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={bookingTrends}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="confirmed" stackId="a" fill="#10b981" name="Confermate" />
                <Bar dataKey="completed" stackId="a" fill="#3b82f6" name="Completate" />
                <Bar dataKey="cancelled" stackId="a" fill="#ef4444" name="Cancellate" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Peak Hours */}
        <Card>
          <CardHeader>
            <CardTitle>Orari di Picco</CardTitle>
            <CardDescription>Distribuzione prenotazioni per fascia oraria</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={timeSlotData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="time" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="count" fill="#8b5cf6" name="Prenotazioni" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Occupancy Pie */}
        <Card>
          <CardHeader>
            <CardTitle>Analisi Comparativa</CardTitle>
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
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {COLORS.map((color, index) => (
                    <Cell key={`cell-${index}`} fill={color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
