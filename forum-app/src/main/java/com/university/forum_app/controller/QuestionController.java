package com.university.forum_app.controller;

import com.university.forum_app.dto.QuestionDTO;
import com.university.forum_app.service.QuestionService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/api/questions")
public class QuestionController {

    @Autowired
    private QuestionService questionService;

    // Crearea unei întrebări noi
    @PostMapping
    public ResponseEntity<?> createQuestion(@RequestBody QuestionDTO questionDTO) {
        try {
            QuestionDTO savedQuestion = questionService.saveQuestion(questionDTO);
            return new ResponseEntity<>(savedQuestion, HttpStatus.CREATED);
        } catch (IllegalArgumentException e) {
            return new ResponseEntity<>(e.getMessage(), HttpStatus.CONFLICT);
        }
    }

    // Crearea unei întrebări cu imagini
    @PostMapping("/with-images")
    public ResponseEntity<?> createQuestionWithImages(
            @RequestPart("question") QuestionDTO questionDTO,
            @RequestPart(value = "images", required = false) List<MultipartFile> imageFiles) {
        try {
            QuestionDTO savedQuestion = questionService.saveQuestionWithImages(questionDTO, imageFiles);
            return new ResponseEntity<>(savedQuestion, HttpStatus.CREATED);
        } catch (IllegalArgumentException e) {
            return new ResponseEntity<>(e.getMessage(), HttpStatus.CONFLICT);
        }
    }

    // Obținerea tuturor întrebărilor
    @GetMapping
    public ResponseEntity<List<QuestionDTO>> getAllQuestions() {
        List<QuestionDTO> questions = questionService.findAllQuestions();
        return new ResponseEntity<>(questions, HttpStatus.OK);
    }

    // Obținerea unei întrebări după titlu
    @GetMapping("/title/{title}")
    public ResponseEntity<?> getQuestionByTitle(@PathVariable String title) {
        try {
            QuestionDTO question = questionService.findQuestionByTitle(title);
            return new ResponseEntity<>(question, HttpStatus.OK);
        } catch (IllegalArgumentException e) {
            return new ResponseEntity<>(e.getMessage(), HttpStatus.NOT_FOUND);
        }
    }

    // Actualizarea unei întrebări (după titlul curent)
    @PutMapping("/title/{currentTitle}")
    public ResponseEntity<?> updateQuestion(
            @PathVariable String currentTitle,
            @RequestBody QuestionDTO questionDTO) {
        try {
            QuestionDTO updatedQuestion = questionService.updateQuestion(currentTitle, questionDTO);
            return new ResponseEntity<>(updatedQuestion, HttpStatus.OK);
        } catch (IllegalArgumentException e) {
            return new ResponseEntity<>(e.getMessage(), HttpStatus.BAD_REQUEST);
        }
    }

    // Ștergerea unei întrebări după titlu
    @DeleteMapping("/title/{title}")
    public ResponseEntity<?> deleteQuestionByTitle(@PathVariable String title) {
        try {
            questionService.deleteQuestionByTitle(title);
            return new ResponseEntity<>("Question with title '" + title + "' was deleted successfully.", HttpStatus.OK);
        } catch (IllegalArgumentException e) {
            return new ResponseEntity<>(e.getMessage(), HttpStatus.NOT_FOUND);
        }
    }
}
