export type OpportunityCategory = "bolsa" | "emprego" | "curso" | "programa" | "evento"
export type Modality = "presencial" | "remoto" | "hibrido"

export interface Skill {
  id: string
  name: string
  category: string
}

export interface Company {
  id: string
  name: string
  sector: string
  location: string
  logo: string
  plan: "starter" | "professional" | "business"
  openJobs: number
}

export interface Institution {
  id: string
  name: string
  type: "faculdade" | "instituto" | "escola" | "ong"
  location: string
  logo: string
  courses: number
  scholarships: number
}

export interface Opportunity {
  id: string
  title: string
  category: OpportunityCategory
  description: string
  institution: string
  institutionId: string
  location: string
  modality: Modality
  deadline: string
  isFree: boolean
  price?: number
  requirements: string[]
  benefits: string[]
  matchFactors: string[]
  featured: boolean
  urgent?: boolean
  spots?: number
}

export interface Plan {
  id: string
  name: string
  price: number
  period: "month"
  target: "company" | "institution" | "user"
  features: string[]
  highlight?: boolean
  cta: string
}

export const SKILLS: Skill[] = [
  { id: "s1", name: "Informática", category: "tecnologia" },
  { id: "s2", name: "Programação", category: "tecnologia" },
  { id: "s3", name: "Design Digital", category: "tecnologia" },
  { id: "s4", name: "Marketing Digital", category: "marketing" },
  { id: "s5", name: "Vendas", category: "comercial" },
  { id: "s6", name: "Comunicação", category: "soft-skill" },
  { id: "s7", name: "Organização", category: "soft-skill" },
  { id: "s8", name: "Atendimento ao Cliente", category: "comercial" },
  { id: "s9", name: "Administração", category: "gestao" },
  { id: "s10", name: "Idiomas (Inglês)", category: "idiomas" },
  { id: "s11", name: "Excel / Planilhas", category: "tecnologia" },
  { id: "s12", name: "Liderança", category: "soft-skill" },
  { id: "s13", name: "Contabilidade", category: "gestao" },
  { id: "s14", name: "Logística", category: "operacoes" },
  { id: "s15", name: "Saúde e Bem-estar", category: "saude" },
]

export const COMPANIES: Company[] = [
  {
    id: "c1",
    name: "NovaTech",
    sector: "Tecnologia",
    location: "Niterói, RJ",
    logo: "NT",
    plan: "professional",
    openJobs: 8,
  },
  {
    id: "c2",
    name: "Conecta RH",
    sector: "Recursos Humanos",
    location: "Rio de Janeiro, RJ",
    logo: "CR",
    plan: "business",
    openJobs: 23,
  },
  {
    id: "c3",
    name: "Horizonte Digital",
    sector: "Marketing",
    location: "São Paulo, SP",
    logo: "HD",
    plan: "starter",
    openJobs: 4,
  },
  {
    id: "c4",
    name: "Impacto Serviços",
    sector: "Serviços",
    location: "Niterói, RJ",
    logo: "IS",
    plan: "starter",
    openJobs: 12,
  },
  {
    id: "c5",
    name: "Evolua Tecnologia",
    sector: "Tecnologia",
    location: "Belo Horizonte, MG",
    logo: "ET",
    plan: "professional",
    openJobs: 6,
  },
]

export const INSTITUTIONS: Institution[] = [
  {
    id: "i1",
    name: "Instituto Futuro",
    type: "instituto",
    location: "Niterói, RJ",
    logo: "IF",
    courses: 12,
    scholarships: 5,
  },
  {
    id: "i2",
    name: "Faculdade Horizonte",
    type: "faculdade",
    location: "Rio de Janeiro, RJ",
    logo: "FH",
    courses: 28,
    scholarships: 14,
  },
  {
    id: "i3",
    name: "Centro Profissionalizante Nova Geração",
    type: "escola",
    location: "Niterói, RJ",
    logo: "NG",
    courses: 18,
    scholarships: 8,
  },
  {
    id: "i4",
    name: "Escola Digital Brasil",
    type: "escola",
    location: "Online",
    logo: "ED",
    courses: 42,
    scholarships: 22,
  },
]

export const OPPORTUNITIES: Opportunity[] = [
  {
    id: "op1",
    title: "Bolsa de Graduação Integral",
    category: "bolsa",
    description:
      "Bolsa 100% para cursos de graduação presenciais e a distância. Voltada para pessoas em vulnerabilidade econômica que desejam iniciar o ensino superior.",
    institution: "Faculdade Horizonte",
    institutionId: "i2",
    location: "Centro, Rio de Janeiro, RJ",
    modality: "presencial",
    deadline: "2025-09-20",
    isFree: true,
    requirements: ["Renda familiar até 3 salários mínimos", "Ensino médio completo", "Participar do processo seletivo"],
    benefits: ["Bolsa integral", "Acesso à biblioteca", "Apoio pedagógico"],
    matchFactors: ["objetivo", "localizacao", "disponibilidade"],
    featured: true,
    spots: 40,
  },
  {
    id: "op2",
    title: "Bolsa Tecnologia — Programação Web",
    category: "bolsa",
    description:
      "Bolsa para o curso de Desenvolvimento Web da Faculdade Horizonte, com foco em React, Node.js e banco de dados.",
    institution: "Faculdade Horizonte",
    institutionId: "i2",
    location: "Barra da Tijuca, Rio de Janeiro, RJ",
    modality: "hibrido",
    deadline: "2025-10-01",
    isFree: true,
    requirements: ["Interesse em tecnologia", "Disponibilidade para curso noturno"],
    benefits: ["Bolsa 80%", "Certificado", "Mentoria", "Apoio na colocação profissional"],
    matchFactors: ["habilidades", "objetivo", "disponibilidade"],
    featured: false,
    spots: 20,
  },
  {
    id: "op3",
    title: "Programa Primeiro Emprego",
    category: "programa",
    description:
      "Programa de capacitação e inserção no mercado de trabalho para jovens de 18 a 29 anos sem experiência profissional formal.",
    institution: "Instituto Futuro",
    institutionId: "i1",
    location: "Centro, Niterói, RJ",
    modality: "presencial",
    deadline: "2025-08-30",
    isFree: true,
    requirements: ["Idade entre 18 e 29 anos", "Sem vínculo empregatício formal", "Disponibilidade integral ou noturna"],
    benefits: ["Capacitação de 3 meses", "Auxílio transporte", "Certificado", "Encaminhamento a vagas"],
    matchFactors: ["objetivo", "localizacao", "habilidades"],
    featured: true,
    urgent: true,
    spots: 50,
  },
  {
    id: "op4",
    title: "Assistente Administrativo",
    category: "emprego",
    description:
      "Vaga para assistente administrativo em empresa de tecnologia. Horário flexível, ideal para quem estuda no período noturno.",
    institution: "NovaTech",
    institutionId: "c1",
    location: "Icaraí, Niterói, RJ",
    modality: "hibrido",
    deadline: "2025-09-10",
    isFree: true,
    requirements: ["Ensino médio completo", "Informática básica", "Organização"],
    benefits: ["Salário R$ 1.800", "Vale transporte", "Vale refeição", "Plano de saúde", "Horário flexível"],
    matchFactors: ["habilidades", "localizacao", "disponibilidade"],
    featured: false,
    spots: 2,
  },
  {
    id: "op5",
    title: "Desenvolvimento Web — Curso Gratuito",
    category: "curso",
    description:
      "Curso completo de desenvolvimento web front-end: HTML, CSS, JavaScript e React. 100% gratuito e online.",
    institution: "Escola Digital Brasil",
    institutionId: "i4",
    location: "Online",
    modality: "remoto",
    deadline: "2025-12-31",
    isFree: true,
    requirements: ["Acesso à internet", "Disponibilidade de 10h semanais"],
    benefits: ["Certificado reconhecido", "Projeto prático", "Suporte da comunidade"],
    matchFactors: ["habilidades", "disponibilidade"],
    featured: false,
  },
  {
    id: "op6",
    title: "Excel Profissional — Do Zero ao Avançado",
    category: "curso",
    description:
      "Curso intensivo de Excel para uso profissional: fórmulas, tabelas dinâmicas, dashboards e automação com macros.",
    institution: "Centro Profissionalizante Nova Geração",
    institutionId: "i3",
    location: "Engenhoca, Niterói, RJ",
    modality: "hibrido",
    deadline: "2025-09-05",
    isFree: true,
    requirements: ["Informática básica"],
    benefits: ["Certificado", "Material didático", "Aula prática"],
    matchFactors: ["habilidades", "localizacao"],
    featured: false,
    spots: 30,
  },
  {
    id: "op7",
    title: "Trilha de Carreira em Marketing Digital",
    category: "programa",
    description:
      "Programa de 6 meses para desenvolvimento de carreira em marketing digital: redes sociais, SEO, tráfego pago e análise de dados.",
    institution: "Instituto Futuro",
    institutionId: "i1",
    location: "Centro, Nova Iguaçu, RJ",
    modality: "hibrido",
    deadline: "2025-10-15",
    isFree: false,
    price: 299,
    requirements: ["Interesse em marketing", "Disponibilidade de 8h semanais"],
    benefits: ["6 meses de conteúdo", "Mentoria individual", "Certificado", "Acesso vitalício"],
    matchFactors: ["objetivo", "habilidades"],
    featured: true,
  },
  {
    id: "op8",
    title: "Desenvolvedor Júnior — React",
    category: "emprego",
    description:
      "Vaga para desenvolvedor front-end júnior. Experiência em projetos acadêmicos ou pessoais é aceita.",
    institution: "NovaTech",
    institutionId: "c1",
    location: "Colubandê, São Gonçalo, RJ",
    modality: "hibrido",
    deadline: "2025-09-15",
    isFree: true,
    requirements: ["Conhecimento de JavaScript", "HTML e CSS", "Vontade de aprender"],
    benefits: ["Salário R$ 2.800", "Vale transporte", "Plano de saúde", "Home office 3x/semana"],
    matchFactors: ["habilidades", "localizacao"],
    featured: false,
    spots: 1,
  },
  {
    id: "op9",
    title: "Bolsa Primeiro Curso — EAD",
    category: "bolsa",
    description:
      "Bolsa de 100% para quem nunca cursou o ensino superior. Válida para todos os cursos de graduação EAD.",
    institution: "Escola Digital Brasil",
    institutionId: "i4",
    location: "Online",
    modality: "remoto",
    deadline: "2025-11-30",
    isFree: true,
    requirements: ["Primeira graduação", "Ensino médio completo", "Renda familiar até 5 salários mínimos"],
    benefits: ["Bolsa integral EAD", "Tutoria online", "Acesso à plataforma"],
    matchFactors: ["objetivo", "disponibilidade"],
    featured: false,
    spots: 100,
  },
  {
    id: "op10",
    title: "Capacitação Digital — Programa Nacional",
    category: "programa",
    description:
      "Programa de inclusão digital para trabalhadores: uso de ferramentas digitais, segurança online e produtividade.",
    institution: "Instituto Futuro",
    institutionId: "i1",
    location: "Niterói, RJ",
    modality: "presencial",
    deadline: "2025-08-28",
    isFree: true,
    requirements: ["Maiores de 18 anos", "Disponibilidade noturna"],
    benefits: ["Certificado", "Kit de materiais", "Conexão com mercado"],
    matchFactors: ["habilidades", "localizacao", "disponibilidade"],
    featured: false,
    urgent: true,
  },
  {
    id: "op11",
    title: "Auxiliar de Marketing Digital",
    category: "emprego",
    description:
      "Vaga para auxiliar em equipe de marketing. Aceita candidatos em formação. Horário compatível com estudos noturnos.",
    institution: "Horizonte Digital",
    institutionId: "c3",
    location: "São Paulo, SP",
    modality: "hibrido",
    deadline: "2025-09-25",
    isFree: true,
    requirements: ["Ensino médio completo", "Interesse em marketing", "Comunicação"],
    benefits: ["Salário R$ 1.600", "Vale transporte", "Experiência internacional possível"],
    matchFactors: ["habilidades", "objetivo"],
    featured: false,
  },
  {
    id: "op12",
    title: "Programa de Empreendedorismo Social",
    category: "programa",
    description:
      "Para quem quer abrir um pequeno negócio: plano de negócios, finanças, marketing e acesso a microcrédito.",
    institution: "Instituto Futuro",
    institutionId: "i1",
    location: "Niterói, RJ",
    modality: "presencial",
    deadline: "2025-10-10",
    isFree: true,
    requirements: ["Ideia de negócio ou negócio recente", "Maiores de 18 anos"],
    benefits: ["Mentoria com empreendedores", "Acesso a rede de microcrédito", "Certificado"],
    matchFactors: ["objetivo", "localizacao"],
    featured: false,
  },
]

export const PLANS: Plan[] = [
  {
    id: "company-starter",
    name: "Starter",
    price: 199,
    period: "month",
    target: "company",
    features: [
      "Até 5 vagas publicadas",
      "Dashboard básico",
      "Matching automático",
      "Visualização de candidatos",
      "Suporte por email",
    ],
    cta: "Começar grátis por 14 dias",
  },
  {
    id: "company-professional",
    name: "Professional",
    price: 499,
    period: "month",
    target: "company",
    features: [
      "Até 20 vagas publicadas",
      "Matching avançado com filtros",
      "Analytics de candidaturas",
      "Destaque nas recomendações",
      "API de candidatos",
      "Suporte prioritário",
    ],
    highlight: true,
    cta: "Assinar Professional",
  },
  {
    id: "company-business",
    name: "Business",
    price: 0,
    period: "month",
    target: "company",
    features: [
      "Vagas ilimitadas",
      "Matching enterprise com IA",
      "Analytics avançado",
      "Múltiplos usuários",
      "API completa",
      "Integrações ATS",
      "Gerente de conta dedicado",
    ],
    cta: "Falar com comercial",
  },
  {
    id: "inst-essencial",
    name: "Essencial",
    price: 149,
    period: "month",
    target: "institution",
    features: [
      "Até 3 oportunidades",
      "Candidatos interessados",
      "Dashboard básico",
      "Suporte por email",
    ],
    cta: "Começar grátis",
  },
  {
    id: "inst-avancado",
    name: "Avançado",
    price: 349,
    period: "month",
    target: "institution",
    features: [
      "Até 15 oportunidades",
      "Analytics detalhado",
      "Destaque nas buscas",
      "Matching de perfis",
      "Suporte prioritário",
    ],
    highlight: true,
    cta: "Assinar Avançado",
  },
]

export const ADMIN_STATS = {
  users: 2480,
  opportunities: 684,
  matches: 12840,
  applications: 4920,
  companies: 86,
  institutions: 43,
  monthlyRevenue: 47200,
  conversionRate: 38.3,
  activeUsers: 1840,
  completedPaths: 1240,
}

export const CHART_DATA = {
  users: [
    { month: "Mar", value: 820 },
    { month: "Abr", value: 1050 },
    { month: "Mai", value: 1380 },
    { month: "Jun", value: 1720 },
    { month: "Jul", value: 2100 },
    { month: "Ago", value: 2480 },
  ],
  revenue: [
    { month: "Mar", value: 12400 },
    { month: "Abr", value: 18200 },
    { month: "Mai", value: 25600 },
    { month: "Jun", value: 33100 },
    { month: "Jul", value: 41500 },
    { month: "Ago", value: 47200 },
  ],
  matches: [
    { month: "Mar", value: 2100 },
    { month: "Abr", value: 3800 },
    { month: "Mai", value: 5600 },
    { month: "Jun", value: 7900 },
    { month: "Jul", value: 10200 },
    { month: "Ago", value: 12840 },
  ],
  categories: [
    { name: "Bolsas", value: 28, color: "#6366F1" },
    { name: "Empregos", value: 34, color: "#F59E0B" },
    { name: "Cursos", value: 22, color: "#10B981" },
    { name: "Programas", value: 12, color: "#F43F5E" },
    { name: "Eventos", value: 4, color: "#8B5CF6" },
  ],
}
