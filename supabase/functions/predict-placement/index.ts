import { Hono } from "https://deno.land/x/hono@v3.12.11/mod.ts";

const app = new Hono();

// CORS headers
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Simulated logistic regression model weights (trained on sample placement data)
// These weights represent the importance of each feature
const modelWeights = {
  cgpa: 0.45,           // CGPA is very important
  num_projects: 0.15,   // Projects matter
  has_internship: 0.20, // Internship experience is valuable
  programming_skill: 0.25, // Programming skills
  communication_skill: 0.15, // Soft skills
  has_certifications: 0.10, // Certifications add value
  bias: -2.5,           // Base threshold
};

// Sigmoid function for logistic regression
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

// Generate recommendations based on input
function generateRecommendations(input: {
  cgpa: number;
  num_projects: number;
  has_internship: boolean;
  programming_skill: number;
  communication_skill: number;
  has_certifications: boolean;
}) {
  const recommendations = [];

  if (input.cgpa < 7) {
    recommendations.push({
      title: "Improve Academic Performance",
      description: "Focus on improving your CGPA. Strong academics are often a key filter for placement eligibility.",
      priority: "high",
      category: "Academics",
    });
  }

  if (input.programming_skill < 6) {
    recommendations.push({
      title: "Enhance Programming Skills",
      description: "Practice DSA on LeetCode/HackerRank. Aim for at least 200+ problems. Focus on arrays, strings, trees, and graphs.",
      priority: "high",
      category: "Technical",
    });
  }

  if (input.num_projects < 3) {
    recommendations.push({
      title: "Build More Projects",
      description: "Create at least 3-4 substantial projects showcasing different technologies. Include a full-stack project.",
      priority: "medium",
      category: "Portfolio",
    });
  }

  if (!input.has_internship) {
    recommendations.push({
      title: "Gain Internship Experience",
      description: "Apply for summer internships. Real-world experience significantly boosts placement chances.",
      priority: "high",
      category: "Experience",
    });
  }

  if (input.communication_skill < 6) {
    recommendations.push({
      title: "Improve Communication Skills",
      description: "Practice mock interviews, join public speaking clubs, and work on articulating technical concepts clearly.",
      priority: "medium",
      category: "Soft Skills",
    });
  }

  if (!input.has_certifications) {
    recommendations.push({
      title: "Obtain Relevant Certifications",
      description: "Consider AWS, Google Cloud, or industry-specific certifications to validate your skills.",
      priority: "low",
      category: "Credentials",
    });
  }

  if (input.programming_skill >= 6 && input.num_projects >= 3) {
    recommendations.push({
      title: "Contribute to Open Source",
      description: "Start contributing to open source projects to gain visibility and demonstrate collaboration skills.",
      priority: "low",
      category: "Community",
    });
  }

  // Sort by priority
  const priorityOrder: Record<string, number> = { high: 0, medium: 1, low: 2 };
  recommendations.sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]);

  return recommendations.slice(0, 5); // Return top 5 recommendations
}

// Predict placement probability
function predictPlacement(input: {
  cgpa: number;
  num_projects: number;
  has_internship: boolean;
  programming_skill: number;
  communication_skill: number;
  has_certifications: boolean;
}) {
  // Calculate weighted sum
  const weightedSum =
    modelWeights.bias +
    modelWeights.cgpa * normalizeCgpa(input.cgpa) * 10 +
    modelWeights.num_projects * normalizeProjects(input.num_projects) * 5 +
    modelWeights.has_internship * (input.has_internship ? 2 : 0) +
    modelWeights.programming_skill * normalizeSkill(input.programming_skill) * 4 +
    modelWeights.communication_skill * normalizeSkill(input.communication_skill) * 2 +
    modelWeights.has_certifications * (input.has_certifications ? 1 : 0);

  // Apply sigmoid to get probability
  const probability = sigmoid(weightedSum);
  const probabilityPercent = Math.round(probability * 100);

  // Determine prediction
  const prediction = probabilityPercent >= 50 ? "Placed" : "Not Placed";

  // Generate recommendations
  const recommendations = generateRecommendations(input);

  return {
    probability: probabilityPercent,
    prediction,
    recommendations,
  };
}

// Handle OPTIONS request
app.options("*", (c) => {
  return c.json({}, 200, corsHeaders);
});

// Prediction endpoint
app.post("/", async (c) => {
  try {
    const body = await c.req.json();

    const { cgpa, num_projects, has_internship, programming_skill, communication_skill, has_certifications } = body;

    // Validate input
    if (cgpa === undefined || num_projects === undefined || programming_skill === undefined || communication_skill === undefined) {
      return c.json({ error: "Missing required fields" }, 400, corsHeaders);
    }

    // Run prediction
    const result = predictPlacement({
      cgpa: Number(cgpa),
      num_projects: Number(num_projects),
      has_internship: Boolean(has_internship),
      programming_skill: Number(programming_skill),
      communication_skill: Number(communication_skill),
      has_certifications: Boolean(has_certifications),
    });

    return c.json(result, 200, corsHeaders);
  } catch (error) {
    console.error("Prediction error:", error);
    return c.json({ error: "Internal server error" }, 500, corsHeaders);
  }
});

Deno.serve(app.fetch);
