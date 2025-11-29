"""
Script para configurar horários padrão para barbeiros que não têm horários configurados
"""
import sys
import os

# Adicionar o diretório pai ao path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from app import app
from db import db, Barber, DEFAULT_HORARIOS
import json

def setup_barber_schedules():
    """Configura horários padrão para barbeiros sem horários"""
    with app.app_context():
        print("🕐 Configurando horários de trabalho para barbeiros...")
        
        # Horários padrão
        default_schedule = [
            {
                "dia": "Segunda",
                "ativo": True,
                "horarios": DEFAULT_HORARIOS.copy()
            },
            {
                "dia": "Terça",
                "ativo": True,
                "horarios": DEFAULT_HORARIOS.copy()
            },
            {
                "dia": "Quarta",
                "ativo": True,
                "horarios": DEFAULT_HORARIOS.copy()
            },
            {
                "dia": "Quinta",
                "ativo": True,
                "horarios": DEFAULT_HORARIOS.copy()
            },
            {
                "dia": "Sexta",
                "ativo": True,
                "horarios": DEFAULT_HORARIOS.copy()
            },
            {
                "dia": "Sábado",
                "ativo": False,
                "horarios": []
            },
            {
                "dia": "Domingo",
                "ativo": False,
                "horarios": []
            }
        ]
        
        # Buscar todos os barbeiros
        barbeiros = Barber.query.all()
        
        updated_count = 0
        for barbeiro in barbeiros:
            # Verificar se já tem horários configurados
            if not barbeiro.disponibilidade or barbeiro.disponibilidade == '[]':
                barbeiro.disponibilidade = json.dumps(default_schedule, ensure_ascii=False)
                updated_count += 1
                print(f"✅ Horários configurados para: {barbeiro.nome}")
        
        # Salvar alterações
        db.session.commit()
        
        print(f"\n✨ Concluído! {updated_count} barbeiro(s) atualizado(s)")
        print(f"📊 Total de barbeiros: {len(barbeiros)}")

if __name__ == '__main__':
    setup_barber_schedules()
