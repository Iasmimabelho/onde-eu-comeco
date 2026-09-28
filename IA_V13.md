# IA por texto livre — v13

A seção **Sua situação** da Landing Page agora usa a Edge Function `analisar-perfil`.

Fluxo: texto livre -> oportunidades ativas do Supabase -> Edge Function -> OpenRouter -> recomendações reais -> cards da Landing Page.

O navegador não recebe a `OPENROUTER_API_KEY`; ela permanece nos Secrets do Supabase.

A função espera o secret `OPENROUTER_API_KEY` e o endpoint implantado com o nome `analisar-perfil`.
