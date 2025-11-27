// ===== CALENDÁRIO VISUAL MODERNO =====

class CalendarPicker {
  constructor(containerId, options = {}) {
    this.container = document.getElementById(containerId);
    this.currentDate = new Date();
    this.selectedDate = null;
    this.selectedTime = null;
    
    // Normalizar minDate para início do dia
    const minDate = options.minDate || new Date();
    minDate.setHours(0, 0, 0, 0);
    this.minDate = minDate;
    
    this.maxDate = options.maxDate || null;
    this.disabledDates = options.disabledDates || [];
    this.availableTimes = options.availableTimes || this.generateDefaultTimes();
    this.onDateSelect = options.onDateSelect || (() => {});
    this.onTimeSelect = options.onTimeSelect || (() => {});
    
    this.render();
  }

  generateDefaultTimes() {
    const times = [];
    for (let hour = 9; hour <= 18; hour++) {
      times.push(`${hour.toString().padStart(2, '0')}:00`);
      if (hour < 18) {
        times.push(`${hour.toString().padStart(2, '0')}:30`);
      }
    }
    return times;
  }

  render() {
    if (!this.container) return;

    this.container.innerHTML = `
      <div class="calendar-picker">
        <div class="calendar-header">
          <div class="calendar-month" id="calendar-month"></div>
          <div class="calendar-nav">
            <button class="calendar-nav-btn" id="calendar-prev-btn" type="button">
              <i class="fas fa-chevron-left"></i>
            </button>
            <button class="calendar-nav-btn" id="calendar-next-btn" type="button">
              <i class="fas fa-chevron-right"></i>
            </button>
          </div>
        </div>
        
        <div class="calendar-weekdays">
          <div class="calendar-weekday">Dom</div>
          <div class="calendar-weekday">Seg</div>
          <div class="calendar-weekday">Ter</div>
          <div class="calendar-weekday">Qua</div>
          <div class="calendar-weekday">Qui</div>
          <div class="calendar-weekday">Sex</div>
          <div class="calendar-weekday">Sáb</div>
        </div>
        
        <div class="calendar-days" id="calendar-days"></div>
        
        <div class="time-slots" id="time-slots-container" style="display: none;">
          <div class="time-slots-header">
            <i class="fas fa-clock"></i>
            <span>Horários Disponíveis</span>
          </div>
          <div class="time-slots-grid" id="time-slots"></div>
        </div>
      </div>
    `;

    // Adicionar event listeners aos botões
    const prevBtn = document.getElementById('calendar-prev-btn');
    const nextBtn = document.getElementById('calendar-next-btn');
    
    if (prevBtn) {
      prevBtn.addEventListener('click', () => this.previousMonth());
    }
    
    if (nextBtn) {
      nextBtn.addEventListener('click', () => this.nextMonth());
    }

    this.updateCalendar();
  }

  updateCalendar() {
    const monthEl = document.getElementById('calendar-month');
    const daysEl = document.getElementById('calendar-days');

    if (!monthEl || !daysEl) return;

    // Atualizar mês/ano
    const monthNames = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
                        'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];
    monthEl.innerHTML = `<i class="fas fa-calendar-alt"></i>${monthNames[this.currentDate.getMonth()]} ${this.currentDate.getFullYear()}`;

    // Gerar dias
    const year = this.currentDate.getFullYear();
    const month = this.currentDate.getMonth();
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const daysInPrevMonth = new Date(year, month, 0).getDate();

    let daysHTML = '';
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Dias do mês anterior
    for (let i = firstDay - 1; i >= 0; i--) {
      const day = daysInPrevMonth - i;
      daysHTML += `<div class="calendar-day other-month disabled">${day}</div>`;
    }

    // Dias do mês atual
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month, day);
      date.setHours(0, 0, 0, 0);
      
      const isToday = date.getTime() === today.getTime();
      
      // Normalizar selectedDate para comparação
      let isSelected = false;
      if (this.selectedDate) {
        const selectedNormalized = new Date(this.selectedDate);
        selectedNormalized.setHours(0, 0, 0, 0);
        isSelected = date.getTime() === selectedNormalized.getTime();
      }
      
      // Comparar apenas timestamps normalizados
      const isPast = date.getTime() < this.minDate.getTime();
      const isBeyondMax = this.maxDate && date.getTime() > this.maxDate.getTime();
      const isDisabled = isPast || isBeyondMax || this.isDateDisabled(date);
      
      const classes = ['calendar-day'];
      if (isToday) classes.push('today');
      if (isSelected) classes.push('selected');
      if (isDisabled) classes.push('disabled');

      const dateStr = date.toISOString().split('T')[0];
      daysHTML += `<button class="${classes.join(' ')}" 
                          data-date="${dateStr}"
                          type="button"
                          ${isDisabled ? 'disabled' : ''}>
                     ${day}
                   </button>`;
    }

    // Dias do próximo mês
    const totalCells = Math.ceil((firstDay + daysInMonth) / 7) * 7;
    const remainingCells = totalCells - (firstDay + daysInMonth);
    for (let day = 1; day <= remainingCells; day++) {
      daysHTML += `<div class="calendar-day other-month disabled">${day}</div>`;
    }

    daysEl.innerHTML = daysHTML;
    
    // Adicionar event listeners aos dias
    const dayButtons = daysEl.querySelectorAll('button[data-date]');
    console.log('🔘 Botões de dias encontrados:', dayButtons.length);
    dayButtons.forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        const dateStr = btn.getAttribute('data-date');
        console.log('🖱️ Clique no dia:', dateStr);
        this.selectDate(dateStr);
      });
    });
  }

  isDateDisabled(date) {
    const dateStr = date.toISOString().split('T')[0];
    return this.disabledDates.includes(dateStr);
  }

  selectDate(dateStr) {
    console.log('📅 selectDate chamado com:', dateStr);
    this.selectedDate = new Date(dateStr + 'T12:00:00');
    this.selectedTime = null;
    console.log('✅ Data selecionada atualizada:', this.selectedDate);
    
    // Atualizar apenas as classes dos dias sem recriar o HTML
    this.updateDayClasses();
    this.showTimeSlots();
    this.onDateSelect(dateStr);
  }
  
  updateDayClasses() {
    const daysEl = document.getElementById('calendar-days');
    if (!daysEl) return;
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const selectedNormalized = this.selectedDate ? new Date(this.selectedDate) : null;
    if (selectedNormalized) selectedNormalized.setHours(0, 0, 0, 0);
    
    // Atualizar classes de todos os botões
    const dayButtons = daysEl.querySelectorAll('button[data-date]');
    dayButtons.forEach(btn => {
      const dateStr = btn.getAttribute('data-date');
      const date = new Date(dateStr + 'T00:00:00');
      
      const isToday = date.getTime() === today.getTime();
      const isSelected = selectedNormalized && date.getTime() === selectedNormalized.getTime();
      
      // Remover classes antigas
      btn.classList.remove('today', 'selected');
      
      // Adicionar classes novas
      if (isToday) btn.classList.add('today');
      if (isSelected) btn.classList.add('selected');
    });
  }

  showTimeSlots() {
    const container = document.getElementById('time-slots-container');
    const slotsEl = document.getElementById('time-slots');

    if (!container || !slotsEl) return;

    container.style.display = 'block';

    if (this.availableTimes.length === 0) {
      slotsEl.innerHTML = `
        <div class="time-slots-empty">
          <i class="fas fa-calendar-times"></i>
          <p>Nenhum horário disponível para esta data</p>
        </div>
      `;
      return;
    }

    let slotsHTML = '';
    this.availableTimes.forEach(time => {
      const isSelected = this.selectedTime === time;
      const classes = ['time-slot'];
      if (isSelected) classes.push('selected');

      slotsHTML += `<button class="${classes.join(' ')}" 
                           data-time="${time}"
                           type="button">
                      ${time}
                    </button>`;
    });

    slotsEl.innerHTML = slotsHTML;
    
    // Adicionar event listeners aos horários
    const timeButtons = slotsEl.querySelectorAll('button[data-time]');
    timeButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        const time = btn.getAttribute('data-time');
        this.selectTime(time);
      });
    });
  }

  selectTime(time) {
    this.selectedTime = time;
    this.showTimeSlots();
    this.onTimeSelect(time);
  }

  previousMonth() {
    console.log('⬅️ Mês anterior');
    this.currentDate.setMonth(this.currentDate.getMonth() - 1);
    this.updateCalendar();
  }

  nextMonth() {
    console.log('➡️ Próximo mês');
    this.currentDate.setMonth(this.currentDate.getMonth() + 1);
    this.updateCalendar();
  }

  getSelectedDateTime() {
    if (!this.selectedDate || !this.selectedTime) return null;
    return {
      date: this.selectedDate.toISOString().split('T')[0],
      time: this.selectedTime
    };
  }

  setAvailableTimes(times) {
    this.availableTimes = times;
    if (this.selectedDate) {
      this.showTimeSlots();
    }
  }
}

// Instância global
let calendarInstance = null;

// Inicializar calendário quando necessário
function initCalendar(options = {}) {
  calendarInstance = new CalendarPicker('calendar-container', options);
  return calendarInstance;
}

// Exportar para uso global
window.CalendarPicker = CalendarPicker;
window.initCalendar = initCalendar;
