# 🎓 CORTE DIGITAL - TCC

## Sistema de Agendamento para Barbearias

---

## 🚀 INÍCIO RÁPIDO

### 1. Verificar Sistema
```bash
python scripts/verificar_sistema.py
```

### 2. Iniciar Servidor
```bash
python app.py
```

### 3. Acessar
```
http://localhost:5001
```

---

## 📚 DOCUMENTAÇÃO COMPLETA

### Arquivos Importantes
- **CHECKLIST_TCC.md** - Lista completa de funcionalidades
- **GUIA_RAPIDO_TCC.md** - Guia de inicialização e demonstração
- **README_TCC.md** - Este arquivo

---

## 🎯 FUNCIONALIDADES PRINCIPAIS

### Para o Cliente
1. **Dashboard Intuitivo**
   - Estatísticas em tempo real
   - Próximos agendamentos
   - Gasto no mês

2. **Sistema de Agendamento em 4 Etapas**
   - Escolher serviço
   - Escolher barbeiro
   - Escolher data/hora
   - Confirmar

3. **Gerenciamento**
   - Ver agendamentos
   - Cancelar agendamentos
   - Histórico completo
   - Editar perfil

### Design
- Interface moderna e profissional
- Paleta de cores azul
- Animações suaves
- Responsivo (mobile/desktop)
- Tema claro/escuro

---

## 🛠️ TECNOLOGIAS UTILIZADAS

### Backend
- **Python 3.11**
- **Flask 2.3** - Framework web
- **Flask-SQLAlchemy** - ORM
- **PyMySQL** - Conector MySQL
- **Flask-CORS** - CORS

### Frontend
- **HTML5**
- **CSS3** - Gradientes, animações
- **JavaScript ES6+**
- **Font Awesome** - Ícones

### Banco de Dados
- **MySQL 8.0**

---

## 📊 ESTRUTURA DO PROJETO

```
CorteDigital/
├── app.py                          # Aplicação principal
├── db.py                           # Modelos do banco
├── services.py                     # Lógica de negócio
├── requirements.txt                # Dependências
├── .env                           # Configurações
│
├── static/
│   ├── css/
│   │   ├── dashboard-intuitiva.css    # Dashboard
│   │   └── novo-agendamento.css       # Agendamento
│   └── js/
│       ├── app.js                     # JavaScript principal
│       ├── novo-agendamento.js        # Sistema de agendamento
│       └── micro-interactions.js      # Animações
│
├── templates/
│   ├── cliente_dashboard.html         # Dashboard cliente
│   ├── barbeiro_dashboard.html        # Dashboard barbeiro
│   └── index.html                     # Página inicial
│
├── routes/                            # Rotas da API
│   ├── appointments.py
│   ├── auth.py
│   └── notifications.py
│
└── scripts/                           # Scripts utilitários
    ├── verificar_sistema.py
    ├── create_database.py
    └── seed_services.py
```

---

## 🎨 PALETA DE CORES

### Cores Principais
- **Azul**: #3b82f6 (Blue 500)
- **Azul Escuro**: #2563eb (Blue 600)
- **Verde**: #10b981 (Emerald 500)
- **Vermelho**: #ef4444 (Red 500)
- **Laranja**: #f59e0b (Amber 500)

---

## 📝 FLUXO DO USUÁRIO

### Cliente
```
Login → Dashboard → Novo Agendamento → Confirmar → Meus Agendamentos
                  ↓
                Perfil / Histórico
```

### Agendamento (4 Etapas)
```
1. Serviço → 2. Barbeiro → 3. Data/Hora → 4. Confirmar
```

---

## ✅ CHECKLIST PRÉ-APRESENTAÇÃO

### Ambiente
- [ ] MySQL rodando
- [ ] Banco de dados criado
- [ ] Servidor iniciando sem erros
- [ ] Navegador aberto em localhost:5001

### Dados
- [ ] Barbeiro cadastrado
- [ ] Serviços cadastrados
- [ ] Cliente de teste
- [ ] Agendamentos de exemplo

### Teste
- [ ] Login funciona
- [ ] Dashboard carrega
- [ ] Agendamento funciona
- [ ] Cancelamento funciona
- [ ] Perfil editável

---

## 🎤 ROTEIRO DE APRESENTAÇÃO (10 min)

### 1. Introdução (2 min)
- Problema: dificuldade de agendar
- Solução: sistema web moderno

### 2. Demonstração (5 min)
- Login
- Dashboard
- Novo agendamento (4 etapas)
- Cancelar
- Histórico
- Perfil

### 3. Técnico (2 min)
- Arquitetura
- Tecnologias
- Código limpo

### 4. Conclusão (1 min)
- Resultados
- Melhorias futuras

---

## 💡 PERGUNTAS FREQUENTES

### P: Por que Flask?
**R:** Leve, flexível, perfeito para APIs REST, fácil de aprender.

### P: Como funciona o agendamento?
**R:** Sistema em 4 etapas com validação em tempo real de horários disponíveis.

### P: É seguro?
**R:** Sim, usa sessões, validação de dados, proteção contra SQL injection.

### P: É escalável?
**R:** Sim, arquitetura modular permite adicionar funcionalidades facilmente.

### P: É responsivo?
**R:** Sim, funciona em desktop, tablet e mobile.

---

## 🔮 MELHORIAS FUTURAS

1. Notificações Push
2. Pagamento Online
3. Sistema de Avaliações
4. Chat Cliente-Barbeiro
5. Relatórios Analíticos
6. App Mobile Nativo
7. Integração com Calendário
8. Multi-idiomas

---

## 📞 SUPORTE

### Se algo der errado:
1. Mantenha a calma
2. Explique o que deveria acontecer
3. Mostre o código
4. Use screenshots de backup

### Lembre-se:
- Você conhece o projeto
- Pequenos bugs acontecem
- Mostre seu conhecimento
- A banca quer ver aprendizado

---

## 🎉 MENSAGEM FINAL

**Seu projeto está:**
- ✅ Funcional
- ✅ Bem implementado
- ✅ Visualmente atraente
- ✅ Pronto para apresentação

**Você:**
- ✅ Trabalhou duro
- ✅ Aprendeu muito
- ✅ Criou algo útil
- ✅ Está preparado

---

## 🍀 BOA SORTE NA APRESENTAÇÃO!

**Você vai arrasar! 💪**

---

*Desenvolvido com dedicação para TCC*
*Pronto para apresentação na sexta-feira*
