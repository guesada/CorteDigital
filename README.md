# 💈 Corte Digital - Sistema de Agendamento para Barbearias

Sistema web completo para gerenciamento de agendamentos em barbearias, desenvolvido com Flask e SQLAlchemy.

## 🚀 Início Rápido

### 1. Instalar Dependências
```bash
pip install -r requirements.txt
```

### 2. Executar o Sistema
```bash
python app.py
```

### 3. Acessar
```
http://localhost:5001
```

## 📁 Estrutura do Projeto

```
CorteDigital/
├── app.py                      # Aplicação principal
├── db.py                       # Modelos do banco de dados
├── services.py                 # Lógica de negócio
├── requirements.txt            # Dependências
│
├── config/                     # Configurações
│   └── config_database.py      # Configuração do banco
│
├── database/                   # Banco de dados
│   ├── init_database.py        # Inicialização
│   └── corte_digital.db        # SQLite (criado automaticamente)
│
├── routes/                     # Rotas da API
│   ├── __init__.py
│   ├── auth.py                 # Autenticação
│   ├── appointments.py         # Agendamentos
│   ├── barber_prices.py        # Preços
│   ├── barber_schedule.py      # Horários de trabalho
│   ├── info.py                 # Informações
│   └── pages.py                # Páginas
│
├── static/                     # Arquivos estáticos
│   ├── css/                    # Estilos
│   └── js/                     # JavaScript
│
├── templates/                  # Templates HTML
│   ├── index.html
│   ├── cliente_dashboard.html
│   └── barbeiro_dashboard.html
│
└── scripts/                    # Scripts utilitários
    ├── backup_database.py
    ├── restore_database.py
    └── test_mysql.py
```

## ⚙️ Configuração

### Modo SQLite (Padrão)
Não precisa configurar nada. O sistema usa SQLite automaticamente.

### Modo MySQL (Escola/Produção)
Edite `config/config_database.py`:

```python
MYSQL_CONFIG = {
    'user': 'root',
    'password': 'sua_senha',
    'host': 'localhost',
    'port': 3306,
    'database': 'corte_digital'
}

DATABASE_MODE = 'mysql'  # ou 'sqlite' ou 'auto'
```

## 🎯 Funcionalidades

### Para Barbeiros
- ✅ Dashboard com estatísticas em tempo real
- ✅ Agenda inteligente com filtros
- ✅ Gerenciamento de preços personalizados
- ✅ Configuração de horários de trabalho
- ✅ Confirmação e conclusão de agendamentos

### Para Clientes
- ✅ Agendamento em 4 etapas
- ✅ Visualização de agendamentos
- ✅ Cancelamento de agendamentos
- ✅ Histórico completo
- ✅ Dashboard pessoal

## 🛠️ Tecnologias

- **Backend:** Python 3.8+, Flask 2.3.3
- **ORM:** Flask-SQLAlchemy 3.0.3
- **Banco:** MySQL 8.0+ ou SQLite 3
- **Frontend:** HTML5, CSS3, JavaScript (ES6+)

## 📝 Scripts Úteis

```bash
# Testar sistema
python scripts/test_system.py

# Testar MySQL
python scripts/test_mysql.py

# Backup do banco
python scripts/backup_database.py

# Restaurar backup
python scripts/restore_database.py
```

## 🔐 Primeiro Uso

1. Execute o sistema
2. Cadastre um barbeiro
3. Configure preços e horários no dashboard
4. Cadastre um cliente
5. Faça um agendamento teste

## 📊 Banco de Dados

O sistema cria automaticamente:
- 6 tabelas (clientes, barbers, services, appointments, barber_prices, statistics)
- 3 serviços básicos (Corte, Barba, Corte + Barba)

## 🆘 Suporte

### Problemas Comuns

**Porta 5001 em uso:**
```python
# Mude em app.py (última linha)
app.run(host="127.0.0.1", port=5002, debug=True)
```

**Dependências não instaladas:**
```bash
pip install -r requirements.txt
```

**MySQL não conecta:**
- Verifique credenciais em `config/config_database.py`
- Use modo SQLite: `DATABASE_MODE = 'sqlite'`

## 📄 Licença

Projeto desenvolvido para TCC.

---

**Desenvolvido com ❤️ para facilitar o gerenciamento de barbearias**
