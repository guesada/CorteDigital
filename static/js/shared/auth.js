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
      // Usar replace para evitar parâmetros na URL e limpar histórico
      window.location.replace(userType === 'barbeiro' ? '/barbeiro' : '/cliente');
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

  try {
    const response = await fetch(`${API_BASE}/users/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ name, email, password, phone, userType: tipo })
    });

    const data = await response.json();
    if (data.success) {
      if (typeof showNotificationToast === 'function') {
        showNotificationToast('Cadastro realizado com sucesso!', 'success');
      }
      // Fazer login automático após cadastro
      const loginResponse = await fetch(`${API_BASE}/users/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ email, password })
      });
      
      const loginData = await loginResponse.json();
      if (loginData.success) {
        // Usar replace para evitar parâmetros na URL
        window.location.replace(tipo === 'barbeiro' ? '/barbeiro' : '/cliente');
      } else {
        // Se login falhar, redirecionar para tela de login
        window.location.replace('/');
      }
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
    window.location.replace('/');
  } catch (error) {
    console.error('Logout error:', error);
    window.location.replace('/');
  }
}

// Export
window.fazerLogin = fazerLogin;
window.fazerCadastro = fazerCadastro;
window.logout = logout;
