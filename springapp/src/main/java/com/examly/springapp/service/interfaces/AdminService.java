package com.examly.springapp.service.interfaces;
import com.examly.springapp.model.Admin;
import com.examly.springapp.dto.RegisterRequest;


public interface AdminService {
    String getAdminEmail();
    void initializeAdmin();
      Admin registerAdmin(RegisterRequest registerRequest);
    boolean existsByUsername(String username);
    boolean existsByEmail(String email);
}