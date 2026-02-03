import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { LucideIcon, TrendingUp, AlertCircle, CheckCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface Recommendation {
  title: string;
  description: string;
  priority: "high" | "medium" | "low";
  category: string;
}

interface RecommendationCardProps {
  recommendations: Recommendation[];
}

export function RecommendationCard({ recommendations }: RecommendationCardProps) {
  const getPriorityStyles = (priority: string) => {
    switch (priority) {
      case "high":
        return {
          badge: "bg-destructive/10 text-destructive border-destructive/20",
          icon: AlertCircle,
          iconColor: "text-destructive",
        };
      case "medium":
        return {
          badge: "bg-warning/10 text-warning border-warning/20",
          icon: TrendingUp,
          iconColor: "text-warning",
        };
      case "low":
        return {
          badge: "bg-success/10 text-success border-success/20",
          icon: CheckCircle,
          iconColor: "text-success",
        };
      default:
        return {
          badge: "bg-muted text-muted-foreground",
          icon: TrendingUp,
          iconColor: "text-muted-foreground",
        };
    }
  };

  if (!recommendations || recommendations.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-display">Recommendations</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-sm">
            No specific recommendations. Your profile looks great!
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="overflow-hidden">
      <CardHeader className="bg-gradient-to-r from-primary/5 to-accent/5">
        <CardTitle className="text-lg font-display flex items-center gap-2">
          <TrendingUp className="h-5 w-5 text-primary" />
          Skill Improvement Recommendations
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <div className="divide-y divide-border">
          {recommendations.map((rec, index) => {
            const styles = getPriorityStyles(rec.priority);
            const Icon = styles.icon;
            
            return (
              <div
                key={index}
                className="p-4 hover:bg-muted/30 transition-colors animate-fade-in"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="flex items-start gap-3">
                  <div className={cn("mt-0.5", styles.iconColor)}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center justify-between gap-2">
                      <h4 className="font-medium text-sm">{rec.title}</h4>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="text-xs">
                          {rec.category}
                        </Badge>
                        <Badge 
                          variant="outline" 
                          className={cn("text-xs capitalize", styles.badge)}
                        >
                          {rec.priority}
                        </Badge>
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground">{rec.description}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
