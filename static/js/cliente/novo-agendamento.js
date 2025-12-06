// ===== SISTEMA PROFISSIONAL DE AGENDAMENTO =====

let bookingState = {
  currentStep: 1,
  service: null,
  barber: null,
  date: null,
  time: null,
  services: [],
  barbers: [],
  currentMonth: new Date().getMonth(),
  currentYear: new Date().getFullYear()
};

// ===== INICIALIZAÇÃO =====
async function initNovoAgendamento() {
  console.log('🚀 Inicializando sistema de agendamento profissional');
  
  const today = new Date();
  bookingState.currentMonth = today.getMonth();
  bookingState.currentYear = today.getFullYear();
  
  await Promise.all([loadBarbersData(), loadServicesData()]);
  
  renderStep(1);
  updateProgress();
}

// ===== CARREGAMENTO DE DADOS =====
async function loadServicesData() {
  try {
    const timestamp = new Date().getTime();
    const res = await fetch(`/api/services?_=${timestamp}`, { 
      credentials: 'include',
      cache: 'no-cache'
    });
    
    if (!res.ok) throw new Error('Erro ao carregar serviços');
    
    const data = await res.json();
    bookingState.services = data.data || [];
    console.log('✅ Serviços carregados:', bookingState.services.length);
  } catch (error) {
    console.error('❌ Erro ao carregar serviços:', error);
    showNotificationToast('Erro ao carregar serviços', 'error');
  }
}

async function loadBarbersData() {
  try {
    const res = await fetch('/api/barbers', { credentials: 'include' });
    
    if (!res.ok) throw new Error('Erro ao carregar barbeiros');
    
    const data = await res.json();
    bookingState.barbers = data.data || [];
    console.log('✅ Barbeiros carregados:', bookingState.barbers.length);
  } catch (error) {
    console.error('❌ Erro ao carregar barbeiros:', error);
    showNotificationToast('Erro ao carregar barbeiros', 'error');
  }
}

async function loadBarberPrices(barberId) {
  try {
    const response = await fetch(`/api/barber-prices?barbeiro_id=${barberId}`);
    const result = await response.json();
    
    if (result.success && result.data) {
      bookingState.services.forEach(service => {
        const customPrice = result.data[service.nome];
        if (customPrice !== undefined) {
          service.preco = customPrice;
        }
      });
      
      if (bookingState.currentStep === 2) {
        renderServices();
      }
    }
  } catch (error) {
    console.error('❌ Erro ao carregar preços:', error);
  }
}

// ===== RENDERIZAÇÃO DE BARBEIROS =====
function renderBarbers() {
  const container = document.getElementById('barbers-grid-new');
  if (!container) return;
  
  if (bookingState.barbers.length === 0) {
    container.innerHTML = `
      <div class="empty-state">
        <div class="empty-icon">
          <i class="fas fa-user-tie"></i>
        </div>
        <h3>Nenhum barbeiro disponível</h3>
        <p>Entre em contato para mais informações</p>
      </div>
    `;
    return;
  }
  
  container.innerHTML = bookingState.barbers.map(barber => {
    const isSelected = bookingState.barber?.id === barber.id;
    const initial = (barber.nome || 'B')[0].toUpperCase();
    const colors = ['#667eea', '#764ba2', '#f093fb', '#4facfe', '#43e97b', '#fa709a'];
    const color = colors[barber.id % colors.length];
    
    return `
      <div class="barber-card-pro ${isSelected ? 'selected' : ''}" 
           onclick="selectBarber(${barber.id})"
           data-aos="fade-up"
           data-aos-delay="${barber.id * 50}">
        
        <div class="barber-check">
          <i class="fas fa-check-circle"></i>
        </div>
        
        <div class="barber-avatar" style="background: linear-gradient(135deg, ${color}, ${color}dd);">
          <span>${initial}</span>
          <div class="avatar-ring"></div>
        </div>
        
        <div class="barber-info">
          <h3 class="barber-name">${barber.nome || 'Barbeiro'}</h3>
        </div>
      </div>
    `;
  }).join('');
}

async function selectBarber(barberId) {
  const barber = bookingState.barbers.find(b => b.id === barberId);
  if (!barber) return;
  
  bookingState.barber = barber;
  renderBarbers();
  await loadBarberPrices(barberId);
  updateNextButton();
}

// ===== RENDERIZAÇÃO DE SERVIÇOS =====
function renderServices() {
  const container = document.getElementById('services-grid-new');
  if (!container) return;
  
  if (bookingState.services.length === 0) {
    container.innerHTML = `
      <div class="empty-state">
        <div class="empty-icon">
          <i class="fas fa-cut"></i>
        </div>
        <h3>Nenhum serviço disponível</h3>
        <p>Entre em contato com a barbearia</p>
      </div>
    `;
    return;
  }
  
  const serviceConfig = {
    'Corte': {
      icon: 'fa-cut',
      gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      features: ['Lavagem incluída', 'Finalização profissional', 'Produtos premium'],
      badge: null
    },
    'Barba': {
      icon: 'fa-user-tie',
      gradient: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
      features: ['Toalha quente', 'Navalha profissional', 'Hidratação'],
      badge: null
    },
    'Corte + Barba': {
      icon: 'fa-scissors',
      gradient: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
      features: ['Combo completo', 'Melhor custo-benefício', 'Atendimento premium'],
      badge: { text: 'Mais Popular', class: 'popular' }
    },
    'Sobrancelha': {
      icon: 'fa-eye',
      gradient: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
      features: ['Design personalizado', 'Técnica profissional', 'Resultado natural'],
      badge: null
    },
    'Pigmentação': {
      icon: 'fa-paint-brush',
      gradient: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
      features: ['Pigmentação premium', 'Resultado duradouro', 'Produtos importados'],
      badge: { text: 'Premium', class: 'premium' }
    },
    'Hidratação': {
      icon: 'fa-tint',
      gradient: 'linear-gradient(135deg, #30cfd0 0%, #330867 100%)',
      features: ['Tratamento profundo', 'Produtos premium', 'Cabelos saudáveis'],
      badge: null
    }
  };
  
  container.innerHTML = bookingState.services.map((service, index) => {
    const isSelected = bookingState.service?.id === service.id;
    const config = serviceConfig[service.nome] || {
      icon: 'fa-cut',
      gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      features: [],
      badge: null
    };
    
    return `
      <div class="service-card-pro ${isSelected ? 'selected' : ''}" 
           onclick="selectService(${service.id})"
           data-aos="fade-up"
           data-aos-delay="${index * 50}">
        
        ${config.badge ? `
          <div class="service-badge-pro ${config.badge.class}">
            <i class="fas fa-crown"></i>
            ${config.badge.text}
          </div>
        ` : ''}
        
        <div class="service-check">
          <i class="fas fa-check-circle"></i>
        </div>
        
        <div class="service-icon-pro" style="background: ${config.gradient};">
          <i class="fas ${config.icon}"></i>
          <div class="icon-glow"></div>
        </div>
        
        <div class="service-content">
          <h3 class="service-title-pro">${service.nome}</h3>
          <p class="service-desc-pro">${service.descricao || getServiceDescription(service.nome)}</p>
          
          ${config.features.length > 0 ? `
            <div class="service-features-pro">
              ${config.features.map(f => `
                <div class="feature-item">
                  <i class="fas fa-check"></i>
                  <span>${f}</span>
                </div>
              `).join('')}
            </div>
          ` : ''}
        </div>
        
        <div class="service-footer-pro">
          <div class="service-duration-pro">
            <i class="fas fa-clock"></i>
            <span>${service.duracao || 30} min</span>
          </div>
          <div class="service-price-pro">
            <span class="price-label">A partir de</span>
            <span class="price-value">R$ ${parseFloat(service.preco).toFixed(2)}</span>
          </div>
        </div>
      </div>
    `;
  }).join('');
}

function getServiceDescription(nome) {
  const descriptions = {
    'Corte': 'Corte de cabelo profissional com técnicas modernas e acabamento impecável.',
    'Barba': 'Barba feita com navalha, toalha quente e produtos de alta qualidade.',
    'Corte + Barba': 'Combo completo com corte de cabelo e barba, o melhor custo-benefício.',
    'Sobrancelha': 'Design de sobrancelha masculina para um visual mais marcante.',
    'Pigmentação': 'Pigmentação de barba ou cabelo para um visual mais jovem.',
    'Hidratação': 'Tratamento de hidratação profunda para cabelos saudáveis.'
  };
  return descriptions[nome] || 'Serviço profissional de alta qualidade.';
}

function selectService(serviceId) {
  const service = bookingState.services.find(s => s.id === serviceId);
  if (!service) return;
  
  bookingState.service = service;
  renderServices();
  updateNextButton();
}

// ===== RENDERIZAÇÃO DE CALENDÁRIO =====
function renderCalendar() {
  const container = document.getElementById('calendar-grid-new');
  if (!container) return;
  
  const today = new Date();
  const currentMonth = bookingState.currentMonth;
  const currentYear = bookingState.currentYear;
  
  const titleEl = document.getElementById('calendar-title-new');
  if (titleEl) {
    const monthNames = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
                        'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];
    titleEl.textContent = `${monthNames[currentMonth]} ${currentYear}`;
  }
  
  const dayLabels = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
  let html = dayLabels.map(day => `<div class="calendar-day-label">${day}</div>`).join('');
  
  const firstDay = new Date(currentYear, currentMonth, 1).getDay();
  
  for (let i = 0; i < firstDay; i++) {
    html += '<div class="calendar-day-empty"></div>';
  }
  
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const todayDate = new Date();
  todayDate.setHours(0, 0, 0, 0);
  
  for (let day = 1; day <= daysInMonth; day++) {
    const date = new Date(currentYear, currentMonth, day);
    const dateStr = date.toISOString().split('T')[0];
    const isToday = day === today.getDate() && 
                    currentMonth === today.getMonth() && 
                    currentYear === today.getFullYear();
    const isPast = date < todayDate;
    const isSelected = bookingState.date === dateStr;
    const isWeekend = date.getDay() === 0 || date.getDay() === 6;
    
    const classes = [
      'calendar-day-pro',
      isToday ? 'today' : '',
      isPast ? 'disabled' : '',
      isSelected ? 'selected' : '',
      isWeekend ? 'weekend' : ''
    ].filter(Boolean).join(' ');
    
    html += `
      <div class="${classes}" onclick="selectDate('${dateStr}')">
        <span class="day-number">${day}</span>
        ${isToday ? '<span class="day-indicator">Hoje</span>' : ''}
      </div>
    `;
  }
  
  container.innerHTML = html;
}

async function selectDate(dateStr) {
  const date = new Date(dateStr + 'T00:00:00');
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  if (date < today) return;
  
  bookingState.time = null;
  bookingState.date = dateStr;
  renderCalendar();
  await loadAvailableTimes();
  updateNextButton();
}

// ===== RENDERIZAÇÃO DE HORÁRIOS =====
async function loadAvailableTimes() {
  const container = document.getElementById('time-slots-new');
  if (!container) return;
  
  if (!bookingState.barber || !bookingState.date) {
    container.innerHTML = '';
    return;
  }
  
  container.innerHTML = '<div class="loading-spinner"><i class="fas fa-spinner fa-spin"></i> Carregando horários...</div>';
  
  try {
    const res = await fetch(`/api/appointments/for_barber/${bookingState.barber.id}?date=${bookingState.date}`, {
      credentials: 'include'
    });
    
    let occupied = [];
    if (res.ok) {
      const data = await res.json();
      occupied = (data.data || [])
        .filter(a => a.status !== 'cancelado')
        .map(a => a.time);
    }
    
    const times = [];
    for (let hour = 8; hour < 18; hour++) {
      times.push(`${hour.toString().padStart(2, '0')}:00`);
      times.push(`${hour.toString().padStart(2, '0')}:30`);
    }
    
    const selectedDate = new Date(bookingState.date + 'T00:00:00');
    const today = new Date();
    const isToday = selectedDate.toDateString() === today.toDateString();
    
    container.innerHTML = times.map((time, index) => {
      const isOccupied = occupied.includes(time);
      let isPast = false;
      
      if (isToday) {
        const [hours, minutes] = time.split(':').map(Number);
        const timeDate = new Date();
        timeDate.setHours(hours, minutes, 0, 0);
        isPast = timeDate <= today;
      }
      
      const isDisabled = isOccupied || isPast;
      const isSelected = bookingState.time === time;
      
      const classes = [
        'time-slot-pro',
        isDisabled ? 'disabled' : '',
        isSelected ? 'selected' : ''
      ].filter(Boolean).join(' ');
      
      return `
        <div class="${classes}" 
             onclick="selectTime('${time}')"
             data-aos="fade-up"
             data-aos-delay="${index * 20}">
          <div class="time-icon">
            <i class="fas ${isOccupied ? 'fa-lock' : isPast ? 'fa-clock' : 'fa-check'}"></i>
          </div>
          <div class="time-value">${time}</div>
          ${isDisabled ? `
            <div class="time-status">${isOccupied ? 'Ocupado' : 'Indisponível'}</div>
          ` : ''}
        </div>
      `;
    }).join('');
    
  } catch (error) {
    console.error('Erro ao carregar horários:', error);
    container.innerHTML = '<div class="error-message"><i class="fas fa-exclamation-circle"></i> Erro ao carregar horários</div>';
  }
}

function selectTime(time) {
  const timeSlot = event.target.closest('.time-slot-pro');
  if (timeSlot && timeSlot.classList.contains('disabled')) return;
  
  bookingState.time = time;
  loadAvailableTimes();
  updateNextButton();
}

// ===== RENDERIZAÇÃO DE RESUMO =====
function renderSummary() {
  const container = document.getElementById('booking-summary-new');
  if (!container) return;
  
  const dateObj = new Date(bookingState.date + 'T00:00:00');
  const dateFormatted = dateObj.toLocaleDateString('pt-BR', { 
    weekday: 'long',
    day: '2-digit', 
    month: 'long', 
    year: 'numeric' 
  });
  
  const barberInitial = (bookingState.barber?.nome || 'B')[0].toUpperCase();
  
  container.innerHTML = `
    <div class="summary-card-pro" data-aos="fade-up">
      <div class="summary-header">
        <div class="summary-icon">
          <i class="fas fa-calendar-check"></i>
        </div>
        <h3>Confirme seu Agendamento</h3>
        <p>Revise os detalhes antes de confirmar</p>
      </div>
      
      <div class="summary-body">
        <div class="summary-item-pro">
          <div class="item-icon" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);">
            <i class="fas fa-cut"></i>
          </div>
          <div class="item-content">
            <span class="item-label">Serviço</span>
            <span class="item-value">${bookingState.service?.nome || '-'}</span>
          </div>
        </div>
        
        <div class="summary-item-pro">
          <div class="item-icon" style="background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);">
            <span class="avatar-initial">${barberInitial}</span>
          </div>
          <div class="item-content">
            <span class="item-label">Barbeiro</span>
            <span class="item-value">${bookingState.barber?.nome || '-'}</span>
          </div>
        </div>
        
        <div class="summary-item-pro">
          <div class="item-icon" style="background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);">
            <i class="fas fa-calendar"></i>
          </div>
          <div class="item-content">
            <span class="item-label">Data</span>
            <span class="item-value">${dateFormatted}</span>
          </div>
        </div>
        
        <div class="summary-item-pro">
          <div class="item-icon" style="background: linear-gradient(135deg, #43e97b 0%, #38f9d7 100%);">
            <i class="fas fa-clock"></i>
          </div>
          <div class="item-content">
            <span class="item-label">Horário</span>
            <span class="item-value">${bookingState.time || '-'}</span>
          </div>
        </div>
        
        <div class="summary-item-pro">
          <div class="item-icon" style="background: linear-gradient(135deg, #fa709a 0%, #fee140 100%);">
            <i class="fas fa-hourglass-half"></i>
          </div>
          <div class="item-content">
            <span class="item-label">Duração</span>
            <span class="item-value">${bookingState.service?.duracao || 30} minutos</span>
          </div>
        </div>
      </div>
      
      <div class="summary-footer">
        <div class="summary-total">
          <span class="total-label">Valor Total</span>
          <span class="total-value">R$ ${parseFloat(bookingState.service?.preco || 0).toFixed(2)}</span>
        </div>
        <div class="summary-note">
          <i class="fas fa-info-circle"></i>
          <span>Pagamento realizado no local</span>
        </div>
      </div>
    </div>
  `;
}

// ===== CONTROLE DE ETAPAS =====
function renderStep(step) {
  document.querySelectorAll('.booking-step').forEach(el => {
    el.classList.remove('active');
  });
  
  const stepEl = document.getElementById(`booking-step-${step}`);
  if (stepEl) {
    stepEl.classList.add('active');
  }
  
  if (step === 1) renderBarbers();
  else if (step === 2) renderServices();
  else if (step === 3) {
    renderCalendar();
    if (bookingState.date) loadAvailableTimes();
  }
  else if (step === 4) renderSummary();
  
  updateNextButton();
}

function updateProgress() {
  const steps = document.querySelectorAll('.progress-step');
  const progressLine = document.querySelector('.progress-line');
  
  steps.forEach((step, index) => {
    const stepNum = index + 1;
    step.classList.remove('active', 'completed');
    
    if (stepNum < bookingState.currentStep) {
      step.classList.add('completed');
    } else if (stepNum === bookingState.currentStep) {
      step.classList.add('active');
    }
  });
  
  if (progressLine) {
    const progress = ((bookingState.currentStep - 1) / 3) * 100;
    progressLine.style.width = `${progress}%`;
  }
}

function nextBookingStep() {
  if (bookingState.currentStep < 4) {
    bookingState.currentStep++;
    renderStep(bookingState.currentStep);
    updateProgress();
  } else {
    confirmarNovoAgendamento();
  }
}

function prevBookingStep() {
  if (bookingState.currentStep > 1) {
    bookingState.currentStep--;
    renderStep(bookingState.currentStep);
    updateProgress();
  }
}

function updateNextButton() {
  const btn = document.getElementById('btn-booking-next');
  if (!btn) return;
  
  let canProceed = false;
  
  if (bookingState.currentStep === 1) {
    canProceed = bookingState.barber !== null;
    btn.innerHTML = '<span>Continuar</span><i class="fas fa-arrow-right"></i>';
  } else if (bookingState.currentStep === 2) {
    canProceed = bookingState.service !== null;
    btn.innerHTML = '<span>Continuar</span><i class="fas fa-arrow-right"></i>';
  } else if (bookingState.currentStep === 3) {
    canProceed = bookingState.date !== null && bookingState.time !== null;
    btn.innerHTML = '<span>Revisar</span><i class="fas fa-arrow-right"></i>';
  } else if (bookingState.currentStep === 4) {
    canProceed = true;
    btn.innerHTML = '<i class="fas fa-check-circle"></i><span>Confirmar Agendamento</span>';
  }
  
  btn.disabled = !canProceed;
}

// ===== CONFIRMAÇÃO =====
async function confirmarNovoAgendamento() {
  const btn = document.getElementById('btn-booking-next');
  if (btn) {
    btn.disabled = true;
    btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i><span>Processando...</span>';
  }
  
  try {
    const body = {
      barberId: bookingState.barber.id,
      barberName: bookingState.barber.nome,
      serviceId: bookingState.service.id,
      serviceName: bookingState.service.nome,
      date: bookingState.date,
      time: bookingState.time,
      total: parseFloat(bookingState.service.preco || 0)
    };
    
    const res = await fetch('/api/appointments', {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    });
    
    const data = await res.json();
    
    if (res.ok || res.status === 201 || data.success) {
      showNotificationToast('✅ Agendamento confirmado com sucesso!', 'success');
      
      bookingState = {
        currentStep: 1,
        service: null,
        barber: null,
        date: null,
        time: null,
        services: bookingState.services,
        barbers: bookingState.barbers,
        currentMonth: new Date().getMonth(),
        currentYear: new Date().getFullYear()
      };
      
      setTimeout(() => {
        switchTab('meus-agendamentos');
        loadAppointmentsAndStats();
        carregarAgendamentos();
      }, 1500);
    } else {
      throw new Error(data.message || 'Erro ao criar agendamento');
    }
  } catch (error) {
    console.error('❌ Erro:', error);
    showNotificationToast(error.message || 'Erro ao criar agendamento', 'error');
    
    if (btn) {
      btn.disabled = false;
      btn.innerHTML = '<i class="fas fa-check-circle"></i><span>Confirmar Agendamento</span>';
    }
  }
}

// ===== NAVEGAÇÃO DO CALENDÁRIO =====
function prevMonth() {
  bookingState.currentMonth--;
  
  if (bookingState.currentMonth < 0) {
    bookingState.currentMonth = 11;
    bookingState.currentYear--;
  }
  
  bookingState.date = null;
  bookingState.time = null;
  renderCalendar();
  
  const container = document.getElementById('time-slots-new');
  if (container) container.innerHTML = '';
  
  updateNextButton();
}

function nextMonth() {
  bookingState.currentMonth++;
  
  if (bookingState.currentMonth > 11) {
    bookingState.currentMonth = 0;
    bookingState.currentYear++;
  }
  
  bookingState.date = null;
  bookingState.time = null;
  renderCalendar();
  
  const container = document.getElementById('time-slots-new');
  if (container) container.innerHTML = '';
  
  updateNextButton();
}

// ===== EXPORTAR FUNÇÕES =====
window.initNovoAgendamento = initNovoAgendamento;
window.selectService = selectService;
window.selectBarber = selectBarber;
window.selectDate = selectDate;
window.selectTime = selectTime;
window.nextBookingStep = nextBookingStep;
window.prevBookingStep = prevBookingStep;
window.confirmarNovoAgendamento = confirmarNovoAgendamento;
window.prevMonth = prevMonth;
window.nextMonth = nextMonth;

console.log('✅ Sistema profissional de agendamento carregado');
