-- Fix SECURITY DEFINER function to include SET search_path
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- Create table to track download activity for rate limiting
CREATE TABLE IF NOT EXISTS public.download_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  book_id UUID NOT NULL REFERENCES public.books(id) ON DELETE CASCADE,
  downloaded_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  ip_address TEXT
);

-- Enable RLS on download_logs
ALTER TABLE public.download_logs ENABLE ROW LEVEL SECURITY;

-- Users can view their own download history
CREATE POLICY "Users can view own downloads"
ON public.download_logs
FOR SELECT
USING (auth.uid() = user_id);

-- Function to check download rate limit (10 downloads per hour)
CREATE OR REPLACE FUNCTION public.check_download_rate_limit(_user_id uuid, _book_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  download_count integer;
BEGIN
  -- Count downloads in the last hour
  SELECT COUNT(*) INTO download_count
  FROM public.download_logs
  WHERE user_id = _user_id
    AND downloaded_at > (now() - interval '1 hour');
  
  -- Allow if under 10 downloads per hour
  IF download_count < 10 THEN
    -- Log this download
    INSERT INTO public.download_logs (user_id, book_id)
    VALUES (_user_id, _book_id);
    RETURN true;
  ELSE
    RETURN false;
  END IF;
END;
$$;

-- Grant execute to authenticated users
GRANT EXECUTE ON FUNCTION public.check_download_rate_limit(uuid, uuid) TO authenticated;