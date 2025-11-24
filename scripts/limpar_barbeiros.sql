-- Script para limpar TODOS os dados de seed/exemplo do banco de dados
-- Execute este script se você já iniciou o sistema e quer remover os dados falsos

USE Corte_Digital;

-- Remove todos os dados de exemplo
DELETE FROM appointments;
DELETE FROM barbers;
DELETE FROM products;
DELETE FROM services;
DELETE FROM notifications;
DELETE FROM users WHERE email IN ('cliente@cortedigital.com', 'barbeiro@cortedigital.com');

-- Reseta os auto_increment
ALTER TABLE appointments AUTO_INCREMENT = 1;
ALTER TABLE barbers AUTO_INCREMENT = 1;
ALTER TABLE products AUTO_INCREMENT = 1;
ALTER TABLE services AUTO_INCREMENT = 1;
ALTER TABLE notifications AUTO_INCREMENT = 1;
ALTER TABLE users AUTO_INCREMENT = 1;

-- Verifica se foi removido
SELECT 'Barbeiros' as tabela, COUNT(*) as total FROM barbers
UNION ALL
SELECT 'Agendamentos', COUNT(*) FROM appointments
UNION ALL
SELECT 'Produtos', COUNT(*) FROM products
UNION ALL
SELECT 'Serviços', COUNT(*) FROM services
UNION ALL
SELECT 'Notificações', COUNT(*) FROM notifications
UNION ALL
SELECT 'Usuários', COUNT(*) FROM users;

-- Resultado esperado: todos com 0 registros
