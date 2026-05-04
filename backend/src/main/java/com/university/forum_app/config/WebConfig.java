package com.university.forum_app.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

import java.nio.file.Path;
import java.nio.file.Paths;

@Configuration
public class WebConfig implements WebMvcConfigurer {

    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        Path uploadDir = Paths.get("uploads/questions");
        String uploadPath = uploadDir.toFile().getAbsolutePath();
        registry.addResourceHandler("/uploads/questions/**")
                .addResourceLocations("file:" + uploadPath + "/");

        Path answerUploadDir = Paths.get("uploads/answers");
        String answerUploadPath = answerUploadDir.toFile().getAbsolutePath();
        registry.addResourceHandler("/uploads/answers/**")
                .addResourceLocations("file:" + answerUploadPath + "/");
    }
}