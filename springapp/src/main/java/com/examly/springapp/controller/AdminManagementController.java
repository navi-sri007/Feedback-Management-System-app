package com.examly.springapp.controller;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.examly.springapp.dto.CreateAdminRequest;
import com.examly.springapp.model.Admin;
import com.examly.springapp.model.Role;
import com.examly.springapp.repository.AdminRepository;
import com.examly.springapp.service.interfaces.AdminService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/admins")
@CrossOrigin("*")
public class AdminManagementController {

    @Autowired
    private AdminRepository adminRepository;

    @Autowired
    private AdminService adminService;

    @Autowired
    private PasswordEncoder passwordEncoder;

    // =============================================
    // 👑 SUPER_ADMIN Only - Get all admins
    // =============================================
    @GetMapping
    public ResponseEntity<List<Admin>> getAllAdmins() {
        return ResponseEntity.ok(adminRepository.findAll());
    }

    // =============================================
    // 👑 SUPER_ADMIN Only - Get admin by ID
    // =============================================
    @GetMapping("/{id}")
    public ResponseEntity<Admin> getAdminById(@PathVariable Long id) {
        Admin admin = adminRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Admin not found with id: " + id));
        return ResponseEntity.ok(admin);
    }

    // =============================================
    // 👑 SUPER_ADMIN Only - Create new admin
    // ✅ Can create GENERAL_ADMIN or SUPER_ADMIN
    // =============================================
    @PostMapping
    public ResponseEntity<?> createAdmin(@Valid @RequestBody CreateAdminRequest createRequest) {
        // Check if username already exists
        if (adminRepository.existsByUsername(createRequest.getUsername())) {
            return ResponseEntity
                .status(HttpStatus.CONFLICT)
                .body("Username already exists: " + createRequest.getUsername());
        }
        
        // Check if email already exists
        if (adminRepository.existsByEmail(createRequest.getEmail())) {
            return ResponseEntity
                .status(HttpStatus.CONFLICT)
                .body("Email already exists: " + createRequest.getEmail());
        }
        
        // Create new admin
        Admin admin = new Admin();
        admin.setUsername(createRequest.getUsername());
        admin.setPasswordHash(passwordEncoder.encode(createRequest.getPassword()));
        admin.setEmail(createRequest.getEmail());
        admin.setCreatedAt(LocalDateTime.now());
        admin.setActive(true);
        
        // ✅ Assign role based on request
        if (createRequest.getRole() != null && createRequest.getRole() == Role.ROLE_SUPER_ADMIN) {
            admin.addRole(Role.ROLE_SUPER_ADMIN);
            admin.addRole(Role.ROLE_ADMIN);
        } else {
            // Default: GENERAL_ADMIN
            admin.addRole(Role.ROLE_ADMIN);
        }
        
        Admin savedAdmin = adminRepository.save(admin);
        
        return ResponseEntity.status(HttpStatus.CREATED).body(savedAdmin);
    }

    // =============================================
    // 👑 SUPER_ADMIN Only - Update admin
    // =============================================
    @PutMapping("/{id}")
    public ResponseEntity<Admin> updateAdmin(
            @PathVariable Long id,
            @RequestBody Admin adminDetails) {
        
        Admin admin = adminRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Admin not found with id: " + id));
        
        if (adminDetails.getUsername() != null) {
            admin.setUsername(adminDetails.getUsername());
        }
        if (adminDetails.getEmail() != null) {
            admin.setEmail(adminDetails.getEmail());
        }
        
        admin.setUpdatedAt(LocalDateTime.now());
        return ResponseEntity.ok(adminRepository.save(admin));
    }

    // =============================================
    // 👑 SUPER_ADMIN Only - Delete admin
    // =============================================
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteAdmin(@PathVariable Long id) {
        // Prevent deleting the last SUPER_ADMIN
        long superAdminCount = adminRepository.findAll().stream()
                .filter(Admin::isSuperAdmin)
                .count();
        
        Admin admin = adminRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Admin not found with id: " + id));
        
        if (admin.isSuperAdmin() && superAdminCount <= 1) {
            return ResponseEntity
                .status(HttpStatus.BAD_REQUEST)
                .body(null); // Can't delete last SUPER_ADMIN
        }
        
        adminRepository.deleteById(id);
        return ResponseEntity.noContent().build();
    }

    // =============================================
    // 👑 SUPER_ADMIN Only - Toggle admin active status
    // =============================================
    @PatchMapping("/{id}/status")
    public ResponseEntity<Admin> toggleAdminStatus(@PathVariable Long id) {
        Admin admin = adminRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Admin not found with id: " + id));
        
        // Prevent deactivating the last SUPER_ADMIN
        long superAdminCount = adminRepository.findAll().stream()
                .filter(Admin::isSuperAdmin)
                .count();
        
        if (admin.isSuperAdmin() && superAdminCount <= 1) {
            return ResponseEntity
                .status(HttpStatus.BAD_REQUEST)
                .body(null); // Can't deactivate last SUPER_ADMIN
        }
        
        admin.setActive(!admin.isActive());
        admin.setUpdatedAt(LocalDateTime.now());
        
        return ResponseEntity.ok(adminRepository.save(admin));
    }

    // =============================================
    // 👑 SUPER_ADMIN Only - Assign role to admin
    // =============================================
    @PostMapping("/{id}/roles")
    public ResponseEntity<Admin> assignRole(
            @PathVariable Long id,
            @RequestParam Role role) {
        
        Admin admin = adminRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Admin not found with id: " + id));
        
        admin.addRole(role);
        admin.setUpdatedAt(LocalDateTime.now());
        
        return ResponseEntity.ok(adminRepository.save(admin));
    }

    // =============================================
    // 👑 SUPER_ADMIN Only - Remove role from admin
    // =============================================
    @DeleteMapping("/{id}/roles")
    public ResponseEntity<Admin> removeRole(
            @PathVariable Long id,
            @RequestParam Role role) {
        
        Admin admin = adminRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Admin not found with id: " + id));
        
        // Prevent removing SUPER_ADMIN role from last SUPER_ADMIN
        long superAdminCount = adminRepository.findAll().stream()
                .filter(Admin::isSuperAdmin)
                .count();
        
        if (role == Role.ROLE_SUPER_ADMIN && admin.isSuperAdmin() && superAdminCount <= 1) {
            return ResponseEntity
                .status(HttpStatus.BAD_REQUEST)
                .body(null); // Can't remove last SUPER_ADMIN role
        }
        
        admin.removeRole(role);
        admin.setUpdatedAt(LocalDateTime.now());
        
        return ResponseEntity.ok(adminRepository.save(admin));
    }

    // =============================================
    // 👑 SUPER_ADMIN Only - Reset admin password
    // =============================================
    @PatchMapping("/{id}/reset-password")
    public ResponseEntity<?> resetPassword(
            @PathVariable Long id,
            @RequestParam String newPassword) {
        
        Admin admin = adminRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Admin not found with id: " + id));
        
        admin.setPasswordHash(passwordEncoder.encode(newPassword));
        admin.setUpdatedAt(LocalDateTime.now());
        adminRepository.save(admin);
        
        return ResponseEntity.ok("Password reset successfully");
    }
}