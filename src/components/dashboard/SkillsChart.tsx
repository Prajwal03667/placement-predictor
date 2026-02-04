import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  RadarChart, 
  PolarGrid, 
  PolarAngleAxis, 
  PolarRadiusAxis, 
  Radar, 
  ResponsiveContainer 
} from "recharts";

interface SkillsChartProps {
  cgpa: number;
  programmingSkill: number;
  communicationSkill: number;
  numProjects: number;
  hasInternship: boolean;
  hasCertifications: boolean;
}

export function SkillsChart({
  cgpa,
  programmingSkill,
  communicationSkill,
  numProjects,
  hasInternship,
  hasCertifications,
}: SkillsChartProps) {
  const data = [
    {
      skill: "CGPA",
      value: (cgpa / 10) * 100,
      fullMark: 100,
    },
    {
      skill: "Programming",
      value: programmingSkill * 10,
      fullMark: 100,
    },
    {
      skill: "Communication",
      value: communicationSkill * 10,
      fullMark: 100,
    },
    {
      skill: "Projects",
      value: Math.min(numProjects, 10) * 10,
      fullMark: 100,
    },
    {
      skill: "Internship",
      value: hasInternship ? 100 : 0,
      fullMark: 100,
    },
    {
      skill: "Certifications",
      value: hasCertifications ? 100 : 0,
      fullMark: 100,
    },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg font-display">Skills Overview</CardTitle>
        <CardDescription>Your profile strength across key areas</CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={280}>
          <RadarChart cx="50%" cy="50%" outerRadius="80%" data={data}>
            <PolarGrid stroke="hsl(var(--border))" />
            <PolarAngleAxis 
              dataKey="skill" 
              tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }}
            />
            <PolarRadiusAxis 
              angle={30} 
              domain={[0, 100]} 
              tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 10 }}
            />
            <Radar
              name="Skills"
              dataKey="value"
              stroke="hsl(var(--primary))"
              fill="hsl(var(--primary))"
              fillOpacity={0.3}
              strokeWidth={2}
            />
          </RadarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
