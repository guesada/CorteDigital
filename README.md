# 💈 Sistema de Barbearia - Simples e Elegante

Um sistema profissional de barbearia com login/cadastro para cliente e barbeiro.

## 🎯 Características

✅ **Página Inicial Limpa**
- Duas opções principais: Cliente e Barbeiro
- Modal com login e cadastro integrados
- Design simples e agradável

✅ **Painel do Cliente**
- Agendar serviços
- Visualizar agendamentos
- Cancelar agendamentos
- Saudação personalizada

✅ **Painel do Barbeiro**
- Visualizar todos os agendamentos
- Confirmar/Recusar agendamentos
- Gerenciar estoque
- Interface simples e funcional

✅ **Autenticação**
- Login com email e senha
- Cadastro de novos usuários
- Sessões seguras
- Logout

## 🚀 Como Usar

### 1. Ativar Ambiente Virtual
```bash
cd "/home/leo/Área de trabalho/CorteDigital/CorteDigital"
source venv/bin/activate
```

### 2. Rodar a Aplicação
```bash
python app.py
```

### 3. Acessar no Navegador
```
http://127.0.0.1:5001
```

## 📁 Estrutura

```
CorteDigital/
├── app.py                          # Backend Flask
├── requirements.txt                # Dependências
├── templates/
│   ├── index.html                 # Página inicial
│   ├── cliente_dashboard.html      # Dashboard cliente
│   └── barbeiro_dashboard.html     # Dashboard barbeiro
└── static/css/
    └── styles.css                 # Estilos
```

## 🔌 Rotas

### Autenticação
- `POST /cliente/login` - Login do cliente
- `POST /cliente/cadastro` - Cadastro do cliente
- `POST /barbeiro/login` - Login do barbeiro
- `POST /barbeiro/cadastro` - Cadastro do barbeiro
- `GET /logout` - Fazer logout

### Cliente
- `GET /cliente/dashboard` - Dashboard
- `GET /api/cliente/agendamentos` - Lista agendamentos
- `POST /api/cliente/agendar` - Criar agendamento
- `POST /api/cliente/cancelar` - Cancelar agendamento

### Barbeiro
- `GET /barbeiro/dashboard` - Dashboard
- `GET /api/barbeiro/agendamentos` - Lista agendamentos
- `POST /api/barbeiro/confirmar` - Confirmar agendamento
- `POST /api/barbeiro/recusar` - Recusar agendamento
- `GET /api/barbeiro/estoque` - Lista estoque
- `POST /api/barbeiro/estoque/atualizar` - Atualizar estoque

## 🎨 Design

- **Cores:** Roxo (#667eea) e gradientes
- **Tipografia:** Inter
- **Responsivo:** Sim (mobile, tablet, desktop)
- **Simples:** Sem excessos, apenas o necessário

## 🧪 Teste Rápido

1. Acesse http://127.0.0.1:5001
2. Clique em "Cliente" ou "Barbeiro"
3. Cadastre uma conta (ou faça login se já tiver)
4. Use as funcionalidades

### Dados de Teste
- Email: teste@email.com
- Senha: 123456

## 📝 Tecnologias

- Python 3 + Flask
- HTML5 + CSS3
- JavaScript Vanilla
- JSON para dados

## ✨ Funcionalidades

**Cliente:**
- Agendar serviço
- Visualizar agendamentos
- Cancelar agendamento
- Saudação personalizada

**Barbeiro:**
- Visualizar agendamentos
- Confirmar/Recusar agendamentos
- Gerenciar estoque
- Atualizar quantidades

## 🔒 Segurança

- Senhas com hash SHA256
- Sessões seguras
- Validação de dados
- Autenticação obrigatória

---

**Aproveite! 💈**
