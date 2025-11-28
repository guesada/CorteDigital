# 💈 Corte Digital - Sistema de Agendamento para Barbearias

Sistema completo de gerenciamento de agendamentos para barbearias desenvolvido em Python/Flask.

## 🚀 Funcionalidades

### Para Clientes
- ✅ Cadastro e login
- ✅ Agendamento de serviços
- ✅ Escolha de barbeiro com preços personalizados
- ✅ Visualização de histórico de agendamentos
- ✅ Sistema de avaliações (1-5 estrelas)
- ✅ Cancelamento de agendamentos
- ✅ Dashboard com estatísticas pessoais

### Para Barbeiros
- ✅ Dashboard profissional com métricas
- ✅ Agenda inteligente com filtros
- ✅ Gerenciamento de preços personalizados
- ✅ Visualização de avaliações
- ✅ Estatísticas avançadas:
  - Receita diária/semanal/mensal
  - Serviços mais populares
  - Taxa de conclusão e cancelamento
  - Análise de retenção de clientes
  - Horários e dias mais populares
- ✅ Controle de agendamentos (confirmar/concluir/cancelar)

## 📋 Pré-requisitos

- Python 3.8 ou superior
- pip (gerenciador de pacotes Python)

## 🔧 Instalação

### 1. Clone ou baixe o projeto

```bash
# Se tiver git instalado
git clone <url-do-repositorio>
cd CorteDigital

# Ou simplesmente extraia o arquivo ZIP
```

### 2. Crie um ambiente virtual (recomendado)

```bash
# Windows
python -m venv venv
venv\Scripts\activate

# Linux/Mac
python3 -m venv venv
source venv/bin/activate
```

### 3. Instale as dependências

```bash
pip install -r requirements.txt
```

### 4. Configure o banco de dados

Execute o script de setup completo que cria todas as tabelas e popula com dados de exemplo:

```bash
python setup_complete.py
```

Este script irá:
- ✅ Criar todas as tabelas do banco de dados
- ✅ Criar 3 barbeiros de exemplo
- ✅ Criar 4 clientes de exemplo
- ✅ Criar serviços padrão (Corte, Barba, Corte + Barba)
- ✅ Criar preços personalizados para cada barbeiro
- ✅ Criar agendamentos de exemplo dos últimos 30 dias
- ✅ Criar avaliações de exemplo

### 5. Inicie o servidor

```bash
python app.py
```

O sistema estará disponível em: **http://localhost:5001**

## 🔐 Credenciais de Acesso

### Barbeiros
| Email | Senha | Nome |
|-------|-------|------|
| joao@barbershop.com | senha123 | João Silva |
| pedro@barbershop.com | senha123 | Pedro Santos |
| carlos@barbershop.com | senha123 | Carlos Oliveira |

### Clientes
| Email | Senha | Nome |
|-------|-------|------|
| maria@email.com | senha123 | Maria Santos |
| jose@email.com | senha123 | José Silva |
| ana@email.com | senha123 | Ana Costa |
| paulo@email.com | senha123 | Paulo Souza |

## 📁 Estrutura do Projeto

```
CorteDigital/
├── app.py                      # Aplicação principal Flask
├── db.py                       # Modelos do banco de dados
├── services.py                 # Lógica de negócio
├── setup_complete.py           # Script de setup automático
├── requirements.txt            # Dependências Python
├── routes/                     # Rotas da API
│   ├── __init__.py
│   ├── auth.py                # Autenticação
│   ├── appointments.py        # Agendamentos
│   ├── barber_prices.py       # Preços personalizados
│   ├── reviews.py             # Avaliações
│   ├── statistics.py          # Estatísticas avançadas
│   ├── info.py                # Informações gerais
│   └── pages.py               # Páginas HTML
├── templates/                  # Templates HTML
│   ├── index.html
│   ├── cliente_dashboard.html
│   └── barbeiro_dashboard.html
└── static/                     # Arquivos estáticos
    ├── css/                   # Estilos CSS
    │   ├── shared/
    │   ├── cliente/
    │   └── barbeiro/
    └── js/                    # JavaScript
        ├── shared/
        ├── cliente/
        └── barbeiro/
```

## 🗄️ Banco de Dados

O sistema utiliza SQLite por padrão (arquivo `corte_digital.db`).

### Tabelas principais:
- **clientes** - Dados dos clientes
- **barbers** - Dados dos barbeiros
- **services** - Serviços disponíveis
- **appointments** - Agendamentos
- **barber_prices** - Preços personalizados por barbeiro
- **reviews** - Avaliações dos clientes
- **statistics** - Estatísticas do sistema

## 🔄 Resetar o Banco de Dados

Se precisar resetar o banco de dados:

```bash
# Deletar o banco atual
python drop_database.py

# Recriar tudo do zero
python setup_complete.py
```

## 🎨 Tecnologias Utilizadas

### Backend
- **Flask** - Framework web Python
- **SQLAlchemy** - ORM para banco de dados
- **Flask-CORS** - Suporte a CORS

### Frontend
- **HTML5/CSS3** - Estrutura e estilo
- **JavaScript (Vanilla)** - Interatividade
- **Font Awesome** - Ícones

### Banco de Dados
- **SQLite** - Banco de dados relacional

## 📊 Funcionalidades Avançadas

### Sistema de Avaliações
- Clientes podem avaliar barbeiros após o serviço
- Avaliação de 1-5 estrelas com comentário opcional
- Média de avaliações calculada automaticamente
- Estatísticas de distribuição de avaliações

### Preços Dinâmicos
- Cada barbeiro define seus próprios preços
- Cliente vê preços atualizados ao escolher o barbeiro
- Sistema de preços padrão como fallback

### Estatísticas Avançadas
- Dashboard com métricas em tempo real
- Gráficos de receita
- Análise de retenção de clientes
- Identificação de horários e serviços mais populares

### Validações Inteligentes
- Barbeiro não pode concluir agendamento futuro
- Cliente não pode cancelar agendamento passado
- Validação de conflitos de horário
- Prevenção de agendamentos em datas/horários passados

## 🐛 Solução de Problemas

### Erro ao instalar dependências
```bash
# Atualize o pip
python -m pip install --upgrade pip

# Tente instalar novamente
pip install -r requirements.txt
```

### Erro "Port already in use"
```bash
# Mude a porta no app.py (linha final)
app.run(host="127.0.0.1", port=5002, debug=True)
```

### Banco de dados corrompido
```bash
# Delete o arquivo do banco
del corte_digital.db  # Windows
rm corte_digital.db   # Linux/Mac

# Recrie o banco
python setup_complete.py
```

## 📝 Notas para o TCC

Este sistema foi desenvolvido como projeto de TCC e inclui:

- ✅ Arquitetura MVC (Model-View-Controller)
- ✅ API RESTful
- ✅ Autenticação e autorização
- ✅ Validações de dados
- ✅ Tratamento de erros
- ✅ Interface responsiva
- ✅ Código documentado
- ✅ Boas práticas de programação

## 👨‍💻 Desenvolvimento

Para desenvolvimento, ative o modo debug no `app.py`:

```python
app.run(host="127.0.0.1", port=5001, debug=True)
```

## 📄 Licença

Este projeto foi desenvolvido para fins educacionais (TCC).

## 🤝 Suporte

Para dúvidas ou problemas:
1. Verifique a seção de Solução de Problemas
2. Execute `python setup_complete.py` novamente
3. Verifique se todas as dependências estão instaladas

---

**Desenvolvido com ❤️ para o TCC**
