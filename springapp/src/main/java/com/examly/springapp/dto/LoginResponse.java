package com.examly.springapp.dto;
import java.util.Set;
import java.util.HashSet;
import java.util.stream.Collectors;

import com.examly.springapp.model.Role;

public class LoginResponse {
    private String token;
    private String username;
    private String email;
    private String message;
    private Set<String> roles;

    public LoginResponse(String token, String username, String email, Set<Role> roles) {
        this.token = token;
        this.username = username;
        this.email = email;
        this.message = "Login successful";
        this.roles = roles == null
                ? new HashSet<>()
                : roles.stream().map(Role::name).collect(Collectors.toSet());
    }

    // Getters and Setters
    public String getToken() { return token; }
    public void setToken(String token) { this.token = token; }

    public String getUsername() { return username; }
    public void setUsername(String username) { this.username = username; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getMessage() { return message; }
    public void setMessage(String message) { this.message = message; }

    public Set<String> getRoles() { return roles; }
    public void setRoles(Set<String> roles) { this.roles = roles; }
}