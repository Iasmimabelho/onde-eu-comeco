-- ============================================================
-- Onde Eu Começo? — Seed Data
-- Safe to run multiple times (uses ON CONFLICT DO NOTHING)
-- Run AFTER schema.sql and AFTER creating your admin user
-- ============================================================

-- ── ORGANIZATIONS ─────────────────────────────────────────
-- These use a placeholder user_id; update with your admin user UUID
-- or run: UPDATE organizations SET user_id = auth.uid() WHERE user_id = '00000000-0000-0000-0000-000000000001'

DO $$
DECLARE
  admin_id          uuid;
  org_novatech      uuid;
  org_conecta       uuid;
  org_horizonte_dig uuid;   -- Horizonte Digital (empresa)
  org_impacto       uuid;
  org_evolua        uuid;
  org_instituto     uuid;   -- Instituto Futuro (instituicao)
  org_faculdade     uuid;   -- Faculdade Horizonte (instituicao)
  org_centroprofis  uuid;   -- Centro Profissionalizante Nova Geração (instituicao)
  org_escoladigital uuid;   -- Escola Digital Brasil (instituicao)
BEGIN
  -- Get the first admin user
  SELECT id INTO admin_id FROM public.profiles WHERE role = 'admin' LIMIT 1;
  IF admin_id IS NULL THEN
    RAISE NOTICE 'No admin user found. Using placeholder UUID. Update manually after creating admin.';
    admin_id := '00000000-0000-0000-0000-000000000001';
  END IF;

  -- ── COMPANIES ──
  INSERT INTO public.organizations (id, user_id, name, type, description, location, category, employees_count, verified)
  VALUES
    ('11111111-1111-1111-1111-000000000001', admin_id, 'NovaTech Soluções', 'empresa',
     'Empresa de tecnologia focada em soluções digitais para pequenas e médias empresas. Ambiente jovem e dinâmico.',
     'Niterói, RJ', 'Tecnologia', '50-200', true),
    ('11111111-1111-1111-1111-000000000002', admin_id, 'Conecta RH', 'empresa',
     'Consultoria especializada em recrutamento e desenvolvimento de talentos. Conectamos profissionais às melhores oportunidades.',
     'Rio de Janeiro, RJ', 'Recursos Humanos', '10-50', true),
    ('11111111-1111-1111-1111-000000000003', admin_id, 'Horizonte Digital', 'empresa',
     'Agência de marketing digital e criação de conteúdo para marcas que querem crescer online.',
     'Rio de Janeiro, RJ', 'Marketing Digital', '20-100', true),
    ('11111111-1111-1111-1111-000000000004', admin_id, 'Impacto Serviços', 'empresa',
     'Empresa de serviços administrativos e logística. Contratação frequente para cargos operacionais.',
     'Niterói, RJ', 'Serviços', '100-500', false),
    ('11111111-1111-1111-1111-000000000005', admin_id, 'Evolua Tecnologia', 'empresa',
     'Startup de EdTech desenvolvendo soluções de aprendizado personalizado com IA.',
     'São Paulo, SP', 'Tecnologia / EdTech', '10-50', true)
  ON CONFLICT (id) DO NOTHING;

  -- ── INSTITUTIONS ──
  INSERT INTO public.organizations (id, user_id, name, type, description, location, category, employees_count, verified)
  VALUES
    ('22222222-2222-2222-2222-000000000001', admin_id, 'Instituto Futuro', 'instituicao',
     'ONG de desenvolvimento social que apoia jovens e adultos em transição de carreira com cursos, mentoria e conexão com o mercado.',
     'Niterói, RJ', 'Desenvolvimento Social', '10-50', true),
    ('22222222-2222-2222-2222-000000000002', admin_id, 'Faculdade Horizonte', 'instituicao',
     'Faculdade particular com foco em cursos noturnos acessíveis. Convênios com programas de bolsa para renda baixa.',
     'Rio de Janeiro, RJ', 'Ensino Superior', '100-500', true),
    ('22222222-2222-2222-2222-000000000003', admin_id, 'Centro Profissionalizante Nova Geração', 'instituicao',
     'Centro de formação profissional com cursos técnicos gratuitos para jovens e adultos em situação de vulnerabilidade.',
     'Niterói, RJ', 'Educação Profissional', '10-50', true),
    ('22222222-2222-2222-2222-000000000004', admin_id, 'Escola Digital Brasil', 'instituicao',
     'Plataforma de cursos online gratuitos em tecnologia, design e marketing. Parceria com grandes empresas.',
     'Online', 'Educação Digital', '50-200', true)
  ON CONFLICT (id) DO NOTHING;

  -- Store org IDs in variables
  org_novatech      := '11111111-1111-1111-1111-000000000001';
  org_conecta       := '11111111-1111-1111-1111-000000000002';
  org_horizonte_dig := '11111111-1111-1111-1111-000000000003';
  org_impacto       := '11111111-1111-1111-1111-000000000004';
  org_evolua        := '11111111-1111-1111-1111-000000000005';
  org_instituto     := '22222222-2222-2222-2222-000000000001';
  org_faculdade     := '22222222-2222-2222-2222-000000000002';
  org_centroprofis  := '22222222-2222-2222-2222-000000000003';
  org_escoladigital := '22222222-2222-2222-2222-000000000004';

  -- ── OPPORTUNITIES ──────────────────────────────────────
  -- Deadlines: all set from August 2026 onwards, spaced coherently
  INSERT INTO public.opportunities (
    id, org_id, title, description, category, modality, location,
    requirements, skills_required, objectives_match,
    deadline, vacancies, status, is_free, salary
  ) VALUES

  -- BOLSAS
  ('aaaaaaaa-aaaa-aaaa-aaaa-000000000001',
   org_faculdade,
   'Bolsa de Graduação Integral — Faculdade Horizonte',
   'Bolsa de estudos 100% para cursos de graduação no período noturno. Destinada a pessoas de baixa renda que não tiveram acesso ao ensino superior. Inclui apoio pedagógico, biblioteca e acesso à plataforma EAD.',
   'bolsa', 'presencial', 'Centro, Rio de Janeiro, RJ',
   ARRAY['Renda familiar até 3 salários mínimos', 'Ensino médio completo', 'Ter feito o ENEM nos últimos 2 anos', 'Residir no RJ'],
   ARRAY['dedicacao', 'organizacao'],
   ARRAY['estudar', 'naosei'],
   '2026-10-15', 50, 'ativo', true, NULL),

  ('aaaaaaaa-aaaa-aaaa-aaaa-000000000002',
   org_instituto,
   'Bolsa Técnica + Estágio — Instituto Futuro',
   'Programa que oferece curso técnico gratuito (6 meses) seguido de estágio remunerado em empresas parceiras. Áreas: administração, atendimento e logística. Voltado para jovens de 18 a 29 anos.',
   'bolsa', 'presencial', 'Centro, Niterói, RJ',
   ARRAY['Idade entre 18 e 29 anos', 'Ensino médio completo', 'Disponibilidade integral por 6 meses', 'Residir em Niterói ou região metropolitana'],
   ARRAY['comunicacao', 'organizacao', 'vendas'],
   ARRAY['trabalho', 'estudar', 'oportunidades'],
   '2026-09-30', 30, 'ativo', true, 'Estágio: R$ 900/mês'),

  -- EMPREGOS
  ('aaaaaaaa-aaaa-aaaa-aaaa-000000000003',
   org_novatech,
   'Desenvolvedor(a) Júnior — React/TypeScript',
   'Vaga para desenvolvedor(a) júnior na equipe de produto. Você vai trabalhar em projetos reais, com mentoria de sêniors e foco em crescimento. Ambiente descontraído, remoto e com plano de carreira claro.',
   'emprego', 'remoto', 'Remoto (Brasil)',
   ARRAY['Conhecimento básico de React ou similar', 'HTML/CSS intermediário', 'Vontade de aprender', 'Disponibilidade de 40h semanais'],
   ARRAY['programacao', 'informatica', 'logica'],
   ARRAY['trabalho', 'tecnologia', 'carreira'],
   '2026-09-05', 3, 'ativo', false, 'R$ 2.500 – R$ 4.000'),

  ('aaaaaaaa-aaaa-aaaa-aaaa-000000000004',
   org_conecta,
   'Assistente Administrativo — Niterói',
   'Vaga para assistente administrativo em empresa de médio porte. Atividades: atendimento, organização de documentos, suporte a equipes. Horário comercial com flexibilidade.',
   'emprego', 'presencial', 'Icaraí, Niterói, RJ',
   ARRAY['Ensino médio completo', 'Conhecimento básico de informática', 'Boa comunicação', 'Organização'],
   ARRAY['comunicacao', 'organizacao', 'informatica'],
   ARRAY['trabalho', 'oportunidades'],
   '2026-08-29', 2, 'ativo', false, 'R$ 1.400 + benefícios'),

  ('aaaaaaaa-aaaa-aaaa-aaaa-000000000005',
   org_horizonte_dig,
   'Criador(a) de Conteúdo Digital — Freelancer',
   'Procuramos criadores de conteúdo para produzir posts, reels e textos para redes sociais de clientes da agência. Trabalho remoto, flexível, pagamento por projeto. Ideal para quem quer construir portfólio.',
   'emprego', 'remoto', 'Remoto',
   ARRAY['Noções de redes sociais', 'Criatividade', 'Boa escrita', 'Smartphone ou computador com acesso à internet'],
   ARRAY['comunicacao', 'design', 'criatividade'],
   ARRAY['trabalho', 'negocio', 'tecnologia'],
   '2026-09-12', 5, 'ativo', false, 'R$ 800 – R$ 2.000/mês (freelancer)'),

  ('aaaaaaaa-aaaa-aaaa-aaaa-000000000006',
   org_impacto,
   'Auxiliar de Logística — Niterói',
   'Contratação para auxiliar de logística. Atividades de separação, embalagem e organização de estoque. Turno matutino ou vespertino. Sem experiência necessária.',
   'emprego', 'presencial', 'Colubandê, São Gonçalo, RJ',
   ARRAY['Ensino fundamental completo', 'Disponibilidade de segunda a sexta', 'Proatividade', 'Boa forma física'],
   ARRAY['organizacao', 'proatividade'],
   ARRAY['trabalho', 'oportunidades'],
   '2026-08-21', 8, 'ativo', false, 'R$ 1.320 + VT + VR'),

  -- CURSOS
  ('aaaaaaaa-aaaa-aaaa-aaaa-000000000007',
   org_escoladigital,
   'Curso Gratuito: Introdução à Programação Web',
   'Aprenda HTML, CSS e JavaScript do zero em 8 semanas. Aulas ao vivo às terças e quintas, das 19h às 21h. Certificado ao final. Turma com mentoria e suporte via comunidade.',
   'curso', 'remoto', 'Online',
   ARRAY['Computador com acesso à internet', 'Nenhum conhecimento prévio necessário'],
   ARRAY['logica', 'informatica'],
   ARRAY['tecnologia', 'estudar', 'carreira'],
   '2026-09-16', 100, 'ativo', true, NULL),

  ('aaaaaaaa-aaaa-aaaa-aaaa-000000000008',
   org_centroprofis,
   'Curso Técnico Gratuito: Excel e Pacote Office',
   'Curso presencial de 3 meses com foco em Excel, Word e PowerPoint para o mercado de trabalho. Inclui material didático, certificado e encaminhamento profissional.',
   'curso', 'presencial', 'Engenhoca, Niterói, RJ',
   ARRAY['Ensino médio cursando ou completo', 'Disponibilidade noturna (19h–22h)', 'Interesse em trabalhar na área administrativa'],
   ARRAY['informatica', 'organizacao'],
   ARRAY['trabalho', 'estudar', 'oportunidades'],
   '2026-08-28', 25, 'ativo', true, NULL),

  ('aaaaaaaa-aaaa-aaaa-aaaa-000000000009',
   org_escoladigital,
   'Formação em Design Gráfico e UX — 100% Online',
   'Formação completa em design gráfico e UX/UI com ferramentas como Figma, Canva e Photoshop. 6 meses de conteúdo com projetos práticos. Certificado reconhecido no mercado.',
   'curso', 'remoto', 'Online',
   ARRAY['Computador ou tablet', 'Acesso à internet', 'Interesse em design e criatividade'],
   ARRAY['criatividade', 'design', 'informatica'],
   ARRAY['tecnologia', 'trabalho', 'carreira'],
   '2026-10-31', 200, 'ativo', true, NULL),

  ('aaaaaaaa-aaaa-aaaa-aaaa-000000000010',
   org_evolua,
   'Bootcamp de Data Science — Intensivo',
   'Bootcamp de 12 semanas focado em Python, análise de dados e machine learning. Projeto final com apresentação para empresas parceiras. Vagas limitadas.',
   'curso', 'remoto', 'Online',
   ARRAY['Conhecimento básico de lógica de programação', 'Computador com 8GB RAM', 'Disponibilidade de 20h/semana'],
   ARRAY['programacao', 'logica', 'matematica'],
   ARRAY['tecnologia', 'trabalho', 'carreira'],
   '2026-09-26', 40, 'ativo', false, 'R$ 1.200 (com bolsas disponíveis)'),

  -- PROGRAMAS
  ('aaaaaaaa-aaaa-aaaa-aaaa-000000000011',
   org_instituto,
   'Programa Primeiro Emprego — Instituto Futuro',
   'Programa completo de 3 meses que prepara jovens para o primeiro emprego. Inclui: orientação profissional, currículo, simulação de entrevistas, conexão com empresas parceiras e acompanhamento pós-colocação.',
   'programa', 'hibrido', 'Centro, Nova Iguaçu, RJ',
   ARRAY['Idade entre 16 e 24 anos', 'Estar fora do mercado de trabalho formal', 'Ensino médio cursando ou completo'],
   ARRAY['comunicacao', 'organizacao'],
   ARRAY['trabalho', 'oportunidades', 'naosei'],
   '2026-10-17', 60, 'ativo', true, NULL),

  ('aaaaaaaa-aaaa-aaaa-aaaa-000000000012',
   org_instituto,
   'Programa Empreenda — Apoio ao Microempreendedor',
   'Apoio completo para quem quer começar um pequeno negócio. Inclui curso de gestão, mentoria individual, apoio para MEI e conexão com linha de microcrédito.',
   'programa', 'presencial', 'Centro, Petrópolis, RJ',
   ARRAY['Maior de 18 anos', 'Ideia de negócio ou negócio já iniciado', 'Disponibilidade para 2 encontros semanais'],
   ARRAY['comunicacao', 'organizacao', 'vendas'],
   ARRAY['negocio', 'oportunidades'],
   '2026-11-14', 20, 'ativo', true, NULL),

  ('aaaaaaaa-aaaa-aaaa-aaaa-000000000013',
   org_faculdade,
   'ProUni — Bolsa Faculdade Horizonte 2027.1',
   'Processo seletivo para bolsas ProUni e bolsas próprias da faculdade para o primeiro semestre de 2027. Cursos disponíveis: Administração, Pedagogia, Serviço Social, Enfermagem e TI.',
   'programa', 'presencial', 'Barra da Tijuca, Rio de Janeiro, RJ',
   ARRAY['Ter realizado o ENEM com nota acima de 450', 'Renda familiar per capita até 1,5 salário mínimo (bolsa integral)', 'Não ter diploma de ensino superior'],
   ARRAY['dedicacao'],
   ARRAY['estudar', 'carreira', 'naosei'],
   '2026-11-28', 80, 'ativo', true, NULL),

  -- VOLUNTARIADO
  ('aaaaaaaa-aaaa-aaaa-aaaa-000000000014',
   org_instituto,
   'Voluntário(a) de Tutoria — Reforço Escolar',
   'Ajude jovens da comunidade com reforço escolar em matemática, português ou inglês. Atividade semanal de 2h. Certificado de horas voluntárias. Ideal para estudantes universitários ou profissionais que querem impactar.',
   'voluntariado', 'presencial', 'Centro, Volta Redonda, RJ',
   ARRAY['Ensino médio completo', 'Disponibilidade semanal de 2h', 'Interesse em educação'],
   ARRAY['comunicacao', 'ensino', 'paciencia'],
   ARRAY['oportunidades', 'naosei'],
   '2026-12-18', 15, 'ativo', true, NULL)

  ON CONFLICT (id) DO NOTHING;

  RAISE NOTICE 'Seed completed successfully.';
END $$;
