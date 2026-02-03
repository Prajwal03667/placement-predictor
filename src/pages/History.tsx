import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Navbar } from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/lib/auth";
import { supabase } from "@/integrations/supabase/client";
import { 
  Clock, 
  TrendingUp, 
  ArrowLeft,
  Sparkles,
  Calendar
} from "lucide-react";
import { format } from "date-fns";

interface Prediction {
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
}

export default function History() {
  const { user } = useAuth();
  const [predictions, setPredictions] = useState<Prediction[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchHistory();
  }, [user]);

  const fetchHistory = async () => {
    if (!user) return;

    const { data, error } = await supabase
      .from("predictions")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (!error && data) {
      setPredictions(data);
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="container mx-auto px-4 py-8">
        <Button
          variant="ghost"
          asChild
          className="mb-4"
        >
          <Link to="/dashboard">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Dashboard
          </Link>
        </Button>

        <div className="mb-8">
          <h1 className="text-3xl font-display font-bold flex items-center gap-2">
            <Clock className="h-8 w-8 text-primary" />
            Prediction History
          </h1>
          <p className="text-muted-foreground mt-1">
            View all your past placement predictions
          </p>
        </div>

        {predictions.length === 0 ? (
          <Card className="text-center py-16">
            <CardContent className="space-y-6">
              <div className="w-16 h-16 rounded-2xl gradient-primary mx-auto flex items-center justify-center">
                <TrendingUp className="h-8 w-8 text-primary-foreground" />
              </div>
              <div className="space-y-2">
                <h2 className="text-xl font-display font-bold">No History Yet</h2>
                <p className="text-muted-foreground">
                  Make your first prediction to start building your history.
                </p>
              </div>
              <Button asChild className="gradient-primary border-0">
                <Link to="/predict">
                  <Sparkles className="mr-2 h-4 w-4" />
                  Make a Prediction
                </Link>
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4">
            {predictions.map((prediction, index) => (
              <Card 
                key={prediction.id} 
                className="animate-fade-in"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <CardContent className="pt-6">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                      <div className={`w-16 h-16 rounded-xl flex items-center justify-center font-display font-bold text-xl ${
                        prediction.prediction_result === "Placed"
                          ? "gradient-success text-success-foreground"
                          : "gradient-warning text-warning-foreground"
                      }`}>
                        {prediction.probability}%
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <Badge 
                            variant={prediction.prediction_result === "Placed" ? "default" : "secondary"}
                            className={prediction.prediction_result === "Placed" 
                              ? "bg-success/10 text-success border-success/20" 
                              : "bg-destructive/10 text-destructive border-destructive/20"
                            }
                          >
                            {prediction.prediction_result}
                          </Badge>
                          <span className="text-sm text-muted-foreground flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {format(new Date(prediction.created_at), "MMM d, yyyy 'at' h:mm a")}
                          </span>
                        </div>
                        <div className="flex flex-wrap gap-3 mt-2 text-sm text-muted-foreground">
                          <span>CGPA: <strong className="text-foreground">{prediction.cgpa}</strong></span>
                          <span>Projects: <strong className="text-foreground">{prediction.num_projects}</strong></span>
                          <span>Programming: <strong className="text-foreground">{prediction.programming_skill}/10</strong></span>
                          <span>Communication: <strong className="text-foreground">{prediction.communication_skill}/10</strong></span>
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-2 text-xs">
                      {prediction.has_internship && (
                        <Badge variant="outline">Internship</Badge>
                      )}
                      {prediction.has_certifications && (
                        <Badge variant="outline">Certifications</Badge>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
