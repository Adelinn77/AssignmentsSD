package com.university.forum_app.controller;

import com.university.forum_app.dto.TagDTO;
import com.university.forum_app.service.TagService; // Presupunând că ai un TagService
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/tags") // Aceasta este baza URL-ului
public class TagController {

    @Autowired
    private TagService tagService;

    // 1. ADD TAG
    @PostMapping
    public ResponseEntity<TagDTO> addTag(@RequestBody TagDTO tagDTO) {
        TagDTO savedTag = tagService.saveTag(tagDTO);
        return new ResponseEntity<>(savedTag, HttpStatus.CREATED);
    }

    // 2. SHOW ALL TAGS
    @GetMapping
    public ResponseEntity<List<TagDTO>> getAllTags() {
        return ResponseEntity.ok(tagService.findAllTags());
    }

    // 3. VIEW TAG (by label)
    @GetMapping("/label/{label}")
    public ResponseEntity<TagDTO> getTagByLabel(@PathVariable String label) {
        return ResponseEntity.ok(tagService.findTagByLabel(label));
    }

    // 4. DELETE TAG
    @DeleteMapping("/label/{label}")
    public ResponseEntity<String> deleteTag(@PathVariable String label) {
        tagService.deleteTagByLabel(label);
        return ResponseEntity.ok("Tag deleted successfully");
    }
}