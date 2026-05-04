-- 1. USERS
INSERT INTO users (first_name, last_name, email, phone, username, password, role, access_restricted)
VALUES
    ('Ion', 'Popescu', 'ion.popescu@email.com', '0722111222', 'ion_pop', '$2a$10$D8bTq1Xb.Fj.v4L2y8c.1e1zQ5j3Xk9xQ5j3Xk9xQ5j3Xk9xQ5j3X', 0, FALSE),
    ('Maria', 'Ionescu', 'maria.ionescu@email.com', '0733222333', 'maria_i', '$2a$10$D8bTq1Xb.Fj.v4L2y8c.1e1zQ5j3Xk9xQ5j3Xk9xQ5j3Xk9xQ5j3X', 0, FALSE),
    ('Andrei', 'Radu', 'andrei.radu@email.com', '0744333444', 'andrew_r', '$2a$10$D8bTq1Xb.Fj.v4L2y8c.1e1zQ5j3Xk9xQ5j3Xk9xQ5j3Xk9xQ5j3X', 0, FALSE),
    ('Elena', 'Dumitrescu', 'elena.d@email.com', '0755444555', 'elena_dum', '$2a$10$D8bTq1Xb.Fj.v4L2y8c.1e1zQ5j3Xk9xQ5j3Xk9xQ5j3Xk9xQ5j3X', 0, TRUE),
    ('Mihai', 'Stan', 'mihai.stan@admin.com', '0766555666', 'admin_mihai', '$2a$10$D8bTq1Xb.Fj.v4L2y8c.1e1zQ5j3Xk9xQ5j3Xk9xQ5j3Xk9xQ5j3X', 1, FALSE);


-- 2. QUESTIONS
INSERT INTO questions (user_id, title, text, date_and_time, status)
VALUES
    -- Q1: Ion (ID 1)
    (1, 'Eroare Spring Security 403', 'Salut! Primesc eroarea 403 Forbidden la endpoint-ul de login deși trimit credențialele corecte. Ceva idei?', NOW() - INTERVAL 3 DAY, 0),
    -- Q2: Ion (ID 1)
    (1, 'Problema mapare ManyToMany JPA', 'Tabelul meu de legătură pentru tag-uri nu se generează automat. Am folosit CascadeType.PERSIST. Unde greșesc?', NOW() - INTERVAL 2 DAY, 2),
    -- Q3: Maria (ID 2)
    (2, 'Eroare CORS React si Spring Boot', 'Încerc să fac un request de pe frontend (localhost:3000) către API (localhost:8080) și primesc CORS policy block.', NOW() - INTERVAL 1 DAY, 1),
    -- Q4: Andrei (ID 3)
    (3, 'NullPointerException in Service', 'Când apelez metoda de save din QuestionService, primesc NullPointerException pe repository.', NOW() - INTERVAL 5 HOUR, 0),
    -- Q5: Elena (ID 4)
    (4, 'Upload imagine in Spring Boot', 'Care este cea mai bună practică? Să salvez imaginea ca byte array in DB sau să o salvez pe disc și să țin calea în baza de date?', NOW() - INTERVAL 1 HOUR, 0),
    -- Q6: Mihai - Admin (ID 5)
    (5, 'Eroare Dockerizare Java 17', 'Containerul meu se oprește imediat după pornire cu exit code 1. Atașez fișierul Dockerfile mai jos.', NOW(), 2);


-- 3. TAGS
INSERT INTO tags (label)
VALUES
    ('spring-security'), -- 1
    ('jpa'),             -- 2
    ('hibernate'),       -- 3
    ('react'),           -- 4
    ('cors'),            -- 5
    ('spring-boot'),     -- 6
    ('docker');          -- 7


-- 4. QUESTION_TAGS (Mapping questions to tags)
INSERT INTO question_tags (question_id, tag_id)
VALUES
    (1, 1), (1, 6),        -- Q1 (Securitate): spring-security, spring-boot
    (2, 2), (2, 3),        -- Q2 (JPA): jpa, hibernate
    (3, 4), (3, 5), (3, 6),-- Q3 (CORS): react, cors, spring-boot
    (4, 6),                -- Q4 (NPE): spring-boot
    (5, 6),                -- Q5 (Upload): spring-boot
    (6, 6), (6, 7);        -- Q6 (Docker): spring-boot, docker


-- 5. ANSWERS
INSERT INTO answers (user_id, question_id, text, date_and_time)
VALUES
    -- A1: Andrei anwers Q1
    (3, 1, 'Dacă folosești Postman, asigură-te că ai configurat http.csrf().disable() în SecurityFilterChain.', NOW() - INTERVAL 2 DAY),
    -- A2: Mihai answers Q2
    (5, 2, 'Adaugă @JoinTable și definește explicit coloanele joinColumns și inverseJoinColumns. Vezi exemplul atașat.', NOW() - INTERVAL 1 DAY),
    -- A3: Ion answers Q3
    (1, 3, 'Poți rezolva rapid punând @CrossOrigin(origins = "http://localhost:3000") deasupra controller-ului tău.', NOW() - INTERVAL 12 HOUR),
    -- A4: Maria answers Q5
    (2, 5, 'Cel mai bine e să le salvezi pe un S3 sau local pe disc și să ții doar calea/URL-ul în baza de date ca String.', NOW() - INTERVAL 30 MINUTE);


-- 6. QUESTION_IMAGES (Attachments for questions)
INSERT INTO question_images (question_id, image_url)
VALUES
    (1, 'https://dummyimage.com/600x400/000/fff&text=postman_403_error.png'),
    (2, 'https://dummyimage.com/600x400/000/fff&text=jpa_entity_code.png'),
    (6, 'https://dummyimage.com/600x400/000/fff&text=dockerfile_config.png');


-- 7. ANSWER_IMAGES (Attachments for answers)
INSERT INTO answer_images (answer_id, image_url)
VALUES
    -- Image for Mihai's answer (A2) to the JPA question
    (2, 'https://dummyimage.com/600x400/000/fff&text=jpa_jointable_example.png'),
    -- Image for Maria's answer (A4) to the image upload question
    (4, 'https://dummyimage.com/600x400/000/fff&text=aws_s3_bucket_setup.png');


# DROP SCHEMA IF EXISTS `forum-app`;