import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { 
  Upload, 
  RefreshCw, 
  FileSpreadsheet, 
  Brain, 
  Trash2,
  Download,
  CheckCircle2,
  AlertCircle
} from "lucide-react";
import { format } from "date-fns";

interface ModelWeights {
  id: string;
  cgpa_weight: number;
  projects_weight: number;
  internship_weight: number;
  programming_weight: number;
  communication_weight: number;
  certifications_weight: number;
  bias: number;
  training_samples: number;
  accuracy: number | null;
  last_trained_at: string | null;
}

interface TrainingBatch {
  id: string;
  filename: string;
  record_count: number;
  created_at: string;
}

export function ModelTraining() {
  const [modelWeights, setModelWeights] = useState<ModelWeights | null>(null);
  const [batches, setBatches] = useState<TrainingBatch[]>([]);
  const [trainingCount, setTrainingCount] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [isRetraining, setIsRetraining] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const fetchData = useCallback(async () => {
    // Fetch model weights
    const { data: weights } = await supabase
      .from("model_weights")
      .select("*")
      .limit(1)
      .single();
    
    if (weights) {
      setModelWeights(weights as ModelWeights);
    }

    // Fetch training batches
    const { data: batchData } = await supabase
      .from("training_batches")
      .select("*")
      .order("created_at", { ascending: false });
    
    if (batchData) {
      setBatches(batchData as TrainingBatch[]);
    }

    // Count training data
    const { count } = await supabase
      .from("training_data")
      .select("*", { count: "exact", head: true });
    
    setTrainingCount(count || 0);
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const parseCSV = (text: string): Array<Record<string, string>> => {
    const lines = text.trim().split("\n");
    const headers = lines[0].split(",").map(h => h.trim().toLowerCase());
    
    return lines.slice(1).map(line => {
      const values = line.split(",").map(v => v.trim());
      const record: Record<string, string> = {};
      headers.forEach((header, index) => {
        record[header] = values[index] || "";
      });
      return record;
    });
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.name.endsWith(".csv")) {
      toast({
        title: "Invalid file",
        description: "Please upload a CSV file",
        variant: "destructive",
      });
      return;
    }

    setIsUploading(true);
    setUploadProgress(10);

    try {
      const text = await file.text();
      const records = parseCSV(text);
      
      setUploadProgress(30);

      // Validate required columns
      const requiredColumns = [
        "cgpa", "num_projects", "has_internship", 
        "programming_skill", "communication_skill", 
        "has_certifications", "was_placed"
      ];
      
      const firstRecord = records[0];
      const missingColumns = requiredColumns.filter(col => !(col in firstRecord));
      
      if (missingColumns.length > 0) {
        toast({
          title: "Missing columns",
          description: `CSV must contain: ${missingColumns.join(", ")}`,
          variant: "destructive",
        });
        setIsUploading(false);
        return;
      }

      setUploadProgress(50);

      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      // Create batch record
      const batchId = crypto.randomUUID();
      const { error: batchError } = await supabase
        .from("training_batches")
        .insert({
          id: batchId,
          filename: file.name,
          record_count: records.length,
          uploaded_by: user.id,
        });

      if (batchError) throw batchError;

      setUploadProgress(70);

      // Insert training data
      const trainingRecords = records.map(record => ({
        cgpa: parseFloat(record.cgpa),
        num_projects: parseInt(record.num_projects) || 0,
        has_internship: record.has_internship?.toLowerCase() === "true" || record.has_internship === "1",
        programming_skill: parseInt(record.programming_skill),
        communication_skill: parseInt(record.communication_skill),
        has_certifications: record.has_certifications?.toLowerCase() === "true" || record.has_certifications === "1",
        was_placed: record.was_placed?.toLowerCase() === "true" || record.was_placed === "1",
        uploaded_by: user.id,
        batch_id: batchId,
      }));

      const { error: insertError } = await supabase
        .from("training_data")
        .insert(trainingRecords);

      if (insertError) throw insertError;

      setUploadProgress(100);

      toast({
        title: "Upload successful",
        description: `Uploaded ${records.length} training records from ${file.name}`,
      });

      fetchData();
    } catch (error) {
      console.error("Upload error:", error);
      toast({
        title: "Upload failed",
        description: error instanceof Error ? error.message : "Failed to upload file",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
      // Reset input
      event.target.value = "";
    }
  };

  const handleRetrain = async () => {
    if (trainingCount < 10) {
      toast({
        title: "Insufficient data",
        description: "Need at least 10 training samples to retrain the model",
        variant: "destructive",
      });
      return;
    }

    setIsRetraining(true);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error("Not authenticated");

      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/retrain-model`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${session.access_token}`,
          },
        }
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Failed to retrain model");
      }

      toast({
        title: "Model retrained",
        description: `Accuracy: ${result.stats.accuracy}% on ${result.stats.samples} samples`,
      });

      fetchData();
    } catch (error) {
      console.error("Retrain error:", error);
      toast({
        title: "Retraining failed",
        description: error instanceof Error ? error.message : "Failed to retrain model",
        variant: "destructive",
      });
    } finally {
      setIsRetraining(false);
    }
  };

  const handleDeleteBatch = async (batchId: string) => {
    try {
      // Delete training data for this batch
      const { error: dataError } = await supabase
        .from("training_data")
        .delete()
        .eq("batch_id", batchId);

      if (dataError) throw dataError;

      // Delete batch record
      const { error: batchError } = await supabase
        .from("training_batches")
        .delete()
        .eq("id", batchId);

      if (batchError) throw batchError;

      toast({
        title: "Batch deleted",
        description: "Training data removed successfully",
      });

      fetchData();
    } catch (error) {
      toast({
        title: "Delete failed",
        description: "Failed to delete batch",
        variant: "destructive",
      });
    }
  };

  const downloadSampleCSV = () => {
    const sampleData = `cgpa,num_projects,has_internship,programming_skill,communication_skill,has_certifications,was_placed
8.5,5,true,8,7,true,true
7.2,3,false,6,6,false,true
6.5,2,false,5,5,false,false
9.0,6,true,9,8,true,true
7.8,4,true,7,7,true,true
6.0,1,false,4,4,false,false
8.2,4,true,8,6,true,true
7.0,3,false,6,7,false,true
5.5,1,false,3,3,false,false
8.8,5,true,9,8,true,true`;

    const blob = new Blob([sampleData], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "sample_training_data.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Model Status Card */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Brain className="h-5 w-5 text-primary" />
              <CardTitle className="text-lg font-display">Model Status</CardTitle>
            </div>
            <Badge variant={modelWeights?.last_trained_at ? "default" : "secondary"}>
              {modelWeights?.last_trained_at ? "Trained" : "Default Weights"}
            </Badge>
          </div>
          <CardDescription>
            Current machine learning model configuration
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <div className="p-4 rounded-lg bg-muted/50">
              <p className="text-sm text-muted-foreground">Training Samples</p>
              <p className="text-2xl font-display font-bold">{trainingCount}</p>
            </div>
            <div className="p-4 rounded-lg bg-muted/50">
              <p className="text-sm text-muted-foreground">Model Accuracy</p>
              <p className="text-2xl font-display font-bold">
                {modelWeights?.accuracy ? `${modelWeights.accuracy}%` : "N/A"}
              </p>
            </div>
            <div className="p-4 rounded-lg bg-muted/50">
              <p className="text-sm text-muted-foreground">Last Trained</p>
              <p className="text-sm font-medium">
                {modelWeights?.last_trained_at 
                  ? format(new Date(modelWeights.last_trained_at), "MMM d, yyyy HH:mm")
                  : "Never"}
              </p>
            </div>
            <div className="p-4 rounded-lg bg-muted/50">
              <p className="text-sm text-muted-foreground">Batches Uploaded</p>
              <p className="text-2xl font-display font-bold">{batches.length}</p>
            </div>
          </div>

          {/* Model Weights */}
          {modelWeights && (
            <div className="p-4 rounded-lg border bg-card">
              <p className="text-sm font-medium mb-3">Current Weights</p>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-sm">
                <div>
                  <span className="text-muted-foreground">CGPA:</span>{" "}
                  <span className="font-mono">{modelWeights.cgpa_weight}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Projects:</span>{" "}
                  <span className="font-mono">{modelWeights.projects_weight}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Internship:</span>{" "}
                  <span className="font-mono">{modelWeights.internship_weight}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Programming:</span>{" "}
                  <span className="font-mono">{modelWeights.programming_weight}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Communication:</span>{" "}
                  <span className="font-mono">{modelWeights.communication_weight}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Certifications:</span>{" "}
                  <span className="font-mono">{modelWeights.certifications_weight}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Bias:</span>{" "}
                  <span className="font-mono">{modelWeights.bias}</span>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Upload & Retrain Card */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Upload className="h-5 w-5 text-primary" />
            <CardTitle className="text-lg font-display">Upload Training Data</CardTitle>
          </div>
          <CardDescription>
            Upload CSV files with placement data to improve the model
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <label className="relative cursor-pointer">
                <Input
                  type="file"
                  accept=".csv"
                  onChange={handleFileUpload}
                  disabled={isUploading}
                  className="cursor-pointer"
                />
              </label>
              {isUploading && (
                <Progress value={uploadProgress} className="mt-2 h-2" />
              )}
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={downloadSampleCSV}
                className="gap-2"
              >
                <Download className="h-4 w-4" />
                Sample CSV
              </Button>
              <Button
                onClick={handleRetrain}
                disabled={isRetraining || trainingCount < 10}
                className="gap-2"
              >
                {isRetraining ? (
                  <RefreshCw className="h-4 w-4 animate-spin" />
                ) : (
                  <Brain className="h-4 w-4" />
                )}
                Retrain Model
              </Button>
            </div>
          </div>

          <div className="p-4 rounded-lg bg-muted/50 text-sm space-y-2">
            <p className="font-medium flex items-center gap-2">
              <FileSpreadsheet className="h-4 w-4" />
              CSV Format Requirements:
            </p>
            <ul className="list-disc list-inside text-muted-foreground space-y-1 ml-6">
              <li><code className="text-xs bg-muted px-1 rounded">cgpa</code> - Student CGPA (0-10)</li>
              <li><code className="text-xs bg-muted px-1 rounded">num_projects</code> - Number of projects</li>
              <li><code className="text-xs bg-muted px-1 rounded">has_internship</code> - true/false</li>
              <li><code className="text-xs bg-muted px-1 rounded">programming_skill</code> - 1-10 rating</li>
              <li><code className="text-xs bg-muted px-1 rounded">communication_skill</code> - 1-10 rating</li>
              <li><code className="text-xs bg-muted px-1 rounded">has_certifications</code> - true/false</li>
              <li><code className="text-xs bg-muted px-1 rounded">was_placed</code> - true/false (target variable)</li>
            </ul>
          </div>
        </CardContent>
      </Card>

      {/* Upload History */}
      {batches.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-display">Upload History</CardTitle>
            <CardDescription>Previously uploaded training data batches</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Filename</TableHead>
                  <TableHead>Records</TableHead>
                  <TableHead>Uploaded</TableHead>
                  <TableHead className="w-20">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {batches.map((batch) => (
                  <TableRow key={batch.id}>
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-2">
                        <FileSpreadsheet className="h-4 w-4 text-muted-foreground" />
                        {batch.filename}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary">{batch.record_count} records</Badge>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {format(new Date(batch.created_at), "MMM d, yyyy HH:mm")}
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDeleteBatch(batch.id)}
                        className="h-8 w-8 text-destructive hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {/* Status Messages */}
      <div className="flex flex-col gap-2">
        {trainingCount >= 10 ? (
          <div className="flex items-center gap-2 text-sm text-success">
            <CheckCircle2 className="h-4 w-4" />
            Model is ready for training with {trainingCount} samples
          </div>
        ) : (
          <div className="flex items-center gap-2 text-sm text-warning">
            <AlertCircle className="h-4 w-4" />
            Upload at least {10 - trainingCount} more samples to enable retraining
          </div>
        )}
      </div>
    </div>
  );
}
