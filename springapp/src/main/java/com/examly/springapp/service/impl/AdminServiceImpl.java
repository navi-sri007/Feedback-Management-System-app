package com.examly.springapp.service.impl;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import com.examly.springapp.dto.RegisterRequest;
import com.examly.springapp.model.Admin;
import com.examly.springapp.model.Role;
import com.examly.springapp.repository.AdminRepository;
import com.examly.springapp.service.interfaces.AdminService;

import jakarta.annotation.PostConstruct;

@Service
public class AdminServiceImpl implements AdminService {

    @Autowired
    private AdminRepository adminRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Value("${admin.username:admin}")
    private String adminUsername;

    @Value("${admin.password:Admin@123}")
    private String adminPassword;

    @Value("${admin.email:admin@feedback.com}")
    private String adminEmail;

    @PostConstruct
    @Override
    public void initializeAdmin() {
        try {
            Optional<Admin> existingAdminOpt = adminRepository.findByUsername(adminUsername);
            if (existingAdminOpt.isPresent()) {
                Admin admin = existingAdminOpt.get();
                boolean updated = false;
                if (!admin.isActive()) {
                    admin.setActive(true);
                    updated = true;
                }
                if (admin.getRoles() == null || admin.getRoles().isEmpty()) {
                    admin.addRole(Role.ROLE_SUPER_ADMIN);
                    admin.addRole(Role.ROLE_ADMIN);
                    updated = true;
                }
                if (updated) {
                    adminRepository.save(admin);
                    System.out.println("✅ Default admin activated and updated successfully!");
                }
            } else {
                Admin admin = new Admin();
                admin.setUsername(adminUsername);
                admin.setPasswordHash(passwordEncoder.encode(adminPassword));
                admin.setEmail(adminEmail);
                admin.setCreatedAt(LocalDateTime.now());
                admin.setActive(true);
                
                // ✅ Assign SUPER_ADMIN role to default admin
                admin.addRole(Role.ROLE_SUPER_ADMIN);
                admin.addRole(Role.ROLE_ADMIN);
                
                adminRepository.save(admin);
                System.out.println("✅ SUPER_ADMIN account created successfully!");
                System.out.println("👤 Username: " + adminUsername);
                System.out.println("📧 Email: " + adminEmail);
            }

            // Ensure all existing admins in the database are active so they can log in
            List<Admin> allAdmins = adminRepository.findAll();
            for (Admin a : allAdmins) {
                if (!a.isActive()) {
                    a.setActive(true);
                    adminRepository.save(a);
                    System.out.println("✅ Activated inactive admin account: " + a.getUsername());
                }
            }
        } catch (Exception e) {
            System.err.println("❌ Failed to initialize admin: " + e.getMessage());
        }
    }

    @Override
    public String getAdminEmail() {
        return adminEmail;
    }

    @Override
    public Admin registerAdmin(RegisterRequest registerRequest) {
        if (adminRepository.existsByUsername(registerRequest.getUsername())) {
            throw new RuntimeException("Username already exists: " + registerRequest.getUsername());
        }
        
        if (adminRepository.existsByEmail(registerRequest.getEmail())) {
            throw new RuntimeException("Email already exists: " + registerRequest.getEmail());
        }
        
        Admin admin = new Admin();
        admin.setUsername(registerRequest.getUsername());
        admin.setPasswordHash(passwordEncoder.encode(registerRequest.getPassword()));
        admin.setEmail(registerRequest.getEmail());
        admin.setCreatedAt(LocalDateTime.now());
        admin.setActive(true);
        
        // ✅ Assign role (default ROLE_ADMIN)
        if (registerRequest.getRole() != null && registerRequest.getRole() == Role.ROLE_SUPER_ADMIN) {
            admin.addRole(Role.ROLE_SUPER_ADMIN);
        } else {
            admin.addRole(Role.ROLE_ADMIN);
        }
        
        return adminRepository.save(admin);
    }

    @Override
    public boolean existsByUsername(String username) {
        return adminRepository.existsByUsername(username);
    }

    @Override
    public boolean existsByEmail(String email) {
        return adminRepository.existsByEmail(email);
    }
}