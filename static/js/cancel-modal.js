// ===== MODAL DE CANCELAMENTO ELEGANTE =====

let currentCancelAppointment = null;

function showCancelModal(appointmentId, appointmentData) {
  currentCancelAppointment = { id: appointmentId, data: appointmentData };
  
  // Criar modal se não existir
  let modal = document.getElementById('cancel-modal-overlay');
  if (!modal) {
    modal = createCancelModal();
    document.body.appendChild(modal);
  }
  
  // Preencher dados do agendamento
  updateCancelModalData(appointmentData);
  
  // Mostrar modal
  setTimeout(() => {
    modal.classList.add('active');
  }, 10);
}

function createCancelModal() {
  const overlay = document.createElement('div');
  overlay.id = 'cancel-modal-overlay';
  overlay.className = 'cancel-modal-overlay';
  overlay.onclick = (e) => {
    if (e.target === overlay) closeCancelModal();
  };
  
  overlay.innerHTML = `
    <div class="cancel-modal">
      <div class="cancel-modal-header">
        <button class="cancel-modal-close" onclick="closeCancelModal()">
          <i class="fas fa-times"></i>
        </button>
        <div class="cancel-modal-icon">
          <i class="fas fa-exclamation-triangle"></i>
        </div>
        <h3 class="cancel-modal-title">Cancelar Agendamento</h3>
        <p class="cancel-modal-subtitle">Tem certeza que deseja cancelar este agendamento?</p>
      </div>
      
      <div class="cancel-modal-body">
        <div class="cancel-appointment-info">
          <div class="cancel-info-row">
            <div class="cancel-info-icon">
              <i class="fas fa-cut"></i>
            </div>
            <div class="cancel-info-content">
              <div class="cancel-info-label">Serviço</div>
              <div class="cancel-info-value" id="cancel-service">-</div>
            </div>
          </div>
          
          <div class="cancel-info-row">
            <div class="cancel-info-icon">
              <i class="fas fa-user-tie"></i>
            </div>
            <div class="cancel-info-content">
              <div class="cancel-info-label">Barbeiro</div>
              <div class="cancel-info-value" id="cancel-barber">-</div>
            </div>
          </div>
          
          <div class="cancel-info-row">
            <div class="cancel-info-icon">
              <i class="fas fa-calendar"></i>
            </div>
            <div class="cancel-info-content">
              <div class="cancel-info-label">Data e Horário</div>
              <div class="cancel-info-value" id="cancel-datetime">-</div>
            </div>
          </div>
        </div>
        
        <div class="cancel-reason-group">
          <label class="cancel-reason-label">Motivo do cancelamento (opcional)</label>
          <div class="cancel-reason-options">
            <div class="cancel-reason-option" onclick="selectCancelReason(this, 'Imprevisto')">
              <input type="radio" name="cancel-reason" value="Imprevisto" id="reason-1">
              <label for="reason-1">Surgiu um imprevisto</label>
            </div>
            <div class="cancel-reason-option" onclick="selectCancelReason(this, 'Horário')">
              <input type="radio" name="cancel-reason" value="Horário" id="reason-2">
              <label for="reason-2">Preciso mudar o horário</label>
            </div>
            <div class="cancel-reason-option" onclick="selectCancelReason(this, 'Outro')">
              <input type="radio" name="cancel-reason" value="Outro" id="reason-3">
              <label for="reason-3">Outro motivo</label>
            </div>
          </div>
        </div>
      </div>
      
      <div class="cancel-modal-footer">
        <button class="cancel-modal-btn cancel-modal-btn-secondary" onclick="closeCancelModal()">
          <i class="fas fa-arrow-left"></i>
          Voltar
        </button>
        <button class="cancel-modal-btn cancel-modal-btn-danger" onclick="confirmCancelAppointment()">
          <i class="fas fa-times-circle"></i>
          Confirmar Cancelamento
        </button>
      </div>
    </div>
  `;
  
  return overlay;
}

function updateCancelModalData(data) {
  document.getElementById('cancel-service').textContent = data.service_name || data.service || '-';
  document.getElementById('cancel-barber').textContent = data.barber_name || data.barbeiro || '-';
  
  const date = data.date ? new Date(data.date + 'T00:00:00').toLocaleDateString('pt-BR') : '-';
  const time = data.time || '-';
  document.getElementById('cancel-datetime').textContent = `${date} às ${time}`;
}

function selectCancelReason(element, reason) {
  // Remover seleção anterior
  document.querySelectorAll('.cancel-reason-option').forEach(opt => {
    opt.classList.remove('selected');
  });
  
  // Adicionar seleção
  element.classList.add('selected');
  element.querySelector('input[type="radio"]').checked = true;
}

function closeCancelModal() {
  const modal = document.getElementById('cancel-modal-overlay');
  if (modal) {
    modal.classList.remove('active');
    setTimeout(() => {
      currentCancelAppointment = null;
      // Limpar seleção de motivo
      document.querySelectorAll('.cancel-reason-option').forEach(opt => {
        opt.classList.remove('selected');
      });
      document.querySelectorAll('input[name="cancel-reason"]').forEach(input => {
        input.checked = false;
      });
    }, 300);
  }
}

async function confirmCancelAppointment() {
  if (!currentCancelAppointment) return;
  
  const btn = document.querySelector('.cancel-modal-btn-danger');
  const originalContent = btn.innerHTML;
  
  try {
    // Mostrar loading
    btn.classList.add('loading');
    btn.innerHTML = '<span>Cancelando...</span>';
    
    // Pegar motivo selecionado
    const reasonInput = document.querySelector('input[name="cancel-reason"]:checked');
    const reason = reasonInput ? reasonInput.value : null;
    
    // Fazer requisição de cancelamento
    const response = await fetch(`/api/appointments/${currentCancelAppointment.id}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json'
      },
      credentials: 'include',
      body: JSON.stringify({ reason })
    });
    
    const result = await response.json();
    
    if (result.success || response.ok) {
      // Sucesso
      showNotificationToast('Agendamento cancelado com sucesso!', 'success');
      closeCancelModal();
      
      // Recarregar lista de agendamentos
      if (typeof loadClientAppointments === 'function') {
        loadClientAppointments();
      }
      if (typeof loadAppointmentsBar === 'function') {
        loadAppointmentsBar();
      }
    } else {
      throw new Error(result.message || 'Erro ao cancelar agendamento');
    }
  } catch (error) {
    console.error('Erro ao cancelar:', error);
    showNotificationToast(error.message || 'Erro ao cancelar agendamento', 'error');
    btn.classList.remove('loading');
    btn.innerHTML = originalContent;
  }
}

// Exportar funções globalmente
window.showCancelModal = showCancelModal;
window.closeCancelModal = closeCancelModal;
window.selectCancelReason = selectCancelReason;
window.confirmCancelAppointment = confirmCancelAppointment;
