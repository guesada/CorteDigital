// App.js - Script UNIFICADO do Corte Digital
// Gerencia autenticação, navegação e funcionalidades de cliente e barbeiro

// ===== CONFIGURAÇÃO GLOBAL =====
const API_BASE = '/api';
const API = {
  appointments: '/api/appointments',
  barbers: '/api/barbers',
  services: '/api/services',
  notifications: '/api/notifications',
  products: '/api/products',
};

let BARBERS = [];
let clientDashboardPoll = null;
let barberDashboardPoll = null;

// ===== FUNÇÕES DE NAVEGAÇÃO =====
function showScreen(screenId) {
  document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
  const targetScreen = document.getElementById(screenId);
  if (targetScreen) targetScreen.classList.add('active');
}

function selectUserType(type) {
  showScreen(`login-${type}`);
}

function showLogin(type) {
  showScreen(`login-${type}`);
}

function showRegister(type) {
  showScreen(`register-${type}`);
}

function goBack() {
  showScreen('user-selection');
}

function showSection(id) {
  document.querySelectorAll('.content-section, .section').forEach(s => s.classList.remove('active'));
  const tgt = document.getElementById(id);
  if (tgt) tgt.classList.add('active');
  
  if (id === 'historico-cliente') loadHistoricoCliente();
  if (id === 'perfil-cliente') setTimeout(loadUserProfile, 100);
}

function switchTab(tabId, event) {
  document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
  document.querySelectorAll('.tab-panel').forEach(panel => panel.classList.remove('active'));
  
  if (event && event.target) {
    event.target.closest('.tab-btn')?.classList.add('active');
  } else {
    const targetBtn = Array.from(document.querySelectorAll('.tab-btn')).find(btn => 
      btn.getAttribute('onclick')?.includes(tabId)
    );
    if (targetBtn) targetBtn.classList.add('active');
  }
  
  document.getElementById(tabId)?.classList.add('active');
  
  if (tabId === 'novo-agendamento' && typeof initNovoAgendamento === 'function') {
    setTimeout(() => initNovoAgendamento(), 100);
  }
  
  if (tabId === 'meus-agendamentos') carregarAgendamentos();
}

// ===== FUNÇÕES DE AUTENTICAÇÃO =====
async function fazerLogin(e, destino) {
  e.preventDefault();
  const form = e.target;
  const email = form.querySelector('input[type="email"]').value;
  const password = form.querySelector('input[type="password"]').value;

  try {
    const response = await fetch(`${API_BASE}/users/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ email, password })
    });

    const data = await response.json();
    if (data.success) {
      const userType = data.user?.userType || destino;
      window.location.href = userType === 'barbeiro' ? '/barbeiro' : '/cliente';
    } else {
      showNotificationToast(data.message || 'Não foi possível entrar', 'error');
    }
  } catch (error) {
    showNotificationToast('Erro ao fazer login', 'error');
  }
}

async function fazerCadastro(e, tipo) {
  e.preventDefault();
  const form = e.target;
  const nome = form.querySelector('input[name="name"]').value;
  const email = form.querySelector('input[name="email"]').value;
  const password = form.querySelector('input[name="password"]').value;
  const confirmPassword = form.querySelector('input[name="confirmPassword"]').value;

  if (password !== confirmPassword) {
    showNotificationToast('As senhas não conferem', 'error');
    return;
  }

  if (password.length < 6) {
    showNotificationToast('A senha deve ter no mínimo 6 caracteres', 'error');
    return;
  }

  try {
    const response = await fetch(`${API_BASE}/users/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ name: nome, email, password, userType: tipo })
    });

    const data = await response.json();
    if (data.success) {
      showNotificationToast('Cadastro realizado! Faça login para continuar.', 'success');
      setTimeout(() => showScreen(`login-${tipo}`), 2000);
    } else {
      showNotificationToast(data.message || 'Não foi possível concluir o cadastro', 'error');
    }
  } catch (error) {
    showNotificationToast('Erro ao cadastrar', 'error');
  }
}

// ===== FUNÇÕES UTILITÁRIAS =====
function showNotificationToast(message, type = 'success', duration = 3000) {
  const existingToast = document.getElementById('notification-toast');
  if (existingToast) existingToast.remove();

  const toast = document.createElement('div');
  toast.id = 'notification-toast';
  toast.style.cssText = `
    position: fixed; top: 20px; right: 20px; padding: 1rem 1.5rem;
    border-radius: 8px; color: white; font-weight: 500; z-index: 10000;
    animation: slideIn 0.3s ease-out; box-shadow: 0 4px 12px rgba(0,0,0,0.3); max-width: 400px;
  `;
  
  if (type === 'success') {
    toast.style.background = 'linear-gradient(135deg, #16a34a 0%, #15803d 100%)';
  } else if (type === 'error') {
    toast.style.background = 'linear-gradient(135deg, #dc2626 0%, #991b1b 100%)';
  } else {
    toast.style.background = 'linear-gradient(135deg, #0b84a5 0%, #064e5e 100%)';
  }
  
  toast.textContent = message;
  document.body.appendChild(toast);

  if (!document.getElementById('toast-animation-style')) {
    const style = document.createElement('style');
    style.id = 'toast-animation-style';
    style.textContent = `
      @keyframes slideIn { from { transform: translateX(400px); opacity: 0; } to { transform: translateX(0); opacity: 1; } }
      @keyframes slideOut { from { transform: translateX(0); opacity: 1; } to { transform: translateX(400px); opacity: 0; } }
    `;
    document.head.appendChild(style);
  }

  setTimeout(() => {
    toast.style.animation = 'slideOut 0.3s ease-in';
    setTimeout(() => toast.remove(), 300);
  }, duration);
}

function formatDate(dateStr) {
  if (!dateStr) return '--';
  try {
    return new Date(dateStr).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' });
  } catch {
    return dateStr;
  }
}

function formatCurrency(value) {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value || 0);
}

function toggleTheme() {
  document.body.classList.toggle('dark-theme');
  const icon = document.getElementById('theme-icon');
  if (icon) {
    icon.classList.toggle('fa-moon');
    icon.classList.toggle('fa-sun');
  }
}

function logout() { 
  window.location.href = '/logout'; 
}

// ===== FUNÇÕES DO CLIENTE =====
async function loadAppointmentsAndStats() {
  try {
    const res = await fetch(API.appointments, { credentials: 'include' });
    if (!res.ok) return;
    
    const j = await res.json();
    const items = j.data || [];

    // DEBUG: Ver o que está vindo da API
    console.log('📊 Total de agendamentos:', items.length);
    items.forEach((a, i) => {
      console.log(`  ${i+1}. Status: "${a.status}" | Serviço: ${a.servico} | Data: ${a.date}`);
    });

    const elAtivos = document.getElementById('stat-ativos');
    const elConcl = document.getElementById('stat-concluidos');
    const elProx = document.getElementById('stat-proximo');
    const elGasto = document.getElementById('stat-gasto-mes');

    // Agendamentos ativos = pendente, agendado, confirmado (não concluído nem cancelado)
    const ativos = items.filter(a => {
      const status = (a.status || '').toLowerCase();
      const isAtivo = status === 'pendente' || status === 'agendado' || status === 'confirmado';
      console.log(`  Verificando: status="${a.status}" -> toLowerCase="${status}" -> isAtivo=${isAtivo}`);
      return isAtivo;
    }).length;
    
    console.log('✅ Total de ativos:', ativos);
    
    const concluidos = items.filter(a => (a.status || '').toLowerCase() === 'concluido').length;
    
    if (elAtivos) elAtivos.textContent = ativos;
    if (elConcl) elConcl.textContent = concluidos;

    const futuros = items.filter(a => a.date).sort((x, y) => 
      new Date(x.date + ' ' + (x.time || '00:00')) - new Date(y.date + ' ' + (y.time || '00:00'))
    );
    const proximo = futuros.find(a => a.status !== 'cancelado');
    
    if (elProx) {
      let proxText = '--';
      if (proximo && proximo.date) {
        const dateObj = new Date(proximo.date + 'T00:00:00');
        if (!isNaN(dateObj.getTime())) {
          const dateStr = dateObj.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
          proxText = `${dateStr} às ${proximo.time || '--:--'}`;
        }
      }
      elProx.textContent = proxText;
    }

    const now = new Date();
    let gasto = 0;
    items.forEach(a => {
      // Contar apenas agendamentos concluídos
      if (!a.date || a.status !== 'concluido') return;
      
      const d = new Date(a.date + 'T00:00:00');
      if (d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear()) {
        const price = parseFloat(a.total_price || a.price || a.total || 0);
        if (!isNaN(price) && price > 0) gasto += price;
      }
    });
    
    if (elGasto) elGasto.textContent = `R$ ${gasto.toFixed(2).replace('.', ',')}`;

    loadProximosAgendamentos(items);
  } catch (e) {
    console.error('Erro ao carregar agendamentos:', e);
  }
}

function loadProximosAgendamentos(items) {
  const section = document.getElementById('upcoming-appointments-section');
  const lista = document.getElementById('upcoming-appointments-list');
  
  if (!section || !lista || !items) {
    if (section) section.style.display = 'none';
    return;
  }
  
  const now = new Date();
  const proximos = items
    .filter(a => {
      if (a.status === 'cancelado' || a.status === 'concluido' || !a.date) return false;
      try {
        return new Date(a.date + 'T' + (a.time || '00:00')) >= now;
      } catch {
        return false;
      }
    })
    .sort((a, b) => new Date(a.date + 'T' + a.time) - new Date(b.date + 'T' + b.time))
    .slice(0, 3);
  
  if (proximos.length === 0) {
    section.style.display = 'none';
    return;
  }
  
  section.style.display = 'block';
  
  lista.innerHTML = proximos.map((a, idx) => {
    const appointmentDate = new Date(a.date + 'T' + (a.time || '00:00'));
    const isToday = appointmentDate.toDateString() === now.toDateString();
    const isTomorrow = appointmentDate.toDateString() === new Date(now.getTime() + 86400000).toDateString();
    
    let dateLabel = isToday ? 'Hoje' : isTomorrow ? 'Amanhã' : 
      appointmentDate.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' });
    
    const statusColor = a.status === 'confirmado' ? 'success' : 'info';
    const statusIcon = a.status === 'confirmado' ? 'check-circle' : 'clock';
    
    return `
      <div class="upcoming-appointment-card animate-fade-in-up" style="animation-delay: ${idx * 0.1}s;">
        <div class="upcoming-appointment-time">
          <div class="time-badge ${isToday ? 'today' : ''}">
            <div class="time-badge-hour">${a.time || '--:--'}</div>
            <div class="time-badge-date">${dateLabel}</div>
          </div>
        </div>
        <div class="upcoming-appointment-content">
          <h4 class="upcoming-appointment-service">${a.servico || 'Serviço'}</h4>
          <div class="upcoming-appointment-details">
            <span><i class="fas fa-user-tie"></i> ${a.barbeiro || 'Barbeiro'}</span>
            <span class="badge-modern badge-${statusColor}">
              <i class="fas fa-${statusIcon}"></i> ${a.status === 'confirmado' ? 'Confirmado' : 'Agendado'}
            </span>
          </div>
        </div>
        <button onclick="cancelarAgendamento('${a.id}')" class="btn-icon-only" title="Cancelar">
          <i class="fas fa-times"></i>
        </button>
      </div>`;
  }).join('');
}

async function carregarAgendamentos() {
  try {
    const res = await fetch(API.appointments, { credentials: 'include' });
    if (!res.ok) return;
    
    const j = await res.json();
    const items = j.data || [];
    const lista = document.getElementById('agendamentos-lista');
    if (!lista) return;
    
    if (items.length === 0) {
      lista.innerHTML = `
        <div class="empty-state-modern">
          <div class="empty-state-icon"><i class="fas fa-calendar-times"></i></div>
          <div class="empty-state-title">Nenhum agendamento</div>
          <div class="empty-state-description">Você ainda não tem agendamentos.</div>
        </div>`;
      return;
    }
    
    const statusColors = {
      'confirmado': 'success',
      'agendado': 'info',
      'concluido': 'success',
      'cancelado': 'error'
    };
    
    lista.innerHTML = items.map((a, idx) => {
      const dateText = a.date ? new Date(a.date).toLocaleDateString('pt-BR') : '';
      const statusColor = statusColors[a.status] || 'info';
      const statusText = a.status === 'confirmado' ? 'Confirmado' : 
                        a.status === 'concluido' ? 'Concluído' : 
                        a.status === 'cancelado' ? 'Cancelado' : 'Agendado';
      
      return `
        <div class="appointment-item animate-fade-in-up" style="animation-delay: ${idx * 0.05}s;">
          <div class="appointment-item-header">
            <div class="appointment-item-info">
              <h3 class="appointment-item-service">${a.servico || 'Serviço'}</h3>
              <div class="appointment-item-details">
                <span><i class="fas fa-user-tie"></i> ${a.barbeiro || 'Barbeiro'}</span>
                <span><i class="fas fa-calendar"></i> ${dateText}</span>
                <span><i class="fas fa-clock"></i> ${a.time || ''}</span>
              </div>
            </div>
            <div class="appointment-item-status">
              <span class="badge-modern badge-${statusColor}">${statusText}</span>
            </div>
          </div>
          ${a.status !== 'cancelado' && a.status !== 'concluido' ? `
          <div class="appointment-item-actions">
            <button onclick="cancelarAgendamento('${a.id}')" class="btn btn--outline btn-sm">
              <i class="fas fa-times"></i> Cancelar
            </button>
          </div>` : ''}
        </div>`;
    }).join('');
  } catch (e) {
    console.error(e);
  }
}

async function cancelarAgendamento(id) {
  if (!confirm('Deseja cancelar este agendamento?')) return;
  
  try {
    const res = await fetch(`${API.appointments}/${id}`, { method: 'DELETE', credentials: 'include' });
    if (!res.ok) throw new Error('Erro ao cancelar');
    
    showNotificationToast('Agendamento cancelado!', 'success');
    carregarAgendamentos();
    loadAppointmentsAndStats();
  } catch (e) {
    showNotificationToast('Erro ao cancelar', 'error');
  }
}

async function loadHistoricoCliente() {
  try {
    const res = await fetch(API.appointments, { credentials: 'include' });
    if (!res.ok) return;
    
    const j = await res.json();
    const items = (j.data || []).filter(a => a.status === 'concluido' || a.status === 'cancelado');
    const lista = document.getElementById('historico-lista');
    if (!lista) return;
    
    if (items.length === 0) {
      lista.innerHTML = `
        <div class="empty-state-modern">
          <div class="empty-state-icon"><i class="fas fa-history"></i></div>
          <div class="empty-state-title">Nenhum histórico</div>
          <div class="empty-state-description">Você ainda não tem serviços concluídos ou cancelados.</div>
        </div>`;
      return;
    }

    lista.innerHTML = items.map((a, idx) => {
      const statusIcon = a.status === 'concluido' ? 'check-circle' : 'times-circle';
      const statusBadge = a.status === 'concluido' ? 'success' : 'error';
      const iconGradient = a.status === 'concluido' ? 'icon-gradient-green' : 'icon-gradient-red';
      
      return `
        <div class="elegant-card animate-fade-in-up" style="animation-delay: ${idx * 0.1}s; margin-bottom: 16px;">
          <div style="display: flex; align-items: start; gap: 16px;">
            <div class="custom-icon ${iconGradient}" style="width: 48px; height: 48px; font-size: 24px; flex-shrink: 0;">
              <i class="fas fa-${statusIcon}"></i>
            </div>
            <div style="flex: 1;">
              <h3 style="margin: 0 0 8px 0; font-size: 16px; font-weight: 600;">${a.servico || 'Serviço'}</h3>
              <div style="display: flex; flex-direction: column; gap: 4px; font-size: 13px; color: var(--color-text-secondary);">
                <div><i class="fas fa-user" style="width: 16px;"></i> ${a.barbeiro || 'Barbeiro'}</div>
                <div><i class="fas fa-calendar-day" style="width: 16px;"></i> ${formatDate(a.date)} às ${a.time || ''}</div>
                ${a.total_price ? `<div><i class="fas fa-dollar-sign" style="width: 16px;"></i> ${formatCurrency(a.total_price)}</div>` : ''}
              </div>
              <div style="margin-top: 12px;">
                <span class="badge-modern badge-${statusBadge}">${a.status === 'concluido' ? 'Concluído' : 'Cancelado'}</span>
              </div>
            </div>
          </div>
        </div>`;
    }).join('');
  } catch (e) {
    console.error('Erro ao carregar histórico:', e);
  }
}

async function refreshDashboardStats() {
  const refreshBtn = document.querySelector('.btn-refresh');
  if (refreshBtn) {
    refreshBtn.classList.add('spinning');
    refreshBtn.disabled = true;
  }
  
  try {
    await loadAppointmentsAndStats();
    await carregarAgendamentos();
    showNotificationToast('Dados atualizados!', 'success');
  } catch (error) {
    showNotificationToast('Erro ao atualizar dados', 'error');
  } finally {
    if (refreshBtn) {
      setTimeout(() => {
        refreshBtn.classList.remove('spinning');
        refreshBtn.disabled = false;
      }, 500);
    }
  }
}

// ===== PERFIL DO USUÁRIO =====
async function loadUserProfile() {
  const nameInput = document.getElementById('profile-name');
  const emailInput = document.getElementById('profile-email');
  const phoneInput = document.getElementById('profile-phone');
  const addressInput = document.getElementById('profile-address');
  
  [nameInput, emailInput, phoneInput, addressInput].forEach(input => {
    if (input) {
      input.removeAttribute('readonly');
      input.removeAttribute('disabled');
    }
  });
  
  try {
    const response = await fetch('/api/users/profile', { credentials: 'include' });
    if (!response.ok) return;
    
    const data = await response.json();
    if (data.success && data.data) {
      const profile = data.data;
      if (nameInput && profile.nome) nameInput.value = profile.nome;
      if (emailInput && profile.email) emailInput.value = profile.email;
      if (phoneInput && profile.telefone) phoneInput.value = profile.telefone;
      if (addressInput && profile.endereco) addressInput.value = profile.endereco;
    }
  } catch (error) {
    console.error('Erro ao carregar perfil:', error);
  }
}

async function salvarPerfil(event) {
  event.preventDefault();
  
  const body = {
    nome: document.getElementById('profile-name')?.value || '',
    email: document.getElementById('profile-email')?.value || '',
    telefone: document.getElementById('profile-phone')?.value || '',
    endereco: document.getElementById('profile-address')?.value || ''
  };
  
  try {
    const response = await fetch('/api/users/profile', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(body)
    });
    
    const data = await response.json();
    
    if (data.success) {
      showNotificationToast('Perfil atualizado com sucesso!', 'success');
    } else {
      showNotificationToast(data.message || 'Erro ao atualizar perfil', 'error');
    }
  } catch (error) {
    showNotificationToast('Erro ao salvar perfil', 'error');
  }
}

// ===== POLLING =====
function startClientPolling() {
  if (clientDashboardPoll) return;
  clientDashboardPoll = setInterval(async () => {
    try {
      await loadAppointmentsAndStats();
      await carregarAgendamentos();
    } catch (e) {
      console.warn('Erro ao atualizar dados:', e);
    }
  }, 30000);
}

function stopClientPolling() {
  if (clientDashboardPoll) {
    clearInterval(clientDashboardPoll);
    clientDashboardPoll = null;
  }
}

// ===== INICIALIZAÇÃO =====
document.addEventListener('DOMContentLoaded', () => {
  const isCliente = document.getElementById('dashboard-cliente') !== null;
  
  if (isCliente) {
    loadAppointmentsAndStats();
    carregarAgendamentos();
    loadHistoricoCliente();
    startClientPolling();
  }
});

window.addEventListener('beforeunload', () => {
  stopClientPolling();
});

// ===== EXPORTAR FUNÇÕES GLOBAIS =====
window.showScreen = showScreen;
window.selectUserType = selectUserType;
window.showLogin = showLogin;
window.showRegister = showRegister;
window.goBack = goBack;
window.showSection = showSection;
window.switchTab = switchTab;
window.fazerLoginCliente = (e) => fazerLogin(e, 'cliente');
window.fazerLoginBarbeiro = (e) => fazerLogin(e, 'barbeiro');
window.fazerCadastroCliente = (e) => fazerCadastro(e, 'cliente');
window.fazerCadastroBarbeiro = (e) => fazerCadastro(e, 'barbeiro');
window.showNotificationToast = showNotificationToast;
window.toggleTheme = toggleTheme;
window.logout = logout;
window.carregarAgendamentos = carregarAgendamentos;
window.cancelarAgendamento = cancelarAgendamento;
window.loadHistoricoCliente = loadHistoricoCliente;
window.formatDate = formatDate;
window.formatCurrency = formatCurrency;
window.refreshDashboardStats = refreshDashboardStats;
window.loadUserProfile = loadUserProfile;
window.salvarPerfil = salvarPerfil;

console.log('✅ App.js carregado');
