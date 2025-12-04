// ===== THEME MANAGEMENT =====
console.log('🎨 Theme.js carregado');

function toggleTheme() {
  console.log('🔄 toggleTheme chamado');
  const body = document.body;
  const themeIcon = document.getElementById('theme-icon');
  
  console.log('🔍 Body classes antes:', body.className);
  console.log('🔍 Theme icon:', themeIcon);
  
  if (body.classList.contains('dark-theme')) {
    body.classList.remove('dark-theme');
    body.classList.add('light-theme');
    if (themeIcon) themeIcon.className = 'fas fa-sun';
    localStorage.setItem('theme', 'light');
    console.log('☀️ Mudou para tema claro');
  } else {
    body.classList.remove('light-theme');
    body.classList.add('dark-theme');
    if (themeIcon) themeIcon.className = 'fas fa-moon';
    localStorage.setItem('theme', 'dark');
    console.log('🌙 Mudou para tema escuro');
  }
  
  console.log('🔍 Body classes depois:', body.className);
}

function initTheme() {
  const savedTheme = localStorage.getItem('theme') || 'dark';
  const body = document.body;
  const themeIcon = document.getElementById('theme-icon');
  
  if (savedTheme === 'light') {
    body.classList.remove('dark-theme');
    body.classList.add('light-theme');
    if (themeIcon) themeIcon.className = 'fas fa-sun';
  } else {
    body.classList.remove('light-theme');
    body.classList.add('dark-theme');
    if (themeIcon) themeIcon.className = 'fas fa-moon';
  }
}

// Initialize theme on load
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initTheme);
} else {
  initTheme();
}

// Export to window
window.toggleTheme = toggleTheme;
window.initTheme = initTheme;

console.log('✅ Theme functions exported:', {
  toggleTheme: typeof window.toggleTheme,
  initTheme: typeof window.initTheme
});
