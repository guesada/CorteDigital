// ===== FORMULÁRIO PROGRESSIVO DE AGENDAMENTO =====
console.log('📋 progressive-booking.js carregado');

let bookingData = {
  servico: null,
  barbeiro: null,
  data: null,
  horario: null
};

// Inicializar formulário progressivo
function initProgressiveBooking() {
  console.log('🎯 Inicializando formulário progressivo');
  
  // Mostrar primeira etapa
  showBookingStep('step-service');
  
  // Carregar serviços
  loadServicesForBooking();
}

// Mostrar etapa específica
function showBookingStep(stepId) {
  console.log('👁️ Mostrando etapa:', stepId);
  const step = document.getElementById(stepId);
  if (step) {
    // Salvar posição atual do scroll
    const scrollY = window.scrollY;
    
    step.classList.add('active');
    console.log('✅ Etapa ativada:', stepId, 'Classes:', step.className);
    
    // Restaurar posição do scroll para evitar pulo
    window.scrollTo(0, scrollY);
  } else {
    console.error('❌ Etapa não encontrada:', stepId);
  }
}

// Ocultar etapa
function hideBookingStep(stepId) {
  const step = document.getElementById(stepId);
  if (step) {
    step.classList.remove('active');
  }
}

// Carregar serviços como cards
async function loadServicesForBooking() {
  console.log('🔄 Carregando serviços...');
  try {
    const response = await fetch('/api/services', { credentials: 'include' });
    if (!response.ok) {
      console.error('❌ Erro ao buscar serviços:', response.status);
      return;
    }
    
    const data = await response.json();
    const services = data.data || [];
    console.log('✅ Serviços carregados:', services.length);
    
    const container = document.getElementById('services-grid');
    if (!container) {
      console.error('❌ Container services-grid não encontrado');
      return;
    }
    
    const html = services.map(service => `
      <div class="service-card" onclick="selectService(${service.id}, '${service.nome}', ${service.preco})">
        <div class="service-card-icon">
          <i class="fas fa-cut"></i>
        </div>
        <div class="service-card-name">${service.nome}</div>
        <div class="service-card-details">
          <span><i class="fas fa-clock"></i> ${service.duracao || 30} min</span>
        </div>
        <div class="service-card-price">R$ ${(service.preco || 0).toFixed(2).replace('.', ',')}</div>
        <div class="service-card-check">
          <i class="fas fa-check"></i>
        </div>
      </div>
    `).join('');
    
    container.innerHTML = html;
    console.log('✅ Cards renderizados no DOM:', container.children.length);
    
  } catch (error) {
    console.error('Erro ao carregar serviços:', error);
  }
}

// Selecionar serviço
function selectService(id, nome, preco) {
  bookingData.servico = { id, nome, preco };
  
  // Atualizar visual
  document.querySelectorAll('.service-card').forEach(card => {
    card.classList.remove('selected');
  });
  event.currentTarget.classList.add('selected');
  
  // Atualizar inputs ocultos
  const servicoInput = document.getElementById('booking-service-hidden');
  if (servicoInput) servicoInput.value = id;
  
  // Também atualizar o seletor antigo se existir
  const servicoSelect = document.querySelector('[data-role="servico"]');
  if (servicoSelect) servicoSelect.value = id;
  
  // Atualizar resumo
  updateBookingSummary();
  
  // Mostrar próxima etapa
  setTimeout(() => {
    showBookingStep('step-barber');
    loadBarbersForBooking();
  }, 300);
}

// Carregar barbeiros como cards
async function loadBarbersForBooking() {
  try {
    const response = await fetch('/api/barbers', { credentials: 'include' });
    if (!response.ok) return;
    
    const data = await response.json();
    const barbers = data.data || [];
    
    const container = document.getElementById('barbers-grid');
    if (!container) return;
    
    container.innerHTML = barbers.map(barber => {
      const initials = barber.nome.split(' ').map(n => n[0]).join('').substring(0, 2);
      const specialties = Array.isArray(barber.especialidades) ? barber.especialidades.slice(0, 2).join(', ') : '';
      
      return `
        <div class="barber-card" onclick="selectBarber(${barber.id}, '${barber.nome}')">
          <div class="barber-card-avatar">
            ${barber.foto ? `<img src="${barber.foto}" alt="${barber.nome}">` : initials}
          </div>
          <div class="barber-card-name">${barber.nome}</div>
          <div class="barber-card-rating">
            <i class="fas fa-star"></i>
            <span>${(barber.avaliacao || 5.0).toFixed(1)}</span>
          </div>
          ${specialties ? `<div class="barber-card-specialties">${specialties}</div>` : ''}
          <div class="barber-card-check">
            <i class="fas fa-check"></i>
          </div>
        </div>
      `;
    }).join('');
    
  } catch (error) {
    console.error('Erro ao carregar barbeiros:', error);
  }
}

// Selecionar barbeiro
function selectBarber(id, nome) {
  bookingData.barbeiro = { id, nome };
  
  // Atualizar visual
  document.querySelectorAll('.barber-card').forEach(card => {
    card.classList.remove('selected');
  });
  event.currentTarget.classList.add('selected');
  
  // Atualizar inputs ocultos
  const barbeiroInput = document.getElementById('booking-barber-hidden');
  if (barbeiroInput) barbeiroInput.value = id;
  
  // Também atualizar o seletor antigo se existir
  const barbeiroSelect = document.querySelector('[data-role="barbeiro"]');
  if (barbeiroSelect) barbeiroSelect.value = id;
  
  // Atualizar resumo
  updateBookingSummary();
  
  // Mostrar próxima etapa
  setTimeout(() => {
    showBookingStep('step-datetime');
    
    // Sempre reinicializar o calendário para garantir que está limpo
    console.log('📅 Inicializando calendário...');
    setTimeout(() => {
      const calendarContainer = document.getElementById('calendar-container');
      if (!calendarContainer) {
        console.error('❌ Container calendar-container não encontrado');
        return;
      }
      
      window.calendarInstance = initCalendar({
        minDate: new Date(),
        onDateSelect: (date) => {
          console.log('📅 Data selecionada:', date);
          bookingData.data = date;
          const dateInput = document.getElementById('selected-date');
          if (dateInput) dateInput.value = date;
          const dateRole = document.querySelector('[data-role="data"]');
          if (dateRole) dateRole.value = date;
          updateBookingSummary();
        },
        onTimeSelect: (time) => {
          console.log('⏰ Horário selecionado:', time);
          bookingData.horario = time;
          const timeInput = document.getElementById('selected-time');
          if (timeInput) timeInput.value = time;
          const timeRole = document.querySelector('[data-role="horario"]');
          if (timeRole) timeRole.value = time;
          updateBookingSummary();
          
          // Mostrar etapa de confirmação
          setTimeout(() => {
            showBookingStep('step-summary');
          }, 300);
        }
      });
      
      console.log('✅ Calendário inicializado');
    }, 100);
  }, 300);
}

// Atualizar resumo do agendamento
function updateBookingSummary() {
  const summaryContainer = document.getElementById('booking-summary-content');
  if (!summaryContainer) return;
  
  let html = '';
  
  if (bookingData.servico) {
    html += `
      <div class="booking-summary-item">
        <div class="booking-summary-icon">
          <i class="fas fa-cut"></i>
        </div>
        <div class="booking-summary-content">
          <div class="booking-summary-label">Serviço</div>
          <div class="booking-summary-value">${bookingData.servico.nome}</div>
        </div>
      </div>
    `;
  }
  
  if (bookingData.barbeiro) {
    html += `
      <div class="booking-summary-item">
        <div class="booking-summary-icon">
          <i class="fas fa-user-tie"></i>
        </div>
        <div class="booking-summary-content">
          <div class="booking-summary-label">Barbeiro</div>
          <div class="booking-summary-value">${bookingData.barbeiro.nome}</div>
        </div>
      </div>
    `;
  }
  
  if (bookingData.data) {
    const dateObj = new Date(bookingData.data + 'T00:00:00');
    const dateFormatted = dateObj.toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' });
    
    html += `
      <div class="booking-summary-item">
        <div class="booking-summary-icon">
          <i class="fas fa-calendar"></i>
        </div>
        <div class="booking-summary-content">
          <div class="booking-summary-label">Data</div>
          <div class="booking-summary-value">${dateFormatted}</div>
        </div>
      </div>
    `;
  }
  
  if (bookingData.horario) {
    html += `
      <div class="booking-summary-item">
        <div class="booking-summary-icon">
          <i class="fas fa-clock"></i>
        </div>
        <div class="booking-summary-content">
          <div class="booking-summary-label">Horário</div>
          <div class="booking-summary-value">${bookingData.horario}</div>
        </div>
      </div>
    `;
  }
  
  if (bookingData.servico) {
    html += `
      <div class="booking-summary-item">
        <div class="booking-summary-icon">
          <i class="fas fa-dollar-sign"></i>
        </div>
        <div class="booking-summary-content">
          <div class="booking-summary-label">Valor</div>
          <div class="booking-summary-value">R$ ${(bookingData.servico.preco || 0).toFixed(2).replace('.', ',')}</div>
        </div>
      </div>
    `;
  }
  
  summaryContainer.innerHTML = html;
  
  // Mostrar/ocultar resumo baseado se há dados
  const summaryEl = document.getElementById('booking-summary');
  if (summaryEl) {
    if (bookingData.servico || bookingData.barbeiro || bookingData.data || bookingData.horario) {
      summaryEl.style.display = 'block';
    } else {
      summaryEl.style.display = 'none';
    }
  }
}

// Resetar formulário
function resetProgressiveBooking() {
  bookingData = {
    servico: null,
    barbeiro: null,
    data: null,
    horario: null
  };
  
  // Ocultar todas as etapas
  document.querySelectorAll('.booking-step').forEach(step => {
    step.classList.remove('active');
  });
  
  // Resetar calendário
  if (window.calendarInstance) {
    window.calendarInstance.selectedDate = null;
    window.calendarInstance.selectedTime = null;
    window.calendarInstance.updateCalendar();
    const timeSlotsContainer = document.getElementById('time-slots-container');
    if (timeSlotsContainer) timeSlotsContainer.style.display = 'none';
  }
  
  // Mostrar primeira etapa
  setTimeout(() => {
    showBookingStep('step-service');
  }, 100);
}

// Confirmar agendamento do formulário progressivo
async function confirmarAgendamentoProgressivo() {
  console.log('📝 Confirmando agendamento progressivo');
  console.log('📊 Dados:', bookingData);
  
  // Validar dados
  if (!bookingData.servico || !bookingData.barbeiro || !bookingData.data || !bookingData.horario) {
    if (typeof showNotificationToast === 'function') {
      showNotificationToast('Preencha todos os campos', 'error');
    } else {
      alert('Preencha todos os campos');
    }
    return;
  }
  
  const body = {
    barberId: bookingData.barbeiro.id,
    barberName: bookingData.barbeiro.nome,
    serviceId: bookingData.servico.id,
    serviceName: bookingData.servico.nome,
    date: bookingData.data,
    time: bookingData.horario,
    total: bookingData.servico.preco || 0
  };
  
  console.log('📤 Enviando:', body);
  
  try {
    const response = await fetch('/api/appointments', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(body)
    });
    
    const result = await response.json();
    
    if (response.ok && result.success) {
      if (typeof showNotificationToast === 'function') {
        showNotificationToast('Agendamento criado com sucesso!', 'success');
      } else {
        alert('Agendamento criado com sucesso!');
      }
      
      // Resetar formulário
      resetProgressiveBooking();
      
      // Redirecionar para meus agendamentos
      setTimeout(() => {
        if (typeof switchTab === 'function') {
          switchTab('meus-agendamentos');
        }
      }, 500);
    } else {
      const errorMsg = result.message || 'Erro ao criar agendamento';
      if (typeof showNotificationToast === 'function') {
        showNotificationToast(errorMsg, 'error');
      } else {
        alert(errorMsg);
      }
    }
  } catch (error) {
    console.error('❌ Erro ao criar agendamento:', error);
    if (typeof showNotificationToast === 'function') {
      showNotificationToast('Erro ao criar agendamento', 'error');
    } else {
      alert('Erro ao criar agendamento');
    }
  }
}

// Exportar funções globalmente
window.initProgressiveBooking = initProgressiveBooking;
window.selectService = selectService;
window.selectBarber = selectBarber;
window.resetProgressiveBooking = resetProgressiveBooking;
window.confirmarAgendamentoProgressivo = confirmarAgendamentoProgressivo;

console.log('✅ Funções exportadas:', {
  initProgressiveBooking: typeof window.initProgressiveBooking,
  selectService: typeof window.selectService,
  selectBarber: typeof window.selectBarber,
  confirmarAgendamentoProgressivo: typeof window.confirmarAgendamentoProgressivo
});
