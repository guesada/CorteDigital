-- Script para inserir dados manualmente no banco (TEMPORÁRIO)
-- Use este script apenas para testar o sistema até criar as interfaces administrativas

USE Corte_Digital;

-- 1. Inserir usuários de teste
INSERT INTO users (nome, email, senha, tipo) VALUES
('João Silva', 'cliente@teste.com', '123456', 'cliente'),
('Maria Santos', 'barbeiro@teste.com', '123456', 'barbeiro');

-- 2. Inserir barbeiros
INSERT INTO barbers (nome, foto, especialidades, avaliacao, preco_base, disponibilidade) VALUES
('João Barbeiro', 'https://ui-avatars.com/api/?name=Joao+Barbeiro&background=0b84a5&color=fff', 
 '["Corte Masculino", "Barba"]', 4.8, 35.00, 
 '["09:00", "10:00", "11:00", "14:00", "15:00", "16:00", "17:00"]'),
 
('Maria Cabeleireira', 'https://ui-avatars.com/api/?name=Maria+Cabeleireira&background=0b84a5&color=fff', 
 '["Corte Feminino", "Coloração"]', 4.9, 50.00, 
 '["08:00", "09:00", "10:00", "13:00", "14:00", "15:00", "16:00"]');

-- 3. Inserir serviços
INSERT INTO services (nome, preco, duracao, descricao) VALUES
('Corte Masculino', 30.00, 30, 'Corte de cabelo masculino com máquina e tesoura'),
('Corte Feminino', 50.00, 60, 'Corte de cabelo feminino com lavagem e finalização'),
('Barba', 20.00, 20, 'Aparar e modelar barba'),
('Corte + Barba', 45.00, 45, 'Corte de cabelo + barba completa'),
('Coloração', 80.00, 90, 'Coloração completa do cabelo');

-- 4. Inserir produtos (opcional - para testar dashboard do barbeiro)
INSERT INTO products (produto, quantidade, preco_custo, fornecedor) VALUES
('Shampoo Profissional', 10, 15.50, 'Distribuidora ABC'),
('Condicionador', 8, 12.00, 'Distribuidora ABC'),
('Pomada Modeladora', 15, 18.90, 'Barber Supply'),
('Óleo para Barba', 12, 22.00, 'Barber Supply');

-- Verificar dados inseridos
SELECT 'Usuários' as tabela, COUNT(*) as total FROM users
UNION ALL
SELECT 'Barbeiros', COUNT(*) FROM barbers
UNION ALL
SELECT 'Serviços', COUNT(*) FROM services
UNION ALL
SELECT 'Produtos', COUNT(*) FROM products;

-- Mostrar dados inseridos
SELECT * FROM users;
SELECT * FROM barbers;
SELECT * FROM services;
SELECT * FROM products;
