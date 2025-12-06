/**
 * Sistema de Notificações em Tempo Real
 */

class NotificationSystem {
    constructor() {
        this.notifications = [];
        this.unreadCount = 0;
        this.socket = null;
        this.init();
    }
    
    init() {
        this.createUI();
        this.connectSocket();
        this.attachEventListeners();
        this.loadNotifications();
    }
    
    createUI() {
        const html = `
            <div class="notifications-bell" id="notificationsBell">
                <i class="fas fa-bell"></i>
                <span class="notifications-badge" id="notificationsBadge" style="display: none;">0</span>
            </div>
            
            <div class="notifications-dropdown" id="notificationsDropdown">
                <div class="notifications-header">
                    <h3>Notificações</h3>
                    <div class="notifications-actions">
                        <button id="markAllRead">Marcar todas como lidas</button>
                    </div>
                </div>
                <div class="notifications-list" id="notificationsList">
                    <div class="notifications-empty">
                        <i class="fas fa-bell-slash"></i>
                        <p>Nenhuma notificação</p>
                    </div>
                </div>
            </div>
        `;
        
        // Adiciona ao header
        const headerActions = document.querySelector('.cliente-header-actions, .barber-header-actions');
        if (headerActions) {
            headerActions.insertAdjacentHTML('afterbegin', html);
        }
    }
    
    connectSocket() {
        if (typeof io !== 'undefined') {
            this.socket = io();
            
            this.socket.on('connect', () => {
                this.socket.emit('join_notifications');
            });
            
            this.socket.on('unread_count', (data) => {
                this.updateBadge(data.count);
            });
            
            this.socket.on('new_notification', (notification) => {
                this.handleNewNotification(notification);
            });
        }
    }

    
    attachEventListeners() {
        document.getElementById('notificationsBell')?.addEventListener('click', () => {
            this.toggleDropdown();
        });
        
        document.getElementById('markAllRead')?.addEventListener('click', () => {
            this.markAllAsRead();
        });
        
        // Fecha ao clicar fora
        document.addEventListener('click', (e) => {
            const dropdown = document.getElementById('notificationsDropdown');
            const bell = document.getElementById('notificationsBell');
            if (dropdown && bell && !dropdown.contains(e.target) && !bell.contains(e.target)) {
                dropdown.classList.remove('active');
            }
        });
    }
    
    async loadNotifications() {
        try {
            const response = await fetch('/api/notifications/');
            const data = await response.json();
            
            if (data.success) {
                this.notifications = data.notifications;
                this.unreadCount = data.unread_count;
                this.renderNotifications();
                this.updateBadge(this.unreadCount);
            }
        } catch (error) {
            console.error('Erro ao carregar notificações:', error);
        }
    }
    
    renderNotifications() {
        const container = document.getElementById('notificationsList');
        if (!container) return;
        
        if (this.notifications.length === 0) {
            container.innerHTML = `
                <div class="notifications-empty">
                    <i class="fas fa-bell-slash"></i>
                    <p>Nenhuma notificação</p>
                </div>
            `;
            return;
        }
        
        container.innerHTML = this.notifications.map(notif => this.createNotificationHTML(notif)).join('');
        
        // Event listeners
        container.querySelectorAll('.notification-item').forEach(item => {
            item.addEventListener('click', (e) => {
                if (!e.target.closest('.notification-delete')) {
                    this.handleNotificationClick(item.dataset.id, item.dataset.link);
                }
            });
        });
        
        container.querySelectorAll('.notification-delete button').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                this.deleteNotification(btn.dataset.id);
            });
        });
    }
    
    createNotificationHTML(notif) {
        const unreadClass = !notif.is_read ? 'unread' : '';
        const icon = this.getIcon(notif.type);
        const time = this.formatTime(notif.created_at);
        
        return `
            <div class="notification-item ${unreadClass}" data-id="${notif.id}" data-link="${notif.link || ''}">
                <div class="notification-icon ${notif.type}">
                    <i class="${icon}"></i>
                </div>
                <div class="notification-content">
                    <div class="notification-title">${notif.title}</div>
                    <div class="notification-message">${notif.message}</div>
                    <div class="notification-time">${time}</div>
                </div>
                <div class="notification-delete">
                    <button data-id="${notif.id}">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
            </div>
        `;
    }
    
    getIcon(type) {
        const icons = {
            'agendamento': 'fas fa-calendar-plus',
            'cancelamento': 'fas fa-calendar-times',
            'confirmacao': 'fas fa-check-circle',
            'lembrete': 'fas fa-clock',
            'chat': 'fas fa-comment',
            'avaliacao': 'fas fa-star'
        };
        return icons[type] || 'fas fa-bell';
    }
    
    formatTime(dateString) {
        const date = new Date(dateString);
        const now = new Date();
        const diff = now - date;
        
        if (diff < 60000) return 'agora';
        if (diff < 3600000) return `${Math.floor(diff / 60000)}m atrás`;
        if (diff < 86400000) return `${Math.floor(diff / 3600000)}h atrás`;
        if (diff < 604800000) return `${Math.floor(diff / 86400000)}d atrás`;
        
        return date.toLocaleDateString('pt-BR');
    }
    
    async handleNotificationClick(id, link) {
        await this.markAsRead(id);
        if (link) {
            window.location.href = link;
        }
    }
    
    async markAsRead(id) {
        try {
            const response = await fetch(`/api/notifications/${id}/read`, {
                method: 'POST'
            });
            const data = await response.json();
            
            if (data.success) {
                this.updateBadge(data.unread_count);
                await this.loadNotifications();
            }
        } catch (error) {
            console.error('Erro ao marcar como lida:', error);
        }
    }
    
    async markAllAsRead() {
        try {
            const response = await fetch('/api/notifications/read-all', {
                method: 'POST'
            });
            const data = await response.json();
            
            if (data.success) {
                this.updateBadge(0);
                await this.loadNotifications();
            }
        } catch (error) {
            console.error('Erro ao marcar todas como lidas:', error);
        }
    }
    
    async deleteNotification(id) {
        try {
            const response = await fetch(`/api/notifications/${id}`, {
                method: 'DELETE'
            });
            const data = await response.json();
            
            if (data.success) {
                await this.loadNotifications();
            }
        } catch (error) {
            console.error('Erro ao deletar notificação:', error);
        }
    }
    
    handleNewNotification(notification) {
        this.notifications.unshift(notification);
        this.unreadCount++;
        this.updateBadge(this.unreadCount);
        this.renderNotifications();
        this.showToast(notification);
    }
    
    showToast(notification) {
        const icon = this.getIcon(notification.type);
        const toast = document.createElement('div');
        toast.className = `notification-toast`;
        toast.innerHTML = `
            <div class="notification-toast-icon ${notification.type}">
                <i class="${icon}"></i>
            </div>
            <div class="notification-toast-content">
                <div class="notification-toast-title">${notification.title}</div>
                <div class="notification-toast-message">${notification.message}</div>
            </div>
            <button class="notification-toast-close">
                <i class="fas fa-times"></i>
            </button>
        `;
        
        document.body.appendChild(toast);
        
        toast.querySelector('.notification-toast-close').addEventListener('click', () => {
            toast.classList.add('hiding');
            setTimeout(() => toast.remove(), 300);
        });
        
        setTimeout(() => {
            toast.classList.add('hiding');
            setTimeout(() => toast.remove(), 300);
        }, 5000);
    }
    
    updateBadge(count) {
        const badge = document.getElementById('notificationsBadge');
        if (badge) {
            if (count > 0) {
                badge.textContent = count > 99 ? '99+' : count;
                badge.style.display = 'block';
            } else {
                badge.style.display = 'none';
            }
        }
    }
    
    toggleDropdown() {
        const dropdown = document.getElementById('notificationsDropdown');
        if (dropdown) {
            dropdown.classList.toggle('active');
        }
    }
}

// Inicializa
let notificationSystem;
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        notificationSystem = new NotificationSystem();
    });
} else {
    notificationSystem = new NotificationSystem();
}

window.NotificationSystem = NotificationSystem;
window.notificationSystem = notificationSystem;
