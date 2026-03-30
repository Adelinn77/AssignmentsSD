package com.university.forum_app.service;

import com.university.forum_app.dto.AnswerDTO;
import com.university.forum_app.entity.Answer;
import com.university.forum_app.entity.AnswerImage;
import com.university.forum_app.entity.Question;
import com.university.forum_app.entity.User;
import com.university.forum_app.repository.AnswerRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Service
public class AnswerService {

    @Autowired
    private AnswerRepository answerRepo;

    @Value("${app.upload.dir.answers:uploads/answers}")
    private String uploadDir;

    private AnswerDTO mapEntityToDTO(Answer answer) {
        return AnswerDTO.builder()
                .answerId(answer.getId())
                .questionId(answer.getQuestion() != null ? answer.getQuestion().getId() : null)
                .userId(answer.getAuthor() != null ? answer.getAuthor().getId() : null)
                .dateTime(answer.getDate())
                .imageUrls(answer.getImages() != null
                        ? answer.getImages().stream().map(AnswerImage::getImageUrl).toList()
                        : new ArrayList<String>())
                .build();
    }

    private Answer mapDTOToEntity(AnswerDTO answerDTO) {
        User author = answerDTO.getUserId() != null
                ? User.builder().id(answerDTO.getUserId()).build()
                : null;

        Question question = answerDTO.getQuestionId() != null
                ? Question.builder().id(answerDTO.getQuestionId()).build()
                : null;

        return Answer.builder()
                .id(answerDTO.getAnswerId())
                .author(author)
                .question(question)
                .date(answerDTO.getDateTime())
                .build();
    }

    private String saveImageToDisk(MultipartFile file) {
        try {
            Path uploadPath = Paths.get(uploadDir);
            if (!Files.exists(uploadPath)) {
                Files.createDirectories(uploadPath);
            }

            String uniqueFilename = UUID.randomUUID() + "_" + file.getOriginalFilename();
            Path filePath = uploadPath.resolve(uniqueFilename);

            Files.copy(file.getInputStream(), filePath);

            return uniqueFilename;

        } catch (IOException e) {
            throw new RuntimeException("Couldn't save image: " + e.getMessage());
        }
    }

    @Transactional
    public AnswerDTO saveAnswerWithImages(AnswerDTO answerDTO, List<MultipartFile> imageFiles) {
        Answer newAnswer = mapDTOToEntity(answerDTO);

        if (imageFiles != null && !imageFiles.isEmpty()) {
            List<AnswerImage> answerImages = new ArrayList<>();

            for (MultipartFile file : imageFiles) {
                if (!file.isEmpty()) {
                    String imageUrl = saveImageToDisk(file);

                    AnswerImage answerImage = new AnswerImage();
                    answerImage.setImageUrl(imageUrl);
                    answerImage.setAnswer(newAnswer);

                    answerImages.add(answerImage);
                }
            }
            newAnswer.setImages(answerImages);
        }

        answerRepo.save(newAnswer);
        return mapEntityToDTO(newAnswer);
    }

    @Transactional
    public AnswerDTO saveAnswer(AnswerDTO answerDTO) {
        Answer answer = mapDTOToEntity(answerDTO);
        answerRepo.save(answer);
        return mapEntityToDTO(answer);
    }

    @Transactional
    public AnswerDTO updateAnswer(AnswerDTO updatedAnswer) {
        Answer answer;
        try {
            answer = answerRepo.findById(updatedAnswer.getAnswerId())
                    .orElseThrow(() -> new IllegalArgumentException(
                            "No answer exists with id: '" + updatedAnswer.getAnswerId() + "'."));
        } catch (Exception e) {
            throw new IllegalArgumentException(
                    "No answer exists with id: '" + updatedAnswer.getAnswerId() + "'.");
        }

        Answer mappedData = mapDTOToEntity(updatedAnswer);

        answer.setAuthor(mappedData.getAuthor());
        answer.setQuestion(mappedData.getQuestion());
        answer.setDate(mappedData.getDate());

        answerRepo.save(answer);
        return mapEntityToDTO(answer);
    }

    @Transactional
    public void deleteAnswerById(Long id) {
        if (answerRepo.existsById(id)) {
            answerRepo.deleteById(id);
        } else {
            throw new IllegalArgumentException("No answer exists with id: '" + id + "'.");
        }
    }

    @Transactional(readOnly = true)
    public AnswerDTO findAnswerById(Long id) {
        Answer answer;
        try {
            answer = answerRepo.findById(id)
                    .orElseThrow(() -> new IllegalArgumentException(
                            "No answer exists with id: '" + id + "'."));
        } catch (Exception e) {
            throw new IllegalArgumentException("No answer exists with id: '" + id + "'.");
        }
        return mapEntityToDTO(answer);
    }

    @Transactional(readOnly = true)
    public List<AnswerDTO> findAnswersByAuthorId(Long userId) {
        List<Answer> answers = answerRepo.findByAuthorId(userId);
        return answers.stream().map(this::mapEntityToDTO).toList();
    }

    @Transactional(readOnly = true)
    public List<AnswerDTO> findAnswersByQuestionId(Long questionId) {
        List<Answer> answers = answerRepo.findByQuestionId(questionId);
        return answers.stream().map(this::mapEntityToDTO).toList();
    }

    @Transactional(readOnly = true)
    public List<AnswerDTO> findAllAnswers() {
        List<Answer> answers = new ArrayList<>();
        answerRepo.findAll().forEach(answers::add);
        return answers.stream().map(this::mapEntityToDTO).toList();
    }
}