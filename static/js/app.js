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
  reportsWeek: '/api/reports/week',
};

let currentUser = null;
let currentUserType = null;
let BARBERS = [];
let clientDashboardPoll = null;
let barberDashboardPoll = null;

// ===== FUNÇÕES DE NAVEGAÇÃO =====
function showScreen(screenId) {
    console.log('📍 Mostrando tela:', screenId);
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
    const targetScreen = document.getElementById(screenId);
    if (targetScreen) {
        targetScreen.classList.add('active');
    } else {
        console.error('❌ Tela não encontrada:', screenId);
    }
}

function selectUserType(type) {
    currentUserType = type;
    showScreen(`login-${type}`);
}

function showLogin(type) {
    currentUserType = type;
    showScreen(`login-${type}`);
}

function showRegister(type) {
    currentUserType = type;
    showScreen(`register-${type}`);
}

function goBack() {
    showScreen('user-selection');
    currentUserType = null;
}

function showSection(id, item) {
  document.querySelectorAll('.content-section, .section').forEach(s => s.classList.remove('active'));
  const tgt = document.getElementById(id);
  if (tgt) tgt.classList.add('active');
  document.querySelectorAll('.nav-item, .menu-item').forEach(i => i.classList.remove('active'));
  if (item) item.classList.add('active');
  
  // Carregar dados específicos da seção
  if (id === 'historico-cliente' && typeof loadHistoricoCliente === 'function') {
    loadHistoricoCliente();
  }
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
        console.error('Erro ao fazer login:', error);
        showNotificationToast('Erro ao fazer login', 'error');
    }
}

const fazerLoginCliente = (e) => fazerLogin(e, 'cliente');
const fazerLoginBarbeiro = (e) => fazerLogin(e, 'barbeiro');

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
            setTimeout(() => showLogin(tipo), 2000);
        } else {
            showNotificationToast(data.message || 'Não foi possível concluir o cadastro', 'error');
        }
    } catch (error) {
        console.error('Erro ao cadastrar:', error);
        showNotificationToast('Erro ao cadastrar', 'error');
    }
}

const fazerCadastroCliente = (e) => fazerCadastro(e, 'cliente');
const fazerCadastroBarbeiro = (e) => fazerCadastro(e, 'barbeiro');

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

function showFormMessage(message, type='info', timeout=5000){
  const container = document.querySelector('.agendamento-form') || document.getElementById('formAgendar');
  if(!container) return;
  let el = document.getElementById('form-message');
  if(!el){
    el = document.createElement('div');
    el.id='form-message';
    el.style.cssText = 'margin-bottom:0.75rem; padding:0.75rem; border-radius:6px; color:#fff;';
    container.parentNode.insertBefore(el, container);
  }
  el.textContent = message;
  if(type==='error') el.style.background = '#c0152f';
  else if(type==='success') el.style.background = '#16a34a';
  else el.style.background = '#0b84a5';
  if(timeout>0){
    clearTimeout(el._timer);
    el._timer = setTimeout(()=>{ try{ el.remove(); }catch(e){} }, timeout);
  }
}

function toggleTheme(){
  document.body.classList.toggle('dark-theme');
  const icon = document.getElementById('theme-icon');
  if(icon){
    icon.classList.toggle('fa-moon');
    icon.classList.toggle('fa-sun');
  }
}

function updateDateTime(){
  const el = document.getElementById('current-datetime');
  if(!el) return;
  const opts = { weekday:'long', day:'2-digit', month:'2-digit', year:'numeric', hour:'2-digit', minute:'2-digit' };
  el.textContent = new Date().toLocaleDateString('pt-BR', opts);
}

function logout(){ window.location.href='/logout'; }

function formatDate(dateStr) {
  if (!dateStr) return '--';
  try {
    const date = new Date(dateStr);
    return date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' });
  } catch {
    return dateStr;
  }
}

function formatCurrency(value) {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value || 0);
}

// ===== FUNÇÕES DO CLIENTE =====
async function loadBarbers(){
  try{
    const res = await fetch(API.barbers, {credentials:'include'});
    if(!res.ok) return;
    const j = await res.json();
    const list = j.data || [];
    BARBERS = list;
    
    const barberEl = document.querySelector('[data-role="barbeiro"]');
    if(!barberEl) return;
    barberEl.innerHTML = '';
    
    if(list.length === 0) {
      barberEl.appendChild(new Option('Nenhum barbeiro cadastrado no sistema',''));
      barberEl.disabled = true;
      showFormMessage('Não há barbeiros cadastrados no momento. Aguarde novos cadastros.', 'info', 0);
      return;
    }
    
    barberEl.appendChild(new Option('Selecione um barbeiro',''));
    list.forEach(b=>{ barberEl.appendChild(new Option(b.nome, b.id)); });

    barberEl.addEventListener('change', async (e)=>{
      const sel = BARBERS.find(x=>String(x.id)===String(e.target.value));
      const disponibilidade = sel?.disponibilidade || [];
      const times = typeof disponibilidade === 'string' ? JSON.parse(disponibilidade) : disponibilidade;
      await populateTimes(times);
      updateFormState();
    });
  }catch(e){ console.error('Erro ao carregar barbeiros', e); }
}

async function populateTimes(times){
  const horaEl = document.querySelector('[data-role="horario"]');
  if(!horaEl) return;
  horaEl.innerHTML = '';
  if(!times || times.length===0){
    horaEl.appendChild(new Option('Sem horários disponíveis',''));
    return;
  }

  const barberEl = document.querySelector('[data-role="barbeiro"]');
  const dateInput = document.querySelector('[data-role="data"]');
  let occupied = [];
  
  try{
    if(barberEl && dateInput && dateInput.value){
      const bid = barberEl.value;
      const date = new Date(dateInput.value + 'T00:00:00').toISOString().split('T')[0];
      const res = await fetch(`/api/appointments/for_barber/${bid}?date=${date}`, {credentials:'include'});
      if(res.ok){
        const j = await res.json();
        occupied = (j.data||[]).filter(a => a.status !== 'cancelado').map(a=>a.time);
      }
    }
  }catch(e){ console.warn('Não foi possível obter agendamentos do barbeiro', e); }

  const selectedDate = dateInput ? new Date(dateInput.value + 'T00:00:00') : null;
  const now = new Date();
  const isToday = selectedDate &&
                  selectedDate.getDate() === now.getDate() &&
                  selectedDate.getMonth() === now.getMonth() &&
                  selectedDate.getFullYear() === now.getFullYear();

  times.forEach(t => {
    const o = document.createElement('option');
    o.value = t;
    o.text = t;
    
    if(occupied.includes(t)){
      o.disabled = true;
      o.text = t + ' (ocupado)';
    }
    else if(isToday) {
      const [hours, minutes] = t.split(':').map(Number);
      const timeDate = new Date();
      timeDate.setHours(hours, minutes, 0, 0);
      
      if(timeDate <= now) {
        o.disabled = true;
        o.text = t + ' (indisponível)';
      }
    }
    
    horaEl.appendChild(o);
  });
  
  try{ updateFormState(); }catch(e){}
}

async function updateFormState(){
  const servEl = document.querySelector('[data-role="servico"]');
  const barberEl = document.querySelector('[data-role="barbeiro"]');
  const dateEl = document.querySelector('[data-role="data"]');
  const horaEl = document.querySelector('[data-role="horario"]');
  const confirmBtn = document.querySelector('button[data-onclick*="confirmarAgendamentoPage"]');
  if(!confirmBtn) return;

  const serviceId = servEl?.value;
  const barberId = barberEl?.value;
  const dateVal = dateEl?.value;
  const timeVal = horaEl?.value;

  let enabled = false;

  if(serviceId && dateVal && barberId && timeVal){
    enabled = true;
  }

  confirmBtn.disabled = !enabled;
  if(confirmBtn.disabled) confirmBtn.classList.add('disabled');
  else confirmBtn.classList.remove('disabled');
}

async function loadServices(){
  try{
    const res = await fetch(API.services, {credentials:'include'});
    if(!res.ok) return;
    const j = await res.json();
    const list = j.data || [];
    const servEl = document.querySelector('[data-role="servico"]');
    if(!servEl) return;
    servEl.innerHTML = '';
    servEl.appendChild(new Option('Selecione um serviço',''));
    list.forEach(s=>{ servEl.appendChild(new Option(`${s.nome} - R$ ${s.preco}`, s.id)); });
  }catch(e){ console.error('Erro ao carregar serviços', e); }
}

async function loadAppointmentsAndStats(){
  try{
    // Aguardar um pouco para garantir que o DOM está pronto
    await new Promise(resolve => setTimeout(resolve, 100));
    
    // Inicializar com valores padrão primeiro
    const elAtivos = document.getElementById('stat-ativos');
    const elConcl = document.getElementById('stat-concluidos');
    const elProx = document.getElementById('stat-proximo');
    const elGasto = document.getElementById('stat-gasto-mes');
    
    // Forçar valores padrão com innerHTML
    if(elAtivos) { elAtivos.innerHTML = '0'; elAtivos.textContent = '0'; }
    if(elConcl) { elConcl.innerHTML = '0'; elConcl.textContent = '0'; }
    if(elProx) { elProx.innerHTML = '--'; elProx.textContent = '--'; }
    if(elGasto) { elGasto.innerHTML = 'R$ 0,00'; elGasto.textContent = 'R$ 0,00'; }
    
    const res = await fetch(API.appointments, {credentials:'include'});
    if(!res.ok){ console.warn('Não autenticado ou erro ao listar'); return; }
    const j = await res.json();
    const items = j.data || [];
    
    console.log('📊 Total de agendamentos:', items.length);
    console.log('📊 Agendamentos:', items);

    // Ativos = pendente, agendado, confirmado (não concluído nem cancelado)
    const ativos = items.filter(a => {
      const status = a.status || '';
      return status !== 'concluido' && status !== 'cancelado';
    }).length;
    
    const concluidos = items.filter(a => a.status === 'concluido').length;
    
    console.log('📊 Ativos:', ativos, 'Concluídos:', concluidos);
    
    if(elAtivos) { elAtivos.innerHTML = String(ativos); elAtivos.textContent = String(ativos); }
    if(elConcl) { elConcl.innerHTML = String(concluidos); elConcl.textContent = String(concluidos); }

    const futuros = items.filter(a => a.date);
    futuros.sort((x,y)=> new Date(x.date + ' ' + (x.time||'00:00')) - new Date(y.date + ' ' + (y.time||'00:00')));
    const proximo = futuros.find(a => a.status !== 'cancelado');
    if(elProx) {
      let proxText = '--';
      if (proximo && proximo.date) {
        try {
          const dateObj = new Date(proximo.date + 'T00:00:00');
          if (!isNaN(dateObj.getTime())) {
            const dateStr = dateObj.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
            const timeStr = proximo.time || '--:--';
            proxText = `${dateStr} às ${timeStr}`;
          }
        } catch(err) {
          console.warn('Erro ao formatar próximo agendamento:', err);
        }
      }
      elProx.innerHTML = proxText;
      elProx.textContent = proxText;
    }

    const now = new Date();
    let gasto = 0;
    
    items.forEach(a => {
      try {
        if (!a.date) return;
        
        const d = new Date(a.date + 'T00:00:00');
        if (isNaN(d.getTime())) return;
        
        if (d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear()) {
          const price = parseFloat(a.total_price || a.price || a.total || 0);
          if (!isNaN(price) && price > 0) {
            gasto += price;
          }
        }
      } catch(err) {
        console.warn('Erro ao processar item:', a, err);
      }
    });
    
    if(elGasto) {
      const gastoSeguro = isNaN(gasto) ? 0 : gasto;
      const gastoFormatado = gastoSeguro.toFixed(2).replace('.', ',');
      const gastoText = `R$ ${gastoFormatado}`;
      elGasto.innerHTML = gastoText;
      elGasto.textContent = gastoText;
    }



    const badge = document.getElementById('badge-agend');
    if(badge) badge.textContent = items.length;
  }catch(e){ console.error('Erro ao carregar agendamentos', e); }
}

async function createAppointment(body){
  try{
    const res = await fetch(API.appointments, {
      method:'POST',
      credentials:'include',
      headers:{'Content-Type':'application/json'},
      body: JSON.stringify(body)
    });
    if(res.status === 401){ window.location.href = '/'; return null; }
    const j = await res.json();
    if(!res.ok) throw new Error(j.message || 'Erro');
    showNotificationToast('Agendamento criado com sucesso!', 'success');
    loadAppointmentsAndStats();
    carregarAgendamentos();
    return j.data;
  }catch(e){
    console.error(e);
    showNotificationToast(e.message || 'Falha ao criar agendamento', 'error');
    return null;
  }
}

async function carregarAgendamentos(){
  try{
    const res = await fetch(API.appointments, {credentials:'include'});
    if(!res.ok) return;
    const j = await res.json();
    const items = j.data || [];
    const lista = document.getElementById('agendamentos-lista');
    if(!lista) return;
    
    if(items.length===0){
      lista.innerHTML = `
        <div class="empty-state-modern">
          <div class="empty-state-icon">
            <i class="fas fa-calendar-times"></i>
          </div>
          <div class="empty-state-title">Nenhum agendamento</div>
          <div class="empty-state-description">Você ainda não tem agendamentos. Crie um novo agendamento para começar.</div>
          <button class="btn btn--primary btn-modern" onclick="showSection('agendar-cliente')" style="margin-top: 16px;">
            <i class="fas fa-plus"></i> Novo Agendamento
          </button>
        </div>`;
      return;
    }
    
    lista.innerHTML = items.map((a, idx)=>{
      const dateText = a.date ? new Date(a.date).toLocaleDateString('pt-BR') : '';
      const statusColors = {
        'confirmado': 'success',
        'agendado': 'info',
        'concluido': 'success',
        'cancelado': 'error'
      };
      const statusColor = statusColors[a.status] || 'info';
      const statusText = {
        'confirmado': 'Confirmado',
        'agendado': 'Agendado',
        'concluido': 'Concluído',
        'cancelado': 'Cancelado'
      }[a.status] || a.status;
      
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
  }catch(e){ console.error(e); }
}

async function agendar(e){
  e.preventDefault();
  const servicoEl = document.querySelector('[data-role="servico"]');
  const barberEl = document.querySelector('[data-role="barbeiro"]');
  const horaEl = document.querySelector('[data-role="horario"]');
  const dataInput = document.querySelector('[data-role="data"]');

  let serviceId = servicoEl?.value || null;
  let serviceText = servicoEl?.selectedOptions?.[0]?.text || serviceId;
  let barberId = barberEl?.value ? Number(barberEl.value) : null;
  let barberName = barberEl?.selectedOptions?.[0]?.text || null;
  let date = dataInput?.value || null;
  let time = horaEl?.value || null;

  if(!serviceId || !date || !time){
    showNotificationToast('Preencha todos os campos', 'error');
    return;
  }

  const body = {
    barberId: barberId,
    barberName: barberName || 'Barbeiro',
    serviceId: serviceId,
    serviceName: serviceText,
    date: date,
    time: time,
    total: 0
  };

  const result = await createAppointment(body);
  
  // Se criou com sucesso, redirecionar para meus agendamentos
  if (result) {
    // Limpar formulário
    const form = document.querySelector('.agendamento-form');
    if(form){
      const s = form.querySelector('[data-role="servico"]'); if(s) s.value='';
      const b = form.querySelector('[data-role="barbeiro"]'); if(b) b.value='';
      const h = form.querySelector('[data-role="horario"]'); if(h) h.innerHTML = '<option value="">Selecione um horário</option>';
      const d = form.querySelector('[data-role="data"]'); if(d) d.value = '';
    }
    
    // Limpar calendário se existir
    if (window.calendarInstance) {
      window.calendarInstance.selectedDate = null;
      window.calendarInstance.selectedTime = null;
      window.calendarInstance.updateCalendar();
      const timeSlotsContainer = document.getElementById('time-slots-container');
      if (timeSlotsContainer) timeSlotsContainer.style.display = 'none';
    }
    
    // Redirecionar para aba de meus agendamentos
    setTimeout(() => {
      if (typeof switchTab === 'function') {
        switchTab('meus-agendamentos');
      }
    }, 500);
  }
}

async function carregarAgendamentos(){
  try{
    const res = await fetch(API.appointments, {credentials:'include'});
    if(!res.ok) return;
    const j = await res.json();
    const items = j.data || [];
    const lista = document.getElementById('agendamentos-lista') || document.getElementById('agendamentosList');
    if(!lista) return;
    if(items.length===0){
      lista.innerHTML = `
        <div class="empty-state-modern">
          <div class="empty-state-icon">
            <i class="fas fa-calendar-times"></i>
          </div>
          <div class="empty-state-title">Nenhum agendamento</div>
          <div class="empty-state-description">Você ainda não tem agendamentos. Crie um novo agendamento para começar.</div>
          <button class="btn btn--primary btn-modern" onclick="showSection('agendar-cliente')">
            <i class="fas fa-plus"></i> Novo Agendamento
          </button>
        </div>`;
      return;
    }
    lista.innerHTML = items.map((a, idx)=>{
      const dateText = a.date ? new Date(a.date).toLocaleDateString('pt-BR') : '';
      const statusColors = {
        'confirmado': 'success',
        'agendado': 'info',
        'concluido': 'success',
        'cancelado': 'error'
      };
      const statusColor = statusColors[a.status] || 'info';
      return `
        <div class="elegant-card animate-fade-in-up" style="animation-delay: ${idx * 0.1}s; margin-bottom: 16px;">
          <div style="display: flex; align-items: start; gap: 16px;">
            <div class="custom-icon icon-gradient-blue" style="width: 48px; height: 48px; font-size: 24px; flex-shrink: 0;">
              <i class="fas fa-calendar"></i>
            </div>
            <div style="flex: 1;">
              <h3 style="margin: 0 0 8px 0; font-size: 16px; font-weight: 600;">${a.servico || 'Serviço'}</h3>
              <div style="display: flex; flex-direction: column; gap: 4px; font-size: 13px; color: var(--color-text-secondary);">
                <div><i class="fas fa-calendar-day" style="width: 16px;"></i> ${dateText} às ${a.time || ''}</div>
                <div><i class="fas fa-user" style="width: 16px;"></i> ${a.barbeiro || 'Barbeiro'}</div>
              </div>
              <div style="margin-top: 12px;">
                <span class="badge-modern badge-${statusColor}">${a.status || 'Agendado'}</span>
              </div>
            </div>
            <button onclick="cancelarAgendamento('${a.id}')" class="btn btn--outline btn-modern" style="padding: 8px 16px; font-size: 13px;">
              <i class="fas fa-times"></i> Cancelar
            </button>
          </div>
        </div>`;
    }).join('');
  }catch(e){ console.error(e); }
}

async function cancelarAgendamento(id){
  if(!confirm('Deseja cancelar este agendamento?')) return;
  try{
    const res = await fetch(`${API.appointments}/${id}`, {method:'DELETE', credentials:'include'});
    if(!res.ok) { const j=await res.json(); throw new Error(j.message||'Erro'); }
    showNotificationToast('Agendamento cancelado!', 'success');
    carregarAgendamentos();
    loadAppointmentsAndStats();
  }catch(e){
    console.error(e);
    showNotificationToast('Erro ao cancelar', 'error');
  }
}

function confirmarAgendamentoPage(){
  const fake = { preventDefault: ()=>{} };
  agendar(fake);
}

async function loadHistoricoCliente() {
  try {
    const res = await fetch(API.appointments, {credentials:'include'});
    if (!res.ok) return;
    const j = await res.json();
    const items = (j.data || []).filter(a => a.status === 'concluido' || a.status === 'cancelado');
    
    const lista = document.getElementById('historico-lista');
    if (!lista) return;
    
    if (items.length === 0) {
      lista.innerHTML = `
        <div class="empty-state-modern">
          <div class="empty-state-icon">
            <i class="fas fa-history"></i>
          </div>
          <div class="empty-state-title">Nenhum histórico</div>
          <div class="empty-state-description">Você ainda não tem serviços concluídos ou cancelados.</div>
        </div>`;
      return;
    }

    lista.innerHTML = items.map((a, idx) => {
      const statusIcon = a.status === 'concluido' ? 'check-circle' : 'times-circle';
      const statusBadge = a.status === 'concluido' ? 'success' : 'error';
      const iconGradient = a.status === 'concluido' ? 'icon-gradient-green' : 'icon-gradient-red';
      const dateText = formatDate(a.date);
      
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
                <div><i class="fas fa-calendar-day" style="width: 16px;"></i> ${dateText} às ${a.time || ''}</div>
                ${a.total_price ? `<div><i class="fas fa-dollar-sign" style="width: 16px;"></i> ${formatCurrency(a.total_price)}</div>` : ''}
              </div>
              <div style="margin-top: 12px;">
                <span class="badge-modern badge-${statusBadge}">${a.status === 'concluido' ? 'Concluído' : 'Cancelado'}</span>
              </div>
            </div>
          </div>
        </div>
      `;
    }).join('');
  } catch (e) {
    console.error('Erro ao carregar histórico:', e);
  }
}

function startClientPolling() {
  if (clientDashboardPoll) return;
  clientDashboardPoll = setInterval(async () => {
    try {
      await loadAppointmentsAndStats();
      await carregarAgendamentos();
      console.log('🔄 Dados do cliente atualizados');
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

// ===== FUNÇÕES DO BARBEIRO =====
async function loadAppointmentsBar(){
  try{
    const res = await fetch(API.appointments, {credentials:'include'});
    if(!res.ok) { console.warn('Erro ao obter agendamentos'); return; }
    const j = await res.json();
    const items = j.data || [];
    
    // Atualizar stats
    const hoje = new Date().toISOString().split('T')[0];
    const agendamentosHoje = items.filter(a => a.date === hoje).length;
    const concluidosHoje = items.filter(a => a.date === hoje && a.status === 'concluido').length;
    const elAgendHoje = document.getElementById('stat-agendamentos-hoje');
    const elConclHoje = document.getElementById('stat-concluidos-hoje');
    if(elAgendHoje) elAgendHoje.textContent = agendamentosHoje || 0;
    if(elConclHoje) elConclHoje.textContent = concluidosHoje || 0;
    
    // Renderizar lista completa
    const container = document.getElementById('barber-appointments-list');
    if(container){
      if(items.length===0) {
        container.innerHTML = `
          <div class="empty-state-modern">
            <div class="empty-state-icon">
              <i class="fas fa-calendar-times"></i>
            </div>
            <div class="empty-state-title">Nenhum agendamento</div>
            <div class="empty-state-description">Não há agendamentos no momento.</div>
          </div>`;
        return;
      }
      
      container.innerHTML = items.map((a, idx)=>{
        const dateText = a.date ? new Date(a.date).toLocaleDateString('pt-BR') : '';
        const statusColors = {
          'confirmado': 'success',
          'agendado': 'info',
          'concluido': 'success',
          'cancelado': 'error'
        };
        const statusColor = statusColors[a.status] || 'info';
        
        return `
          <div class="elegant-card animate-fade-in-up" style="animation-delay: ${idx * 0.05}s; margin-bottom: 16px;">
            <div style="display: flex; align-items: start; gap: 16px;">
              <div class="custom-icon icon-gradient-blue" style="width: 48px; height: 48px; font-size: 24px; flex-shrink: 0; color: white;">
                <i class="fas fa-user"></i>
              </div>
              <div style="flex: 1;">
                <h3 style="margin: 0 0 8px 0; font-size: 16px; font-weight: 600;">${a.servico || 'Serviço'}</h3>
                <div style="display: flex; flex-direction: column; gap: 4px; font-size: 13px; color: var(--color-text-secondary);">
                  <div><i class="fas fa-user" style="width: 16px;"></i> ${a.cliente || 'Cliente'}</div>
                  <div><i class="fas fa-envelope" style="width: 16px;"></i> ${a.cliente_email || ''}</div>
                  <div><i class="fas fa-calendar-day" style="width: 16px;"></i> ${dateText} às ${a.time || ''}</div>
                </div>
                <div style="margin-top: 12px;">
                  <span class="badge-modern badge-${statusColor}">${a.status || 'Agendado'}</span>
                </div>
              </div>
              <div style="display: flex; flex-direction: column; gap: 8px;">
                ${a.status !== 'confirmado' ? `<button onclick="updateStatus('${a.id}','confirmado')" class="btn btn--outline btn-modern" style="padding: 6px 12px; font-size: 12px; white-space: nowrap;"><i class="fas fa-check"></i> Confirmar</button>` : ''}
                ${a.status !== 'concluido' ? `<button onclick="updateStatus('${a.id}','concluido')" class="btn btn--primary btn-modern" style="padding: 6px 12px; font-size: 12px; white-space: nowrap;"><i class="fas fa-check-double"></i> Concluir</button>` : ''}
                ${a.status !== 'cancelado' ? `<button onclick="updateStatus('${a.id}','cancelado')" class="btn btn--outline btn-modern" style="padding: 6px 12px; font-size: 12px; white-space: nowrap; color: var(--color-error); border-color: var(--color-error);"><i class="fas fa-times"></i> Recusar</button>` : ''}
              </div>
            </div>
          </div>`;
      }).join('');
    }
    
    // Renderizar próximos agendamentos no dashboard
    const proximosContainer = document.getElementById('proximos-agendamentos-barbeiro');
    if(proximosContainer) {
      const now = new Date();
      const proximos = items
        .filter(a => {
          // Filtrar apenas agendamentos futuros ou de hoje que ainda não passaram
          if (a.status === 'cancelado' || a.status === 'concluido') return false;
          const appointmentDate = new Date(a.date + ' ' + a.time);
          return appointmentDate >= now;
        })
        .sort((a, b) => {
          // Ordenar por data e hora
          const dateA = new Date(a.date + ' ' + a.time);
          const dateB = new Date(b.date + ' ' + b.time);
          return dateA - dateB;
        })
        .slice(0, 5);
      
      if(proximos.length === 0) {
        proximosContainer.innerHTML = `
          <div class="empty-state-modern">
            <div class="empty-state-icon">
              <i class="fas fa-calendar-check"></i>
            </div>
            <div class="empty-state-title">Nenhum agendamento pendente</div>
            <div class="empty-state-description">Todos os agendamentos foram concluídos ou não há novos agendamentos.</div>
          </div>`;
      } else {
        proximosContainer.innerHTML = proximos.map((a, idx) => {
          const appointmentDate = new Date(a.date + ' ' + a.time);
          const isToday = appointmentDate.toDateString() === now.toDateString();
          const isTomorrow = appointmentDate.toDateString() === new Date(now.getTime() + 86400000).toDateString();
          
          let dateLabel = '';
          if (isToday) {
            dateLabel = 'Hoje';
          } else if (isTomorrow) {
            dateLabel = 'Amanhã';
          } else {
            dateLabel = appointmentDate.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' });
          }
          
          const statusColors = {
            'confirmado': 'success',
            'agendado': 'warning'
          };
          const statusColor = statusColors[a.status] || 'info';
          const statusIcon = a.status === 'confirmado' ? 'check-circle' : 'clock';
          
          return `
            <div class="appointment-card-next animate-fade-in-up" style="animation-delay: ${idx * 0.08}s;">
              <div class="appointment-card-next-time">
                <div class="appointment-time-badge ${isToday ? 'today' : ''}">
                  <div class="time-badge-hour">${a.time}</div>
                  <div class="time-badge-date">${dateLabel}</div>
                </div>
              </div>
              <div class="appointment-card-next-content">
                <div class="appointment-card-next-header">
                  <h4 class="appointment-service">${a.servico || 'Serviço'}</h4>
                  <span class="badge-status badge-${statusColor}">
                    <i class="fas fa-${statusIcon}"></i>
                  </span>
                </div>
                <div class="appointment-card-next-info">
                  <div class="info-item">
                    <i class="fas fa-user"></i>
                    <span>${a.cliente || 'Cliente'}</span>
                  </div>
                  ${a.cliente_email ? `
                  <div class="info-item">
                    <i class="fas fa-envelope"></i>
                    <span>${a.cliente_email}</span>
                  </div>` : ''}
                </div>
                <div class="appointment-card-next-actions">
                  ${a.status !== 'confirmado' ? `
                  <button onclick="updateStatus('${a.id}','confirmado')" class="action-btn-mini action-btn-confirm" title="Confirmar">
                    <i class="fas fa-check"></i>
                  </button>` : ''}
                  <button onclick="updateStatus('${a.id}','concluido')" class="action-btn-mini action-btn-complete" title="Concluir">
                    <i class="fas fa-check-double"></i>
                  </button>
                  <button onclick="showSection('agenda-barbeiro')" class="action-btn-mini action-btn-view" title="Ver detalhes">
                    <i class="fas fa-eye"></i>
                  </button>
                </div>
              </div>
            </div>`;
        }).join('');
      }
    }
  }catch(e){ console.error(e); }
}

async function updateStatus(appointmentId, status){
  try{
    const res = await fetch(`${API.appointments}/${appointmentId}/status`, {
      method:'PATCH',
      credentials:'include',
      headers:{'Content-Type':'application/json'},
      body: JSON.stringify({status})
    });
    if(!res.ok) { const j=await res.json(); throw new Error(j.message||'Erro'); }
    
    const statusMessages = {
      'confirmado': 'Agendamento confirmado!',
      'concluido': 'Serviço concluído!',
      'cancelado': 'Agendamento cancelado!'
    };
    
    showNotificationToast(statusMessages[status] || 'Status atualizado com sucesso!', 'success');
    
    // Recarregar todos os dados do dashboard
    loadAppointmentsBar();
    
    // Se estiver na agenda inteligente, recarregar
    if (typeof loadAgendaAppointments === 'function') {
      await loadAgendaAppointments();
      if (typeof renderAgenda === 'function') {
        renderAgenda();
      }
    }
    
    // Recarregar próximos agendamentos
    if (typeof loadProximosAgendamentos === 'function') {
      loadProximosAgendamentos();
    }
    
    // Recarregar histórico (se concluído ou cancelado)
    if ((status === 'concluido' || status === 'cancelado') && typeof loadHistoricoCliente === 'function') {
      loadHistoricoCliente();
    }
    
  }catch(e){
    console.error(e);
    showNotificationToast('Falha ao atualizar status', 'error');
  }
}

async function loadProducts(){
  try{
    const res = await fetch(API.products, {credentials:'include'});
    if(!res.ok) { console.warn('Erro ao obter produtos'); return; }
    const j = await res.json();
    const items = j.data || [];
    
    // Atualizar stat
    const elProdutos = document.getElementById('stat-produtos');
    if(elProdutos) elProdutos.textContent = items.length;
    
    const el = document.getElementById('products-list');
    if(!el) return;
    
    if(items.length === 0) {
      el.innerHTML = `
        <div class="empty-state-modern">
          <div class="empty-state-icon">
            <i class="fas fa-box-open"></i>
          </div>
          <div class="empty-state-title">Nenhum produto cadastrado</div>
          <div class="empty-state-description">Adicione produtos ao estoque usando o formulário acima.</div>
        </div>`;
      return;
    }
    
    el.innerHTML = items.map((p, idx) => {
      const lowStock = p.quantidade < 5;
      return `
        <div class="elegant-card animate-fade-in-up" style="animation-delay: ${idx * 0.05}s; margin-bottom: 12px;">
          <div style="display: flex; align-items: start; gap: 16px;">
            <div class="custom-icon ${lowStock ? 'icon-gradient-red' : 'icon-gradient-green'}" style="width: 48px; height: 48px; font-size: 24px; flex-shrink: 0; color: white;">
              <i class="fas fa-box"></i>
            </div>
            <div style="flex: 1;">
              <h3 style="margin: 0 0 8px 0; font-size: 16px; font-weight: 600;">${p.produto}</h3>
              <div style="display: flex; flex-direction: column; gap: 4px; font-size: 13px; color: var(--color-text-secondary);">
                <div><i class="fas fa-layer-group" style="width: 16px;"></i> Quantidade: <strong>${p.quantidade}</strong></div>
                ${p.preco_custo ? `<div><i class="fas fa-dollar-sign" style="width: 16px;"></i> Custo: ${formatCurrency(p.preco_custo)}</div>` : ''}
                ${p.fornecedor ? `<div><i class="fas fa-truck" style="width: 16px;"></i> ${p.fornecedor}</div>` : ''}
              </div>
              ${lowStock ? `<div style="margin-top: 8px;"><span class="badge-modern badge-warning">Estoque Baixo</span></div>` : ''}
            </div>
            <div style="display: flex; flex-direction: column; gap: 8px;">
              <button onclick="editProductPrompt(${JSON.stringify(p).replace(/"/g, '&quot;')})" class="btn btn--outline btn-modern" style="padding: 6px 12px; font-size: 12px;">
                <i class="fas fa-edit"></i> Editar
              </button>
              <button onclick="deleteProduct(${p.id})" class="btn btn--outline btn-modern" style="padding: 6px 12px; font-size: 12px; color: var(--color-error); border-color: var(--color-error);">
                <i class="fas fa-trash"></i> Excluir
              </button>
            </div>
          </div>
        </div>`;
    }).join('');
  }catch(e){ console.error(e); }
}

async function createProduct(data){
  try{
    const res = await fetch(API.products, {
      method:'POST',
      credentials:'include',
      headers:{'Content-Type':'application/json'},
      body: JSON.stringify(data)
    });
    if(!res.ok){ const j=await res.json(); throw new Error(j.message||'Erro'); }
    showNotificationToast('Produto criado com sucesso!', 'success');
    loadProducts();
  }catch(e){
    console.error(e);
    showNotificationToast('Falha ao criar produto', 'error');
  }
}

async function deleteProduct(id){
  try{
    const res = await fetch(`${API.products}/${id}`, {method:'DELETE', credentials:'include'});
    if(!res.ok) throw new Error('Erro ao deletar');
    showNotificationToast('Produto excluído!', 'success');
    loadProducts();
  }catch(e){
    console.error(e);
    showNotificationToast('Falha ao excluir produto', 'error');
  }
}

function editProductPrompt(p){
  const novoNome = prompt('Nome', p.produto);
  const novaQtd = prompt('Quantidade', p.quantidade);
  const novoPreco = prompt('Preço', p.preco_custo || '0');
  if(novoNome==null) return;
  updateProduct(p.id, {name:novoNome, quantity:novaQtd, price:novoPreco});
}

async function updateProduct(id, data){
  try{
    const res = await fetch(`${API.products}/${id}`, {
      method:'PUT',
      credentials:'include',
      headers:{'Content-Type':'application/json'},
      body: JSON.stringify(data)
    });
    if(!res.ok){ const j=await res.json(); throw new Error(j.message||'Erro'); }
    showNotificationToast('Produto atualizado!', 'success');
    loadProducts();
  }catch(e){
    console.error(e);
    showNotificationToast('Falha ao atualizar produto', 'error');
  }
}

function startBarberPolling() {
  if (barberDashboardPoll) return;
  barberDashboardPoll = setInterval(async () => {
    try {
      await loadAppointmentsBar();
      console.log('🔄 Dados do barbeiro atualizados');
    } catch (e) {
      console.warn('Erro ao atualizar dados:', e);
    }
  }, 30000);
}

function stopBarberPolling() {
  if (barberDashboardPoll) {
    clearInterval(barberDashboardPoll);
    barberDashboardPoll = null;
  }
}

// ===== INICIALIZAÇÃO =====
document.addEventListener('DOMContentLoaded', () => {
    console.log('🚀 App Unificado inicializado');
    
    // Bind data-onclick attributes
    document.querySelectorAll('[data-onclick]').forEach(el => {
        el.addEventListener('click', (ev) => {
            ev.preventDefault();
            const code = el.getAttribute('data-onclick');
            try {
                eval(code);
            } catch (e) {
                console.error('Erro ao executar data-onclick:', e);
            }
        });
    });
    
    // Inicializar data/hora
    setInterval(updateDateTime, 60000);
    updateDateTime();
    
    // Detectar tipo de dashboard e inicializar
    const isCliente = document.getElementById('dashboard-cliente') !== null;
    const isBarbeiro = document.getElementById('barber-appointments-list') !== null;
    
    if(isCliente) {
        console.log('📱 Dashboard Cliente detectado');
        loadAppointmentsAndStats();
        loadBarbers();
        loadServices();
        carregarAgendamentos();
        loadHistoricoCliente();
        startClientPolling();
        
        // Configurar data mínima
        const dateInput = document.querySelector('[data-role="data"]');
        if(dateInput) {
            const today = new Date().toISOString().split('T')[0];
            dateInput.min = today;
            dateInput.value = today;
            
            dateInput.addEventListener('change', async ()=>{
                const barberEl = document.querySelector('[data-role="barbeiro"]');
                if(barberEl && barberEl.value) {
                    const sel = BARBERS.find(x=>String(x.id)===String(barberEl.value));
                    const disponibilidade = sel?.disponibilidade || [];
                    const times = typeof disponibilidade === 'string' ? JSON.parse(disponibilidade) : disponibilidade;
                    await populateTimes(times);
                }
                updateFormState();
            });
        }
        
        const servEl = document.querySelector('[data-role="servico"]');
        const horaEl = document.querySelector('[data-role="horario"]');
        if(servEl) servEl.addEventListener('change', ()=>{ updateFormState(); });
        if(horaEl) horaEl.addEventListener('change', ()=>{ updateFormState(); });
    }
    
    if(isBarbeiro) {
        console.log('💈 Dashboard Barbeiro detectado');
        loadAppointmentsBar();
        loadProducts();
        startBarberPolling();
    }
});

// Parar polling ao sair
window.addEventListener('beforeunload', () => {
    stopClientPolling();
    stopBarberPolling();
});

// ===== EXPORTAR FUNÇÕES GLOBAIS =====
window.showScreen = showScreen;
window.selectUserType = selectUserType;
window.showLogin = showLogin;
window.showRegister = showRegister;
window.goBack = goBack;
window.fazerLoginCliente = fazerLoginCliente;
window.fazerLoginBarbeiro = fazerLoginBarbeiro;
window.fazerCadastroCliente = fazerCadastroCliente;
window.fazerCadastroBarbeiro = fazerCadastroBarbeiro;
window.showNotificationToast = showNotificationToast;
window.showSection = showSection;
window.toggleTheme = toggleTheme;
window.logout = logout;
window.showNotifications = showNotifications;
window.createAppointment = createAppointment;
window.agendar = agendar;
window.carregarAgendamentos = carregarAgendamentos;
window.cancelarAgendamento = cancelarAgendamento;
window.confirmarAgendamentoPage = confirmarAgendamentoPage;
window.loadHistoricoCliente = loadHistoricoCliente;
window.formatDate = formatDate;
window.formatCurrency = formatCurrency;
window.loadAppointmentsBar = loadAppointmentsBar;
window.loadProducts = loadProducts;
window.createProduct = createProduct;

async function showNotifications(){
  try{
    const res = await fetch(API.notifications, {credentials:'include'});
    if(!res.ok) throw new Error('Falha ao obter notificações');
    const j = await res.json();
    const data = j.data || [];
    if(data.length===0){
      showNotificationToast('Sem novas notificações', 'info');
      return;
    }
    const msgs = data.map(n=>`[${n.tipo}] ${n.mensagem} (${n.data})`).join('\n\n');
    alert(msgs);
  }catch(e){
    console.error(e);
    showNotificationToast('Erro ao buscar notificações', 'error');
  }
}

console.log('✅ App.js unificado carregado');

// ===== AGENDA INTELIGENTE DO BARBEIRO =====

let currentView = 'week'; // 'week', 'list', 'day'
let currentWeekStart = new Date();
let currentFilter = 'todos'; // 'todos', 'agendado', 'confirmado', 'concluido', 'cancelado'
let allAppointments = [];

// Configurar início da semana (segunda-feira)
function getWeekStart(date) {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  return new Date(d.setDate(diff));
}

// Formatar data para exibição
function formatDateBR(date) {
  return new Date(date).toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' });
}

function formatDayName(date) {
  return new Date(date).toLocaleDateString('pt-BR', { weekday: 'short' });
}

// Inicializar agenda inteligente
async function initAgendaInteligente() {
  currentWeekStart = getWeekStart(new Date());
  updateWeekDisplay(); // Atualizar display da semana imediatamente
  await loadAgendaAppointments();
  renderAgenda();
}

// Carregar agendamentos
async function loadAgendaAppointments() {
  try {
    const res = await fetch(API.appointments, { credentials: 'include' });
    if (!res.ok) return;
    const j = await res.json();
    allAppointments = j.data || [];
  } catch (e) {
    console.error('Erro ao carregar agendamentos:', e);
  }
}

// Filtrar agendamentos
function getFilteredAppointments() {
  let filtered = [...allAppointments];
  
  if (currentFilter !== 'todos') {
    filtered = filtered.filter(a => a.status === currentFilter);
  }
  
  return filtered;
}

// Renderizar agenda
function renderAgenda() {
  const container = document.getElementById('agenda-inteligente-content');
  if (!container) return;
  
  const filtered = getFilteredAppointments();
  
  if (currentView === 'week') {
    renderWeekView(container, filtered);
  } else if (currentView === 'list') {
    renderListView(container, filtered);
  } else if (currentView === 'day') {
    renderDayView(container, filtered);
  }
  
  updateAgendaStats(filtered);
}

// Renderizar visualização semanal
function renderWeekView(container, appointments) {
  const weekDays = [];
  for (let i = 0; i < 7; i++) {
    const day = new Date(currentWeekStart);
    day.setDate(currentWeekStart.getDate() + i);
    weekDays.push(day);
  }
  
  const today = new Date().toDateString();
  const timeSlots = ['08:00', '09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00', '18:00'];
  
  let html = '<div class="week-view">';
  
  // Header
  html += '<div class="week-header">';
  html += '<div class="week-header-cell time-label"></div>';
  weekDays.forEach(day => {
    const isToday = day.toDateString() === today;
    html += `
      <div class="week-header-cell">
        <div class="week-header-day ${isToday ? 'today' : ''}">
          <div class="week-header-day-name">${formatDayName(day)}</div>
          <div class="week-header-day-number">${day.getDate()}</div>
        </div>
      </div>`;
  });
  html += '</div>';
  
  // Time slots
  timeSlots.forEach(time => {
    html += `<div class="time-slot">${time}</div>`;
    
    weekDays.forEach(day => {
      const dayStr = day.toISOString().split('T')[0];
      const dayAppointments = appointments.filter(a => a.date === dayStr);
      const isPast = day < new Date(new Date().setHours(0, 0, 0, 0));
      
      html += `<div class="day-cell ${isPast ? 'past' : ''}" onclick="openNewAppointmentModal('${dayStr}', '${time}')">`;
      
      dayAppointments.forEach(apt => {
        if (apt.time && apt.time.startsWith(time.split(':')[0])) {
          html += `
            <div class="appointment-slot status-${apt.status}" onclick="event.stopPropagation(); showAppointmentModal(${apt.id})">
              <div class="appointment-slot-time">${apt.time}</div>
              <div class="appointment-slot-service">${apt.servico || 'Serviço'}</div>
              <div class="appointment-slot-client">${apt.cliente || 'Cliente'}</div>
            </div>`;
        }
      });
      
      html += '</div>';
    });
  });
  
  html += '</div>';
  container.innerHTML = html;
}

// Renderizar visualização de lista
function renderListView(container, appointments) {
  if (appointments.length === 0) {
    container.innerHTML = `
      <div class="agenda-empty">
        <div class="agenda-empty-icon">
          <i class="fas fa-calendar-times"></i>
        </div>
        <div class="agenda-empty-title">Nenhum agendamento encontrado</div>
        <div class="agenda-empty-description">Não há agendamentos para os filtros selecionados.</div>
      </div>`;
    return;
  }
  
  // Ordenar por data e hora
  const sorted = [...appointments].sort((a, b) => {
    const dateA = new Date(a.date + ' ' + a.time);
    const dateB = new Date(b.date + ' ' + b.time);
    return dateA - dateB;
  });
  
  let html = '<div class="list-view">';
  
  sorted.forEach(apt => {
    const dateText = formatDateBR(apt.date);
    html += `
      <div class="appointment-card-agenda status-${apt.status} animate-slide-in">
        <div class="appointment-card-header">
          <div class="appointment-card-info">
            <div class="appointment-card-time">${apt.time}</div>
            <div class="appointment-card-service">${apt.servico || 'Serviço'}</div>
            <div class="appointment-card-client">
              <i class="fas fa-user"></i>
              <span>${apt.cliente || 'Cliente'}</span>
            </div>
            <div class="appointment-card-contact">
              <i class="fas fa-envelope"></i>
              <span>${apt.cliente_email || 'Sem email'}</span>
            </div>
            <div style="margin-top: 8px; font-size: 13px; color: var(--color-text-secondary);">
              <i class="fas fa-calendar"></i> ${dateText}
            </div>
          </div>
          <div>
            <span class="badge-modern badge-${apt.status === 'confirmado' ? 'success' : apt.status === 'concluido' ? 'success' : apt.status === 'cancelado' ? 'error' : 'info'}">${apt.status || 'Agendado'}</span>
          </div>
        </div>
        <div class="appointment-card-actions">
          ${apt.status !== 'confirmado' && apt.status !== 'concluido' ? `<button class="action-btn action-btn-confirm" onclick="updateStatus('${apt.id}', 'confirmado')"><i class="fas fa-check"></i> Confirmar</button>` : ''}
          ${apt.status !== 'concluido' && apt.status !== 'cancelado' ? `<button class="action-btn action-btn-complete" onclick="updateStatus('${apt.id}', 'concluido')"><i class="fas fa-check-double"></i> Concluir</button>` : ''}
          ${apt.status !== 'cancelado' && apt.status !== 'concluido' ? `<button class="action-btn action-btn-cancel" onclick="updateStatus('${apt.id}', 'cancelado')"><i class="fas fa-times"></i> Cancelar</button>` : ''}
          <button class="action-btn action-btn-reschedule" onclick="showAppointmentModal(${apt.id})"><i class="fas fa-info-circle"></i> Detalhes</button>
        </div>
      </div>`;
  });
  
  html += '</div>';
  container.innerHTML = html;
}

// Renderizar visualização do dia (timeline)
function renderDayView(container, appointments) {
  const today = new Date().toISOString().split('T')[0];
  const todayAppointments = appointments.filter(a => a.date === today);
  
  if (todayAppointments.length === 0) {
    container.innerHTML = `
      <div class="agenda-empty">
        <div class="agenda-empty-icon">
          <i class="fas fa-calendar-day"></i>
        </div>
        <div class="agenda-empty-title">Nenhum agendamento hoje</div>
        <div class="agenda-empty-description">Você não tem agendamentos para hoje.</div>
      </div>`;
    return;
  }
  
  const sorted = [...todayAppointments].sort((a, b) => {
    return a.time.localeCompare(b.time);
  });
  
  let html = `
    <div class="day-timeline">
      <div class="timeline-header">
        <div class="timeline-title">Agenda de Hoje</div>
        <div class="timeline-date">${formatDateBR(today)}</div>
      </div>
      <div class="timeline-content">
        <div class="timeline-line"></div>`;
  
  sorted.forEach(apt => {
    html += `
      <div class="timeline-item status-${apt.status}">
        <div class="timeline-dot"></div>
        <div class="timeline-time">${apt.time}</div>
        <div class="timeline-service">${apt.servico || 'Serviço'}</div>
        <div class="timeline-client">${apt.cliente || 'Cliente'} • ${apt.cliente_email || ''}</div>
      </div>`;
  });
  
  html += `
      </div>
    </div>`;
  
  container.innerHTML = html;
}

// Atualizar estatísticas da agenda
function updateAgendaStats(appointments) {
  const hoje = new Date().toISOString().split('T')[0];
  const agendamentosHoje = appointments.filter(a => a.date === hoje).length;
  const confirmados = appointments.filter(a => a.status === 'confirmado').length;
  const pendentes = appointments.filter(a => a.status === 'agendado').length;
  
  const elHoje = document.getElementById('agenda-stat-hoje');
  const elConfirmados = document.getElementById('agenda-stat-confirmados');
  const elPendentes = document.getElementById('agenda-stat-pendentes');
  
  if (elHoje) elHoje.textContent = agendamentosHoje;
  if (elConfirmados) elConfirmados.textContent = confirmados;
  if (elPendentes) elPendentes.textContent = pendentes;
}

// Navegação de semana
function previousWeek() {
  currentWeekStart.setDate(currentWeekStart.getDate() - 7);
  renderAgenda();
  updateWeekDisplay();
}

function nextWeek() {
  currentWeekStart.setDate(currentWeekStart.getDate() + 7);
  renderAgenda();
  updateWeekDisplay();
}

function goToToday() {
  currentWeekStart = getWeekStart(new Date());
  renderAgenda();
  updateWeekDisplay();
}

function updateWeekDisplay() {
  const el = document.getElementById('agenda-current-week');
  if (!el) return;
  
  const weekEnd = new Date(currentWeekStart);
  weekEnd.setDate(currentWeekStart.getDate() + 6);
  
  const startStr = currentWeekStart.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' });
  const endStr = weekEnd.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' });
  
  el.textContent = `${startStr} - ${endStr}`;
}

// Alternar visualização
function setView(view) {
  currentView = view;
  
  document.querySelectorAll('.view-toggle-btn').forEach(btn => {
    btn.classList.remove('active');
  });
  event.target.classList.add('active');
  
  renderAgenda();
}

// Filtrar por status
function setFilter(filter) {
  currentFilter = filter;
  
  document.querySelectorAll('.filter-btn').forEach(btn => {
    btn.classList.remove('active');
  });
  event.target.classList.add('active');
  
  renderAgenda();
}

// Modal de detalhes do agendamento
function showAppointmentModal(id) {
  const apt = allAppointments.find(a => a.id == id);
  if (!apt) return;
  
  const dateText = formatDateBR(apt.date);
  
  const modal = document.createElement('div');
  modal.className = 'appointment-modal';
  modal.innerHTML = `
    <div class="appointment-modal-content">
      <div class="modal-header">
        <div class="modal-title">Detalhes do Agendamento</div>
        <button class="modal-close" onclick="this.closest('.appointment-modal').remove()">
          <i class="fas fa-times"></i>
        </button>
      </div>
      <div class="modal-body">
        <div class="modal-field">
          <div class="modal-field-label">Serviço</div>
          <div class="modal-field-value">${apt.servico || 'Não especificado'}</div>
        </div>
        <div class="modal-field">
          <div class="modal-field-label">Cliente</div>
          <div class="modal-field-value">${apt.cliente || 'Não especificado'}</div>
        </div>
        <div class="modal-field">
          <div class="modal-field-label">Email</div>
          <div class="modal-field-value">${apt.cliente_email || 'Não especificado'}</div>
        </div>
        <div class="modal-field">
          <div class="modal-field-label">Data e Hora</div>
          <div class="modal-field-value">${dateText} às ${apt.time}</div>
        </div>
        <div class="modal-field">
          <div class="modal-field-label">Status</div>
          <div class="modal-field-value">
            <span class="badge-modern badge-${apt.status === 'confirmado' ? 'success' : apt.status === 'concluido' ? 'success' : apt.status === 'cancelado' ? 'error' : 'info'}">${apt.status || 'Agendado'}</span>
          </div>
        </div>
        ${apt.total_price ? `
        <div class="modal-field">
          <div class="modal-field-label">Valor</div>
          <div class="modal-field-value">${formatCurrency(apt.total_price)}</div>
        </div>` : ''}
      </div>
      <div class="modal-actions">
        ${apt.status !== 'confirmado' && apt.status !== 'concluido' ? `<button class="action-btn action-btn-confirm" onclick="updateStatus('${apt.id}', 'confirmado'); this.closest('.appointment-modal').remove();"><i class="fas fa-check"></i> Confirmar</button>` : ''}
        ${apt.status !== 'concluido' && apt.status !== 'cancelado' ? `<button class="action-btn action-btn-complete" onclick="updateStatus('${apt.id}', 'concluido'); this.closest('.appointment-modal').remove();"><i class="fas fa-check-double"></i> Concluir</button>` : ''}
        ${apt.status !== 'cancelado' && apt.status !== 'concluido' ? `<button class="action-btn action-btn-cancel" onclick="updateStatus('${apt.id}', 'cancelado'); this.closest('.appointment-modal').remove();"><i class="fas fa-times"></i> Cancelar</button>` : ''}
      </div>
    </div>`;
  
  modal.addEventListener('click', (e) => {
    if (e.target === modal) modal.remove();
  });
  
  document.body.appendChild(modal);
}

// Modal para novo agendamento (placeholder)
function openNewAppointmentModal(date, time) {
  showNotificationToast('Funcionalidade de criar agendamento em desenvolvimento', 'info');
}

// Atualizar status e recarregar agenda
const originalUpdateStatus = window.updateStatus;
window.updateStatus = async function(appointmentId, status) {
  await originalUpdateStatus(appointmentId, status);
  await loadAgendaAppointments();
  renderAgenda();
};

// Exportar funções
window.initAgendaInteligente = initAgendaInteligente;
window.loadAgendaAppointments = loadAgendaAppointments;
window.renderAgenda = renderAgenda;
window.previousWeek = previousWeek;
window.nextWeek = nextWeek;
window.goToToday = goToToday;
window.setView = setView;
window.setFilter = setFilter;
window.showAppointmentModal = showAppointmentModal;
window.openNewAppointmentModal = openNewAppointmentModal;

console.log('✅ Agenda Inteligente carregada');

// ===== SISTEMA DE ABAS =====
function switchTab(tabId) {
  // Remover active de todos os botões e painéis
  document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
  document.querySelectorAll('.tab-panel').forEach(panel => panel.classList.remove('active'));
  
  // Ativar botão e painel selecionados
  event.target.closest('.tab-btn')?.classList.add('active');
  document.getElementById(tabId)?.classList.add('active');
  
  // Se mudou para novo agendamento, recarregar barbeiros e serviços
  if (tabId === 'novo-agendamento') {
    loadBarbers();
    loadServices();
  }
}

// Exportar função
window.switchTab = switchTab;

console.log('✅ Sistema de abas carregado');
