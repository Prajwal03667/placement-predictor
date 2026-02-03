import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

interface SkillSliderProps {
  label: string;
  value: number;
  onChange: (value: number) => void;
  description?: string;
}

export function SkillSlider({ label, value, onChange, description }: SkillSliderProps) {
  const getSkillLevel = (val: number) => {
    if (val <= 3) return { text: "Beginner", color: "text-destructive" };
    if (val <= 5) return { text: "Intermediate", color: "text-warning" };
    if (val <= 7) return { text: "Advanced", color: "text-accent" };
    return { text: "Expert", color: "text-success" };
  };

  const skillLevel = getSkillLevel(value);

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <Label className="text-sm font-medium">{label}</Label>
        <div className="flex items-center gap-2">
          <span className={cn("text-sm font-semibold", skillLevel.color)}>
            {skillLevel.text}
          </span>
          <span className="text-lg font-display font-bold text-primary">
            {value}/10
          </span>
        </div>
      </div>
      {description && (
        <p className="text-xs text-muted-foreground">{description}</p>
      )}
      <Slider
        value={[value]}
        onValueChange={([v]) => onChange(v)}
        min={1}
        max={10}
        step={1}
        className="py-2"
      />
      <div className="flex justify-between text-xs text-muted-foreground">
        <span>1</span>
        <span>5</span>
        <span>10</span>
      </div>
    </div>
  );
}
