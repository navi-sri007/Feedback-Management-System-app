package com.examly.springapp.security;

import java.util.ArrayList;
import java.util.Collection;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import com.examly.springapp.model.Admin;
import com.examly.springapp.model.Role;
import com.examly.springapp.repository.AdminRepository;

@Service
public class CustomUserDetailsService implements UserDetailsService {

    @Autowired
    private AdminRepository adminRepository;

    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        Admin admin = adminRepository.findByUsername(username)
                .orElseThrow(() -> new UsernameNotFoundException("Admin not found with username: " + username));

        // Check if account is active
        if (!admin.isActive()) {
            throw new UsernameNotFoundException("Account is deactivated: " + username);
        }

        Collection<GrantedAuthority> authorities = getAuthorities(admin);

        return new User(
            admin.getUsername(),
            admin.getPasswordHash(),
            authorities
        );
    }

    private Collection<GrantedAuthority> getAuthorities(Admin admin) {
        List<GrantedAuthority> authorities = new ArrayList<>();
        
        // Add all roles as authorities
        if (admin.getRoles() != null) {
            for (Role role : admin.getRoles()) {
                authorities.add(new SimpleGrantedAuthority(role.name()));
            }
        }
        
        return authorities;
    }
}