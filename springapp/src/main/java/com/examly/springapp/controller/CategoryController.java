package com.examly.springapp.controller;

import com.examly.springapp.model.Admin;
import com.examly.springapp.model.AuditLog;
import com.examly.springapp.model.Category;
import com.examly.springapp.repository.AdminRepository;
import com.examly.springapp.repository.AuditLogRepository;
import com.examly.springapp.repository.CategoryRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/v1/categories")
@CrossOrigin("*")
public class CategoryController {

    @Autowired
    private CategoryRepository categoryRepository;

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

    // ✅ Get all categories with feedback count using repository query
    @GetMapping
    public ResponseEntity<List<Category>> getAllCategories() {
        List<Object[]> results = categoryRepository.findAllWithFeedbackCount();
        
        List<Category> categories = new ArrayList<>();
        for (Object[] result : results) {
            Category category = (Category) result[0];
            Long count = (Long) result[1];
            category.setFeedbackCount(count);
            categories.add(category);
        }
        
        return ResponseEntity.ok(categories);
    }

    @PostMapping
    public ResponseEntity<Category> createCategory(@Valid @RequestBody Category category) {
        if (categoryRepository.existsByName(category.getName())) {
            return ResponseEntity.status(HttpStatus.CONFLICT).build();
        }
        
        Category savedCategory = categoryRepository.save(category);
        
        createAuditLog(
            getCurrentAdminId(),
            "CATEGORY_CREATED",
            "Category",
            savedCategory.getId(),
            "Category created: " + savedCategory.getName()
        );
        
        savedCategory.setFeedbackCount(0L);
        
        return ResponseEntity.status(HttpStatus.CREATED).body(savedCategory);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteCategory(@PathVariable Long id) {
        Category category = categoryRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Category not found"));
        
        String categoryName = category.getName();
        categoryRepository.deleteById(id);
        
        createAuditLog(
            getCurrentAdminId(),
            "CATEGORY_DELETED",
            "Category",
            id,
            "Category deleted: " + categoryName
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