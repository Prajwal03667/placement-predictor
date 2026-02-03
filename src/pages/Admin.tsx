import { useState, useEffect } from "react";
import { Navbar } from "@/components/Navbar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { supabase } from "@/integrations/supabase/client";
import { 
  Shield, 
  Users, 
  TrendingUp, 
  Search,
  ChevronLeft,
  ChevronRight,
  BarChart3
} from "lucide-react";
import { format } from "date-fns";

interface PredictionWithProfile {
  id: string;
  probability: number;
  prediction_result: string;
  cgpa: number;
  num_projects: number;
  has_internship: boolean;
  programming_skill: number;
  communication_skill: number;
  has_certifications: boolean;
  created_at: string;
  user_id: string;
  profiles: {
    full_name: string;
    email: string;
  } | null;
}

export default function Admin() {
  const [predictions, setPredictions] = useState<PredictionWithProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const pageSize = 10;

  const [stats, setStats] = useState({
    totalStudents: 0,
    totalPredictions: 0,
    avgProbability: 0,
    placedCount: 0,
  });

  useEffect(() => {
    fetchPredictions();
    fetchStats();
  }, [page]);

  const fetchStats = async () => {
    // Get total unique students
    const { count: studentCount } = await supabase
      .from("profiles")
      .select("*", { count: "exact", head: true });

    // Get all predictions for stats
    const { data: allPredictions } = await supabase
      .from("predictions")
      .select("probability, prediction_result");

    if (allPredictions) {
      const avgProb = allPredictions.reduce((sum, p) => sum + Number(p.probability), 0) / (allPredictions.length || 1);
      const placed = allPredictions.filter(p => p.prediction_result === "Placed").length;

      setStats({
        totalStudents: studentCount || 0,
        totalPredictions: allPredictions.length,
        avgProbability: Math.round(avgProb),
        placedCount: placed,
      });
    }
  };

  const fetchPredictions = async () => {
    setLoading(true);

    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;

    const { data, error, count } = await supabase
      .from("predictions")
      .select(`
        *,
        profiles!predictions_user_id_fkey (
          full_name,
          email
        )
      `, { count: "exact" })
      .order("created_at", { ascending: false })
      .range(from, to);

    if (!error && data) {
      setPredictions(data as unknown as PredictionWithProfile[]);
      setTotalCount(count || 0);
    }
    setLoading(false);
  };

  const filteredPredictions = predictions.filter(p => {
    if (!search) return true;
    const searchLower = search.toLowerCase();
    return (
      p.profiles?.full_name?.toLowerCase().includes(searchLower) ||
      p.profiles?.email?.toLowerCase().includes(searchLower)
    );
  });

  const totalPages = Math.ceil(totalCount / pageSize);

  const statCards = [
    {
      icon: Users,
      label: "Total Students",
      value: stats.totalStudents,
      color: "text-primary",
      bgColor: "bg-primary/10",
    },
    {
      icon: BarChart3,
      label: "Total Predictions",
      value: stats.totalPredictions,
      color: "text-accent",
      bgColor: "bg-accent/10",
    },
    {
      icon: TrendingUp,
      label: "Avg Probability",
      value: `${stats.avgProbability}%`,
      color: "text-warning",
      bgColor: "bg-warning/10",
    },
    {
      icon: Shield,
      label: "Placed Predictions",
      value: stats.placedCount,
      color: "text-success",
      bgColor: "bg-success/10",
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-2">
            <Shield className="h-6 w-6 text-primary" />
            <h1 className="text-3xl font-display font-bold">Admin Panel</h1>
          </div>
          <p className="text-muted-foreground">
            View all student predictions and analytics.
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {statCards.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <Card key={index} className="animate-fade-in" style={{ animationDelay: `${index * 100}ms` }}>
                <CardContent className="pt-6">
                  <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-xl ${stat.bgColor} flex items-center justify-center`}>
                      <Icon className={`h-6 w-6 ${stat.color}`} />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">{stat.label}</p>
                      <p className="text-2xl font-display font-bold">{stat.value}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Predictions Table */}
        <Card>
          <CardHeader>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <CardTitle className="text-xl font-display">All Predictions</CardTitle>
                <CardDescription>Browse and search student predictions</CardDescription>
              </div>
              <div className="relative w-full sm:w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by name or email..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Student</TableHead>
                    <TableHead>CGPA</TableHead>
                    <TableHead>Projects</TableHead>
                    <TableHead>Skills</TableHead>
                    <TableHead>Probability</TableHead>
                    <TableHead>Result</TableHead>
                    <TableHead>Date</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredPredictions.map((prediction) => (
                    <TableRow key={prediction.id}>
                      <TableCell>
                        <div>
                          <p className="font-medium">
                            {prediction.profiles?.full_name || "Unknown"}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {prediction.profiles?.email}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell>{prediction.cgpa}</TableCell>
                      <TableCell>{prediction.num_projects}</TableCell>
                      <TableCell>
                        <div className="text-xs space-y-1">
                          <p>Prog: {prediction.programming_skill}/10</p>
                          <p>Comm: {prediction.communication_skill}/10</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="font-semibold">{prediction.probability}%</span>
                      </TableCell>
                      <TableCell>
                        <Badge 
                          variant={prediction.prediction_result === "Placed" ? "default" : "secondary"}
                          className={prediction.prediction_result === "Placed" 
                            ? "bg-success/10 text-success border-success/20" 
                            : "bg-destructive/10 text-destructive border-destructive/20"
                          }
                        >
                          {prediction.prediction_result}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-muted-foreground text-sm">
                        {format(new Date(prediction.created_at), "MMM d, yyyy")}
                      </TableCell>
                    </TableRow>
                  ))}
                  {filteredPredictions.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                        No predictions found
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between mt-4">
                <p className="text-sm text-muted-foreground">
                  Page {page} of {totalPages}
                </p>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage(p => Math.max(1, p - 1))}
                    disabled={page === 1}
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                    disabled={page === totalPages}
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
