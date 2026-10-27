package com.examly.springapp.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.examly.springapp.model.Feedback;
import com.examly.springapp.service.interfaces.FeedbackService;
import com.examly.springapp.service.interfaces.NotificationService;
import com.examly.springapp.service.interfaces.RateLimiterService;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/feedback")
@CrossOrigin("*")
public class FeedbackSubmissionController {

    @Autowired
    private FeedbackService feedbackService;

    @Autowired
    private NotificationService notificationService;

    @Autowired
    private RateLimiterService rateLimiterService;

    @PostMapping
    public ResponseEntity<Feedback> submitFeedback(
            @Valid @RequestBody Feedback feedback,
            HttpServletRequest request) {
        
        String clientIp = request.getRemoteAddr();
        
        if (!rateLimiterService.isAllowed(clientIp)) {
            return ResponseEntity.status(HttpStatus.TOO_MANY_REQUESTS).build();
        }
        
        Feedback submitted = feedbackService.submitFeedback(feedback);
        
        // Send notification to admin
        try {
            notificationService.sendNewFeedbackNotification(submitted);
        } catch (Exception e) {
            // Log error but don't fail the request
            System.err.println("Failed to send notification: " + e.getMessage());
        }
        
        return ResponseEntity.status(HttpStatus.CREATED).body(submitted);
    }
}