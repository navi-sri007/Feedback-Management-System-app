package com.examly.springapp.controller;

import com.examly.springapp.model.Feedback;
import com.examly.springapp.repository.FeedbackRepository;
import com.examly.springapp.service.FeedbackService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin/feedback")
@CrossOrigin("*")
public class AdminFeedbackController {

    @Autowired
    private FeedbackService service;

    @Autowired
    private FeedbackRepository repository;

    @GetMapping
    public ResponseEntity<List<Feedback>> getAllFeedback() {
        return ResponseEntity.ok(
                service.getAllFeedback()
        );
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteFeedback(
            @PathVariable Long id) {

        repository.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}