Quero que você faça uma revisão COMPLETA da plataforma de impacto social que já está sendo desenvolvida.

**Não comece o projeto do zero.** Preserve a identidade visual, estrutura, componentes e telas já criadas. O objetivo agora é transformar o protótipo em uma aplicação realmente funcional, organizada e conectada ao **Supabase**.

### 1. REGRA PRINCIPAL

Tudo que aparece como uma ação na interface precisa funcionar.

Não deixe botões, links, cards, filtros, formulários ou menus apenas como elementos visuais.

Antes de finalizar, percorra TODAS as telas e teste cada interação.

### 2. SUPABASE

Implementar o Supabase como backend principal da aplicação.

Organizar corretamente:

* Autenticação de usuários
* Cadastro
* Login
* Logout
* Recuperação de senha
* Perfil do usuário
* Organizações/ONGs
* Oportunidades
* Inscrições/interesses em oportunidades
* Projetos
* Impactos/resultados
* Notificações, quando aplicável
* Dados administrativos

Utilizar o banco de dados do Supabase de forma estruturada e escalável.

Criar as tabelas, relacionamentos, chaves, índices e políticas RLS necessárias.

Não deixar dados importantes hardcoded no frontend.

### 3. AUTENTICAÇÃO

O sistema deve diferenciar corretamente os tipos de usuário necessários, por exemplo:

* Usuário/voluntário
* Organização/ONG
* Administrador

Cada perfil deve visualizar somente as funcionalidades permitidas para sua função.

Após login, o usuário deve permanecer autenticado corretamente mesmo ao navegar entre as páginas.

### 4. “ONDE EU COMEÇO?”

Essa página precisa ser totalmente funcional.

As oportunidades devem vir do Supabase.

Cada oportunidade deve possuir:

* título
* organização
* descrição
* categoria
* localização
* modalidade
* requisitos
* prazo
* quantidade de vagas, quando aplicável
* status
* imagem, quando aplicável

O botão **“Ver oportunidade”** deve abrir uma página/modal de detalhes da oportunidade correta.

O botão **“Quero participar” / “Tenho interesse”** deve registrar a ação do usuário no Supabase.

Depois disso, o usuário deve conseguir acompanhar suas oportunidades e inscrições.

### 5. DASHBOARD DO USUÁRIO

Criar/conectar um dashboard onde o usuário possa visualizar:

* oportunidades recomendadas
* oportunidades salvas
* inscrições realizadas
* participações
* histórico
* impacto gerado
* perfil

Os dados devem ser reais e vindos do Supabase.

### 6. ORGANIZAÇÕES / ONGs

As organizações devem conseguir:

* criar perfil
* editar perfil
* publicar oportunidades
* editar oportunidades
* pausar/encerrar oportunidades
* visualizar interessados
* gerenciar inscrições
* acompanhar métricas de impacto

Tudo deve estar conectado ao banco.

### 7. BUSCA E FILTROS

Implementar de verdade:

* busca por texto
* categoria
* localização
* modalidade
* disponibilidade
* filtros relevantes

Os filtros devem alterar os resultados exibidos e consultar os dados corretamente.

### 8. FORMULÁRIOS

Todos os formulários devem:

* validar os campos
* mostrar mensagens de erro
* mostrar estado de carregamento
* impedir envio inválido
* salvar os dados no Supabase
* mostrar confirmação de sucesso
* tratar erros do backend

Não utilizar apenas `console.log()` como resposta de uma ação.

### 9. ESTADOS DA INTERFACE

Todas as páginas que dependem de dados devem possuir:

* loading
* estado vazio
* erro
* sucesso

Exemplo:

Se não existirem oportunidades, mostrar uma mensagem amigável explicando que nenhuma oportunidade foi encontrada.

### 10. ADMIN

O painel administrativo também deve ser funcional.

O administrador deve conseguir visualizar e gerenciar os dados relevantes da plataforma, respeitando as permissões de acesso.

### 11. ORGANIZAÇÃO DO CÓDIGO

Organizar o projeto profissionalmente.

Separar corretamente:

* páginas
* componentes
* hooks
* serviços
* autenticação
* integração com Supabase
* tipos/interfaces
* utilitários
* estilos

Evitar código duplicado.

Criar componentes reutilizáveis.

Não colocar consultas ao Supabase espalhadas desnecessariamente por vários componentes.

### 12. SEGURANÇA

Implementar corretamente:

* Row Level Security (RLS)
* políticas de acesso
* proteção de rotas
* permissões por tipo de usuário

NUNCA colocar a `service_role key` do Supabase no frontend.

Utilizar apenas as credenciais apropriadas para o ambiente client-side.

### 13. EXPERIÊNCIA DO USUÁRIO

Manter a interface bonita e moderna que já foi criada.

Não simplificar o design.

Adicionar feedback visual para ações:

* botão pressionado
* carregamento
* sucesso
* erro
* confirmação

Nenhuma ação deve parecer quebrada ou sem resposta.

### 14. REVISÃO FINAL

Depois da implementação, faça uma auditoria completa da aplicação.

Teste:

1. Cadastro
2. Login
3. Logout
4. Perfil
5. Navegação
6. “Onde Eu Começo?”
7. Busca
8. Filtros
9. “Ver oportunidade”
10. “Quero participar”
11. Salvamento de oportunidades
12. Dashboard
13. Organizações
14. Criação de oportunidade
15. Edição
16. Exclusão/encerramento
17. Formulários
18. Permissões
19. Dados do Supabase
20. Estados de loading/erro/vazio

Corrija qualquer botão sem função, rota quebrada, dado fictício, formulário que não salva ou componente que não possui comportamento real.

**IMPORTANTE:** não quero apenas uma interface visual simulando um sistema. Quero uma aplicação funcional, com frontend conectado ao Supabase e com os principais fluxos funcionando de ponta a ponta.

Antes de considerar concluído, verifique se cada ação visível na interface possui uma implementação correspondente.
