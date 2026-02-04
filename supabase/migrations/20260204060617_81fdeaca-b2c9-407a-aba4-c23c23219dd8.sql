-- Create table for training data records
CREATE TABLE public.training_data (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cgpa NUMERIC NOT NULL,
  num_projects INTEGER NOT NULL DEFAULT 0,
  has_internship BOOLEAN NOT NULL DEFAULT false,
  programming_skill INTEGER NOT NULL,
  communication_skill INTEGER NOT NULL,
  has_certifications BOOLEAN NOT NULL DEFAULT false,
  was_placed BOOLEAN NOT NULL,
  uploaded_by UUID NOT NULL,
  batch_id UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create table for model weights (singleton pattern - only one row)
CREATE TABLE public.model_weights (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cgpa_weight NUMERIC NOT NULL DEFAULT 0.45,
  projects_weight NUMERIC NOT NULL DEFAULT 0.15,
  internship_weight NUMERIC NOT NULL DEFAULT 0.20,
  programming_weight NUMERIC NOT NULL DEFAULT 0.25,
  communication_weight NUMERIC NOT NULL DEFAULT 0.15,
  certifications_weight NUMERIC NOT NULL DEFAULT 0.10,
  bias NUMERIC NOT NULL DEFAULT -2.5,
  training_samples INTEGER NOT NULL DEFAULT 0,
  accuracy NUMERIC,
  last_trained_at TIMESTAMP WITH TIME ZONE,
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_by UUID
);

-- Create table for upload batches tracking
CREATE TABLE public.training_batches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  filename TEXT NOT NULL,
  record_count INTEGER NOT NULL DEFAULT 0,
  uploaded_by UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.training_data ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.model_weights ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.training_batches ENABLE ROW LEVEL SECURITY;

-- RLS Policies for training_data (admin only)
CREATE POLICY "Admins can view all training data"
ON public.training_data
FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can insert training data"
ON public.training_data
FOR INSERT
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can delete training data"
ON public.training_data
FOR DELETE
USING (has_role(auth.uid(), 'admin'::app_role));

-- RLS Policies for model_weights (public read, admin write)
CREATE POLICY "Anyone can view model weights"
ON public.model_weights
FOR SELECT
USING (true);

CREATE POLICY "Admins can update model weights"
ON public.model_weights
FOR UPDATE
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can insert model weights"
ON public.model_weights
FOR INSERT
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- RLS Policies for training_batches (admin only)
CREATE POLICY "Admins can view all batches"
ON public.training_batches
FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can insert batches"
ON public.training_batches
FOR INSERT
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can delete batches"
ON public.training_batches
FOR DELETE
USING (has_role(auth.uid(), 'admin'::app_role));

-- Insert default model weights
INSERT INTO public.model_weights (
  cgpa_weight, projects_weight, internship_weight, 
  programming_weight, communication_weight, certifications_weight, 
  bias, training_samples
) VALUES (0.45, 0.15, 0.20, 0.25, 0.15, 0.10, -2.5, 0);