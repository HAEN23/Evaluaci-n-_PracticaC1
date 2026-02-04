-- VIEW 1: vw_most_borrowed_books (Window Function)
-- Devuelve: Ranking de los libros más prestados.
-- Grain: Un registro por libro (book_id).
-- Métricas: total_loans (COUNT), loan_rank (RANK).
-- VERIFY 1: SELECT * FROM vw_most_borrowed_books WHERE loan_rank <= 3;
-- VERIFY 2: SELECT * FROM vw_most_borrowed_books WHERE author ILIKE '%martin%';

CREATE OR REPLACE VIEW vw_most_borrowed_books AS
SELECT
    b.id AS book_id,
    b.title,
    b.author,
    b.category,
    COUNT(l.id) AS total_loans,
    RANK() OVER (ORDER BY COUNT(l.id) DESC) AS loan_rank
FROM
    books b
JOIN
    copies c ON b.id = c.book_id
JOIN
    loans l ON c.id = l.copy_id
GROUP BY
    b.id, b.title, b.author, b.category;


-- VIEW 2: vw_overdue_loans (CTE + CASE)
-- Devuelve: Préstamos vencidos que no han sido devueltos.
-- Grain: Un registro por préstamo vencido (loan_id).
-- Métricas: dias_atraso (Calculado), suggested_fine (CASE).
-- VERIFY 1: SELECT * FROM vw_overdue_loans WHERE dias_atraso > 10;
-- VERIFY 2: SELECT * FROM vw_overdue_loans WHERE member_name = 'Maria Rodriguez';
CREATE OR REPLACE VIEW vw_overdue_loans AS
WITH OverdueData AS (
    SELECT
        l.id AS loan_id,
        m.id AS member_id,
        m.name AS member_name,
        b.title AS book_title,
        l.due_at,
        CURRENT_DATE - l.due_at::date AS dias_atraso
    FROM
        loans l
    JOIN
        copies c ON l.copy_id = c.id
    JOIN
        books b ON c.book_id = b.id
    JOIN
        members m ON l.member_id = m.id
    WHERE
        l.returned_at IS NULL AND l.due_at < CURRENT_TIMESTAMP
)
SELECT
    loan_id,
    member_id,
    member_name,
    book_title,
    due_at,
    dias_atraso,
    CASE
        WHEN dias_atraso > 60 THEN 50.00
        WHEN dias_atraso > 30 THEN 25.00
        WHEN dias_atraso > 7 THEN 10.00
        ELSE 5.00
    END AS suggested_fine
FROM
    OverdueData;


-- VIEW 3: vw_fines_summary (HAVING)
-- Devuelve: Resumen de multas por mes.
-- Grain: Un registro por año y mes (summary_month).
-- Métricas: total_fines_amount, paid_fines_amount, pending_fines_amount, number_of_fines.
-- VERIFY 1: SELECT * FROM vw_fines_summary WHERE summary_month = '2026-01';
-- VERIFY 2: SELECT summary_month, total_fines_amount FROM vw_fines_summary ORDER BY summary_month DESC LIMIT 3;
CREATE OR REPLACE VIEW vw_fines_summary AS
SELECT
    TO_CHAR(l.loaned_at, 'YYYY-MM') AS summary_month,
    SUM(f.amount) AS total_fines_amount,
    SUM(CASE WHEN f.paid_at IS NOT NULL THEN f.amount ELSE 0 END) AS paid_fines_amount,
    SUM(CASE WHEN f.paid_at IS NULL THEN f.amount ELSE 0 END) AS pending_fines_amount,
    COUNT(f.id) AS number_of_fines
FROM
    fines f
JOIN
    loans l ON f.loan_id = l.id
GROUP BY
    TO_CHAR(l.loaned_at, 'YYYY-MM')
HAVING
    COUNT(f.id) > 0;


-- VIEW 4: vw_member_activity (HAVING + CASE/COALESCE)
-- Devuelve: Actividad de cada miembro, incluyendo total de préstamos y tasa de atraso.
-- Grain: Un registro por miembro (member_id).
-- Métricas: total_loans (COUNT), overdue_rate_percentage (Calculado con COALESCE).
-- VERIFY 1: SELECT * FROM vw_member_activity WHERE total_loans > 1;
-- VERIFY 2: SELECT member_name, total_loans, overdue_rate_percentage FROM vw_member_activity ORDER BY total_loans DESC LIMIT 5;
CREATE OR REPLACE VIEW vw_member_activity AS
SELECT
    m.id AS member_id,
    m.name AS member_name,
    m.email,
    m.joined_at,
    COUNT(l.id) AS total_loans,
    COALESCE(
        SUM(CASE WHEN l.returned_at > l.due_at THEN 1 ELSE 0 END) * 100.0 / NULLIF(COUNT(l.id), 0),
        0
    ) AS overdue_rate_percentage
FROM
    members m
LEFT JOIN
    loans l ON m.id = l.member_id
GROUP BY
    m.id, m.name, m.email, m.joined_at
HAVING
    COUNT(l.id) > 0;


-- VIEW 5: vw_inventory_health (CASE/COALESCE)
-- Devuelve: Estado del inventario de libros por categoría.
-- Grain: Un registro por (COUNT), available_copies (SUM+CASE), loaned_copies (SUM+CASE), lost_copies (SUM+CASE), availability_percentage (Calculado).
-- VERIFY 1: SELECT * FROM vw_inventory_health WHERE category = 'Distopía';
-- VERIFY 2: SELECT category, total_copies, availability_percentage FROM vw_inventory_health ORDER BY availability_percentage ASC
-- VERIFY 1: SELECT * FROM vw_inventory_health WHERE category = 'Distopía';
CREATE OR REPLACE VIEW vw_inventory_health AS
SELECT
    b.category,
    COUNT(c.id) AS total_copies,
    COALESCE(SUM(CASE WHEN c.status = 'available' THEN 1 ELSE 0 END), 0) AS available_copies,
    COALESCE(SUM(CASE WHEN c.status = 'loaned' THEN 1 ELSE 0 END), 0) AS loaned_copies,
    COALESCE(SUM(CASE WHEN c.status = 'lost' THEN 1 ELSE 0 END), 0) AS lost_copies,
    (COALESCE(SUM(CASE WHEN c.status = 'available' THEN 1 ELSE 0 END), 0) * 100.0) / COUNT(c.id) AS availability_percentage
FROM
    books b
JOIN
    copies c ON b.id = c.book_id
GROUP BY
    b.category;