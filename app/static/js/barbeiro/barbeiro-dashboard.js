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
        
        console.log('📅 Data de hoje:', today);
        
        // Agendamentos de hoje
        // Garantir que appointments é um array
        if (!Array.isArray(appointments)) {
            console.error('❌ appointments não é um array:', appointments);
            throw new Error('Dados de agendamentos inválidos');
        }
        
        // Normalizar campos PRIMEIRO: API retorna 'date' e 'time', mas código usa 'data' e 'horario'
        appointments.forEach(a => {
            if (!a.data && a.date) a.data = a.date;
            if (!a.horario && a.time) a.horario = a.time;
            if (!a.preco && a.total_price) a.preco = a.total_price;
            if (!a.cliente_nome && a.cliente) a.cliente_nome = a.cliente;
        });
        
        console.log('📅 Filtrando agendamentos para hoje:', today);
        console.log('📦 Total de agendamentos:', appointments.length);
        // Log simplificado das datas
        appointments.forEach(a => {
            console.log(`📋 Agendamento ${a.id}: data="${a.data}" vs hoje="${today}" | igual=${a.data === today}`);
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
        
        const pendingToday = todayAppointments.filter(a => ['agendado', 'pendente'].includes(a.status));
        
        // Próximos agendamentos (próximos 7 dias)
        const next7Days = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
        const upcomingAppointments = appointments.filter(a => {
            return a.data >= today && a.data <= next7Days && ['agendado', 'confirmado', 'pendente'].includes(a.status);
        });
        
        console.log('⏳ Pendentes hoje:', pendingToday.length);
        console.log('📅 Próximos 7 dias:', upcomingAppointments.length);
        
        // Faturamento últimos 7 dias (incluindo agendados e pendentes)
        const last7Days = appointments.filter(a => {
            const date = new Date(a.data + 'T00:00:00');
            // Incluir concluídos, agendados e pendentes dos últimos 7 dias
            return date >= sevenDaysAgo && ['concluido', 'concluído', 'agendado', 'pendente', 'confirmado'].includes(a.status);
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
        
        console.log('📊 Métricas:', `Hoje: ${todayAppointments.length}, Concluídos: ${completedToday.length}, Pendentes: ${pendingToday.length}`);
        
        updateMetricElement('appointments-today', todayAppointments.length);
        updateMetricElement('completed-today', completedToday.length);
        updateMetricElement('pending-today', pendingToday.length);
        
        updateMetricElement('clients-month', uniqueClients);
        updateMetricElement('new-clients', Math.floor(uniqueClients * 0.3));
        
        updateMetricElement('ticket-average', ticketAverage.toFixed(2).replace('.', ','));
        updateMetricElement('total-services', completedAppointments.length);
        
        // Atualizar hero stats
        console.log('📊 Atualizando hero:', `Hoje=${todayAppointments.length}, Pendentes=${pendingToday.length}, R$=${revenue7Days.toFixed(2)}`);
        
        // Atualizar com verificação
        const elHoje = document.getElementById('hero-stat-hoje');
        const elFaturamento = document.getElementById('hero-stat-faturamento');
        
        console.log('🔍 Elementos encontrados:', {
            hoje: !!elHoje,
            proximos: !!document.getElementById('hero-stat-proximos'),
            faturamento: !!elFaturamento
        });
        
        if (elHoje) {
            elHoje.textContent = todayAppointments.length;
            console.log('✅ Atualizado hero-stat-hoje:', todayAppointments.length);
        }
        
        const elProximos = document.getElementById('hero-stat-proximos');
        if (elProximos) {
            elProximos.textContent = upcomingAppointments.length;
            console.log('✅ Atualizado hero-stat-proximos:', upcomingAppointments.length);
        }
        
        if (elFaturamento) {
            elFaturamento.textContent = revenue7Days.toFixed(2).replace('.', ',');
            console.log('✅ Atualizado hero-stat-faturamento:', revenue7Days.toFixed(2));
        }
        
        // Carregar outros componentes
        await loadHeroUpcomingAppointments();
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

// ===== PRÓXIMOS AGENDAMENTOS NA HERO =====
async function loadHeroUpcomingAppointments() {
    try {
        console.log('📅 Carregando próximos agendamentos para hero...');
        const today = new Date().toISOString().split('T')[0];
        const next7Days = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
        
        // Buscar agendamentos dos próximos 7 dias
        let upcomingAppointments = dashboardState.appointments.filter(a => {
            const aptDate = a.data;
            return aptDate >= today && aptDate <= next7Days && ['agendado', 'confirmado', 'pendente'].includes(a.status);
        });
        
        // Ordenar por data e hora
        upcomingAppointments.sort((a, b) => {
            const dateA = a.data;
            const dateB = b.data;
            if (dateA !== dateB) return dateA.localeCompare(dateB);
            return a.horario.localeCompare(b.horario);
        });
        
        console.log('📅 Próximos agendamentos encontrados:', upcomingAppointments.length);
        renderHeroUpcomingAppointments(upcomingAppointments.slice(0, 5), today);
    } catch (error) {
        console.error('❌ Erro ao carregar próximos agendamentos:', error);
    }
}

function renderHeroUpcomingAppointments(appointments, today) {
    const container = document.getElementById('hero-upcoming-list');
    if (!container) return;
    
    if (appointments.length === 0) {
        container.innerHTML = `
            <div class="hero-upcoming-empty">
                <i class="fas fa-calendar-check"></i>
                <div class="hero-upcoming-empty-title">Nenhum agendamento próximo</div>
                <div class="hero-upcoming-empty-text">Aproveite para relaxar!</div>
            </div>
        `;
        return;
    }
    
    container.innerHTML = appointments.map(apt => {
        const aptDate = apt.data;
        const aptTime = apt.horario;
        const aptService = apt.servico;
        const aptClient = apt.cliente_nome;
        const isToday = aptDate === today;
        
        // Formatar data
        const date = new Date(aptDate + 'T00:00:00');
        const dateLabel = isToday ? 'Hoje' : date.toLocaleDateString('pt-BR', { 
            day: '2-digit', 
            month: 'short' 
        });
        
        return `
            <div class="hero-upcoming-item">
                <div class="hero-upcoming-time">
                    <div class="hero-upcoming-time-hour">${aptTime}</div>
                    <div class="hero-upcoming-time-date">${dateLabel}</div>
                </div>
                <div class="hero-upcoming-info">
                    <div class="hero-upcoming-service">${aptService}</div>
                    <div class="hero-upcoming-client">
                        <i class="fas fa-user"></i>
                        ${aptClient}
                    </div>
                </div>
                <div class="hero-upcoming-status ${apt.status}">${apt.status}</div>
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
            a.data === dateStr && (a.status === 'concluido' || a.status === 'concluído')
        ).length;
        
        // Contar todos os agendamentos (incluindo pendentes e futuros)
        const total = appointments.filter(a => 
            a.data === dateStr && ['agendado', 'confirmado', 'concluido', 'concluído', 'pendente'].includes(a.status)
        ).length;
        
        // Calcular faturamento (incluindo agendados e pendentes para projeção)
        const revenue = appointments
            .filter(a => a.data === dateStr && ['concluido', 'concluído', 'agendado', 'pendente', 'confirmado'].includes(a.status))
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

// ===== AGENDA DIGITAL VISUAL =====
let agendaState = {
    currentDate: new Date(),
    currentFilter: 'todos',
    appointments: [],
    viewMode: 'expanded', // 'expanded' ou 'compact'
    searchQuery: '',
    soundEnabled: true,
    lastAppointmentCount: 0
};

async function initAgendaInteligente() {
    console.log('📅 Inicializando Agenda Digital...');
    
    try {
        // Carregar agendamentos
        const response = await fetch('/api/appointments');
        const result = await response.json();
        
        if (result.success) {
            agendaState.appointments = result.data || [];
            console.log('📅 Agendamentos carregados para agenda:', agendaState.appointments.length);
            updateDateDisplay();
            renderAgendaDigital();
        }
    } catch (error) {
        console.error('❌ Erro ao carregar agenda digital:', error);
    }
}

function updateDateDisplay() {
    const dateFullText = document.getElementById('date-full-text');
    const dateDayName = document.getElementById('date-day-name');
    if (!dateFullText) return;
    
    const today = new Date().toISOString().split('T')[0];
    const currentDateStr = agendaState.currentDate.toISOString().split('T')[0];
    
    // Data principal
    dateFullText.textContent = agendaState.currentDate.toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: 'long',
        year: 'numeric'
    });
    
    // Dia da semana
    if (dateDayName) {
        const dayName = agendaState.currentDate.toLocaleDateString('pt-BR', { weekday: 'long' });
        dateDayName.textContent = currentDateStr === today ? 'Hoje' : dayName.charAt(0).toUpperCase() + dayName.slice(1);
    }
}

function renderAgendaDigital() {
    const container = document.getElementById('agenda-digital-timeline');
    if (!container) return;
    
    const today = new Date().toISOString().split('T')[0];
    const currentDateStr = agendaState.currentDate.toISOString().split('T')[0];
    
    // Normalizar campos
    agendaState.appointments.forEach(a => {
        if (!a.data && a.date) a.data = a.date;
        if (!a.horario && a.time) a.horario = a.time;
        if (!a.preco && a.total_price) a.preco = a.total_price;
        if (!a.cliente_nome && a.cliente) a.cliente_nome = a.cliente;
    });
    
    // Filtrar agendamentos pela data atual
    let filtered = agendaState.appointments.filter(a => a.data === currentDateStr);
    
    // Aplicar filtro de status
    if (agendaState.currentFilter !== 'todos') {
        if (agendaState.currentFilter === 'pendente') {
            filtered = filtered.filter(a => ['agendado', 'pendente'].includes(a.status));
        } else if (agendaState.currentFilter === 'concluido') {
            // Aceitar ambas variações: com e sem acento
            filtered = filtered.filter(a => a.status === 'concluido' || a.status === 'concluído');
        } else if (agendaState.currentFilter === 'confirmado') {
            filtered = filtered.filter(a => a.status === 'confirmado');
        } else if (agendaState.currentFilter === 'cancelado') {
            filtered = filtered.filter(a => a.status === 'cancelado');
        } else {
            filtered = filtered.filter(a => a.status === agendaState.currentFilter);
        }
    }
    
    // Atualizar stats
    updateAgendaStats();
    
    // Renderizar lista
    if (filtered.length === 0) {
        container.innerHTML = `
            <div class="timeline-empty">
                <div class="timeline-empty-icon">
                    <i class="fas fa-calendar-check"></i>
                </div>
                <div class="timeline-empty-title">Nenhum agendamento encontrado</div>
                <div class="timeline-empty-text">
                    ${agendaState.currentFilter === 'todos' 
                        ? 'Nenhum agendamento para este dia' 
                        : `Nenhum agendamento ${agendaState.currentFilter} para este dia`
                    }
                </div>
            </div>
        `;
        return;
    }
    
    // Ordenar por horário
    filtered.sort((a, b) => a.horario.localeCompare(b.horario));
    
    // Renderizar cards
    container.innerHTML = filtered.map(apt => renderAppointmentCardModern(apt)).join('');
}

function updateAgendaStats() {
    const today = new Date().toISOString().split('T')[0];
    
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
    
    const elHoje = document.getElementById('agenda-stat-hoje');
    const elConfirmados = document.getElementById('agenda-stat-confirmados');
    const elPendentes = document.getElementById('agenda-stat-pendentes');
    
    if (elHoje) elHoje.textContent = todayCount;
    if (elConfirmados) elConfirmados.textContent = confirmedCount;
    if (elPendentes) elPendentes.textContent = pendingCount;
}

function refreshAgenda() {
    console.log('🔄 Atualizando agenda...');
    initAgendaInteligente();
}

function renderAppointmentCardModern(apt) {
    const aptTime = apt.horario;
    const aptDate = apt.data;
    const aptService = apt.servico;
    const aptClient = apt.cliente_nome;
    const aptPrice = apt.preco;
    const aptId = apt.id;
    const aptStatus = apt.status;
    
    const isCompleted = aptStatus === 'concluido';
    const isCanceled = aptStatus === 'cancelado';
    
    // Verificar se o agendamento já passou
    const now = new Date();
    const appointmentDateTime = new Date(`${aptDate}T${aptTime}`);
    const hasPassed = appointmentDateTime <= now;
    
    // Lógica inteligente de ações
    const canConfirm = (aptStatus === 'agendado' || aptStatus === 'pendente') && !hasPassed;
    const canComplete = (aptStatus === 'confirmado' || aptStatus === 'agendado') && hasPassed;
    // Barbeiro só pode cancelar agendamentos futuros
    const canCancel = !isCanceled && !isCompleted && !hasPassed;
    
    return `
        <div class="appointment-card-modern status-${aptStatus} ${hasPassed ? 'past-appointment' : ''}">
            ${canComplete ? `
                <div class="appointment-checkbox">
                    <label class="checkbox-wrapper">
                        <input type="checkbox" 
                               class="checkbox-input"
                               onchange="handleCheckboxChange('${aptId}', this.checked)"
                               ${isCompleted ? 'checked' : ''}>
                        <span class="checkbox-custom">
                            <i class="fas fa-check"></i>
                        </span>
                    </label>
                </div>
            ` : ''}
            
            <div class="appointment-card-content">
                <div class="appointment-card-main">
                    <div class="appointment-card-info">
                        <div class="appointment-time-badge">
                            <i class="fas fa-clock"></i>
                            <span class="appointment-time-text">${aptTime}</span>
                        </div>
                        
                        <div class="appointment-service-name">${aptService}</div>
                        
                        <div class="appointment-client-info">
                            <i class="fas fa-user"></i>
                            <span>${aptClient}</span>
                        </div>
                        
                        <div class="appointment-price">
                            R$ ${parseFloat(aptPrice).toFixed(2).replace('.', ',')}
                        </div>
                    </div>
                    
                    <div class="appointment-status-badge ${aptStatus}">
                        ${aptStatus}
                    </div>
                </div>
                
                <div class="appointment-card-actions">
                    ${canConfirm ? `
                        <button class="action-btn-modern action-btn-confirm" 
                                onclick="updateAppointmentStatus('${aptId}', 'confirmado')">
                            <i class="fas fa-check"></i> Confirmar
                        </button>
                    ` : ''}
                    ${canComplete ? `
                        <button class="action-btn-modern action-btn-complete" 
                                onclick="updateAppointmentStatus('${aptId}', 'concluido')">
                            <i class="fas fa-check-double"></i> Concluir
                        </button>
                    ` : ''}
                    ${canCancel ? `
                        <button class="action-btn-modern action-btn-cancel" 
                                onclick="updateAppointmentStatus('${aptId}', 'cancelado')">
                            <i class="fas fa-times"></i> Cancelar
                        </button>
                    ` : ''}
                </div>
            </div>
        </div>
    `;
}

async function handleCheckboxChange(appointmentId, isChecked) {
    const newStatus = isChecked ? 'concluido' : 'confirmado';
    await updateAppointmentStatus(appointmentId, newStatus);
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
            
            if (typeof showNotificationToast === 'function') {
                const messages = {
                    'confirmado': 'Agendamento confirmado!',
                    'concluido': 'Agendamento concluído!',
                    'cancelado': 'Agendamento cancelado'
                };
                showNotificationToast(messages[newStatus] || 'Status atualizado', 'success');
            }
        } else {
            alert('Erro ao atualizar status: ' + result.message);
        }
    } catch (error) {
        console.error('❌ Erro ao atualizar status:', error);
        alert('Erro ao atualizar status');
    }
}

function setQuickFilter(filter) {
    agendaState.currentFilter = filter;
    
    // Atualizar botões
    document.querySelectorAll('.quick-filter-btn').forEach(btn => {
        btn.classList.remove('active');
        if (btn.dataset.filter === filter) {
            btn.classList.add('active');
        }
    });
    
    renderAgendaDigital();
}

function previousDay() {
    agendaState.currentDate.setDate(agendaState.currentDate.getDate() - 1);
    updateDateDisplay();
    renderAgendaDigital();
}

function nextDay() {
    agendaState.currentDate.setDate(agendaState.currentDate.getDate() + 1);
    updateDateDisplay();
    renderAgendaDigital();
}

function goToToday() {
    agendaState.currentDate = new Date();
    updateDateDisplay();
    renderAgendaDigital();
}

// ===== ATUALIZAÇÃO AUTOMÁTICA =====
function startAutoRefresh() {
    // Atualizar a cada 30 segundos
    setInterval(async () => {
        if (!dashboardState.loading) {
            console.log('🔄 Atualizando dashboard...');
            await loadProfessionalMetrics();
            await loadHeroUpcomingAppointments();
        }
    }, 30000);
}

// ===== EXPORTAR FUNÇÕES =====
window.initBarbeiroDashboard = initBarbeiroDashboard;
window.loadProfessionalMetrics = loadProfessionalMetrics;
window.loadHeroUpcomingAppointments = loadHeroUpcomingAppointments;
window.loadWeeklyChartData = loadWeeklyChartData;
window.loadTopServicesData = loadTopServicesData;
window.initAgendaInteligente = initAgendaInteligente;
window.handleCheckboxChange = handleCheckboxChange;
window.updateAppointmentStatus = updateAppointmentStatus;
window.setQuickFilter = setQuickFilter;
window.previousDay = previousDay;
window.nextDay = nextDay;
window.goToToday = goToToday;
window.refreshAgenda = refreshAgenda;
window.updateAgendaStats = updateAgendaStats;

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
