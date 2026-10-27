package com.examly.springapp.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import org.hibernate.annotations.Formula;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "categories")
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class Category {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank(message = "Category name is required")
    @Size(max = 255, message = "Category name cannot exceed 255 characters")
    @Column(unique = true, nullable = false)
    private String name;

    private LocalDateTime createdAt;

    @JsonIgnore
    @OneToMany(mappedBy = "category", fetch = FetchType.LAZY)
    private List<Feedback> feedbackList = new ArrayList<>();


    @Formula("(SELECT COUNT(*) FROM feedback f WHERE f.category_id = id)")
    private Long feedbackCount;

    public Category() {
        this.createdAt = LocalDateTime.now();
    }

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public List<Feedback> getFeedbackList() { return feedbackList; }
    public void setFeedbackList(List<Feedback> feedbackList) { this.feedbackList = feedbackList; }

    public Long getFeedbackCount() { return feedbackCount; }
    public void setFeedbackCount(Long feedbackCount) { this.feedbackCount = feedbackCount; }
}