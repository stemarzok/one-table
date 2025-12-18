import { useState, useEffect, useMemo } from "react";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line, AreaChart, Area } from "recharts";
import { MousePointer, Eye, ArrowDown, Clock, Users, TrendingUp, MapPin } from "lucide-react";

interface AnalyticsEvent {
  id: string;
  event_type: string;
  page_path: string;
  x_position: number | null;
  y_position: number | null;
  viewport_width: number | null;
  viewport_height: number | null;
  created_at: string;
  metadata: any;
}

const COLORS = ['hsl(var(--primary))', 'hsl(var(--chart-2))', 'hsl(var(--chart-3))', 'hsl(var(--chart-4))', 'hsl(var(--chart-5))'];

export const UserBehaviorAnalytics = () => {
  const [events, setEvents] = useState<AnalyticsEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState("7d");
  const [selectedPage, setSelectedPage] = useState("all");

  useEffect(() => {
    fetchAnalytics();
  }, [dateRange]);

  const fetchAnalytics = async () => {
    setLoading(true);
    
    const daysAgo = dateRange === "1d" ? 1 : dateRange === "7d" ? 7 : 30;
    const since = new Date();
    since.setDate(since.getDate() - daysAgo);

    const { data, error } = await supabase
      .from('user_analytics')
      .select('*')
      .gte('created_at', since.toISOString())
      .order('created_at', { ascending: false })
      .limit(5000);

    if (data && !error) {
      setEvents(data);
    }
    setLoading(false);
  };

  // Aggregate data
  const stats = useMemo(() => {
    const filtered = selectedPage === "all" 
      ? events 
      : events.filter(e => e.page_path === selectedPage);

    const pageViews = filtered.filter(e => e.event_type === 'page_view').length;
    const clicks = filtered.filter(e => e.event_type === 'click').length;
    const uniqueSessions = new Set(filtered.map(e => (e.metadata as any)?.timestamp?.split('T')[0])).size;
    
    // Page popularity
    const pagePopularity = filtered
      .filter(e => e.event_type === 'page_view')
      .reduce((acc, e) => {
        acc[e.page_path] = (acc[e.page_path] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

    const topPages = Object.entries(pagePopularity)
      .map(([name, value]) => ({ name: name.length > 20 ? name.slice(0, 20) + '...' : name, value, fullPath: name }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 10);

    // Click heatmap data (aggregate by grid)
    const clicksWithPos = filtered.filter(e => e.event_type === 'click' && e.x_position && e.y_position);
    const gridSize = 100;
    const heatmapData: Record<string, number> = {};
    
    clicksWithPos.forEach(e => {
      const gridX = Math.floor((e.x_position || 0) / gridSize);
      const gridY = Math.floor((e.y_position || 0) / gridSize);
      const key = `${gridX},${gridY}`;
      heatmapData[key] = (heatmapData[key] || 0) + 1;
    });

    const heatmapGrid = Object.entries(heatmapData).map(([key, count]) => {
      const [x, y] = key.split(',').map(Number);
      return { x: x * gridSize, y: y * gridSize, count };
    });

    // Scroll depth distribution
    const scrollEvents = filtered.filter(e => e.event_type === 'scroll_depth');
    const scrollDepths = [25, 50, 75, 100].map(depth => ({
      depth: `${depth}%`,
      count: scrollEvents.filter(e => (e.metadata as any)?.depth === depth).length
    }));

    // Timeline (hourly distribution)
    const hourlyData = Array(24).fill(0).map((_, i) => ({ hour: `${i}:00`, count: 0 }));
    filtered.forEach(e => {
      const hour = new Date(e.created_at).getHours();
      hourlyData[hour].count++;
    });

    // Popular click elements
    const clickElements = filtered
      .filter(e => e.event_type === 'click' && (e.metadata as any)?.text)
      .reduce((acc, e) => {
        const text = ((e.metadata as any)?.text || '').slice(0, 30);
        if (text) acc[text] = (acc[text] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

    const topClickedElements = Object.entries(clickElements)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 8);

    return {
      pageViews,
      clicks,
      uniqueSessions,
      topPages,
      scrollDepths,
      hourlyData,
      topClickedElements,
      heatmapGrid
    };
  }, [events, selectedPage]);

  const uniquePages = useMemo(() => {
    const pages = [...new Set(events.map(e => e.page_path))];
    return pages.sort();
  }, [events]);

  if (loading) {
    return (
      <Card className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-muted rounded w-1/3"></div>
          <div className="h-64 bg-muted rounded"></div>
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h2 className="text-2xl font-bold">Comportamento Utenti</h2>
        <div className="flex gap-3">
          <Select value={selectedPage} onValueChange={setSelectedPage}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Tutte le pagine" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tutte le pagine</SelectItem>
              {uniquePages.map(page => (
                <SelectItem key={page} value={page}>
                  {page.length > 25 ? page.slice(0, 25) + '...' : page}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={dateRange} onValueChange={setDateRange}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1d">Ultime 24h</SelectItem>
              <SelectItem value="7d">Ultimi 7 giorni</SelectItem>
              <SelectItem value="30d">Ultimi 30 giorni</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-full bg-primary/10">
              <Eye className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-bold">{stats.pageViews.toLocaleString()}</p>
              <p className="text-sm text-muted-foreground">Visualizzazioni</p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-full bg-primary/10">
              <MousePointer className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-bold">{stats.clicks.toLocaleString()}</p>
              <p className="text-sm text-muted-foreground">Click</p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-full bg-primary/10">
              <Users className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-bold">{stats.uniqueSessions}</p>
              <p className="text-sm text-muted-foreground">Sessioni uniche</p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-full bg-primary/10">
              <TrendingUp className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-bold">
                {stats.pageViews > 0 ? ((stats.clicks / stats.pageViews) * 100).toFixed(1) : 0}%
              </p>
              <p className="text-sm text-muted-foreground">CTR</p>
            </div>
          </div>
        </Card>
      </div>

      <Tabs defaultValue="pages" className="space-y-4">
        <TabsList>
          <TabsTrigger value="pages">Pagine popolari</TabsTrigger>
          <TabsTrigger value="clicks">Elementi cliccati</TabsTrigger>
          <TabsTrigger value="scroll">Profondità scroll</TabsTrigger>
          <TabsTrigger value="timeline">Distribuzione oraria</TabsTrigger>
          <TabsTrigger value="heatmap">Heatmap click</TabsTrigger>
        </TabsList>

        <TabsContent value="pages">
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Pagine più visitate</h3>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={stats.topPages} layout="vertical">
                  <XAxis type="number" />
                  <YAxis type="category" dataKey="name" width={150} tick={{ fontSize: 12 }} />
                  <Tooltip 
                    formatter={(value: number) => [value, 'Visite']}
                    labelFormatter={(label) => stats.topPages.find(p => p.name === label)?.fullPath || label}
                  />
                  <Bar dataKey="value" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="clicks">
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Elementi più cliccati</h3>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={stats.topClickedElements}>
                  <XAxis dataKey="name" tick={{ fontSize: 10 }} angle={-45} textAnchor="end" height={80} />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="value" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="scroll">
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Profondità di scroll</h3>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={stats.scrollDepths}>
                  <XAxis dataKey="depth" />
                  <YAxis />
                  <Tooltip />
                  <Area type="monotone" dataKey="count" fill="hsl(var(--primary))" fillOpacity={0.3} stroke="hsl(var(--primary))" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
            <p className="text-sm text-muted-foreground mt-4">
              Quanti utenti hanno scrollato fino a una certa profondità della pagina
            </p>
          </Card>
        </TabsContent>

        <TabsContent value="timeline">
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Distribuzione oraria</h3>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={stats.hourlyData}>
                  <XAxis dataKey="hour" />
                  <YAxis />
                  <Tooltip />
                  <Line type="monotone" dataKey="count" stroke="hsl(var(--primary))" strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="heatmap">
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Heatmap dei click</h3>
            <div className="relative w-full h-96 bg-muted/50 rounded-lg overflow-hidden border">
              {/* Simplified heatmap visualization */}
              <div className="absolute inset-0">
                {stats.heatmapGrid.map((point, i) => {
                  const maxCount = Math.max(...stats.heatmapGrid.map(p => p.count), 1);
                  const intensity = point.count / maxCount;
                  const size = 20 + intensity * 60;
                  
                  return (
                    <div
                      key={i}
                      className="absolute rounded-full transition-all"
                      style={{
                        left: `${Math.min((point.x / 1920) * 100, 95)}%`,
                        top: `${Math.min((point.y / 3000) * 100, 95)}%`,
                        width: size,
                        height: size,
                        background: `radial-gradient(circle, hsla(var(--primary), ${0.3 + intensity * 0.5}) 0%, transparent 70%)`,
                        transform: 'translate(-50%, -50%)'
                      }}
                    />
                  );
                })}
              </div>
              <div className="absolute inset-0 flex items-center justify-center text-muted-foreground">
                <div className="text-center">
                  <MapPin className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">Distribuzione dei click sulla pagina</p>
                  <p className="text-xs opacity-70">Zone più calde = più click</p>
                </div>
              </div>
            </div>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default UserBehaviorAnalytics;