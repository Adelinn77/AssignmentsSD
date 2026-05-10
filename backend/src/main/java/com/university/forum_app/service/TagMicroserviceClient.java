package com.university.forum_app.service;

import com.university.forum_app.dto.TagDTO;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.HttpStatusCodeException;
import org.springframework.web.client.RestTemplate;

import java.util.List;

@Service
public class TagMicroserviceClient {

    private final RestTemplate restTemplate;

    private static final String TAG_SERVICE_URL = "http://localhost:8081/api/tags";

    public TagMicroserviceClient(RestTemplate restTemplate) {
        this.restTemplate = restTemplate;
    }

    public ResponseEntity<Object> addTag(TagDTO tagDTO) {
        try {
            ResponseEntity<TagDTO> response = restTemplate.exchange(
                    TAG_SERVICE_URL,
                    HttpMethod.POST,
                    new HttpEntity<>(tagDTO),
                    TagDTO.class
            );

            return new ResponseEntity<>(response.getBody(), response.getStatusCode());
        } catch (HttpStatusCodeException e) {
            return new ResponseEntity<>(e.getResponseBodyAsString(), e.getStatusCode());
        }
    }

    public ResponseEntity<List<TagDTO>> getAllTags() {
        ResponseEntity<List<TagDTO>> response = restTemplate.exchange(
                TAG_SERVICE_URL,
                HttpMethod.GET,
                null,
                new ParameterizedTypeReference<List<TagDTO>>() {}
        );

        return new ResponseEntity<>(response.getBody(), response.getStatusCode());
    }

    public ResponseEntity<Object> getTagByLabel(String label) {
        try {
            ResponseEntity<TagDTO> response = restTemplate.exchange(
                    TAG_SERVICE_URL + "/label/" + label,
                    HttpMethod.GET,
                    null,
                    TagDTO.class
            );

            return new ResponseEntity<>(response.getBody(), response.getStatusCode());
        } catch (HttpStatusCodeException e) {
            return new ResponseEntity<>(e.getResponseBodyAsString(), e.getStatusCode());
        }
    }

    public ResponseEntity<Object> updateTag(Long id, TagDTO tagDTO) {
        try {
            ResponseEntity<TagDTO> response = restTemplate.exchange(
                    TAG_SERVICE_URL + "/" + id,
                    HttpMethod.PUT,
                    new HttpEntity<>(tagDTO),
                    TagDTO.class
            );

            return new ResponseEntity<>(response.getBody(), response.getStatusCode());
        } catch (HttpStatusCodeException e) {
            return new ResponseEntity<>(e.getResponseBodyAsString(), e.getStatusCode());
        }
    }

    public ResponseEntity<String> deleteTag(String label) {
        try {
            ResponseEntity<String> response = restTemplate.exchange(
                    TAG_SERVICE_URL + "/label/" + label,
                    HttpMethod.DELETE,
                    null,
                    String.class
            );

            return new ResponseEntity<>(response.getBody(), response.getStatusCode());
        } catch (HttpStatusCodeException e) {
            return new ResponseEntity<>(e.getResponseBodyAsString(), e.getStatusCode());
        }
    }
}