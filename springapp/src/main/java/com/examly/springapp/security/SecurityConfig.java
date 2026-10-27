package com.examly.springapp.security;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

    @Autowired
    private JwtRequestFilter jwtRequestFilter;

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder(10);
    }

    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration config) throws Exception {
        return config.getAuthenticationManager();
    }

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
            .csrf(csrf -> csrf.disable())
            .authorizeHttpRequests(authz -> authz
                // =============================================
                // 🔒 PROTECTED CATEGORY OPERATIONS FIRST (order matters!)
                // =============================================
                .requestMatchers(HttpMethod.POST, "/api/v1/categories/**").hasAnyRole("ADMIN", "SUPER_ADMIN")
                .requestMatchers(HttpMethod.DELETE, "/api/v1/categories/**").hasAnyRole("ADMIN", "SUPER_ADMIN")
                .requestMatchers(HttpMethod.PUT, "/api/v1/categories/**").hasAnyRole("ADMIN", "SUPER_ADMIN")
                .requestMatchers(HttpMethod.PATCH, "/api/v1/categories/**").hasAnyRole("ADMIN", "SUPER_ADMIN")

                // =============================================
                // ✅ PUBLIC ENDPOINTS (No authentication required)
                // =============================================
                .requestMatchers(
                    "/api/auth/login",        // Login only
                    "/api/feedback",          // Submit feedback (public)
                    "/api/feedback/**",       // All public feedback endpoints
                    "/api/files/**",          // View uploaded files
                    "/api/v1/categories",     // List categories (public feedback form)
                    "/api/v1/categories/**",  // GET categories is public
                    "/h2-console/**",
                    "/swagger-ui/**",
                    "/swagger-ui.html",
                    "/swagger-resources/**",
                    "/v3/api-docs/**",
                    "/webjars/**"
                ).permitAll()

                

                // =============================================
                // 👑 SUPER_ADMIN ONLY (Manage admins)
                // =============================================
                .requestMatchers("/api/admins/**").hasRole("SUPER_ADMIN")

                // =============================================
                // 🔧 ADMIN & SUPER_ADMIN (Feedback management)
                // =============================================
                .requestMatchers("/api/v1/feedback/**").hasAnyRole("ADMIN", "SUPER_ADMIN")
                .requestMatchers("/api/v1/dashboard/**").hasAnyRole("ADMIN", "SUPER_ADMIN")
                .requestMatchers("/api/v1/audit-logs/**").hasAnyRole("ADMIN", "SUPER_ADMIN")

                // ✅ All other endpoints require authentication
                .anyRequest().authenticated()
            )
            .sessionManagement(session -> session
                .sessionCreationPolicy(SessionCreationPolicy.STATELESS)
            )
            .headers(headers -> headers
                .frameOptions(frameOptions -> frameOptions.disable())
            )
            .addFilterBefore(jwtRequestFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }
}