-- 1. Oprim verificarea cheilor externe pentru a putea șterge datele vechi fără erori
SET FOREIGN_KEY_CHECKS = 0;

-- 2. Curățăm tabelele de datele vechi
TRUNCATE TABLE answer_votes;
TRUNCATE TABLE question_votes;
TRUNCATE TABLE question_tags;
TRUNCATE TABLE tags;
TRUNCATE TABLE answers;
TRUNCATE TABLE questions;
TRUNCATE TABLE users;

-- 3. Pornim înapoi verificarea cheilor externe
SET FOREIGN_KEY_CHECKS = 1;

-- ==========================================
-- INSERARE UTILIZATORI
-- (Parola pentru toți este: 'password')
-- ==========================================
INSERT INTO users (user_id, first_name, last_name, email, phone, username, password, role, access_restricted) VALUES
              (1, 'Admin', 'Istrator', 'admin@forum.com', '0700000001', 'admin', '$2a$10$slYQmyNdGzTn7ZLBUrUxHOcBaBo/BjhACR.JbK6E48I.U0C6.2qjm', 'ADMIN', 0),
              (2, 'Alice', 'Smith', 'alice@student.com', '0700000002', 'alice_s', '$2a$10$slYQmyNdGzTn7ZLBUrUxHOcBaBo/BjhACR.JbK6E48I.U0C6.2qjm', 'USER', 0),
              (3, 'Bob', 'Johnson', 'bob@student.com', '0700000003', 'bobj', '$2a$10$slYQmyNdGzTn7ZLBUrUxHOcBaBo/BjhACR.JbK6E48I.U0C6.2qjm', 'USER', 0),
              (4, 'Charlie', 'Brown', 'charlie@student.com', '0700000004', 'charlie_b', '$2a$10$slYQmyNdGzTn7ZLBUrUxHOcBaBo/BjhACR.JbK6E48I.U0C6.2qjm', 'USER', 0);


-- ==========================================
-- INSERARE TAG-URI
-- ==========================================
INSERT INTO tags (tag_id, label) VALUES
             (1, 'Java'),
             (2, 'Spring Boot'),
             (3, 'Angular'),
             (4, 'SQL'),
             (5, 'Debugging');


-- ==========================================
-- INSERARE ÎNTREBĂRI
-- Regula: 0 = Primită (Fără răspunsuri)
--         1 = În curs (Are răspunsuri, niciunul acceptat)
--         2 = Rezolvată (Are un răspuns acceptat)
-- ==========================================

INSERT INTO questions (question_id, user_id, title, text, likes, dislikes, date_and_time, status) VALUES
-- Q1: Alice. Are un răspuns acceptat -> Status 2
(1, 2, 'How to handle CORS in Spring Boot?', 'I am getting a blocked by CORS policy error when calling my API from Angular.', 2, 0, '2026-05-15 10:00:00', 'RESOLVED'),

-- Q2: Bob. Are răspuns, dar nu e acceptat -> Status 1
(2, 3, 'Understanding Signals in Angular 17', 'Can someone explain how to properly replace RxJS BehaviorSubjects with the new Signals API?', 1, 1, '2026-05-16 11:30:00', 'IN_PROGRESS'),

-- Q3: Charlie. NU are niciun răspuns -> Status 0
(3, 4, 'Best practices for SQL indexing?', 'What are the main rules to follow when deciding which columns to index in a MySQL database?', 3, 0, '2026-05-17 08:15:00', 'RECEIVED'),

-- Q4: Admin. Are răspuns acceptat -> Status 2
(4, 1, 'What is new in Java 21?', 'Can someone give a quick summary of the best features introduced in Java 21 for backend devs?', 0, 0, '2026-05-17 14:00:00', 'RESOLVED'),

-- Q5: Alice. Are răspuns, dar nu e acceptat -> Status 1
(5, 2, 'Hibernate N+1 problem', 'I am fetching a list of users and their questions, but Hibernate runs a query for each user. Help?', 2, 0, '2026-05-17 15:30:00', 'IN_PROGRESS');


-- ==========================================
-- ASOCIERE TAG-URI LA ÎNTREBĂRI (Join Table)
-- ==========================================
INSERT INTO question_tags (question_id, tag_id) VALUES
                (1, 2), (1, 3),         -- Q1: Spring Boot, Angular
                (2, 3),                 -- Q2: Angular
                (3, 4),                 -- Q3: SQL
                (4, 1),                 -- Q4: Java
                (5, 1), (5, 2), (5, 4); -- Q5: Java, Spring Boot, SQL


-- ==========================================
-- INSERARE RĂSPUNSURI
-- ==========================================
INSERT INTO answers (answer_id, user_id, question_id, text, likes, dislikes, accepted, date_and_time) VALUES
-- Răspunsuri la Q1 (Status 2)
(1, 1, 1, 'You need to add a CorsConfigurationSource bean in your SecurityConfig.', 3, 0, 1, '2026-05-15 10:30:00'), -- Acceptat!
(2, 3, 1, 'Another option is to use the @CrossOrigin annotation directly on your Controller.', 1, 0, 0, '2026-05-15 11:00:00'),

-- Răspuns la Q2 (Status 1)
(3, 2, 2, 'Signals are reactive primitives. You just use signal() and computed(). No more subscribe() needed.', 2, 0, 0, '2026-05-16 12:45:00'), -- Neacceptat

-- Răspuns la Q4 (Status 2)
(4, 4, 4, 'Virtual threads are the biggest addition! They make concurrent programming so much easier.', 2, 0, 1, '2026-05-17 14:30:00'), -- Acceptat!

-- Răspuns la Q5 (Status 1)
(5, 1, 5, 'You need to use a JOIN FETCH in your JPQL query to load the collection in a single hit.', 1, 0, 0, '2026-05-17 16:00:00'); -- Neacceptat


-- ==========================================
-- INSERARE VOTURI PENTRU ÎNTREBĂRI
-- (is_like: 1 = Like, 0 = Dislike)
-- Se potrivește cu numărătoarea (likes/dislikes) din tabelul questions
-- ==========================================
INSERT INTO question_votes (id, user_id, question_id, is_like) VALUES
               (1, 1, 1, 1), -- Admin likes Q1
               (2, 3, 1, 1), -- Bob likes Q1
               (3, 2, 2, 1), -- Alice likes Q2
               (4, 4, 2, 0), -- Charlie dislikes Q2
               (5, 1, 3, 1), -- Admin likes Q3
               (6, 2, 3, 1), -- Alice likes Q3
               (7, 3, 3, 1), -- Bob likes Q3
               (8, 4, 5, 1), -- Charlie likes Q5
               (9, 1, 5, 1); -- Admin likes Q5


-- ==========================================
-- INSERARE VOTURI PENTRU RĂSPUNSURI
-- Se potrivește cu numărătoarea (likes/dislikes) din tabelul answers
-- ==========================================
INSERT INTO answer_votes (id, user_id, answer_id, is_like) VALUES
               (1, 2, 1, 1), -- Alice likes A1
               (2, 3, 1, 1), -- Bob likes A1
               (3, 4, 1, 1), -- Charlie likes A1
               (4, 2, 2, 1), -- Alice likes A2
               (5, 1, 3, 1), -- Admin likes A3
               (6, 3, 3, 1), -- Bob likes A3
               (7, 1, 4, 1), -- Admin likes A4
               (8, 2, 4, 1), -- Alice likes A4
               (9, 3, 5, 1); -- Bob likes A5