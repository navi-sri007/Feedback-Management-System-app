package com.examly.springapp.dto;

import com.examly.springapp.model.Category;
import java.time.LocalDateTime;

public class CategoryDTO {
    private Long id;
    private String name;
    private LocalDateTime createdAt;
    private Long feedbackCount;

    public CategoryDTO() {}

    public CategoryDTO(Category category, Long feedbackCount) {
        this.id = category.getId();
        this.name = category.getName();
        this.createdAt = category.getCreatedAt();
        this.feedbackCount = feedbackCount;
    }

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public Long getFeedbackCount() { return feedbackCount; }
    public void setFeedbackCount(Long feedbackCount) { this.feedbackCount = feedbackCount; }
}