// ===== AUTHENTICATION FUNCTIONS =====

async function fazerLogin(e, destino) {
  e.preventDefault();
  console.log('🔐 Tentando fazer login...', { destino });
  
  const form = e.target;
  const email = form.querySelector('input[type="email"]').value;
  const password = form.querySelector('input[type="password"]').value;

  console.log('📧 Email:', email);
  console.log('🔑 API_BASE:', window.API_BASE);

  try {
    const url = `${window.API_BASE}/users/login`;
    console.log('🌐 URL:', url);
    
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ email, password })
    });

    console.log('📡 Response status:', response.status);
    const data = await response.json();
    console.log('📦 Response data:', data);
    
    if (data.success) {
      const userType = data.user?.userType || destino;
      console.log('✅ Login bem-sucedido! Redirecionando para:', userType);
      window.location.href = userType === 'barbeiro' ? '/barbeiro' : '/cliente';
    } else {
      console.error('❌ Login falhou:', data.message);
      if (typeof showNotificationToast === 'function') {
        showNotificationToast(data.message || 'Não foi possível entrar', 'error');
      } else {
        alert(data.message || 'Não foi possível entrar');
      }
    }
  } catch (error) {
    console.error('❌ Erro no login:', error);
    if (typeof showNotificationToast === 'function') {
      showNotificationToast('Erro ao fazer login', 'error');
    } else {
      alert('Erro ao fazer login: ' + error.message);
    }
  }
}

async function fazerCadastro(e, tipo) {
  e.preventDefault();
  const form = e.target;
  
  // Validar formulário antes de enviar
  if (typeof validarFormularioRegistro === 'function') {
    if (!validarFormularioRegistro(form)) {
      console.log('❌ Formulário inválido');
      return;
    }
  }
  
  const name = form.querySelector('input[name="name"]').value;
  const email = form.querySelector('input[type="email"]').value;
  const password = form.querySelector('input[type="password"]').value;
  const phone = form.querySelector('input[name="phone"]')?.value || '';
  
  // Capturar dias e horários de trabalho (apenas para barbeiros)
  let workDays = [];
  let workHours = [];
  
  if (tipo === 'barbeiro') {
    // Capturar dias selecionados
    const dayCheckboxes = form.querySelectorAll('input[name="workDays"]:checked');
    workDays = Array.from(dayCheckboxes).map(cb => cb.value);
    
    // Capturar horários
    const startTime = form.querySelector('select[name="workTimeStart"]')?.value;
    const endTime = form.querySelector('select[name="workTimeEnd"]')?.value;
    
    // Gerar horários disponíveis
    if (startTime && endTime) {
      workHours = generateTimeSlots(startTime, endTime);
    }
    
    console.log('📅 Dias de trabalho:', workDays);
    console.log('⏰ Horários de trabalho:', workHours);
  }

  try {
    const response = await fetch(`${API_BASE}/users/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ 
        name, 
        email, 
        password, 
        phone, 
        userType: tipo,
        workDays: workDays,
        workHours: workHours
      })
    });

    const data = await response.json();
    if (data.success) {
      if (typeof showNotificationToast === 'function') {
        showNotificationToast('Cadastro realizado com sucesso!', 'success');
      }
      setTimeout(() => {
        window.location.href = tipo === 'barbeiro' ? '/barbeiro' : '/cliente';
      }, 1000);
    } else {
      if (typeof showNotificationToast === 'function') {
        showNotificationToast(data.message || 'Erro ao cadastrar', 'error');
      } else {
        alert(data.message || 'Erro ao cadastrar');
      }
    }
  } catch (error) {
    console.error('Register error:', error);
    if (typeof showNotificationToast === 'function') {
      showNotificationToast('Erro ao fazer cadastro', 'error');
    } else {
      alert('Erro ao fazer cadastro');
    }
  }
}

async function logout() {
  try {
    await fetch(`${API_BASE}/users/logout`, {
      method: 'POST',
      credentials: 'include'
    });
    window.location.href = '/';
  } catch (error) {
    console.error('Logout error:', error);
    window.location.href = '/';
  }
}

// ===== GERAR HORÁRIOS DISPONÍVEIS =====
function generateTimeSlots(startTime, endTime) {
  const slots = [];
  
  // Converter para minutos
  const [startHour, startMin] = startTime.split(':').map(Number);
  const [endHour, endMin] = endTime.split(':').map(Number);
  
  const startMinutes = startHour * 60 + startMin;
  const endMinutes = endHour * 60 + endMin;
  
  // Gerar slots de 1 hora
  for (let minutes = startMinutes; minutes < endMinutes; minutes += 60) {
    const hour = Math.floor(minutes / 60);
    const min = minutes % 60;
    const timeStr = `${String(hour).padStart(2, '0')}:${String(min).padStart(2, '0')}`;
    slots.push(timeStr);
  }
  
  return slots;
}

// Export
window.fazerLogin = fazerLogin;
window.fazerCadastro = fazerCadastro;
window.logout = logout;
window.generateTimeSlots = generateTimeSlots;
