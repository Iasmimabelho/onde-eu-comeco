-- Onde Eu Começo? — atualizar locais das oportunidades já existentes
-- Execute uma vez no SQL Editor do Supabase.
UPDATE public.opportunities SET location = CASE id
  WHEN 'aaaaaaaa-aaaa-aaaa-aaaa-000000000001' THEN 'Centro, Rio de Janeiro, RJ'
  WHEN 'aaaaaaaa-aaaa-aaaa-aaaa-000000000002' THEN 'Centro, Niterói, RJ'
  WHEN 'aaaaaaaa-aaaa-aaaa-aaaa-000000000004' THEN 'Icaraí, Niterói, RJ'
  WHEN 'aaaaaaaa-aaaa-aaaa-aaaa-000000000006' THEN 'Colubandê, São Gonçalo, RJ'
  WHEN 'aaaaaaaa-aaaa-aaaa-aaaa-000000000008' THEN 'Engenhoca, Niterói, RJ'
  WHEN 'aaaaaaaa-aaaa-aaaa-aaaa-000000000011' THEN 'Centro, Nova Iguaçu, RJ'
  WHEN 'aaaaaaaa-aaaa-aaaa-aaaa-000000000012' THEN 'Centro, Petrópolis, RJ'
  WHEN 'aaaaaaaa-aaaa-aaaa-aaaa-000000000013' THEN 'Barra da Tijuca, Rio de Janeiro, RJ'
  WHEN 'aaaaaaaa-aaaa-aaaa-aaaa-000000000014' THEN 'Centro, Volta Redonda, RJ'
  ELSE location
END
WHERE id IN (
 'aaaaaaaa-aaaa-aaaa-aaaa-000000000001','aaaaaaaa-aaaa-aaaa-aaaa-000000000002',
 'aaaaaaaa-aaaa-aaaa-aaaa-000000000004','aaaaaaaa-aaaa-aaaa-aaaa-000000000006',
 'aaaaaaaa-aaaa-aaaa-aaaa-000000000008','aaaaaaaa-aaaa-aaaa-aaaa-000000000011',
 'aaaaaaaa-aaaa-aaaa-aaaa-000000000012','aaaaaaaa-aaaa-aaaa-aaaa-000000000013',
 'aaaaaaaa-aaaa-aaaa-aaaa-000000000014'
);
