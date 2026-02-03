import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Navbar } from "@/components/Navbar";
import { 
  GraduationCap, 
  Brain, 
  TrendingUp, 
  Users, 
  ChevronRight,
  Sparkles,
  Target,
  BarChart3,
  Shield
} from "lucide-react";

export default function Landing() {
  const features = [
    {
      icon: Brain,
      title: "AI-Powered Predictions",
      description: "Advanced machine learning algorithms analyze your profile to predict placement probability with high accuracy.",
    },
    {
      icon: Target,
      title: "Personalized Recommendations",
      description: "Get tailored skill improvement suggestions based on your current abilities and industry requirements.",
    },
    {
      icon: BarChart3,
      title: "Detailed Analytics",
      description: "Visual dashboards showing your strengths, areas for improvement, and progress over time.",
    },
    {
      icon: Shield,
      title: "Secure & Private",
      description: "Your data is encrypted and protected. We prioritize your privacy and security.",
    },
  ];

  const stats = [
    { value: "95%", label: "Prediction Accuracy" },
    { value: "10K+", label: "Students Helped" },
    { value: "500+", label: "Partner Companies" },
    { value: "85%", label: "Placement Success" },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        {/* Background decoration */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-80 h-80 rounded-full bg-primary/10 blur-3xl" />
          <div className="absolute top-60 -left-40 w-80 h-80 rounded-full bg-accent/10 blur-3xl" />
        </div>
        
        <div className="container mx-auto px-4 py-20 md:py-32 relative">
          <div className="max-w-4xl mx-auto text-center space-y-8">
            <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full text-sm font-medium animate-fade-in">
              <Sparkles className="h-4 w-4" />
              AI-Powered Campus Placement Predictions
            </div>
            
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-display font-bold leading-tight animate-fade-in">
              Predict Your
              <span className="gradient-text block">Placement Success</span>
            </h1>
            
            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto animate-fade-in">
              Enter your academic details and skills to get instant AI-powered predictions 
              about your placement chances, along with personalized recommendations to improve.
            </p>
            
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-fade-in">
              <Button 
                asChild 
                size="lg" 
                className="gradient-primary border-0 shadow-lg hover:shadow-xl transition-all px-8 h-14 text-lg group"
              >
                <Link to="/register">
                  Get Started Free
                  <ChevronRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </Link>
              </Button>
              <Button 
                asChild 
                variant="outline" 
                size="lg"
                className="h-14 px-8 text-lg"
              >
                <Link to="/login">
                  Sign In
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 border-y border-border/50 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div 
                key={index} 
                className="text-center animate-fade-in"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="text-3xl md:text-4xl font-display font-bold gradient-text">
                  {stat.value}
                </div>
                <div className="text-sm text-muted-foreground mt-1">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 md:py-32">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16 space-y-4">
            <h2 className="text-3xl md:text-4xl font-display font-bold">
              Everything You Need to Succeed
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Our platform combines advanced AI with comprehensive career insights 
              to maximize your placement potential.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <Card 
                  key={index} 
                  className="group hover:shadow-lg transition-all duration-300 border-border/50 overflow-hidden animate-fade-in"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <CardContent className="p-6 space-y-4">
                    <div className="w-12 h-12 rounded-xl gradient-primary flex items-center justify-center shadow-md group-hover:scale-110 transition-transform">
                      <Icon className="h-6 w-6 text-primary-foreground" />
                    </div>
                    <h3 className="font-display font-semibold text-lg">{feature.title}</h3>
                    <p className="text-sm text-muted-foreground">{feature.description}</p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 md:py-32 relative overflow-hidden">
        <div className="absolute inset-0 gradient-hero opacity-10" />
        <div className="container mx-auto px-4 relative">
          <div className="max-w-3xl mx-auto text-center space-y-8">
            <h2 className="text-3xl md:text-4xl font-display font-bold">
              Ready to Predict Your Future?
            </h2>
            <p className="text-muted-foreground text-lg">
              Join thousands of students who have used PlacePredict to understand 
              their placement potential and improve their skills.
            </p>
            <Button 
              asChild 
              size="lg" 
              className="gradient-primary border-0 shadow-lg hover:shadow-xl transition-all px-8 h-14 text-lg"
            >
              <Link to="/register">
                Start Your Prediction Now
                <ChevronRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 border-t border-border/50">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg gradient-primary flex items-center justify-center">
                <GraduationCap className="w-5 h-5 text-primary-foreground" />
              </div>
              <span className="font-display font-bold">PlacePredict</span>
            </div>
            <p className="text-sm text-muted-foreground">
              © 2024 PlacePredict. Empowering students for successful placements.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
