# 💈 Corte Digital v2.0.0

> Sistema profissional de agendamento para barbearias com IA integrada

[![Python](https://img.shields.io/badge/Python-3.9+-blue.svg)](https://www.python.org/)
[![Flask](https://img.shields.io/badge/Flask-2.3+-green.svg)](https://flask.palletsprojects.com/)
[![License](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

## 🚀 Features

### ✨ Core Features
- ✅ **Sistema de Agendamento** - Gestão completa de agendamentos
- ✅ **Multi-usuário** - Clientes e Barbeiros
- ✅ **Chat em Tempo Real** - WebSocket integrado
- ✅ **Notificações Push** - Sistema de notificações em tempo real
- ✅ **Sistema de Avaliações** - Reviews e ratings

### 🤖 IA & Machine Learning
- ✅ **Recomendações Inteligentes** - Sugestões baseadas em padrões
- ✅ **Análise de Comportamento** - Insights personalizados
- ✅ **Previsão de Horários** - Sugestões de próximos agendamentos
- ✅ **Recomendação de Serviços** - Baseado em histórico

### 🔒 Segurança
- ✅ **Validação Avançada** - Email, telefone, CPF
- ✅ **Rate Limiting** - Proteção contra spam
- ✅ **Sanitização de Inputs** - Proteção XSS
- ✅ **Sessões Seguras** - HTTPOnly cookies

### 📊 Analytics
- ✅ **Dashboard Completo** - Métricas em tempo real
- ✅ **Relatórios** - Faturamento, agendamentos, clientes
- ✅ **Gráficos Interativos** - Visualização de dados

## 🏗️ Arquitetura

```
corte-digital/
├── app/
│   ├── api/v1/          # API REST versão 1
│   ├── core/            # Módulos fundamentais
│   ├── models/          # Modelos de dados
│   ├── services/        # Lógica de negócio
│   ├── utils/           # Utilitários
│   ├── static/          # Arquivos estáticos
│   └── templates/       # Templates HTML
├── tests/               # Testes automatizados
├── logs/                # Logs da aplicação
├── uploads/             # Arquivos enviados
└── migrations/          # Migrações de banco
```

## 🚀 Quick Start

### Pré-requisitos

- Python 3.9+
- pip
- virtualenv (recomendado)

### Instalação

1. **Clone o repositório**
```bash
git clone https://github.com/seu-usuario/corte-digital.git
cd corte-digital
```

2. **Crie ambiente virtual**
```bash
python -m venv venv
source venv/bin/activate  # Linux/Mac
venv\Scripts\activate     # Windows
```

3. **Instale dependências**
```bash
pip install -r requirements.txt
```

4. **Configure variáveis de ambiente**
```bash
cp .env.example .env
# Edite .env com suas configurações
```

5. **Inicialize o banco de dados**
```bash
flask init-db
```

6. **Execute a aplicação**
```bash
python run.py
```

Acesse: http://localhost:5001

## 📚 API Documentation

### Autenticação

#### POST /api/v1/auth/login
Login de usuário

```json
{
  "email": "user@example.com",
  "password": "senha123"
}
```

#### POST /api/v1/auth/register
Registro de novo usuário

```json
{
  "name": "João Silva",
  "email": "joao@example.com",
  "phone": "(11) 98765-4321",
  "password": "Senha@123"
}
```

### Agendamentos

#### GET /api/v1/appointments
Lista agendamentos do usuário

#### POST /api/v1/appointments
Cria novo agendamento

```json
{
  "barberId": 1,
  "serviceId": 2,
  "date": "2025-12-15",
  "time": "14:00"
}
```

### IA & Recomendações

#### GET /api/v1/ai/patterns
Análise de padrões do usuário

#### GET /api/v1/ai/suggest-appointment
Sugestões de próximos agendamentos

#### GET /api/v1/ai/insights
Insights personalizados

## 🧪 Testes

```bash
# Executar todos os testes
pytest

# Com coverage
pytest --cov=app tests/

# Testes específicos
pytest tests/test_api/
```

## 🐳 Docker

```bash
# Build
docker build -t corte-digital .

# Run
docker-compose up
```

## 📊 Monitoramento

### Logs
```bash
tail -f logs/app.log
```

### Health Check
```
GET /health
```

## 🔧 Configuração

### Ambientes

- **Development**: Desenvolvimento local
- **Staging**: Testes pré-produção
- **Production**: Produção

Configure via variável `FLASK_ENV`:

```bash
export FLASK_ENV=production
```

### Variáveis de Ambiente

```env
# App
SECRET_KEY=sua_chave_secreta
FLASK_ENV=development

# Database
DATABASE_PATH=corte_digital.db

# Email
MAIL_SERVER=smtp.gmail.com
MAIL_PORT=587
MAIL_USERNAME=seu_email@gmail.com
MAIL_PASSWORD=sua_senha

# Redis (opcional)
REDIS_URL=redis://localhost:6379/0
```

## 🤝 Contribuindo

1. Fork o projeto
2. Crie uma branch (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## 📝 Changelog

### v2.0.0 (2025-12-03)
- ✨ Arquitetura completamente refatorada
- ✨ API REST v1 com versionamento
- ✨ Sistema de IA para recomendações
- ✨ Validações avançadas
- ✨ Cache integrado
- ✨ Logging estruturado
- ✨ Testes automatizados
- ✨ Docker support

### v1.0.0 (2025-11-01)
- 🎉 Versão inicial

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](LICENSE) para mais detalhes.

## 👥 Equipe

- **Desenvolvimento** - Corte Digital Team
- **Design** - UI/UX Team
- **IA** - ML Team

## 🙏 Agradecimentos

- Flask Community
- Contributors
- Beta Testers

---

**Desenvolvido com ❤️ para revolucionar o agendamento em barbearias**

[Website](https://cortedigital.com) • [Documentação](https://docs.cortedigital.com) • [Suporte](mailto:suporte@cortedigital.com)
