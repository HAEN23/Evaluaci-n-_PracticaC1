-- Índice en claves foráneas frecuentemente usadas en JOINs
CREATE INDEX idx_loans_copy_id ON loans(copy_id);
CREATE INDEX idx_loans_member_id ON loans(member_id);

-- Índice en una columna usada para búsquedas y filtros
CREATE INDEX idx_books_title_author ON books(title, author);

-- Índice en el estado de las copias para encontrar rápidamente las disponibles/prestadas
CREATE INDEX idx_copies_status ON copies(status);