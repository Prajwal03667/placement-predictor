import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Navbar } from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ProgressRing } from "@/components/ui/progress-ring";
import { RecommendationCard } from "@/components/RecommendationCard";
import { useAuth } from "@/lib/auth";
import { supabase } from "@/integrations/supabase/client";
import { 
  Sparkles, 
  TrendingUp, 
  Target, 
  Calendar,
  ArrowRight,
  ChevronRight,
  BookOpen,
  Briefcase,
  Code,
  MessageSquare
} from "lucide-react";
import { format } from "date-fns";

interface Prediction {
  id: string;
  probability: number;
  prediction_result: string;
  recommendations: any;
  created_at: string;
  cgpa: number;
  num_projects: number;
  has_internship: boolean;
  programming_skill: number;
  communication_skill: number;
  has_certifications: boolean;
}

export default function Dashboard() {
  const { user } = useAuth();
  const [latestPrediction, setLatestPrediction] = useState<Prediction | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLatestPrediction();
  }, [user]);

  const fetchLatestPrediction = async () => {
    if (!user) return;

    const { data, error } = await supabase
      .from("predictions")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(1)
      .single();

    if (!error && data) {
      setLatestPrediction(data);
    }
    setLoading(false);
  };

  const skillCards = latestPrediction ? [
    {
      icon: BookOpen,
      label: "CGPA",
      value: latestPrediction.cgpa.toString(),
      color: "text-primary",
      bgColor: "bg-primary/10",
    },
    {
      icon: Code,
      label: "Programming",
      value: `${latestPrediction.programming_skill}/10`,
      color: "text-accent",
      bgColor: "bg-accent/10",
    },
    {
      icon: MessageSquare,
      label: "Communication",
      value: `${latestPrediction.communication_skill}/10`,
      color: "text-warning",
      bgColor: "bg-warning/10",
    },
    {
      icon: Briefcase,
      label: "Projects",
      value: latestPrediction.num_projects.toString(),
      color: "text-success",
      bgColor: "bg-success/10",
    },
  ] : [];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-display font-bold">Dashboard</h1>
          <p className="text-muted-foreground">
            Welcome back! View your placement predictions and recommendations.
          </p>
        </div>

        {latestPrediction ? (
          <div className="space-y-8">
            {/* Prediction Overview */}
            <div className="grid lg:grid-cols-3 gap-6">
              {/* Main Prediction Card */}
              <Card className="lg:col-span-2 overflow-hidden">
                <CardHeader className="bg-gradient-to-r from-primary/5 to-accent/5">
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-xl font-display">
                        Placement Prediction
                      </CardTitle>
                      <CardDescription>
                        Based on your profile data
                      </CardDescription>
                    </div>
                    <div className="flex items-center text-sm text-muted-foreground">
                      <Calendar className="h-4 w-4 mr-1" />
                      {format(new Date(latestPrediction.created_at), "MMM d, yyyy")}
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pt-6">
                  <div className="flex flex-col md:flex-row items-center gap-8">
                    <ProgressRing 
                      progress={Number(latestPrediction.probability)} 
                      size={160}
                      strokeWidth={12}
                    />
                    <div className="flex-1 space-y-4">
                      <div>
                        <p className="text-sm text-muted-foreground">Prediction Result</p>
                        <p className={`text-2xl font-display font-bold ${
                          latestPrediction.prediction_result === "Placed" 
                            ? "text-success" 
                            : "text-destructive"
                        }`}>
                          {latestPrediction.prediction_result}
                        </p>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        {skillCards.map((skill, index) => {
                          const Icon = skill.icon;
                          return (
                            <div 
                              key={index}
                              className="flex items-center gap-3 p-3 rounded-lg bg-muted/50"
                            >
                              <div className={`w-10 h-10 rounded-lg ${skill.bgColor} flex items-center justify-center`}>
                                <Icon className={`h-5 w-5 ${skill.color}`} />
                              </div>
                              <div>
                                <p className="text-xs text-muted-foreground">{skill.label}</p>
                                <p className="font-semibold">{skill.value}</p>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Quick Actions */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg font-display">Quick Actions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button asChild className="w-full justify-between gradient-primary border-0">
                    <Link to="/predict">
                      <span className="flex items-center gap-2">
                        <Sparkles className="h-4 w-4" />
                        New Prediction
                      </span>
                      <ChevronRight className="h-4 w-4" />
                    </Link>
                  </Button>
                  <Button asChild variant="outline" className="w-full justify-between">
                    <Link to="/profile">
                      <span className="flex items-center gap-2">
                        <Target className="h-4 w-4" />
                        Update Profile
                      </span>
                      <ChevronRight className="h-4 w-4" />
                    </Link>
                  </Button>
                  <Button asChild variant="outline" className="w-full justify-between">
                    <Link to="/history">
                      <span className="flex items-center gap-2">
                        <TrendingUp className="h-4 w-4" />
                        View History
                      </span>
                      <ChevronRight className="h-4 w-4" />
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            </div>

            {/* Recommendations */}
            <RecommendationCard 
              recommendations={latestPrediction.recommendations as any[] || []} 
            />
          </div>
        ) : (
          /* No Predictions Yet */
          <Card className="text-center py-16">
            <CardContent className="space-y-6">
              <div className="w-20 h-20 rounded-2xl gradient-primary mx-auto flex items-center justify-center animate-pulse-glow">
                <Sparkles className="h-10 w-10 text-primary-foreground" />
              </div>
              <div className="space-y-2">
                <h2 className="text-2xl font-display font-bold">No Predictions Yet</h2>
                <p className="text-muted-foreground max-w-md mx-auto">
                  Enter your academic details and skills to get your first 
                  AI-powered placement prediction.
                </p>
              </div>
              <Button asChild className="gradient-primary border-0 px-8">
                <Link to="/predict">
                  Get Your First Prediction
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  );
}
