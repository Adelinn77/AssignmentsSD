package com.university.forum_app.service;

import com.university.forum_app.dto.AnswerDTO;
import com.university.forum_app.entity.Answer;
import com.university.forum_app.entity.AnswerImage;
import com.university.forum_app.entity.Question;
import com.university.forum_app.entity.Role;
import com.university.forum_app.entity.Status;
import com.university.forum_app.entity.User;
import com.university.forum_app.repository.AnswerRepository;
import com.university.forum_app.repository.AnswerVoteRepository;
import com.university.forum_app.entity.AnswerVote;
import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
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

    @Autowired
    private com.university.forum_app.repository.UserRepository userRepository;

    @Autowired
    private AnswerVoteRepository answerVoteRepository;

    @Autowired
    private com.university.forum_app.repository.QuestionRepository questionRepository;

    @PersistenceContext
    private EntityManager entityManager;

    @Value("${app.upload.dir.answers:uploads/answers}")
    private String uploadDir;

    @Autowired
    private UserScoreService userScoreService;

    private AnswerDTO mapEntityToDTO(Answer answer) {
        Double authorScore = null;
        if (answer.getAuthor() != null) {
            authorScore = userScoreService.calculateScore(answer.getAuthor().getId());
        }
        return AnswerDTO.builder()
                .answerId(answer.getId())
                .questionId(answer.getQuestion() != null ? answer.getQuestion().getId() : null)
                .userId(answer.getAuthor() != null ? answer.getAuthor().getId() : null)
                .authorName(answer.getAuthor() != null ? answer.getAuthor().getUsername() : null)
                .authorScore(authorScore)
                .text(answer.getText())
                .likes(answer.getLikes())
                .dislikes(answer.getDislikes())
                .accepted(answer.isAccepted())
                .dateTime(answer.getDate())
                .imageUrls(answer.getImages() != null
                        ? answer.getImages().stream().map(AnswerImage::getImageUrl).toList()
                        : new ArrayList<String>())
                .build();
    }

    private AnswerDTO mapEntityToDTO(Answer answer, String viewer) {
        AnswerDTO dto = mapEntityToDTO(answer);
        if (viewer != null) {
            User user = userRepository.findByUsername(viewer);
            if (user != null) {
                AnswerVote vote = answerVoteRepository.findByAnswerAndUser(answer, user);
                if (vote != null) {
                    dto.setCurrentUserVote(vote.isLike() ? "LIKE" : "DISLIKE");
                }
            }
        }
        return dto;
    }

    private Answer mapDTOToEntity(AnswerDTO answerDTO) {
        User author = null;
        if (answerDTO.getAuthorName() != null) {
            author = userRepository.findByUsername(answerDTO.getAuthorName());
            if (author == null) {
                throw new IllegalArgumentException("Author with username '" + answerDTO.getAuthorName() + "' doesn't exist.");
            }
        }

        Question question = null;
        if (answerDTO.getQuestionId() != null) {
            question = questionRepository.findById(answerDTO.getQuestionId())
                    .orElseThrow(() -> new IllegalArgumentException("Question with id '" + answerDTO.getQuestionId() + "' doesn't exist."));
        }

        return Answer.builder()
                .id(answerDTO.getAnswerId())
                .text(answerDTO.getText())
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

        Answer savedAnswer = answerRepo.save(newAnswer);
        updateQuestionStatusIfFirstAnswer(savedAnswer.getQuestion());
        return mapEntityToDTO(savedAnswer);
    }

    @Transactional
    public AnswerDTO saveAnswer(AnswerDTO answerDTO) {
        Answer answer = mapDTOToEntity(answerDTO);
        Answer savedAnswer = answerRepo.save(answer);
        updateQuestionStatusIfFirstAnswer(savedAnswer.getQuestion());
        return mapEntityToDTO(savedAnswer);
    }

    @Transactional
    public AnswerDTO updateAnswer(AnswerDTO updatedAnswer) {
        return updateAnswer(updatedAnswer, null);
    }

    @Transactional
    public AnswerDTO updateAnswer(AnswerDTO updatedAnswer, String username) {
        Answer answer = answerRepo.findById(updatedAnswer.getAnswerId())
                .orElseThrow(() -> new IllegalArgumentException(
                        "No answer exists with id: '" + updatedAnswer.getAnswerId() + "'."));

        requireOwnerOrAdmin(answer, username);

        Answer mappedData = mapDTOToEntity(updatedAnswer);
        answer.setText(mappedData.getText());
        answerRepo.save(answer);
        return mapEntityToDTO(answer);
    }

    @Transactional
    public void deleteAnswerById(Long id) {
        deleteAnswerById(id, null);
    }

    @Transactional
    public void deleteAnswerById(Long id, String username) {
        Answer answer = answerRepo.findAnswerById(id);
        if(answer == null) {
            throw new IllegalArgumentException("No answer exists with id: '" + id + "'.");
        }

        requireOwnerOrAdmin(answer, username);

        Question question = answer.getQuestion();
        boolean wasAccepted = answer.isAccepted();

        answerVoteRepository.deleteByAnswer(answer);

        if (question.getAnswers() != null) {
            question.getAnswers().remove(answer);
        }

        answerRepo.delete(answer);

        if (question.getAnswers() == null || question.getAnswers().isEmpty()) {
            question.setStatus(Status.RECEIVED);
        } else if (wasAccepted) {
            question.setStatus(Status.IN_PROGRESS);
        }
    }

    @Transactional(readOnly = true)
    public AnswerDTO findAnswerById(Long id) {
        Answer answer = answerRepo.findById(id)
                .orElseThrow(() -> new IllegalArgumentException(
                        "No answer exists with id: '" + id + "'."));
        return mapEntityToDTO(answer);
    }

    @Transactional(readOnly = true)
    public List<AnswerDTO> findAnswersByAuthorId(Long userId) {
        List<Answer> answers = answerRepo.findByAuthorId(userId);
        return answers.stream().map(this::mapEntityToDTO).toList();
    }

    @Transactional(readOnly = true)
    public List<AnswerDTO> findAnswersByQuestionId(Long questionId, String viewer) {
        List<Answer> answers = answerRepo.findByQuestionId(questionId);
        return answers.stream().map(a -> mapEntityToDTO(a, viewer)).toList();
    }

    @Transactional(readOnly = true)
    public List<AnswerDTO> findAllAnswers(String viewer) {
        List<Answer> answers = new ArrayList<>();
        answerRepo.findAll().forEach(answers::add);
        return answers.stream().map(a -> mapEntityToDTO(a, viewer)).toList();
    }

    @Transactional
    public AnswerDTO likeAnswer(Long id, String username) {
        Answer answer = answerRepo.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("No answer exists with id: '" + id + "'."));
        User user = userRepository.findByUsername(username);
        if (user == null) {
            throw new IllegalArgumentException("User not found.");
        }

        if (answer.getAuthor().getUsername().equals(user.getUsername())) {
            throw new IllegalArgumentException("Can't like your own answer!");
        }

        AnswerVote existingVote = answerVoteRepository.findByAnswerAndUser(answer, user);
        if (existingVote != null) {
            if (existingVote.isLike()) {
                answerVoteRepository.delete(existingVote);
            } else {
                existingVote.setLike(true);
                answerVoteRepository.save(existingVote);
            }
        } else {
            AnswerVote newVote = AnswerVote.builder().answer(answer).user(user).isLike(true).build();
            answerVoteRepository.save(newVote);
        }

        answer.setLikes((int) answerVoteRepository.countByAnswerAndIsLike(answer, true));
        answer.setDislikes((int) answerVoteRepository.countByAnswerAndIsLike(answer, false));
        answerRepo.save(answer);
        return mapEntityToDTO(answer, username);
    }

    @Transactional
    public AnswerDTO dislikeAnswer(Long id, String username) {
        Answer answer = answerRepo.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("No answer exists with id: '" + id + "'."));
        User user = userRepository.findByUsername(username);
        if (user == null) {
            throw new IllegalArgumentException("User not found.");
        }

        if (answer.getAuthor().getUsername().equals(user.getUsername())) {
            throw new IllegalArgumentException("Can't dislike your own answer!");
        }

        AnswerVote existingVote = answerVoteRepository.findByAnswerAndUser(answer, user);
        if (existingVote != null) {
            if (!existingVote.isLike()) {
                answerVoteRepository.delete(existingVote);
            } else {
                existingVote.setLike(false);
                answerVoteRepository.save(existingVote);
            }
        } else {
            AnswerVote newVote = AnswerVote.builder().answer(answer).user(user).isLike(false).build();
            answerVoteRepository.save(newVote);
        }

        answer.setLikes((int) answerVoteRepository.countByAnswerAndIsLike(answer, true));
        answer.setDislikes((int) answerVoteRepository.countByAnswerAndIsLike(answer, false));
        answerRepo.save(answer);
        return mapEntityToDTO(answer, username);
    }

    @Transactional
    public AnswerDTO acceptAnswer(Long id, String username) {
        Answer answer = answerRepo.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("No answer exists with id: '" + id + "'."));

        Question question = answer.getQuestion();
        if (question == null) {
            throw new IllegalArgumentException("Answer is not associated with any question.");
        }

        if (question.getAuthor() == null || !question.getAuthor().getUsername().equals(username)) {
            throw new IllegalArgumentException("Only the author of the question can accept an answer.");
        }

        if (question.getStatus() == Status.RESOLVED) {
            throw new IllegalArgumentException("This question already has an accepted answer.");
        }

        List<Answer> questionAnswers = answerRepo.findByQuestionId(question.getId());
        for (Answer a : questionAnswers) {
            if (a.isAccepted()) {
                a.setAccepted(false);
                answerRepo.save(a);
            }
        }

        answer.setAccepted(true);
        answerRepo.save(answer);
        answerRepo.save(answer);

        question.setStatus(Status.RESOLVED);
        questionRepository.save(question);

        return mapEntityToDTO(answer, username);
    }

    private void requireOwnerOrAdmin(Answer answer, String username) {
        if (username == null) {
            return;
        }

        User user = userRepository.findByUsername(username);
        if (user == null) {
            throw new IllegalArgumentException("User not found.");
        }

        boolean owner = answer.getAuthor() != null && answer.getAuthor().getUsername().equals(username);
        boolean admin = user.getRole() == Role.ADMIN;

        if (!owner && !admin) {
            throw new IllegalArgumentException("You are not allowed to change this answer.");
        }
    }

    private void updateQuestionStatusIfFirstAnswer(Question question) {
        if (question != null) {
            entityManager.flush();

            Question managedQuestion = questionRepository.findById(question.getId())
                    .orElseThrow(() -> new IllegalArgumentException("Question not found"));

            if (managedQuestion.getStatus() == Status.RECEIVED) {
                long answerCount = answerRepo.countByQuestionId(managedQuestion.getId());
                if (answerCount == 1) {
                    managedQuestion.setStatus(Status.IN_PROGRESS);
                    questionRepository.save(managedQuestion);
                    entityManager.flush();
                }
            }
        }
    }
}