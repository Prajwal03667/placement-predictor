import { Hono } from "https://deno.land/x/hono@v3.12.11/mod.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const app = new Hono();

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Sigmoid function
function sigmoid(x: number): number {
  return 1 / (1 + Math.exp(-x));
}

// Normalize CGPA (0-10 scale to 0-1)
function normalizeCgpa(cgpa: number): number {
  return cgpa / 10;
}

// Normalize skill (1-10 scale to 0-1)
function normalizeSkill(skill: number): number {
  return (skill - 1) / 9;
}

// Normalize projects (cap at 10)
function normalizeProjects(projects: number): number {
  return Math.min(projects, 10) / 10;
}

// Simple gradient descent for logistic regression
function trainLogisticRegression(
  data: Array<{
    cgpa: number;
    num_projects: number;
    has_internship: boolean;
    programming_skill: number;
    communication_skill: number;
    has_certifications: boolean;
    was_placed: boolean;
  }>,
  learningRate = 0.1,
  iterations = 1000
) {
  // Initialize weights
  let weights = {
    cgpa: 0.45,
    projects: 0.15,
    internship: 0.20,
    programming: 0.25,
    communication: 0.15,
    certifications: 0.10,
    bias: -2.5,
  };

  for (let iter = 0; iter < iterations; iter++) {
    let gradients = {
      cgpa: 0,
      projects: 0,
      internship: 0,
      programming: 0,
      communication: 0,
      certifications: 0,
      bias: 0,
    };

    for (const sample of data) {
      // Prepare features
      const features = {
        cgpa: normalizeCgpa(sample.cgpa) * 10,
        projects: normalizeProjects(sample.num_projects) * 5,
        internship: sample.has_internship ? 2 : 0,
        programming: normalizeSkill(sample.programming_skill) * 4,
        communication: normalizeSkill(sample.communication_skill) * 2,
        certifications: sample.has_certifications ? 1 : 0,
      };

      // Calculate prediction
      const z =
        weights.bias +
        weights.cgpa * features.cgpa +
        weights.projects * features.projects +
        weights.internship * features.internship +
        weights.programming * features.programming +
        weights.communication * features.communication +
        weights.certifications * features.certifications;

      const prediction = sigmoid(z);
      const target = sample.was_placed ? 1 : 0;
      const error = prediction - target;

      // Accumulate gradients
      gradients.bias += error;
      gradients.cgpa += error * features.cgpa;
      gradients.projects += error * features.projects;
      gradients.internship += error * features.internship;
      gradients.programming += error * features.programming;
      gradients.communication += error * features.communication;
      gradients.certifications += error * features.certifications;
    }

    // Update weights
    const n = data.length;
    weights.bias -= (learningRate * gradients.bias) / n;
    weights.cgpa -= (learningRate * gradients.cgpa) / n;
    weights.projects -= (learningRate * gradients.projects) / n;
    weights.internship -= (learningRate * gradients.internship) / n;
    weights.programming -= (learningRate * gradients.programming) / n;
    weights.communication -= (learningRate * gradients.communication) / n;
    weights.certifications -= (learningRate * gradients.certifications) / n;
  }

  return weights;
}

// Calculate accuracy on training data
function calculateAccuracy(
  data: Array<{
    cgpa: number;
    num_projects: number;
    has_internship: boolean;
    programming_skill: number;
    communication_skill: number;
    has_certifications: boolean;
    was_placed: boolean;
  }>,
  weights: {
    cgpa: number;
    projects: number;
    internship: number;
    programming: number;
    communication: number;
    certifications: number;
    bias: number;
  }
): number {
  let correct = 0;

  for (const sample of data) {
    const features = {
      cgpa: normalizeCgpa(sample.cgpa) * 10,
      projects: normalizeProjects(sample.num_projects) * 5,
      internship: sample.has_internship ? 2 : 0,
      programming: normalizeSkill(sample.programming_skill) * 4,
      communication: normalizeSkill(sample.communication_skill) * 2,
      certifications: sample.has_certifications ? 1 : 0,
    };

    const z =
      weights.bias +
      weights.cgpa * features.cgpa +
      weights.projects * features.projects +
      weights.internship * features.internship +
      weights.programming * features.programming +
      weights.communication * features.communication +
      weights.certifications * features.certifications;

    const prediction = sigmoid(z) >= 0.5;
    const actual = sample.was_placed;

    if (prediction === actual) {
      correct++;
    }
  }

  return (correct / data.length) * 100;
}

// Handle OPTIONS
app.options("*", (c) => {
  return c.json({}, 200, corsHeaders);
});

// Retrain endpoint
app.post("/", async (c) => {
  try {
    const authHeader = c.req.header("Authorization");
    if (!authHeader) {
      return c.json({ error: "Unauthorized" }, 401, corsHeaders);
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Verify user is admin
    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    
    if (authError || !user) {
      return c.json({ error: "Unauthorized" }, 401, corsHeaders);
    }

    const { data: roleData } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", user.id)
      .eq("role", "admin")
      .single();

    if (!roleData) {
      return c.json({ error: "Admin access required" }, 403, corsHeaders);
    }

    // Fetch all training data
    const { data: trainingData, error: dataError } = await supabase
      .from("training_data")
      .select("*");

    if (dataError) {
      throw dataError;
    }

    if (!trainingData || trainingData.length < 10) {
      return c.json(
        { error: "Need at least 10 training samples to retrain the model" },
        400,
        corsHeaders
      );
    }

    // Train the model
    const weights = trainLogisticRegression(trainingData);
    const accuracy = calculateAccuracy(trainingData, weights);

    // Update model weights in database
    const { error: updateError } = await supabase
      .from("model_weights")
      .update({
        cgpa_weight: weights.cgpa,
        projects_weight: weights.projects,
        internship_weight: weights.internship,
        programming_weight: weights.programming,
        communication_weight: weights.communication,
        certifications_weight: weights.certifications,
        bias: weights.bias,
        training_samples: trainingData.length,
        accuracy: Math.round(accuracy * 100) / 100,
        last_trained_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        updated_by: user.id,
      })
      .neq("id", "00000000-0000-0000-0000-000000000000"); // Update any row

    if (updateError) {
      throw updateError;
    }

    return c.json(
      {
        success: true,
        message: "Model retrained successfully",
        stats: {
          samples: trainingData.length,
          accuracy: Math.round(accuracy * 100) / 100,
          weights: {
            cgpa: Math.round(weights.cgpa * 1000) / 1000,
            projects: Math.round(weights.projects * 1000) / 1000,
            internship: Math.round(weights.internship * 1000) / 1000,
            programming: Math.round(weights.programming * 1000) / 1000,
            communication: Math.round(weights.communication * 1000) / 1000,
            certifications: Math.round(weights.certifications * 1000) / 1000,
            bias: Math.round(weights.bias * 1000) / 1000,
          },
        },
      },
      200,
      corsHeaders
    );
  } catch (error) {
    console.error("Retrain error:", error);
    return c.json({ error: "Internal server error" }, 500, corsHeaders);
  }
});

Deno.serve(app.fetch);
