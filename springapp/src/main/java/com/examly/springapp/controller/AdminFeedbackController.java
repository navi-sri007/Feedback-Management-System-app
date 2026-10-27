package com.examly.springapp.controller;

import java.time.LocalDateTime;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.examly.springapp.model.Admin;
import com.examly.springapp.model.AuditLog;
import com.examly.springapp.model.Feedback;
import com.examly.springapp.model.FeedbackStatus;
import com.examly.springapp.repository.AdminRepository;
import com.examly.springapp.repository.AuditLogRepository;
import com.examly.springapp.repository.FeedbackRepository;

@RestController
@RequestMapping("/api/v1/feedback")
@CrossOrigin("*")
public class AdminFeedbackController {

    @Autowired
    private FeedbackRepository feedbackRepository;

    @Autowired
    private AuditLogRepository auditLogRepository;

    @Autowired
    private AdminRepository adminRepository;

    private Long getCurrentAdminId() {
        UserDetails userDetails = (UserDetails) SecurityContextHolder.getContext()
                .getAuthentication().getPrincipal();
        Admin admin = adminRepository.findByUsername(userDetails.getUsername())
                .orElseThrow(() -> new RuntimeException("Admin not found"));
        return admin.getId();
    }

    @GetMapping
    public ResponseEntity<Page<Feedback>> getAllFeedback(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "submittedAt") String sortBy,
            @RequestParam(defaultValue = "DESC") String sortDir) {
        
        Sort sort = Sort.by(sortDir.equalsIgnoreCase("ASC") ? Sort.Direction.ASC : Sort.Direction.DESC, sortBy);
        Pageable pageable = PageRequest.of(page, size, sort);
        
        return ResponseEntity.ok(feedbackRepository.findAll(pageable));
    }

    @GetMapping("/{id}")
    public ResponseEntity<Feedback> getFeedbackById(@PathVariable Long id) {
        return ResponseEntity.ok(feedbackRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Feedback not found")));
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<Feedback> updateFeedbackStatus(
            @PathVariable Long id,
            @RequestParam FeedbackStatus status) {
        
        Feedback feedback = feedbackRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Feedback not found"));
        
        FeedbackStatus oldStatus = feedback.getStatus();
        feedback.setStatus(status);
        feedback.setUpdatedAt(LocalDateTime.now());
        
        Feedback updated = feedbackRepository.save(feedback);
        
        // ✅ Create audit log for status change
        createAuditLog(
            getCurrentAdminId(),
            "STATUS_CHANGED",
            "Feedback",
            id,
            "Status changed from " + oldStatus + " to " + status
        );
        
        return ResponseEntity.ok(updated);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteFeedback(@PathVariable Long id) {
        Feedback feedback = feedbackRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Feedback not found"));
        
        feedbackRepository.deleteById(id);
        
        // ✅ Create audit log for deletion
        createAuditLog(
            getCurrentAdminId(),
            "DELETED",
            "Feedback",
            id,
            "Deleted feedback from: " + feedback.getSubmitterEmail()
        );
        
        return ResponseEntity.noContent().build();
    }

    private void createAuditLog(Long adminId, String action, String entityType, Long entityId, String details) {
        Admin admin = adminRepository.findById(adminId)
                .orElseThrow(() -> new RuntimeException("Admin not found"));
        
        AuditLog auditLog = new AuditLog();
        auditLog.setAdmin(admin);
        auditLog.setAction(action);
        auditLog.setEntityType(entityType);
        auditLog.setEntityId(entityId);
        auditLog.setDetails(details);
        auditLog.setTimestamp(LocalDateTime.now());
        
        auditLogRepository.save(auditLog);
    }
}