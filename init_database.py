"""
Script de Inicialização Automática do Banco de Dados
Cria apenas a estrutura do banco de dados (sem dados de exemplo)
"""

def init_database_with_sample_data(app, db):
    """Inicializa o banco de dados (apenas estrutura, sem dados de exemplo)"""
    
    from db import Service
    
    with app.app_context():
        print("🔍 Verificando banco de dados...")
        
        # Criar todas as tabelas
        db.create_all()
        print("✅ Tabelas criadas/verificadas")
        
        # Verificar se já existem serviços básicos
        if Service.query.count() > 0:
            print("ℹ️  Banco de dados já possui dados")
            return
        
        print("🚀 Criando serviços básicos do sistema...")
        
        # ===== CRIAR APENAS SERVIÇOS BÁSICOS =====
        print("📦 Criando serviços básicos...")
        servicos = [
            Service(
                nome="Corte",
                preco=35.00,
                duracao=30,
                descricao="Corte de cabelo masculino profissional"
            ),
            Service(
                nome="Barba",
                preco=25.00,
                duracao=20,
                descricao="Aparar e modelar barba"
            ),
            Service(
                nome="Corte + Barba",
                preco=55.00,
                duracao=45,
                descricao="Combo completo: corte + barba"
            )
        ]
        
        for servico in servicos:
            db.session.add(servico)
        
        db.session.commit()
        print(f"✅ {len(servicos)} serviços básicos criados")
        
        # ===== RESUMO =====
        print("\n" + "="*60)
        print("✨ BANCO DE DADOS INICIALIZADO COM SUCESSO!")
        print("="*60)
        print(f"\n📊 Estrutura criada:")
        print(f"   • Tabelas: clientes, barbers, services, appointments, barber_prices, statistics")
        print(f"   • Serviços básicos: {len(servicos)}")
        print(f"\n📝 Próximos passos:")
        print(f"   1. Cadastre barbeiros pela interface de registro")
        print(f"   2. Cadastre clientes pela interface de registro")
        print(f"   3. Configure preços e horários no dashboard do barbeiro")
        print(f"   4. Comece a agendar serviços!")
        print("\n" + "="*60)
        print("🚀 Sistema pronto para cadastros!")
        print("="*60 + "\n")
