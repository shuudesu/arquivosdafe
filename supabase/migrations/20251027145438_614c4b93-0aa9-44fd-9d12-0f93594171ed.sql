-- Add DELETE policy to allow users to manage their own reading history
CREATE POLICY "Users can delete own logs"
ON public.download_logs
FOR DELETE
USING (auth.uid() = user_id);

-- Create function to clean up old logs (90-day retention)
CREATE OR REPLACE FUNCTION public.cleanup_old_download_logs()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  DELETE FROM public.download_logs
  WHERE downloaded_at < (now() - interval '90 days');
END;
$$;

-- Create a function that can be called manually or scheduled to clean logs
COMMENT ON FUNCTION public.cleanup_old_download_logs() IS 'Deletes download logs older than 90 days for privacy compliance';
