Agora quero implementar as funcionalidades que ainda estão faltando na plataforma **Onde Eu Começo?**.

A integração com Supabase já está funcionando, o schema foi executado, o seed foi executado e o usuário admin está funcionando.

**Não recrie o projeto e não remova funcionalidades que já funcionam. Trabalhe sobre a implementação atual.**

## 1. MATCH / PESQUISA POR IA

A pesquisa de IA precisa realmente encontrar oportunidades existentes no Supabase.

Atualmente, quando o usuário realiza a pesquisa, ela não encontra corretamente as oportunidades e não apresenta a porcentagem de compatibilidade.

Corrigir isso.

O sistema deve:

1. Ler os dados preenchidos no onboarding:

   * objetivo
   * dificuldades
   * habilidades
   * disponibilidade
   * meta

2. Buscar as oportunidades reais da tabela `opportunities`.

3. Comparar o perfil do usuário com:

   * `category`
   * `skills_required`
   * `objectives_match`
   * `modality`
   * `location`
   * `requirements`
   * disponibilidade, quando houver

4. Calcular uma **porcentagem de compatibilidade** para cada oportunidade.

Exemplo:

**Desenvolvedor(a) Júnior — React/TypeScript**
Compatibilidade: **87%**

A porcentagem precisa ser calculada com base nos dados reais do usuário e da oportunidade.

Não usar porcentagens fixas ou aleatórias.

## 2. MELHOR OPORTUNIDADE

Depois de analisar as oportunidades, destacar claramente a oportunidade com maior compatibilidade.

Criar uma seção:

**“Sua melhor oportunidade”**

Mostrar:

* nome
* organização
* compatibilidade
* motivo da recomendação
* principais pontos que fizeram o match
* botão **“Ver oportunidade”**

Não inventar o resultado.

A oportunidade destacada deve ser realmente a que possui a maior pontuação calculada.

## 3. LISTA DE RESULTADOS

Além da melhor oportunidade, mostrar as demais oportunidades encontradas ordenadas pela compatibilidade.

Cada resultado deve mostrar:

* oportunidade
* organização
* categoria
* modalidade
* compatibilidade %
* principais motivos do match
* prazo
* botão **“Ver oportunidade”**
* botão **“Salvar”**

Todos esses botões devem funcionar.

## 4. PÁGINA DA OPORTUNIDADE

Ao clicar em **“Ver oportunidade”**, abrir a oportunidade correta pelo ID.

Mostrar todos os dados disponíveis no Supabase.

O usuário deve conseguir:

* salvar
* demonstrar interesse
* voltar
* compartilhar
* visualizar organização

A ação de interesse deve criar um registro real em `applications`.

## 5. LOGIN DAS EMPRESAS E INSTITUIÇÕES

Precisamos implementar corretamente o fluxo de organizações.

Na autenticação, permitir escolher:

**“Sou candidato”**
ou
**“Sou empresa/instituição”**

### Candidato

Cadastro normal:

Cadastro → Onboarding → Match → Oportunidades → Candidaturas → Dashboard.

### Empresa/Instituição

Fluxo:

Cadastro → Perfil da organização → Dashboard da organização.

A organização deve poder:

* cadastrar dados da organização
* editar perfil
* criar oportunidades
* editar oportunidades
* pausar oportunidades
* encerrar oportunidades
* visualizar candidatos
* visualizar informações permitidas dos candidatos
* alterar status das candidaturas

## 6. PERMISSÕES

Utilizar o `role` existente em `profiles`:

* `user`
* `organization`
* `admin`

Criar proteção de rotas baseada no role.

Um candidato não deve conseguir acessar o painel de organização.

Uma organização não deve conseguir acessar funcionalidades exclusivas do administrador.

O administrador continua tendo acesso administrativo.

## 7. ORGANIZAÇÃO NO SUPABASE

Ao cadastrar uma organização:

1. Criar o usuário no Auth.
2. Criar/atualizar o `profile` com `role = 'organization'`.
3. Criar o registro correspondente em `organizations`.
4. Associar `organizations.user_id` ao usuário autenticado.

As oportunidades criadas por uma organização devem utilizar o `org_id` correto.

## 8. RELATÓRIO POR E-MAIL

Depois que o usuário concluir o onboarding e realizar o processo de match, oferecer:

**“Receber meu relatório por e-mail”**

O usuário deve informar ou confirmar o e-mail.

Enviar um relatório com:

* nome do usuário
* resumo do perfil
* principais habilidades
* objetivo
* melhor oportunidade
* porcentagem de compatibilidade
* outras oportunidades recomendadas
* porcentagem de compatibilidade de cada uma
* explicação resumida dos matches
* próximos passos

### IMPORTANTE

O envio precisa ser REAL.

Não criar apenas uma mensagem dizendo “e-mail enviado”.

Utilizar uma solução segura de envio de e-mail no backend/Edge Function.

**NUNCA colocar API keys de serviço de e-mail no frontend.**

Se for necessário configurar um provedor de e-mail ou variável de ambiente, indicar exatamente qual configuração é necessária.

## 9. ESTADOS DO MATCH

Implementar:

* carregando análise
* análise concluída
* oportunidades encontradas
* nenhuma oportunidade compatível
* erro ao buscar oportunidades
* erro ao calcular match

Nunca deixar a tela simplesmente vazia.

## 10. DADOS REAIS

Não utilizar:

* arrays MOCK
* porcentagens fixas
* oportunidades fictícias no frontend
* resultados aleatórios
* empresas simuladas

Todos os resultados devem vir dos dados reais do Supabase.

## 11. AUDITORIA FINAL

Depois de implementar, testar:

### Candidato

Cadastro → Login → Onboarding → Pesquisa IA → Match → Porcentagens → Melhor oportunidade → Ver oportunidade → Salvar → Quero participar → Dashboard → Relatório por e-mail.

### Organização

Cadastro → Login → Perfil da organização → Criar oportunidade → Editar → Publicar → Visualizar candidatos → Atualizar candidatura.

### Admin

Login → Dashboard → Usuários → Organizações → Oportunidades → Candidaturas.

### REGRA

Todos os botões, links, filtros, formulários e ações visíveis precisam funcionar.

Não considere a tarefa concluída enquanto:

* a pesquisa não encontrar oportunidades reais;
* não houver porcentagem calculada;
* não houver melhor oportunidade;
* empresas/instituições não conseguirem fazer login;
* organizações não tiverem dashboard;
* candidaturas não estiverem conectadas ao Supabase;
* o relatório não puder ser enviado realmente por e-mail;
* ou existir algum botão sem função.
