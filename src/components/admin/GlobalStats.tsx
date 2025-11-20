import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { Download, TrendingUp, Store, Calendar, XCircle, Star } from "lucide-react";
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { toast } from "sonner";

interface Stats {
  totalRestaurants: number;
  todayBookings: number;
  cancelledBookings: number;
  recentReviews: number;
  revenue: number;
}

interface ChartData {
  date: string;
  bookings: number;
  cancelled: number;
}

export const GlobalStats = () => {
  const [stats, setStats] = useState<Stats>({
    totalRestaurants: 0,
    todayBookings: 0,
    cancelledBookings: 0,
    recentReviews: 0,
    revenue: 0,
  });
  const [chartData, setChartData] = useState<ChartData[]>([]);
  const [dateRange, setDateRange] = useState<string>("7");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
    fetchChartData();
  }, [dateRange]);

  const fetchStats = async () => {
    try {
      const today = new Date().toISOString().split('T')[0];

      // Total restaurants
      const { count: restaurantsCount } = await supabase
        .from('restaurants')
        .select('*', { count: 'exact', head: true })
        .eq('is_active', true);

      // Today's bookings
      const { count: todayCount } = await supabase
        .from('bookings')
        .select('*', { count: 'exact', head: true })
        .eq('booking_date', today)
        .in('status', ['pending', 'confirmed']);

      // Cancelled bookings (last 30 days)
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      const { count: cancelledCount } = await supabase
        .from('bookings')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'cancelled')
        .gte('booking_date', thirtyDaysAgo.toISOString().split('T')[0]);

      // Recent reviews (last 7 days)
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      const { count: reviewsCount } = await supabase
        .from('reviews')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', sevenDaysAgo.toISOString());

      // Calculate revenue (based on completed bookings and restaurant price ranges)
      const { data: completedBookings } = await supabase
        .from('bookings')
        .select(`
          guests_count,
          restaurants:restaurant_id (
            price_range
          )
        `)
        .eq('status', 'completed')
        .gte('booking_date', thirtyDaysAgo.toISOString().split('T')[0]);

      let totalRevenue = 0;
      completedBookings?.forEach((booking: any) => {
        const priceRange = booking.restaurants?.price_range || '€';
        const avgPrice = priceRange === '€' ? 15 : 
                        priceRange === '€€' ? 30 : 
                        priceRange === '€€€' ? 50 : 80;
        totalRevenue += avgPrice * booking.guests_count;
      });

      setStats({
        totalRestaurants: restaurantsCount || 0,
        todayBookings: todayCount || 0,
        cancelledBookings: cancelledCount || 0,
        recentReviews: reviewsCount || 0,
        revenue: totalRevenue,
      });
    } catch (error) {
      console.error("Error fetching stats:", error);
      toast.error("Errore nel caricamento delle statistiche");
    } finally {
      setLoading(false);
    }
  };

  const fetchChartData = async () => {
    try {
      const days = parseInt(dateRange);
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);

      const { data: bookingsData } = await supabase
        .from('bookings')
        .select('booking_date, status')
        .gte('booking_date', startDate.toISOString().split('T')[0])
        .order('booking_date');

      // Group by date
      const dataMap = new Map<string, { bookings: number; cancelled: number }>();
      
      for (let i = 0; i < days; i++) {
        const date = new Date();
        date.setDate(date.getDate() - (days - 1 - i));
        const dateStr = date.toISOString().split('T')[0];
        dataMap.set(dateStr, { bookings: 0, cancelled: 0 });
      }

      bookingsData?.forEach((booking) => {
        const existing = dataMap.get(booking.booking_date);
        if (existing) {
          existing.bookings++;
          if (booking.status === 'cancelled') {
            existing.cancelled++;
          }
          dataMap.set(booking.booking_date, existing);
        }
      });

      const chartArray = Array.from(dataMap.entries()).map(([date, data]) => ({
        date: new Date(date).toLocaleDateString('it-IT', { day: '2-digit', month: '2-digit' }),
        bookings: data.bookings,
        cancelled: data.cancelled,
      }));

      setChartData(chartArray);
    } catch (error) {
      console.error("Error fetching chart data:", error);
    }
  };

  const exportToCSV = () => {
    const headers = ['Data', 'Prenotazioni', 'Cancellate'];
    const rows = chartData.map(item => [item.date, item.bookings, item.cancelled]);
    
    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `statistiche_onetable_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    
    toast.success("Dati esportati con successo");
  };

  if (loading) {
    return <div className="text-center py-8">Caricamento statistiche...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Statistiche Globali</h2>
        <div className="flex items-center gap-2">
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
          <Button variant="outline" onClick={exportToCSV}>
            <Download className="w-4 h-4 mr-2" />
            Esporta CSV
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid md:grid-cols-2 lg:grid-cols-5 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Store className="w-4 h-4 text-blue-500" />
              Ristoranti Totali
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalRestaurants}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Calendar className="w-4 h-4 text-green-500" />
              Prenotazioni Oggi
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.todayBookings}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <XCircle className="w-4 h-4 text-red-500" />
              Cancellate (30gg)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.cancelledBookings}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Star className="w-4 h-4 text-yellow-500" />
              Recensioni (7gg)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.recentReviews}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-purple-500" />
              Revenue (stima)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">€{stats.revenue.toLocaleString()}</div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Andamento Prenotazioni</CardTitle>
            <CardDescription>Prenotazioni totali per giorno</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="bookings" stroke="#8b5cf6" strokeWidth={2} name="Prenotazioni" />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Prenotazioni vs Cancellazioni</CardTitle>
            <CardDescription>Confronto giornaliero</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="bookings" fill="#10b981" name="Prenotazioni" />
                <Bar dataKey="cancelled" fill="#ef4444" name="Cancellate" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
