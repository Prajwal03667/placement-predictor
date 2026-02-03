import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Navbar } from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { SkillSlider } from "@/components/SkillSlider";
import { ProgressRing } from "@/components/ui/progress-ring";
import { RecommendationCard } from "@/components/RecommendationCard";
import { useAuth } from "@/lib/auth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { 
  Sparkles, 
  Loader2, 
  BookOpen,
  Briefcase,
  Award,
  RefreshCw,
  ArrowLeft,
  CheckCircle
} from "lucide-react";
import { Link } from "react-router-dom";

interface PredictionResult {
  probability: number;
  prediction: string;
  recommendations: Array<{
    title: string;
    description: string;
    priority: "high" | "medium" | "low";
    category: string;
  }>;
}

export default function Predict() {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [cgpa, setCgpa] = useState("");
  const [numProjects, setNumProjects] = useState("");
  const [hasInternship, setHasInternship] = useState(false);
  const [programmingSkill, setProgrammingSkill] = useState(5);
  const [communicationSkill, setCommunicationSkill] = useState(5);
  const [hasCertifications, setHasCertifications] = useState(false);
  
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<PredictionResult | null>(null);

  const handlePredict = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const cgpaNum = parseFloat(cgpa);
    const projectsNum = parseInt(numProjects);
    
    if (isNaN(cgpaNum) || cgpaNum < 0 || cgpaNum > 10) {
      toast.error("CGPA must be between 0 and 10");
      return;
    }
    
    if (isNaN(projectsNum) || projectsNum < 0) {
      toast.error("Number of projects must be a positive number");
      return;
    }

    setLoading(true);

    try {
      // Call the prediction edge function
      const { data, error } = await supabase.functions.invoke("predict-placement", {
        body: {
          cgpa: cgpaNum,
          num_projects: projectsNum,
          has_internship: hasInternship,
          programming_skill: programmingSkill,
          communication_skill: communicationSkill,
          has_certifications: hasCertifications,
        },
      });

      if (error) throw error;

      // Save prediction to database
      const { error: saveError } = await supabase.from("predictions").insert({
        user_id: user!.id,
        cgpa: cgpaNum,
        num_projects: projectsNum,
        has_internship: hasInternship,
        programming_skill: programmingSkill,
        communication_skill: communicationSkill,
        has_certifications: hasCertifications,
        probability: data.probability,
        prediction_result: data.prediction,
        recommendations: data.recommendations,
      });

      if (saveError) throw saveError;

      setResult(data);
      toast.success("Prediction generated successfully!");
    } catch (error: any) {
      toast.error(error.message || "Failed to generate prediction");
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setResult(null);
    setCgpa("");
    setNumProjects("");
    setHasInternship(false);
    setProgrammingSkill(5);
    setCommunicationSkill(5);
    setHasCertifications(false);
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="container mx-auto px-4 py-8">
        {/* Back Button */}
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

        {!result ? (
          /* Prediction Form */
          <div className="max-w-2xl mx-auto">
            <div className="text-center mb-8">
              <div className="w-16 h-16 rounded-2xl gradient-primary mx-auto flex items-center justify-center mb-4">
                <Sparkles className="h-8 w-8 text-primary-foreground" />
              </div>
              <h1 className="text-3xl font-display font-bold">Placement Prediction</h1>
              <p className="text-muted-foreground mt-2">
                Enter your details to get an AI-powered placement probability
              </p>
            </div>

            <Card className="border-border/50 shadow-lg">
              <CardContent className="pt-6">
                <form onSubmit={handlePredict} className="space-y-6">
                  {/* Academic Details */}
                  <div className="space-y-4">
                    <h3 className="font-display font-semibold flex items-center gap-2">
                      <BookOpen className="h-5 w-5 text-primary" />
                      Academic Details
                    </h3>
                    
                    <div className="grid sm:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="cgpa">CGPA (0-10)</Label>
                        <Input
                          id="cgpa"
                          type="number"
                          step="0.01"
                          min="0"
                          max="10"
                          placeholder="e.g., 8.5"
                          value={cgpa}
                          onChange={(e) => setCgpa(e.target.value)}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="projects">Number of Projects</Label>
                        <Input
                          id="projects"
                          type="number"
                          min="0"
                          placeholder="e.g., 5"
                          value={numProjects}
                          onChange={(e) => setNumProjects(e.target.value)}
                          required
                        />
                      </div>
                    </div>
                  </div>

                  {/* Experience */}
                  <div className="space-y-4">
                    <h3 className="font-display font-semibold flex items-center gap-2">
                      <Briefcase className="h-5 w-5 text-accent" />
                      Experience & Certifications
                    </h3>
                    
                    <div className="grid sm:grid-cols-2 gap-4">
                      <div className="flex items-center justify-between p-4 rounded-lg bg-muted/50">
                        <div>
                          <Label htmlFor="internship" className="font-medium">
                            Internship Experience
                          </Label>
                          <p className="text-xs text-muted-foreground">
                            Have you completed any internships?
                          </p>
                        </div>
                        <Switch
                          id="internship"
                          checked={hasInternship}
                          onCheckedChange={setHasInternship}
                        />
                      </div>
                      <div className="flex items-center justify-between p-4 rounded-lg bg-muted/50">
                        <div>
                          <Label htmlFor="certifications" className="font-medium">
                            Certifications
                          </Label>
                          <p className="text-xs text-muted-foreground">
                            Do you have any relevant certifications?
                          </p>
                        </div>
                        <Switch
                          id="certifications"
                          checked={hasCertifications}
                          onCheckedChange={setHasCertifications}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Skills */}
                  <div className="space-y-4">
                    <h3 className="font-display font-semibold flex items-center gap-2">
                      <Award className="h-5 w-5 text-warning" />
                      Skills Assessment
                    </h3>
                    
                    <div className="space-y-6">
                      <SkillSlider
                        label="Programming Skills"
                        value={programmingSkill}
                        onChange={setProgrammingSkill}
                        description="Rate your coding and problem-solving abilities"
                      />
                      <SkillSlider
                        label="Communication Skills"
                        value={communicationSkill}
                        onChange={setCommunicationSkill}
                        description="Rate your verbal and written communication"
                      />
                    </div>
                  </div>

                  <Button 
                    type="submit" 
                    className="w-full gradient-primary border-0 h-12 text-lg"
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                        Analyzing...
                      </>
                    ) : (
                      <>
                        <Sparkles className="mr-2 h-5 w-5" />
                        Predict Placement
                      </>
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>
        ) : (
          /* Results */
          <div className="max-w-3xl mx-auto space-y-6">
            <div className="text-center mb-8">
              <div className={`w-16 h-16 rounded-2xl mx-auto flex items-center justify-center mb-4 ${
                result.prediction === "Placed" ? "gradient-success" : "gradient-warning"
              }`}>
                <CheckCircle className="h-8 w-8 text-primary-foreground" />
              </div>
              <h1 className="text-3xl font-display font-bold">Prediction Results</h1>
              <p className="text-muted-foreground mt-2">
                Based on your profile analysis
              </p>
            </div>

            {/* Main Result Card */}
            <Card className="overflow-hidden">
              <CardHeader className={`${
                result.prediction === "Placed" 
                  ? "bg-gradient-to-r from-success/10 to-accent/10" 
                  : "bg-gradient-to-r from-warning/10 to-destructive/10"
              }`}>
                <CardTitle className="text-xl font-display">Placement Probability</CardTitle>
              </CardHeader>
              <CardContent className="pt-8 pb-8">
                <div className="flex flex-col items-center gap-6">
                  <ProgressRing 
                    progress={result.probability} 
                    size={200}
                    strokeWidth={16}
                  />
                  <div className="text-center">
                    <p className="text-sm text-muted-foreground mb-1">Prediction</p>
                    <p className={`text-3xl font-display font-bold ${
                      result.prediction === "Placed" 
                        ? "text-success" 
                        : "text-destructive"
                    }`}>
                      {result.prediction}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Recommendations */}
            <RecommendationCard recommendations={result.recommendations} />

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                onClick={handleReset}
                variant="outline"
                className="gap-2"
              >
                <RefreshCw className="h-4 w-4" />
                New Prediction
              </Button>
              <Button 
                asChild
                className="gradient-primary border-0"
              >
                <Link to="/dashboard">
                  View Dashboard
                </Link>
              </Button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
