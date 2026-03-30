package com.university.forum_app.controller;

import com.university.forum_app.dto.AnswerDTO;
import com.university.forum_app.service.AnswerService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/api/answers")
public class AnswerController {

    @Autowired
    private AnswerService answerService;

    // Crearea unui răspuns nou
    @PostMapping
    public ResponseEntity<?> createAnswer(@RequestBody AnswerDTO answerDTO) {
        try {
            AnswerDTO savedAnswer = answerService.saveAnswer(answerDTO);
            return new ResponseEntity<>(savedAnswer, HttpStatus.CREATED);
        } catch (IllegalArgumentException e) {
            return new ResponseEntity<>(e.getMessage(), HttpStatus.BAD_REQUEST);
        }
    }

    // Crearea unui răspuns cu imagini
    @PostMapping("/with-images")
    public ResponseEntity<?> createAnswerWithImages(
            @RequestPart("answer") AnswerDTO answerDTO,
            @RequestPart(value = "images", required = false) List<MultipartFile> imageFiles) {
        try {
            AnswerDTO savedAnswer = answerService.saveAnswerWithImages(answerDTO, imageFiles);
            return new ResponseEntity<>(savedAnswer, HttpStatus.CREATED);
        } catch (IllegalArgumentException e) {
            return new ResponseEntity<>(e.getMessage(), HttpStatus.BAD_REQUEST);
        }
    }

    // Obținerea tuturor răspunsurilor
    @GetMapping
    public ResponseEntity<List<AnswerDTO>> getAllAnswers() {
        List<AnswerDTO> answers = answerService.findAllAnswers();
        return new ResponseEntity<>(answers, HttpStatus.OK);
    }

    // Obținerea unui răspuns după ID
    @GetMapping("/{id}")
    public ResponseEntity<?> getAnswerById(@PathVariable Long id) {
        try {
            AnswerDTO answer = answerService.findAnswerById(id);
            return new ResponseEntity<>(answer, HttpStatus.OK);
        } catch (IllegalArgumentException e) {
            return new ResponseEntity<>(e.getMessage(), HttpStatus.NOT_FOUND);
        }
    }

    // Obținerea răspunsurilor pentru o întrebare specifică
    @GetMapping("/question/{questionId}")
    public ResponseEntity<List<AnswerDTO>> getAnswersByQuestionId(@PathVariable Long questionId) {
        List<AnswerDTO> answers = answerService.findAnswersByQuestionId(questionId);
        return new ResponseEntity<>(answers, HttpStatus.OK);
    }

    // Obținerea răspunsurilor unui utilizator
    @GetMapping("/user/{userId}")
    public ResponseEntity<List<AnswerDTO>> getAnswersByUserId(@PathVariable Long userId) {
        List<AnswerDTO> answers = answerService.findAnswersByAuthorId(userId);
        return new ResponseEntity<>(answers, HttpStatus.OK);
    }

    // Actualizarea unui răspuns
    @PutMapping("/{id}")
    public ResponseEntity<?> updateAnswer(@PathVariable Long id, @RequestBody AnswerDTO answerDTO) {
        try {
            answerDTO.setAnswerId(id);
            AnswerDTO updatedAnswer = answerService.updateAnswer(answerDTO);
            return new ResponseEntity<>(updatedAnswer, HttpStatus.OK);
        } catch (IllegalArgumentException e) {
            return new ResponseEntity<>(e.getMessage(), HttpStatus.BAD_REQUEST);
        }
    }

    // stergerea unui răspuns
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteAnswer(@PathVariable Long id) {
        try {
            answerService.deleteAnswerById(id);
            return new ResponseEntity<>("Answer with id " + id + " was deleted successfully.", HttpStatus.OK);
        } catch (IllegalArgumentException e) {
            return new ResponseEntity<>(e.getMessage(), HttpStatus.NOT_FOUND);
        }
    }
}
