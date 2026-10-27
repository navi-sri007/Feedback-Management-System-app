package com.examly.springapp.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.examly.springapp.dto.LoginRequest;
import com.examly.springapp.dto.LoginResponse;
import com.examly.springapp.model.Admin;
import com.examly.springapp.model.Role;
import com.examly.springapp.repository.AdminRepository;
import com.examly.springapp.security.JwtUtil;
import com.examly.springapp.service.interfaces.AdminService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin("*")
public class AuthController {

    @Autowired
    private AuthenticationManager authenticationManager;

    @Autowired
    private JwtUtil jwtUtil;

    @Autowired
    private AdminRepository adminRepository;

    @Autowired
    private AdminService adminService;

    
    // ✅ LOGIN ENDPOINT - Public
    @PostMapping("/login")
    public ResponseEntity<?> login(@Valid @RequestBody LoginRequest loginRequest) {
        try {
            Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                    loginRequest.getUsername(),
                    loginRequest.getPassword()
                )
            );

            UserDetails userDetails = (UserDetails) authentication.getPrincipal();
            String token = jwtUtil.generateToken(userDetails);
            
            Admin admin = adminRepository.findByUsername(loginRequest.getUsername())
                    .orElseThrow(() -> new RuntimeException("Admin not found"));

            if (admin.isSuperAdmin() && !admin.isAdmin()) {
                admin.addRole(Role.ROLE_ADMIN);
                adminRepository.save(admin);
            }

            return ResponseEntity.ok(
                new LoginResponse(token, admin.getUsername(), admin.getEmail(), admin.getRoles())
            );
        } catch (Exception e) {
            return ResponseEntity.status(401).body("Invalid credentials");
        }
    }

    // ❌ REMOVED: Public registration endpoint - only SUPER_ADMIN can create admins
    // The register endpoint has been removed to prevent public admin creation

    // ✅ NEW: SUPER_ADMIN only - Create admin (moved to AdminManagementController)
}