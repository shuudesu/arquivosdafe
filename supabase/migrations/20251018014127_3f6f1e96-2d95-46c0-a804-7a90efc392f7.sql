-- Fix STORAGE_EXPOSURE: Add DELETE policy for covers bucket
-- This allows admins to delete old cover images when editing or deleting books

CREATE POLICY "Admins can delete covers"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'covers' AND
    public.has_role(auth.uid(), 'admin'::app_role)
  );

-- Fix OPEN_ENDPOINTS: Create separate rate limit function for online reading
-- Reading PDFs online costs minimal bandwidth compared to downloads
-- This allows users to browse the library without hitting download limits

CREATE OR REPLACE FUNCTION public.check_read_rate_limit(_user_id uuid, _book_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  read_count integer;
BEGIN
  -- Count reads in the last hour
  SELECT COUNT(*) INTO read_count
  FROM public.download_logs
  WHERE user_id = _user_id
    AND downloaded_at > (now() - interval '1 hour');
  
  -- Allow up to 100 reads per hour (much more generous than downloads)
  -- This is reasonable for browsing while still preventing abuse
  IF read_count < 100 THEN
    -- Log this read (reusing download_logs table for simplicity)
    INSERT INTO public.download_logs (user_id, book_id)
    VALUES (_user_id, _book_id);
    RETURN true;
  ELSE
    RETURN false;
  END IF;
END;
$$;