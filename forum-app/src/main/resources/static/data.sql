INSERT INTO users (first_name, last_name, email, phone, username, password, role, access_restricted)
VALUES
    ('Ion', 'Popescu', 'ion.popescu@email.com', '0722111222', 'ion_pop', '$2a$10$D8bTq1Xb.Fj.v4L2y8c.1e1zQ5j3Xk9xQ5j3Xk9xQ5j3Xk9xQ5j3X', 0, FALSE),
    ('Maria', 'Ionescu', 'maria.ionescu@email.com', '0733222333', 'maria_i', '$2a$10$D8bTq1Xb.Fj.v4L2y8c.1e1zQ5j3Xk9xQ5j3Xk9xQ5j3Xk9xQ5j3X', 0, FALSE),
    ('Andrei', 'Radu', 'andrei.radu@email.com', '0744333444', 'andrew_r', '$2a$10$D8bTq1Xb.Fj.v4L2y8c.1e1zQ5j3Xk9xQ5j3Xk9xQ5j3Xk9xQ5j3X', 0, FALSE),
    ('Elena', 'Dumitrescu', 'elena.d@email.com', '0755444555', 'elena_dum', '$2a$10$D8bTq1Xb.Fj.v4L2y8c.1e1zQ5j3Xk9xQ5j3Xk9xQ5j3Xk9xQ5j3X', 0, TRUE),
    ('Mihai', 'Stan', 'mihai.stan@admin.com', '0766555666', 'admin_mihai', '$2a$10$D8bTq1Xb.Fj.v4L2y8c.1e1zQ5j3Xk9xQ5j3Xk9xQ5j3Xk9xQ5j3X', 1, FALSE);



INSERT INTO questions (user_id, title, text, date_and_time, status)
VALUES
    -- Questions for User 1 (Ion)
    (1, 'Eroare Spring Security 403', 'Salut! Primesc eroarea 403 Forbidden la endpoint-ul de login deși trimit credențialele corecte. Ceva idei?', NOW() - INTERVAL 3 DAY, 0),
    (1, 'Problema mapare ManyToMany JPA', 'Tabelul meu de legătură pentru tag-uri nu se generează automat. Am folosit CascadeType.PERSIST. Unde greșesc?', NOW() - INTERVAL 2 DAY, 2),

    -- Question for User 2 (Maria)
    (2, 'Eroare CORS React si Spring Boot', 'Încerc să fac un request de pe frontend (localhost:3000) către API (localhost:8080) și primesc CORS policy block.', NOW() - INTERVAL 1 DAY, 1),

    -- Question for User 3 (Andrei)
    (3, 'NullPointerException in Service', 'Când apelez metoda de save din QuestionService, primesc NullPointerException pe repository.', NOW() - INTERVAL 5 HOUR, 0),

    -- Question for User 4 (Elena)
    (4, 'Upload imagine in Spring Boot', 'Care este cea mai bună practică? Să salvez imaginea ca byte array in DB sau să o salvez pe disc și să țin calea în baza de date?', NOW() - INTERVAL 1 HOUR, 0),

    -- Question for User 5 (Mihai - Admin)
    (5, 'Eroare Dockerizare Java 17', 'Containerul meu se oprește imediat după pornire cu exit code 1. Atașez fișierul Dockerfile mai jos.', NOW(), 2);