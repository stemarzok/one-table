import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { supabase } from "@/integrations/supabase/client";
import { Calendar, TrendingUp, Users, Clock, DollarSign, Download, ChevronDown, ChevronUp, Filter, Mail, Phone, RefreshCw } from "lucide-react";
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { format, subDays, startOfWeek, endOfWeek, startOfMonth, endOfMonth } from "date-fns";
import { it } from "date-fns/locale";
import { toast } from "sonner";

interface AnalyticsProps {
  restaurantId: string;
}

interface BookingStats {
  date: string;
  fullDate: string;
  bookings: number;
  confirmed: number;
  cancelled: number;
  completed: number;
  pending: number;
  guests: number;
  revenue: number;
}

interface TimeSlotStats {
  time: string;
  count: number;
  guests: number;
}

interface MarketingUser {
  id: string;
  user_name: string;
  user_email: string;
  user_phone: string | null;
  booking_date: string;
  created_at: string;
}

interface WeekdayStats {
  day: string;
  bookings: number;
  avgGuests: number;
}

export const RestaurantAnalyticsAdvanced = ({ restaurantId }: AnalyticsProps) => {
  const [dateRange, setDateRange] = useState<string>("30");
  const [customStartDate, setCustomStartDate] = useState<string>("");
  const [customEndDate, setCustomEndDate] = useState<string>("");
  const [bookingTrends, setBookingTrends] = useState<BookingStats[]>([]);
  const [timeSlotData, setTimeSlotData] = useState<TimeSlotStats[]>([]);
  const [weekdayStats, setWeekdayStats] = useState<WeekdayStats[]>([]);
  const [marketingUsers, setMarketingUsers] = useState<MarketingUser[]>([]);
  const [stats, setStats] = useState({
    totalBookings: 0,
    avgGuests: 0,
    occupancyRate: 0,
    revenue: 0,
    peakHour: "",
    conversionRate: 0,
    returningCustomers: 0,
    cancellationRate: 0,
  });
  const [loading, setLoading] = useState(true);
  const [expandedSections, setExpandedSections] = useState({
    trends: true,
    timeSlots: true,
    weekdays: true,
    marketing: true,
    comparison: true,
  });

  useEffect(() => {
    fetchAnalytics();
  }, [restaurantId, dateRange, customStartDate, customEndDate]);

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections(prev => ({ ...prev, [section]: !prev[section] }));
  };

  const getDateRange = () => {
    if (dateRange === "custom" && customStartDate && customEndDate) {
      return { start: new Date(customStartDate), end: new Date(customEndDate) };
    }
    const days = parseInt(dateRange);
    return { start: subDays(new Date(), days), end: new Date() };
  };

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const { start: startDate, end: endDate } = getDateRange();
      const days = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));

      // Fetch bookings data
      const { data: bookings } = await supabase
        .from('bookings')
        .select('*')
        .eq('restaurant_id', restaurantId)
        .gte('booking_date', startDate.toISOString().split('T')[0])
        .lte('booking_date', endDate.toISOString().split('T')[0])
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

      // Fetch marketing consent users
      const { data: marketingData } = await supabase
        .from('bookings')
        .select('id, user_name, user_email, user_phone, booking_date, created_at, marketing_consent')
        .eq('restaurant_id', restaurantId)
        .eq('marketing_consent', true)
        .order('created_at', { ascending: false });

      setMarketingUsers(marketingData || []);

      if (!bookings) return;

      // Calculate booking trends by date
      const trendsMap = new Map<string, BookingStats>();
      const avgPrice = restaurant?.price_range === '€' ? 15 :
                      restaurant?.price_range === '€€' ? 30 :
                      restaurant?.price_range === '€€€' ? 50 : 80;

      for (let i = 0; i <= days; i++) {
        const date = new Date(startDate);
        date.setDate(date.getDate() + i);
        const dateStr = date.toISOString().split('T')[0];
        trendsMap.set(dateStr, {
          date: format(date, 'dd/MM', { locale: it }),
          fullDate: dateStr,
          bookings: 0,
          confirmed: 0,
          cancelled: 0,
          completed: 0,
          pending: 0,
          guests: 0,
          revenue: 0,
        });
      }

      // Calculate time slot distribution and weekday stats
      const timeSlotsMap = new Map<string, { count: number; guests: number }>();
      const weekdayMap = new Map<number, { bookings: number; guests: number }>();
      let totalGuests = 0;
      let completedBookings = 0;
      const uniqueUsers = new Set<string>();
      const returningUsers = new Set<string>();

      bookings.forEach((booking) => {
        const stats = trendsMap.get(booking.booking_date);
        if (stats) {
          stats.bookings++;
          stats.guests += booking.guests_count;
          if (booking.status === 'confirmed') stats.confirmed++;
          if (booking.status === 'cancelled') stats.cancelled++;
          if (booking.status === 'completed') {
            stats.completed++;
            stats.revenue += avgPrice * booking.guests_count;
          }
          if (booking.status === 'pending') stats.pending++;
          trendsMap.set(booking.booking_date, stats);
        }

        // Time slots
        const hour = booking.booking_time.split(':')[0];
        const timeSlot = `${hour}:00`;
        const existing = timeSlotsMap.get(timeSlot) || { count: 0, guests: 0 };
        timeSlotsMap.set(timeSlot, { 
          count: existing.count + 1, 
          guests: existing.guests + booking.guests_count 
        });

        // Weekday stats
        const dayOfWeek = new Date(booking.booking_date).getDay();
        const weekdayData = weekdayMap.get(dayOfWeek) || { bookings: 0, guests: 0 };
        weekdayMap.set(dayOfWeek, {
          bookings: weekdayData.bookings + 1,
          guests: weekdayData.guests + booking.guests_count,
        });

        totalGuests += booking.guests_count;
        if (booking.status === 'completed') completedBookings++;

        // Track unique and returning users
        if (uniqueUsers.has(booking.user_id)) {
          returningUsers.add(booking.user_id);
        }
        uniqueUsers.add(booking.user_id);
      });

      setBookingTrends(Array.from(trendsMap.values()));

      // Sort time slots
      const timeSlots = Array.from(timeSlotsMap.entries())
        .map(([time, data]) => ({ time, ...data }))
        .sort((a, b) => parseInt(a.time) - parseInt(b.time));
      
      setTimeSlotData(timeSlots);

      // Format weekday stats
      const dayNames = ['Dom', 'Lun', 'Mar', 'Mer', 'Gio', 'Ven', 'Sab'];
      const weekdays = Array.from(weekdayMap.entries())
        .map(([day, data]) => ({
          day: dayNames[day],
          bookings: data.bookings,
          avgGuests: data.bookings > 0 ? Math.round(data.guests / data.bookings * 10) / 10 : 0,
        }))
        .sort((a, b) => dayNames.indexOf(a.day) - dayNames.indexOf(b.day));
      
      setWeekdayStats(weekdays);

      // Calculate stats
      const totalSeats = tables?.reduce((sum, t) => sum + t.seats, 0) || 0;
      const peakSlot = timeSlots.reduce((max, slot) => slot.count > max.count ? slot : max, { time: "20:00", count: 0, guests: 0 });
      const cancelledCount = bookings.filter(b => b.status === 'cancelled').length;

      setStats({
        totalBookings: bookings.length,
        avgGuests: bookings.length > 0 ? Math.round(totalGuests / bookings.length * 10) / 10 : 0,
        occupancyRate: totalSeats > 0 ? Math.round((totalGuests / (totalSeats * days)) * 100) : 0,
        revenue: completedBookings * avgPrice * (totalGuests / (bookings.length || 1)),
        peakHour: peakSlot.time,
        conversionRate: bookings.length > 0 ? Math.round((completedBookings / bookings.length) * 100) : 0,
        returningCustomers: returningUsers.size,
        cancellationRate: bookings.length > 0 ? Math.round((cancelledCount / bookings.length) * 100) : 0,
      });

    } catch (error) {
      console.error("Error fetching analytics:", error);
    } finally {
      setLoading(false);
    }
  };

  const exportToCSV = (data: any[], filename: string) => {
    if (data.length === 0) {
      toast.error("Nessun dato da esportare");
      return;
    }
    
    const headers = Object.keys(data[0]).join(',');
    const rows = data.map(row => Object.values(row).join(',')).join('\n');
    const csv = `${headers}\n${rows}`;
    
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `${filename}_${format(new Date(), 'yyyy-MM-dd')}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success("File CSV esportato con successo");
  };

  const exportAllData = () => {
    exportToCSV([
      ...bookingTrends.map(d => ({ tipo: 'trend', ...d })),
    ], 'analytics_completi');
  };

  const COLORS = ['hsl(var(--primary))', 'hsl(var(--chart-2))', 'hsl(var(--chart-3))', 'hsl(var(--chart-4))', 'hsl(var(--chart-5))'];

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <RefreshCw className="w-6 h-6 animate-spin text-muted-foreground" />
        <span className="ml-2 text-muted-foreground">Caricamento analytics...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with Filters */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <h2 className="text-2xl font-bold">Analytics Avanzate</h2>
        <div className="flex flex-wrap items-center gap-3">
          <Select value={dateRange} onValueChange={setDateRange}>
            <SelectTrigger className="w-[180px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7">Ultimi 7 giorni</SelectItem>
              <SelectItem value="30">Ultimi 30 giorni</SelectItem>
              <SelectItem value="90">Ultimi 90 giorni</SelectItem>
              <SelectItem value="180">Ultimi 6 mesi</SelectItem>
              <SelectItem value="365">Ultimo anno</SelectItem>
              <SelectItem value="custom">Personalizzato</SelectItem>
            </SelectContent>
          </Select>
          
          {dateRange === "custom" && (
            <div className="flex gap-2">
              <Input
                type="date"
                value={customStartDate}
                onChange={(e) => setCustomStartDate(e.target.value)}
                className="w-[150px]"
              />
              <Input
                type="date"
                value={customEndDate}
                onChange={(e) => setCustomEndDate(e.target.value)}
                className="w-[150px]"
              />
            </div>
          )}
          
          <Button variant="outline" size="sm" onClick={exportAllData}>
            <Download className="w-4 h-4 mr-2" />
            Esporta Tutto
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-3">
        <Card className="col-span-1">
          <CardHeader className="pb-2 px-4 pt-4">
            <CardTitle className="text-xs font-medium flex items-center gap-1">
              <Calendar className="w-3 h-3 text-primary" />
              Prenotazioni
            </CardTitle>
          </CardHeader>
          <CardContent className="px-4 pb-4">
            <div className="text-xl font-bold">{stats.totalBookings}</div>
          </CardContent>
        </Card>

        <Card className="col-span-1">
          <CardHeader className="pb-2 px-4 pt-4">
            <CardTitle className="text-xs font-medium flex items-center gap-1">
              <Users className="w-3 h-3 text-chart-2" />
              Media Ospiti
            </CardTitle>
          </CardHeader>
          <CardContent className="px-4 pb-4">
            <div className="text-xl font-bold">{stats.avgGuests}</div>
          </CardContent>
        </Card>

        <Card className="col-span-1">
          <CardHeader className="pb-2 px-4 pt-4">
            <CardTitle className="text-xs font-medium flex items-center gap-1">
              <TrendingUp className="w-3 h-3 text-chart-3" />
              Occupazione
            </CardTitle>
          </CardHeader>
          <CardContent className="px-4 pb-4">
            <div className="text-xl font-bold">{stats.occupancyRate}%</div>
          </CardContent>
        </Card>

        <Card className="col-span-1">
          <CardHeader className="pb-2 px-4 pt-4">
            <CardTitle className="text-xs font-medium flex items-center gap-1">
              <Clock className="w-3 h-3 text-chart-4" />
              Orario Picco
            </CardTitle>
          </CardHeader>
          <CardContent className="px-4 pb-4">
            <div className="text-xl font-bold">{stats.peakHour}</div>
          </CardContent>
        </Card>

        <Card className="col-span-1">
          <CardHeader className="pb-2 px-4 pt-4">
            <CardTitle className="text-xs font-medium flex items-center gap-1">
              <DollarSign className="w-3 h-3 text-chart-5" />
              Revenue
            </CardTitle>
          </CardHeader>
          <CardContent className="px-4 pb-4">
            <div className="text-xl font-bold">€{Math.round(stats.revenue).toLocaleString()}</div>
          </CardContent>
        </Card>

        <Card className="col-span-1">
          <CardHeader className="pb-2 px-4 pt-4">
            <CardTitle className="text-xs font-medium">Conversione</CardTitle>
          </CardHeader>
          <CardContent className="px-4 pb-4">
            <div className="text-xl font-bold text-chart-2">{stats.conversionRate}%</div>
          </CardContent>
        </Card>

        <Card className="col-span-1">
          <CardHeader className="pb-2 px-4 pt-4">
            <CardTitle className="text-xs font-medium">Ritorno</CardTitle>
          </CardHeader>
          <CardContent className="px-4 pb-4">
            <div className="text-xl font-bold text-chart-3">{stats.returningCustomers}</div>
          </CardContent>
        </Card>

        <Card className="col-span-1">
          <CardHeader className="pb-2 px-4 pt-4">
            <CardTitle className="text-xs font-medium">Cancellaz.</CardTitle>
          </CardHeader>
          <CardContent className="px-4 pb-4">
            <div className="text-xl font-bold text-destructive">{stats.cancellationRate}%</div>
          </CardContent>
        </Card>
      </div>

      {/* Booking Trends - Collapsible */}
      <Collapsible open={expandedSections.trends} onOpenChange={() => toggleSection('trends')}>
        <Card>
          <CollapsibleTrigger asChild>
            <CardHeader className="cursor-pointer hover:bg-muted/50 transition-colors">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Trend Prenotazioni</CardTitle>
                  <CardDescription>Andamento giornaliero delle prenotazioni e revenue</CardDescription>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); exportToCSV(bookingTrends, 'trend_prenotazioni'); }}>
                    <Download className="w-4 h-4" />
                  </Button>
                  {expandedSections.trends ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                </div>
              </div>
            </CardHeader>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <CardContent>
              <ResponsiveContainer width="100%" height={350}>
                <AreaChart data={bookingTrends}>
                  <defs>
                    <linearGradient id="colorBookings" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(var(--chart-2))" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="hsl(var(--chart-2))" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis dataKey="date" className="text-xs" />
                  <YAxis yAxisId="left" className="text-xs" />
                  <YAxis yAxisId="right" orientation="right" className="text-xs" />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'hsl(var(--background))', 
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px'
                    }} 
                  />
                  <Legend />
                  <Area yAxisId="left" type="monotone" dataKey="bookings" stroke="hsl(var(--primary))" fillOpacity={1} fill="url(#colorBookings)" name="Prenotazioni" />
                  <Line yAxisId="left" type="monotone" dataKey="confirmed" stroke="hsl(var(--chart-2))" strokeWidth={2} name="Confermate" />
                  <Line yAxisId="left" type="monotone" dataKey="cancelled" stroke="hsl(var(--destructive))" strokeWidth={2} name="Cancellate" />
                  <Line yAxisId="right" type="monotone" dataKey="revenue" stroke="hsl(var(--chart-5))" strokeWidth={2} strokeDasharray="5 5" name="Revenue (€)" />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </CollapsibleContent>
        </Card>
      </Collapsible>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Time Slots - Collapsible */}
        <Collapsible open={expandedSections.timeSlots} onOpenChange={() => toggleSection('timeSlots')}>
          <Card>
            <CollapsibleTrigger asChild>
              <CardHeader className="cursor-pointer hover:bg-muted/50 transition-colors">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Distribuzione Oraria</CardTitle>
                    <CardDescription>Prenotazioni per fascia oraria</CardDescription>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); exportToCSV(timeSlotData, 'distribuzione_oraria'); }}>
                      <Download className="w-4 h-4" />
                    </Button>
                    {expandedSections.timeSlots ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                  </div>
                </div>
              </CardHeader>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={timeSlotData}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis dataKey="time" className="text-xs" />
                    <YAxis className="text-xs" />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'hsl(var(--background))', 
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '8px'
                      }} 
                    />
                    <Legend />
                    <Bar dataKey="count" fill="hsl(var(--primary))" name="Prenotazioni" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="guests" fill="hsl(var(--chart-2))" name="Ospiti" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </CollapsibleContent>
          </Card>
        </Collapsible>

        {/* Weekday Stats - Collapsible */}
        <Collapsible open={expandedSections.weekdays} onOpenChange={() => toggleSection('weekdays')}>
          <Card>
            <CollapsibleTrigger asChild>
              <CardHeader className="cursor-pointer hover:bg-muted/50 transition-colors">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Distribuzione Settimanale</CardTitle>
                    <CardDescription>Performance per giorno della settimana</CardDescription>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); exportToCSV(weekdayStats, 'distribuzione_settimanale'); }}>
                      <Download className="w-4 h-4" />
                    </Button>
                    {expandedSections.weekdays ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                  </div>
                </div>
              </CardHeader>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={weekdayStats}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis dataKey="day" className="text-xs" />
                    <YAxis className="text-xs" />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'hsl(var(--background))', 
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '8px'
                      }} 
                    />
                    <Legend />
                    <Bar dataKey="bookings" fill="hsl(var(--chart-3))" name="Prenotazioni" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="avgGuests" fill="hsl(var(--chart-4))" name="Media Ospiti" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </CollapsibleContent>
          </Card>
        </Collapsible>
      </div>

      {/* Status Distribution */}
      <Collapsible open={expandedSections.comparison} onOpenChange={() => toggleSection('comparison')}>
        <Card>
          <CollapsibleTrigger asChild>
            <CardHeader className="cursor-pointer hover:bg-muted/50 transition-colors">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Analisi Comparativa Status</CardTitle>
                  <CardDescription>Distribuzione delle prenotazioni per stato</CardDescription>
                </div>
                {expandedSections.comparison ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
              </div>
            </CardHeader>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <CardContent>
              <div className="grid lg:grid-cols-2 gap-6">
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={bookingTrends}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis dataKey="date" className="text-xs" />
                    <YAxis className="text-xs" />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'hsl(var(--background))', 
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '8px'
                      }} 
                    />
                    <Legend />
                    <Bar dataKey="confirmed" stackId="a" fill="hsl(var(--chart-2))" name="Confermate" />
                    <Bar dataKey="completed" stackId="a" fill="hsl(var(--primary))" name="Completate" />
                    <Bar dataKey="pending" stackId="a" fill="hsl(var(--chart-4))" name="In Attesa" />
                    <Bar dataKey="cancelled" stackId="a" fill="hsl(var(--destructive))" name="Cancellate" />
                  </BarChart>
                </ResponsiveContainer>

                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={[
                        { name: 'Confermate', value: bookingTrends.reduce((sum, d) => sum + d.confirmed, 0) },
                        { name: 'Completate', value: bookingTrends.reduce((sum, d) => sum + d.completed, 0) },
                        { name: 'In Attesa', value: bookingTrends.reduce((sum, d) => sum + d.pending, 0) },
                        { name: 'Cancellate', value: bookingTrends.reduce((sum, d) => sum + d.cancelled, 0) },
                      ].filter(item => item.value > 0)}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      outerRadius={100}
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
              </div>
            </CardContent>
          </CollapsibleContent>
        </Card>
      </Collapsible>

      {/* Marketing Users - Collapsible */}
      <Collapsible open={expandedSections.marketing} onOpenChange={() => toggleSection('marketing')}>
        <Card>
          <CollapsibleTrigger asChild>
            <CardHeader className="cursor-pointer hover:bg-muted/50 transition-colors">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Mail className="w-5 h-5" />
                    Utenti Marketing
                  </CardTitle>
                  <CardDescription>Utenti che hanno accettato il trattamento ai fini marketing ({marketingUsers.length})</CardDescription>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); exportToCSV(marketingUsers, 'utenti_marketing'); }}>
                    <Download className="w-4 h-4" />
                  </Button>
                  {expandedSections.marketing ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                </div>
              </div>
            </CardHeader>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <CardContent>
              {marketingUsers.length === 0 ? (
                <p className="text-muted-foreground text-center py-8">Nessun utente ha ancora accettato il trattamento marketing</p>
              ) : (
                <div className="space-y-3 max-h-[400px] overflow-y-auto">
                  {marketingUsers.map((user) => (
                    <div key={user.id} className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                      <div>
                        <p className="font-medium">{user.user_name}</p>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Mail className="w-3 h-3" />
                            {user.user_email}
                          </span>
                          {user.user_phone && (
                            <span className="flex items-center gap-1">
                              <Phone className="w-3 h-3" />
                              {user.user_phone}
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="text-right text-sm text-muted-foreground">
                        <p>Prenotazione: {format(new Date(user.booking_date), 'dd/MM/yyyy', { locale: it })}</p>
                        <p>Registrato: {format(new Date(user.created_at), 'dd/MM/yyyy', { locale: it })}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </CollapsibleContent>
        </Card>
      </Collapsible>
    </div>
  );
};