-- Remove a política insegura que expõe tokens publicamente
DROP POLICY IF EXISTS "Anyone can view unexpired unused links" ON public.invite_links;

-- Criar função segura para validar token de convite (sem expor outros dados)
CREATE OR REPLACE FUNCTION public.validate_invite_token(_token text)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.invite_links
    WHERE token = _token
      AND used_at IS NULL
      AND expires_at > now()
  )
$$;

-- Criar função segura para marcar token como usado (apenas após signup bem-sucedido)
CREATE OR REPLACE FUNCTION public.mark_invite_used(_token text, _user_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.invite_links
  SET used_by = _user_id,
      used_at = now()
  WHERE token = _token
    AND used_at IS NULL
    AND expires_at > now();
  
  RETURN FOUND;
END;
$$;

-- Permitir que usuários não autenticados validem tokens (mas não visualizem os dados)
GRANT EXECUTE ON FUNCTION public.validate_invite_token(text) TO anon;
GRANT EXECUTE ON FUNCTION public.mark_invite_used(text, uuid) TO authenticated;