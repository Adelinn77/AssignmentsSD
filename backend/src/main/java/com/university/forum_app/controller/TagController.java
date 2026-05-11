package com.university.forum_app.controller;

import com.university.forum_app.dto.TagDTO;
import com.university.forum_app.service.TagMicroserviceClient;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/tags")
public class TagController {

    private final TagMicroserviceClient tagMicroserviceClient;

    public TagController(TagMicroserviceClient tagMicroserviceClient) {
        this.tagMicroserviceClient = tagMicroserviceClient;
    }

    @PostMapping
    public ResponseEntity<Object> addTag(@RequestBody TagDTO tagDTO) {
        return tagMicroserviceClient.addTag(tagDTO);
    }

    @GetMapping
    public ResponseEntity<List<TagDTO>> getAllTags() {
        return tagMicroserviceClient.getAllTags();
    }

    @GetMapping("/label/{label}")
    public ResponseEntity<Object> getTagByLabel(@PathVariable String label) {
        return tagMicroserviceClient.getTagByLabel(label);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Object> updateTag(@PathVariable Long id, @RequestBody TagDTO tagDTO) {
        return tagMicroserviceClient.updateTag(id, tagDTO);
    }

    @DeleteMapping("/label/{label}")
    public ResponseEntity<String> deleteTag(@PathVariable String label) {
        return tagMicroserviceClient.deleteTag(label);
    }
}