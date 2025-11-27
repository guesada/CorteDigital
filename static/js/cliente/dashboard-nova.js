// ===== NOVA DASHBOARD DO CLIENTE =====

async function loadClienteDashboard() {
    console.log('📊 Carregando dashboard do cliente...');
    
    try {
        const response = await fetch('/api/appointments');
        const result = await response.json();
        
        if (!result.success) {
            throw new Error(result.message || 'Erro ao carregar agendamentos');
        }
        
        const appointments = result.data || [];
        console.log('📦 Agendamentos recebidos:', appointments.length);
        
        // Calcular estatísticas
        const today = new Date().toISOString().split('T')[0];
        
        const ativos = appointments.filter(a => 
            ['agendado', 'confirmado', 'pendente'].includes(a.status)
        ).length;
        
        const concluidos = appointments.filter(a => 
            a.status === 'concluido'
        ).length;
        
        // Próximo agendamento
        const proximos = appointments
            .filter(a => {
                const aptDate = a.data || a.date;
                return aptDate >= today && ['agendado', 'confirmado', 'pendente'].includes(a.status);
            })
            .sort((a, b) => {
                const dateA = a.data || a.date;
                const dateB = b.data || b.date;
                if (dateA !== dateB) return dateA.localeCompare(dateB);
                return (a.horario || a.time).localeCompare(b.horario || b.time);
            });
        
        // Atualizar stats
        document.getElementById('stat-total').textContent = ativos;
        document.getElementById('stat-concluidos').textContent = concluidos;
        
        if (proximos.length > 0) {
            const proximo = proximos[0];
            const date = new Date((proximo.data || proximo.date) + 'T00:00:00');
            const dias = Math.ceil((date - new Date()) / (1000 * 60 * 60 * 24));
            document.getElementById('stat-proximo').textContent = dias === 0 ? 'Hoje' : `${dias}d`;
        } else {
            document.getElementById('stat-proximo').textContent = '--';
        }
        
        // Renderizar próximos agendamentos
        renderProximosAgendamentos(proximos.slice(0, 3));
        
    } catch (error) {
        console.error('❌ Erro ao carregar dashboard:', error);
    }
}

function renderProximosAgendamentos(appointments) {
    const container = document.getElementById('proximos-agendamentos-lista');
    
    if (appointments.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <div class="empty-icon">
                    <i class="fas fa-calendar-times"></i>
                </div>
                <div class="empty-title">Nenhum agendamento próximo</div>
                <div class="empty-text">Que tal agendar seu próximo corte?</div>
                <button class="empty-action" onclick="showSection('agendamentos-cliente'); setTimeout(() => switchTab('novo-agendamento'), 100);">
                    Agendar Agora
                </button>
            </div>
        `;
        return;
    }
    
    container.innerHTML = appointments.map(apt => {
        const aptDate = apt.data || apt.date;
        const aptTime = apt.horario || apt.time;
        const aptService = apt.servico || apt.service;
        const aptBarber = apt.barbeiro_nome || apt.barber_name || 'Barbeiro';
        const aptPrice = apt.preco || apt.price || 0;
        
        const date = new Date(aptDate + 'T00:00:00');
        const day = date.getDate();
        const month = date.toLocaleDateString('pt-BR', { month: 'short' }).toUpperCase();
        
        return `
            <div class="appointment-card">
                <div class="appointment-header">
                    <div class="appointment-date">
                        <div class="appointment-day">
                            <div class="appointment-day-number">${day}</div>
                            <div class="appointment-day-month">${month}</div>
                        </div>
                        <div class="appointment-info">
                            <div class="appointment-time">${aptTime}</div>
                            <div class="appointment-service">${aptService}</div>
                        </div>
                    </div>
                    <div class="appointment-status ${apt.status}">${apt.status}</div>
                </div>
                <div class="appointment-details">
                    <div class="appointment-detail">
                        <i class="fas fa-user-tie"></i>
                        ${aptBarber}
                    </div>
                    <div class="appointment-detail">
                        <i class="fas fa-dollar-sign"></i>
                        R$ ${parseFloat(aptPrice).toFixed(2).replace('.', ',')}
                    </div>
                </div>
            </div>
        `;
    }).join('');
}

// Carregar dashboard quando estiver pronto
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', loadClienteDashboard);
} else {
    loadClienteDashboard();
}

// Exportar
window.loadClienteDashboard = loadClienteDashboard;
