package com.examly.springapp.service.impl;

import com.examly.springapp.model.Admin;
import com.examly.springapp.model.AuditLog;
import com.examly.springapp.model.Category;
import com.examly.springapp.model.Feedback;
import com.examly.springapp.model.FeedbackStatus;
import com.examly.springapp.repository.AdminRepository;
import com.examly.springapp.repository.AuditLogRepository;
import com.examly.springapp.repository.CategoryRepository;
import com.examly.springapp.repository.FeedbackRepository;
import com.examly.springapp.service.interfaces.FeedbackService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
@Transactional
public class FeedbackServiceImpl implements FeedbackService {

    @Autowired
    private FeedbackRepository feedbackRepository;

    @Autowired
    private AuditLogRepository auditLogRepository;

    @Autowired
    private AdminRepository adminRepository;

    @Autowired
    private CategoryRepository categoryRepository;

    @Override
    public Feedback submitFeedback(Feedback feedback) {
        feedback.setStatus(FeedbackStatus.NEW);
        feedback.setSubmittedAt(LocalDateTime.now());

        if (feedback.getCategory() != null && feedback.getCategory().getId() != null) {
            Category managedCategory = categoryRepository.findById(feedback.getCategory().getId())
                    .orElse(null);
            feedback.setCategory(managedCategory);
        }

        return feedbackRepository.save(feedback);
    }

    @Override
    public Page<Feedback> getAllFeedback(Pageable pageable) {
        return feedbackRepository.findAll(pageable);
    }

    @Override
    public Feedback getFeedbackById(Long id) {
        return feedbackRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Feedback not found with id: " + id));
    }

    @Override
    public Feedback updateFeedbackStatus(Long id, FeedbackStatus status, Long adminId) {
        Feedback feedback = getFeedbackById(id);
        FeedbackStatus oldStatus = feedback.getStatus();
        
        feedback.setStatus(status);
        feedback.setUpdatedAt(LocalDateTime.now());
        
        Feedback updated = feedbackRepository.save(feedback);
        
        createAuditLog(adminId, "STATUS_CHANGED", "Feedback", id, 
                "Status changed from " + oldStatus + " to " + status);
        
        return updated;
    }

    @Override
    public Feedback updateFeedback(Long id, Feedback feedbackDetails, Long adminId) {
        Feedback existing = getFeedbackById(id);
        
        if (feedbackDetails.getSubmitterName() != null) {
            existing.setSubmitterName(feedbackDetails.getSubmitterName());
        }
        if (feedbackDetails.getSubmitterEmail() != null) {
            existing.setSubmitterEmail(feedbackDetails.getSubmitterEmail());
        }
        if (feedbackDetails.getFeedbackContent() != null) {
            existing.setFeedbackContent(feedbackDetails.getFeedbackContent());
        }
        if (feedbackDetails.getRating() != null) {
            existing.setRating(feedbackDetails.getRating());
        }
        if (feedbackDetails.getCategory() != null) {
            Category updatedCategory = null;
            if (feedbackDetails.getCategory().getId() != null) {
                updatedCategory = categoryRepository.findById(feedbackDetails.getCategory().getId())
                        .orElse(null);
            }
            existing.setCategory(updatedCategory);
            if (updatedCategory != null) {
                createAuditLog(adminId, "CATEGORY_ASSIGNED", "Feedback", id,
                        "Category assigned: " + updatedCategory.getName());
            }
        }
        
        existing.setUpdatedAt(LocalDateTime.now());
        return feedbackRepository.save(existing);
    }

    @Override
    public void deleteFeedback(Long id, Long adminId) {
        Feedback feedback = getFeedbackById(id);
        feedbackRepository.deleteById(id);
        
        createAuditLog(adminId, "DELETED", "Feedback", id, 
                "Deleted feedback from: " + feedback.getSubmitterEmail());
    }

    @Override
    public Page<Feedback> getFeedbackByStatus(FeedbackStatus status, Pageable pageable) {
        return feedbackRepository.findByStatus(status, pageable);
    }

    @Override
    public Page<Feedback> searchFeedback(String search, Pageable pageable) {
        return feedbackRepository.searchFeedback(search, pageable);
    }

    @Override
    public Page<Feedback> getFeedbackByCategory(Long categoryId, Pageable pageable) {
        return feedbackRepository.findByCategoryId(categoryId, pageable);
    }

    @Override
    public List<Feedback> getRecentFeedback(int limit) {
        return feedbackRepository.findAll(Pageable.ofSize(limit)).getContent();
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
        
        auditLogRepository.save(auditLog);
    }
}