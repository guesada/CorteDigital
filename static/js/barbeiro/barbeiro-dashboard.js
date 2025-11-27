// ===== DASHBOARD PROFISSIONAL DO BARBEIRO =====
console.log('📦 Arquivo barbeiro-dashboard.js carregado');

// Estado global do dashboard
const dashboardState = {
    appointments: [],
    products: [],
    loading: false,
    currentFilter: 'todos',
    currentView: 'week',
    currentWeekStart: null
};

// ===== INICIALIZAÇÃO =====
async function initBarbeiroDashboard() {
    console.log('🚀 Inicializando Dashboard Profissional do Barbeiro');
    
    try {
        await loadProfessionalMetrics();
        console.log('✅ Dashboard profissional carregado com sucesso');
    } catch (error) {
        console.error('❌ Erro ao inicializar dashboard:', error);
        showErrorMessage('Erro ao carregar dashboard');
    }
}

// ===== MÉTRICAS PROFISSIONAIS =====
async function loadProfessionalMetrics() {
    try {
        console.log('📊 Carregando métricas profissionais...');
        const response = await fetch('/api/appointments');
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const result = await response.json();
        console.log('📦 Resposta da API:', result);
        
        // A API retorna {success: true, data: [...]}
        if (!result.success) {
            throw new Error(result.message || 'Erro ao carregar agendamentos');
        }
        
        const appointments = result.data || [];
        console.log('📦 Agendamentos processados:', appointments.length);
        dashboardState.appointments = appointments;
        
        const now = new Date();
        const today = now.toISOString().split('T')[0];
        const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        
        // Agendamentos de hoje
        // Garantir que appointments é um array
        if (!Array.isArray(appointments)) {
            console.error('❌ appointments não é um array:', appointments);
            throw new Error('Dados de agendamentos inválidos');
        }
        
        console.log('📅 Filtrando agendamentos para hoje:', today);
        console.log('📦 Total de agendamentos:', appointments.length);
        
        // Normalizar campos: API retorna 'date' e 'time', mas código usa 'data' e 'horario'
        appointments.forEach(a => {
            if (!a.data && a.date) a.data = a.date;
            if (!a.horario && a.time) a.horario = a.time;
            if (!a.preco && a.total_price) a.preco = a.total_price;
            if (!a.cliente_nome && a.cliente) a.cliente_nome = a.cliente;
        });
        
        const todayAppointments = appointments.filter(a => {
            const aptDate = a.data;
            const status = a.status;
            console.log('🔍 Verificando agendamento:', { aptDate, status, today, agendamento: a });
            return aptDate === today && ['agendado', 'confirmado', 'pendente'].includes(status);
        });
        
        console.log('✅ Agendamentos de hoje:', todayAppointments.length);
        
        const completedToday = appointments.filter(a => {
            const aptDate = a.data;
            return aptDate === today && a.status === 'concluido';
        });
        
        const pendingToday = todayAppointments.filter(a => 
            ['agendado', 'pendente'].includes(a.status)
        );
        
        // Faturamento últimos 7 dias
        const last7Days = appointments.filter(a => {
            const date = new Date(a.data + 'T00:00:00');
            return date >= sevenDaysAgo && a.status === 'concluido';
        });
        const revenue7Days = last7Days.reduce((sum, a) => sum + (parseFloat(a.preco) || 0), 0);
        
        // Clientes únicos este mês
        const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0];
        const monthAppointments = appointments.filter(a => 
            a.data >= firstDayOfMonth && a.status === 'concluido'
        );
        const uniqueClients = new Set(monthAppointments.map(a => a.cliente_id)).size;
        
        // Ticket médio
        const completedAppointments = appointments.filter(a => a.status === 'concluido');
        const totalRevenue = completedAppointments.reduce((sum, a) => sum + (parseFloat(a.preco) || 0), 0);
        const ticketAverage = completedAppointments.length > 0 
            ? totalRevenue / completedAppointments.length 
            : 0;
        
        // Atualizar UI
        updateMetricElement('revenue-7days', revenue7Days.toFixed(2).replace('.', ','));
        
        console.log('📊 Métricas de hoje:', {
            total: todayAppointments.length,
            completed: completedToday.length,
            pending: pendingToday.length
        });
        
        updateMetricElement('appointments-today', todayAppointments.length);
        updateMetricElement('completed-today', completedToday.length);
        updateMetricElement('pending-today', pendingToday.length);
        
        updateMetricElement('clients-month', uniqueClients);
        updateMetricElement('new-clients', Math.floor(uniqueClients * 0.3));
        
        updateMetricElement('ticket-average', ticketAverage.toFixed(2).replace('.', ','));
        updateMetricElement('total-services', completedAppointments.length);
        
        // Atualizar hero stats
        updateMetricElement('hero-stat-hoje', todayAppointments.length);
        updateMetricElement('hero-stat-pendentes', pendingToday.length);
        updateMetricElement('hero-stat-faturamento', revenue7Days.toFixed(2).replace('.', ','));
        
        // Carregar outros componentes
        await loadAgendaPreviewData();
        await loadWeeklyChartData();
        await loadTopServicesData();
        
        console.log('✅ Todas as métricas carregadas');
        
    } catch (error) {
        console.error('❌ Erro ao carregar métricas:', error);
        showErrorMessage('Erro ao carregar dados do dashboard');
    }
}

function showErrorMessage(message) {
    console.error(message);
    // Mostrar mensagem de erro nos containers
    const containers = ['agenda-preview', 'weekly-chart', 'top-services-list'];
    containers.forEach(id => {
        const el = document.getElementById(id);
        if (el) {
            el.innerHTML = `
                <div style="text-align: center; padding: 20px; color: var(--color-text-secondary);">
                    <i class="fas fa-exclamation-triangle" style="font-size: 24px; margin-bottom: 8px;"></i>
                    <div>${message}</div>
                </div>
            `;
        }
    });
}

function updateMetricElement(id, value) {
    const element = document.getElementById(id);
    if (element) {
        element.textContent = value;
    }
}

// ===== PREVIEW DA AGENDA =====
async function loadAgendaPreviewData() {
    try {
        console.log('📅 Carregando preview da agenda...');
        const today = new Date().toISOString().split('T')[0];
        
        // Buscar agendamentos de hoje primeiro
        let previewAppointments = dashboardState.appointments.filter(a => {
            const aptDate = a.data;
            return aptDate === today && ['agendado', 'confirmado', 'pendente'].includes(a.status);
        });
        
        // Se não houver agendamentos hoje, mostrar os próximos
        if (previewAppointments.length === 0) {
            previewAppointments = dashboardState.appointments
                .filter(a => {
                    const aptDate = a.data;
                    return aptDate >= today && ['agendado', 'confirmado', 'pendente'].includes(a.status);
                })
                .sort((a, b) => {
                    const dateA = a.data;
                    const dateB = b.data;
                    if (dateA !== dateB) return dateA.localeCompare(dateB);
                    return a.horario.localeCompare(b.horario);
                });
        }
        
        console.log('📅 Agendamentos para preview:', previewAppointments.length);
        renderAgendaPreview(previewAppointments, today);
    } catch (error) {
        console.error('❌ Erro ao carregar preview da agenda:', error);
    }
}

function renderAgendaPreview(appointments, today) {
    const container = document.getElementById('agenda-preview');
    if (!container) return;
    
    if (appointments.length === 0) {
        container.innerHTML = `
            <div class="empty-agenda">
                <i class="fas fa-calendar-check"></i>
                <div class="empty-agenda-title">Nenhum agendamento próximo</div>
                <div class="empty-agenda-text">Aproveite para organizar seu espaço!</div>
            </div>
        `;
        return;
    }
    
    // Pegar os próximos 3
    const next3 = appointments.slice(0, 3);
    
    container.innerHTML = next3.map(apt => {
        const aptDate = apt.data;
        const aptTime = apt.horario;
        const aptService = apt.servico;
        const aptClient = apt.cliente_nome;
        const isToday = aptDate === today;
        
        // Formatar data se não for hoje
        let dateLabel = '';
        if (!isToday) {
            const date = new Date(aptDate + 'T00:00:00');
            dateLabel = date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
        }
        
        return `
            <div class="preview-appointment">
                <div class="preview-time">
                    ${aptTime}
                    ${dateLabel ? `<div style="font-size: 11px; opacity: 0.8;">${dateLabel}</div>` : ''}
                </div>
                <div class="preview-info">
                    <div class="preview-service">${aptService}</div>
                    <div class="preview-client">
                        <i class="fas fa-user"></i>
                        ${aptClient}
                    </div>
                </div>
                <div class="preview-status ${apt.status}">${apt.status}</div>
            </div>
        `;
    }).join('');
}

// ===== GRÁFICO SEMANAL =====
async function loadWeeklyChartData() {
    try {
        renderWeeklyChart(dashboardState.appointments);
    } catch (error) {
        console.error('Erro ao carregar gráfico semanal:', error);
    }
}

function renderWeeklyChart(appointments) {
    const container = document.getElementById('weekly-chart');
    if (!container) return;
    
    const daysShort = ['DOM', 'SEG', 'TER', 'QUA', 'QUI', 'SEX', 'SÁB'];
    const daysFull = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];
    const today = new Date();
    
    // Últimos 7 dias
    const chartData = [];
    for (let i = 6; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        const dateStr = date.toISOString().split('T')[0];
        const dayIndex = date.getDay();
        const dayShort = daysShort[dayIndex];
        const dayFull = daysFull[dayIndex];
        
        // Contar agendamentos concluídos
        const completed = appointments.filter(a => 
            a.data === dateStr && a.status === 'concluido'
        ).length;
        
        // Contar todos os agendamentos (incluindo pendentes)
        const total = appointments.filter(a => 
            a.data === dateStr && ['agendado', 'confirmado', 'concluido'].includes(a.status)
        ).length;
        
        // Calcular faturamento
        const revenue = appointments
            .filter(a => a.data === dateStr && a.status === 'concluido')
            .reduce((sum, a) => sum + (parseFloat(a.preco) || 0), 0);
        
        const isToday = i === 0;
        const dateFormatted = date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
        
        chartData.push({ 
            dayShort, 
            dayFull,
            completed, 
            total,
            revenue,
            isToday,
            dateFormatted,
            date: dateStr
        });
    }
    
    const maxCount = Math.max(...chartData.map(d => d.completed), 1);
    
    container.innerHTML = chartData.map(data => {
        const height = (data.completed / maxCount) * 100;
        const percentage = data.total > 0 ? Math.round((data.completed / data.total) * 100) : 0;
        
        return `
            <div class="chart-bar ${data.isToday ? 'today' : ''}" title="${data.dayFull}, ${data.dateFormatted}">
                <div class="chart-bar-info">
                    <div class="chart-bar-revenue">R$ ${data.revenue.toFixed(2).replace('.', ',')}</div>
                    <div class="chart-bar-stats">${data.completed}/${data.total}</div>
                </div>
                <div class="chart-bar-fill" style="height: ${height}%">
                    <div class="chart-bar-value">${data.completed}</div>
                </div>
                <div class="chart-bar-footer">
                    <div class="chart-bar-label">${data.dayShort}</div>
                    <div class="chart-bar-date">${data.dateFormatted}</div>
                    ${data.isToday ? '<div class="chart-bar-today-badge">HOJE</div>' : ''}
                </div>
            </div>
        `;
    }).join('');
}

// ===== SERVIÇOS MAIS REALIZADOS =====
async function loadTopServicesData() {
    try {
        const completedAppointments = dashboardState.appointments.filter(a => 
            a.status === 'concluido'
        );
        renderTopServices(completedAppointments);
    } catch (error) {
        console.error('Erro ao carregar top serviços:', error);
    }
}

function renderTopServices(completedAppointments) {
    const container = document.getElementById('top-services-list');
    if (!container) return;
    
    // Contar serviços
    const serviceCounts = {};
    const serviceRevenue = {};
    
    completedAppointments.forEach(apt => {
        const service = apt.servico;
        serviceCounts[service] = (serviceCounts[service] || 0) + 1;
        serviceRevenue[service] = (serviceRevenue[service] || 0) + (parseFloat(apt.preco) || 0);
    });
    
    // Ordenar por quantidade
    const sorted = Object.entries(serviceCounts)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5);
    
    if (sorted.length === 0) {
        container.innerHTML = `
            <div class="loading-services">
                <i class="fas fa-inbox"></i>
                Nenhum serviço realizado ainda
            </div>
        `;
        return;
    }
    
    container.innerHTML = sorted.map(([service, count], index) => `
        <div class="service-rank-item">
            <div class="service-rank-number">${index + 1}</div>
            <div class="service-rank-info">
                <div class="service-rank-name">${service}</div>
                <div class="service-rank-stats">${count} ${count === 1 ? 'serviço' : 'serviços'} realizados</div>
            </div>
            <div>
                <div class="service-rank-count">${count}</div>
                <div class="service-rank-revenue">R$ ${serviceRevenue[service].toFixed(2).replace('.', ',')}</div>
            </div>
        </div>
    `).join('');
}

// ===== AGENDA INTELIGENTE =====
let agendaState = {
    currentWeekStart: null,
    currentFilter: 'todos',
    currentView: 'list',
    appointments: []
};

async function initAgendaInteligente() {
    console.log('📅 Inicializando Agenda Inteligente...');
    
    try {
        // Carregar agendamentos
        const response = await fetch('/api/appointments');
        const result = await response.json();
        
        if (result.success) {
            agendaState.appointments = result.data || [];
            console.log('📅 Agendamentos carregados para agenda:', agendaState.appointments.length);
            renderAgendaInteligente();
        }
    } catch (error) {
        console.error('❌ Erro ao carregar agenda inteligente:', error);
    }
}

function renderAgendaInteligente() {
    const container = document.getElementById('agenda-inteligente-content');
    if (!container) return;
    
    const today = new Date().toISOString().split('T')[0];
    
    // Normalizar campos
    agendaState.appointments.forEach(a => {
        if (!a.data && a.date) a.data = a.date;
        if (!a.horario && a.time) a.horario = a.time;
        if (!a.preco && a.total_price) a.preco = a.total_price;
        if (!a.cliente_nome && a.cliente) a.cliente_nome = a.cliente;
    });
    
    // Filtrar agendamentos
    let filtered = agendaState.appointments;
    
    if (agendaState.currentFilter !== 'todos') {
        filtered = filtered.filter(a => a.status === agendaState.currentFilter);
    }
    
    // Atualizar stats
    const todayCount = agendaState.appointments.filter(a => {
        const aptDate = a.data;
        return aptDate === today && ['agendado', 'confirmado', 'pendente'].includes(a.status);
    }).length;
    
    const confirmedCount = agendaState.appointments.filter(a => 
        a.status === 'confirmado'
    ).length;
    
    const pendingCount = agendaState.appointments.filter(a => 
        ['agendado', 'pendente'].includes(a.status)
    ).length;
    
    document.getElementById('agenda-stat-hoje').textContent = todayCount;
    document.getElementById('agenda-stat-confirmados').textContent = confirmedCount;
    document.getElementById('agenda-stat-pendentes').textContent = pendingCount;
    
    // Renderizar lista
    if (filtered.length === 0) {
        container.innerHTML = `
            <div class="empty-state-modern">
                <div class="empty-state-icon">
                    <i class="fas fa-calendar-times"></i>
                </div>
                <div class="empty-state-title">Nenhum agendamento encontrado</div>
            </div>
        `;
        return;
    }
    
    // Ordenar por data e hora (mais recentes primeiro)
    filtered.sort((a, b) => {
        const dateA = a.data;
        const dateB = b.data;
        if (dateA !== dateB) return dateA.localeCompare(dateB);
        const timeA = a.horario;
        const timeB = b.horario;
        return timeA.localeCompare(timeB);
    });
    
    // Agrupar por data
    const groupedByDate = {};
    filtered.forEach(apt => {
        const date = apt.data;
        if (!groupedByDate[date]) {
            groupedByDate[date] = [];
        }
        groupedByDate[date].push(apt);
    });
    
    // Renderizar agrupado por data
    const dates = Object.keys(groupedByDate).sort();
    
    container.innerHTML = `
        <div class="agenda-by-date">
            ${dates.map(date => {
                const appointments = groupedByDate[date];
                const dateObj = new Date(date + 'T00:00:00');
                const isToday = date === today;
                const dayName = dateObj.toLocaleDateString('pt-BR', { weekday: 'long' });
                const dateFormatted = dateObj.toLocaleDateString('pt-BR', { 
                    day: '2-digit', 
                    month: 'long',
                    year: 'numeric'
                });
                
                return `
                    <div class="date-group ${isToday ? 'today' : ''}">
                        <div class="date-group-header">
                            <div class="date-group-title">
                                <i class="fas fa-calendar-day"></i>
                                <span class="day-name">${dayName.charAt(0).toUpperCase() + dayName.slice(1)}</span>
                                ${isToday ? '<span class="today-badge">Hoje</span>' : ''}
                            </div>
                            <div class="date-group-subtitle">${dateFormatted}</div>
                            <div class="date-group-count">${appointments.length} ${appointments.length === 1 ? 'agendamento' : 'agendamentos'}</div>
                        </div>
                        <div class="date-group-appointments">
                            ${appointments.map(apt => renderAppointmentCard(apt, today)).join('')}
                        </div>
                    </div>
                `;
            }).join('')}
        </div>
    `;
}

function renderAppointmentCard(apt, today) {
    const aptDate = apt.data;
    const aptTime = apt.horario;
    const aptService = apt.servico;
    const aptClient = apt.cliente_nome;
    const aptPrice = apt.preco;
    const aptId = apt.id;
    
    console.log('📋 Renderizando card:', { aptId, aptPrice, apt });
    
    const date = new Date(aptDate + 'T00:00:00');
    const dateFormatted = date.toLocaleDateString('pt-BR', { 
        day: '2-digit', 
        month: 'long',
        year: 'numeric'
    });
    
    return `
        <div class="appointment-card-agenda status-${apt.status}">
            <div class="appointment-card-header">
                <div class="appointment-card-info">
                    <div class="appointment-card-time">${aptTime}</div>
                    <div style="font-size: 13px; color: var(--color-text-secondary); margin-bottom: 8px;">
                        ${dateFormatted}
                    </div>
                    <div class="appointment-card-service">${aptService}</div>
                    <div class="appointment-card-client">
                        <i class="fas fa-user"></i>
                        ${aptClient}
                    </div>
                    <div style="font-size: 14px; color: var(--color-text); margin-top: 8px; font-weight: 600;">
                        R$ ${parseFloat(aptPrice).toFixed(2).replace('.', ',')}
                    </div>
                </div>
                <div class="appointment-card-actions">
                    ${apt.status === 'agendado' || apt.status === 'pendente' ? `
                        <button class="action-btn action-btn-confirm" onclick="updateAppointmentStatus('${aptId}', 'confirmado')">
                            <i class="fas fa-check"></i> Confirmar
                        </button>
                    ` : ''}
                    ${apt.status === 'confirmado' ? `
                        <button class="action-btn action-btn-complete" onclick="updateAppointmentStatus('${aptId}', 'concluido')">
                            <i class="fas fa-check-double"></i> Concluir
                        </button>
                    ` : ''}
                    ${apt.status !== 'cancelado' && apt.status !== 'concluido' ? `
                        <button class="action-btn action-btn-cancel" onclick="updateAppointmentStatus('${aptId}', 'cancelado')">
                            <i class="fas fa-times"></i> Cancelar
                        </button>
                    ` : ''}
                </div>
            </div>
        </div>
    `;
}

async function updateAppointmentStatus(appointmentId, newStatus) {
    try {
        const response = await fetch(`/api/appointments/${appointmentId}/status`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ status: newStatus })
        });
        
        const result = await response.json();
        
        if (result.success) {
            console.log('✅ Status atualizado com sucesso');
            await initAgendaInteligente();
            await loadProfessionalMetrics();
        } else {
            alert('Erro ao atualizar status: ' + result.message);
        }
    } catch (error) {
        console.error('❌ Erro ao atualizar status:', error);
        alert('Erro ao atualizar status');
    }
}

function setFilter(filter) {
    agendaState.currentFilter = filter;
    
    // Atualizar botões
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    event.target.classList.add('active');
    
    renderAgendaInteligente();
}

function setView(view) {
    agendaState.currentView = view;
    
    // Atualizar botões
    document.querySelectorAll('.view-toggle-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    event.target.classList.add('active');
    
    renderAgendaInteligente();
}

function previousWeek() {
    console.log('⬅️ Semana anterior');
}

function nextWeek() {
    console.log('➡️ Próxima semana');
}

function goToToday() {
    console.log('📅 Ir para hoje');
    renderAgendaInteligente();
}

// ===== ATUALIZAÇÃO AUTOMÁTICA =====
function startAutoRefresh() {
    // Atualizar a cada 30 segundos
    setInterval(async () => {
        if (!dashboardState.loading) {
            console.log('🔄 Atualizando dashboard...');
            await loadProfessionalMetrics();
            await loadAgendaPreviewData();
        }
    }, 30000);
}

// ===== EXPORTAR FUNÇÕES =====
window.initBarbeiroDashboard = initBarbeiroDashboard;
window.loadProfessionalMetrics = loadProfessionalMetrics;
window.loadAgendaPreviewData = loadAgendaPreviewData;
window.loadWeeklyChartData = loadWeeklyChartData;
window.loadTopServicesData = loadTopServicesData;
window.initAgendaInteligente = initAgendaInteligente;
window.updateAppointmentStatus = updateAppointmentStatus;
window.setFilter = setFilter;
window.setView = setView;
window.previousWeek = previousWeek;
window.nextWeek = nextWeek;
window.goToToday = goToToday;

// Verificar dependências
console.log('🔍 Verificando dependências...');
console.log('API_BASE:', typeof window.API_BASE);
console.log('fetch:', typeof fetch);

// Inicializar quando o DOM estiver pronto
if (document.readyState === 'loading') {
    console.log('⏳ Aguardando DOM carregar...');
    document.addEventListener('DOMContentLoaded', () => {
        console.log('✅ DOM carregado, iniciando dashboard do barbeiro');
        initBarbeiroDashboard();
        startAutoRefresh();
    });
} else {
    console.log('✅ DOM já carregado, iniciando dashboard do barbeiro imediatamente');
    initBarbeiroDashboard();
    startAutoRefresh();
}
