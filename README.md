# 📚 Biblioteca Digital - Sistema Completo

Um sistema de biblioteca digital desenvolvido com HTML, CSS e JavaScript puro, oferecendo funcionalidades completas para usuários e administradores.

## 🚀 Funcionalidades

### 👥 Área do Usuário (index.html)
- **Banner "Destaque do Mês"** com livro em destaque
- **Sistema de busca** por título, autor ou gênero
- **Filtros por categoria** (Ficção, Fantasia, Romance, etc.)
- **Visualização de livros** em grade responsiva
- **Modal de sinopse** com detalhes completos do livro
- **Sistema de reserva** com formulário completo
- **Design responsivo** para desktop e mobile

### 🔧 Área Administrativa (admin.html)
- **Sistema de autenticação** (senha: admin123)
- **Dashboard** com estatísticas da biblioteca
- **Cadastro de livros** com upload de capa
- **Gerenciamento de livros** (editar/excluir)
- **Gerenciamento de reservas** (aprovar/rejeitar)
- **Atividade recente** em tempo real

## 📁 Estrutura do Projeto

```
biblioteca-digital/
├── index.html              # Página principal (área do usuário)
├── style.css               # Estilos da área do usuário
├── script.js               # JavaScript da área do usuário
├── admin.html              # Painel administrativo
├── admin-style.css         # Estilos do painel administrativo
├── admin-script.js         # JavaScript do painel administrativo
├── assets/                 # Pasta para imagens dos livros
└── README.md               # Documentação do projeto
```

## 🛠️ Como Usar

### 1. Executar o Projeto
```bash
# Navegue até a pasta do projeto
cd biblioteca-digital

# Inicie um servidor HTTP local
python3 -m http.server 8000

# Acesse no navegador
http://localhost:8000
```

### 2. Área do Usuário
1. Acesse `http://localhost:8000`
2. Navegue pelos livros disponíveis
3. Use os filtros laterais para encontrar livros específicos
4. Clique em "Ver Sinopse" para detalhes do livro
5. Clique em "Reservar Livro" para fazer uma reserva

### 3. Área Administrativa
1. Acesse `http://localhost:8000/admin.html`
2. Digite a senha: `admin123`
3. Use o menu lateral para navegar entre as seções:
   - **Dashboard**: Visão geral das estatísticas
   - **Cadastrar Livro**: Adicionar novos livros
   - **Gerenciar Livros**: Editar ou excluir livros
   - **Reservas**: Aprovar ou rejeitar reservas

## 💾 Armazenamento de Dados

O sistema utiliza **localStorage** do navegador para persistir dados:
- `library_books`: Lista de livros cadastrados
- `library_reservations`: Lista de reservas realizadas
- `admin_session`: Sessão de autenticação do administrador

## 📱 Responsividade

O sistema é totalmente responsivo e funciona em:
- **Desktop** (1200px+)
- **Tablet** (768px - 1199px)
- **Mobile** (até 767px)

## 🎨 Design

O design foi inspirado no site de referência e inclui:
- **Gradientes modernos** e cores vibrantes
- **Animações suaves** e efeitos hover
- **Tipografia clara** e hierarquia visual
- **Componentes interativos** (modais, formulários)
- **Ícones emoji** para melhor UX

## 🔧 Tecnologias Utilizadas

- **HTML5**: Estrutura semântica
- **CSS3**: Estilos modernos com Flexbox e Grid
- **JavaScript ES6+**: Funcionalidades interativas
- **LocalStorage**: Persistência de dados
- **Design Responsivo**: Mobile-first approach

## 📋 Funcionalidades Implementadas

### ✅ Área do Usuário
- [x] Banner "Destaque do Mês"
- [x] Sistema de busca avançada
- [x] Filtros por categoria
- [x] Exibição de livros em grade
- [x] Modal de sinopse
- [x] Formulário de reserva
- [x] Validação de formulários
- [x] Design responsivo

### ✅ Área Administrativa
- [x] Sistema de autenticação
- [x] Dashboard com estatísticas
- [x] Cadastro de livros
- [x] Gerenciamento de livros
- [x] Gerenciamento de reservas
- [x] Atividade recente
- [x] Validação de formulários
- [x] Design responsivo

## 🚀 Melhorias Futuras

- Integração com banco de dados real
- Sistema de usuários com perfis
- Notificações por email
- Relatórios avançados
- Sistema de multas
- Integração com APIs de livros

---

**Desenvolvido com ❤️ usando HTML, CSS e JavaScript puro**

