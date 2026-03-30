package com.university.forum_app;

import com.university.forum_app.dto.QuestionDTO;
import com.university.forum_app.dto.UserDTO;
import com.university.forum_app.entity.Question;
import com.university.forum_app.entity.User;
import com.university.forum_app.service.QuestionService;
import com.university.forum_app.service.UserService;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;

import java.util.ArrayList;
import java.util.List;

@SpringBootApplication
public class Application {

    public static UserService userService;
    public static QuestionService questionService;

    public static void main(String[] args) {
        SpringApplication.run(Application.class, args);
    }

//    @Bean
//    CommandLineRunner runAtStartup(UserService userService, QuestionService questionService) {
//        return args -> {
//            System.out.println("--- STARTING INTEGRATION TEST ---");
//
//            UserDTO u1 = UserDTO.builder().username("user1").email("user1@univ.com").build();
//            UserDTO u2 = UserDTO.builder().username("user2").email("user2@univ.com").build();
//            UserDTO u3 = UserDTO.builder().username("user3").email("user3@univ.com").build();
//
//            userService.saveUser(u1);
//            userService.saveUser(u2);
//            userService.saveUser(u3);
//            System.out.println("Users saved successfully.");
//
//            questionService.saveQuestion(QuestionDTO.builder()
//                    .title("Java Spring Boot NullPointer")
//                    .text("Why is my repository null in the main method?")
//                    .authorName("user3")
//                    .build());
//
//            questionService.saveQuestion(QuestionDTO.builder()
//                    .title("Hibernate Mapping")
//                    .text("How to map a OneToMany relationship correctly?")
//                    .authorName("user2")
//                    .build());
//
//            List<QuestionDTO> allQuestions = questionService.findAllQuestions();
//            System.out.println("Current Questions in DB: " + allQuestions);
//
//            if (!allQuestions.isEmpty()) {
//                String targetTitle = "Java Spring Boot NullPointer";
//                QuestionDTO updateData = QuestionDTO.builder()
//                        .title("SOLVED: Spring Boot Dependency Injection")
//                        .text("I forgot that static fields are not injected by Spring!")
//                        .authorName("user1")
//                        .build();
//
//                questionService.updateQuestion(targetTitle, updateData);
//                System.out.println("Update successful. New data: " +
//                        questionService.findQuestionByTitle("SOLVED: Spring Boot Dependency Injection"));
//            }
//
//            System.out.println("Total users before deletion: " + userService.findAllUsers().size());
//            try {
//                userService.deleteUserByUsername("user1");
//                System.out.println("User 'user1' deleted.");
//            } catch (Exception e) {
//                System.out.println("Deletion failed. Check Foreign Key constraints: " + e.getMessage());
//            }
//
//            System.out.println("Final user list: " + userService.findAllUsers());
//            System.out.println("--- INTEGRATION TEST FINISHED ---");
//        };
//    }
}
