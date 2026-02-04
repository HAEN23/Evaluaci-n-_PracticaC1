-- Members
INSERT INTO members (name, email, member_type, joined_at) VALUES
('Ana Torres', 'ana.torres@example.com', 'premium', '2024-01-15T10:00:00Z'),
('Luis Garcia', 'luis.garcia@example.com', 'standard', '2024-02-20T11:30:00Z'),
('Maria Rodriguez', 'maria.rdz@example.com', 'standard', '2024-03-10T09:00:00Z'),
('Carlos Martinez', 'carlos.m@example.com', 'premium', '2023-11-05T15:00:00Z'),
('Sofia Hernandez', 'sofia.h@example.com', 'student', '2024-04-01T14:20:00Z');

-- Books
INSERT INTO books (title, author, category, isbn) VALUES
('Cien Años de Soledad', 'Gabriel García Márquez', 'Ficción', '978-0307350443'),
('El Señor de los Anillos', 'J.R.R. Tolkien', 'Fantasía', '978-0618640157'),
('1984', 'George Orwell', 'Distopía', '978-0451524935'),
('Un Mundo Feliz', 'Aldous Huxley', 'Distopía', '978-0060850524'),
('Don Quijote de la Mancha', 'Miguel de Cervantes', 'Clásico', '978-8424117311'),
('Clean Code', 'Robert C. Martin', 'Tecnología', '978-0132350884');

-- Copies
-- 2 copies for each book
INSERT INTO copies (book_id, barcode, status) VALUES
(1, 'CAS001', 'available'), (1, 'CAS002', 'loaned'),
(2, 'LOTR001', 'loaned'), (2, 'LOTR002', 'lost'),
(3, '1984-001', 'available'), (3, '1984-002', 'loaned'),
(4, 'BNW001', 'available'), (4, 'BNW002', 'available'),
(5, 'DQ001', 'loaned'), (5, 'DQ002', 'available'),
(6, 'CC001', 'loaned'), (6, 'CC002', 'loaned');

-- Loans
-- Loan 1 (returned on time)
INSERT INTO loans (copy_id, member_id, loaned_at, due_at, returned_at) VALUES
(3, 1, '2025-12-01T10:00:00Z', '2025-12-15T10:00:00Z', '2025-12-14T18:00:00Z');
-- Loan 2 (overdue, returned)
INSERT INTO loans (copy_id, member_id, loaned_at, due_at, returned_at) VALUES
(9, 2, '2026-01-05T14:00:00Z', '2026-01-20T14:00:00Z', '2026-01-25T10:00:00Z');
-- Loan 3 (overdue, not returned)
INSERT INTO loans (copy_id, member_id, loaned_at, due_at) VALUES
(2, 3, '2026-01-10T16:00:00Z', '2026-01-25T16:00:00Z');
-- Loan 4 (active, not due yet)
INSERT INTO loans (copy_id, member_id, loaned_at, due_at) VALUES
(6, 4, '2026-01-28T12:00:00Z', '2026-02-12T12:00:00Z');
-- Loan 5 (very overdue, not returned)
INSERT INTO loans (copy_id, member_id, loaned_at, due_at) VALUES
(11, 5, '2025-11-15T11:00:00Z', '2025-11-30T11:00:00Z');
-- Loan 6 (another one for most borrowed)
INSERT INTO loans (copy_id, member_id, loaned_at, due_at, returned_at) VALUES
(12, 1, '2025-10-01T09:00:00Z', '2025-10-15T09:00:00Z', '2025-10-15T09:00:00Z');


-- Fines
-- Fine for Loan 2 (paid)
INSERT INTO fines (loan_id, amount, paid_at) VALUES
(2, 5.00, '2026-01-25T11:00:00Z');
-- Fine for Loan 3 (unpaid)
INSERT INTO fines (loan_id, amount) VALUES
(3, 8.00);
-- Fine for Loan 5 (unpaid, large)
INSERT INTO fines (loan_id, amount) VALUES
(5, 50.00);