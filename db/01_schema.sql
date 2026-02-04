CREATE TABLE members (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    member_type VARCHAR(50) DEFAULT 'standard',
    joined_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE books (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    author VARCHAR(100) NOT NULL,
    category VARCHAR(50),
    isbn VARCHAR(20) UNIQUE
);

CREATE TABLE copies (
    id SERIAL PRIMARY KEY,
    book_id INT NOT NULL,
    barcode VARCHAR(50) UNIQUE NOT NULL,
    status VARCHAR(50) DEFAULT 'available', -- available, loaned, lost
    CONSTRAINT fk_book
        FOREIGN KEY(book_id) 
        REFERENCES books(id)
        ON DELETE CASCADE
);

CREATE TABLE loans (
    id SERIAL PRIMARY KEY,
    copy_id INT NOT NULL,
    member_id INT NOT NULL,
    loaned_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    due_at TIMESTAMPTZ NOT NULL,
    returned_at TIMESTAMPTZ,
    CONSTRAINT fk_copy
        FOREIGN KEY(copy_id) 
        REFERENCES copies(id),
    CONSTRAINT fk_member
        FOREIGN KEY(member_id) 
        REFERENCES members(id)
);

CREATE TABLE fines (
    id SERIAL PRIMARY KEY,
    loan_id INT NOT NULL,
    amount DECIMAL(10, 2) NOT NULL,
    paid_at TIMESTAMPTZ,
    CONSTRAINT fk_loan
        FOREIGN KEY(loan_id) 
        REFERENCES loans(id)
);