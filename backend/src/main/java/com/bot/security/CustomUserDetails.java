package com.bot.security;

import com.bot.entity.User;
import lombok.AllArgsConstructor;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import java.util.Collection;
import java.util.List;

/**
 * Lớp bọc (Wrapper) cho Entity User của hệ thống để tương thích với 
 * interface UserDetails của Spring Security.
 */
@AllArgsConstructor
public class CustomUserDetails implements UserDetails {

    private final User user;

    /**
     * Cung cấp danh sách quyền (Roles/Authorities) của người dùng để Spring Security phân quyền.
     */
    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        return List.of(new SimpleGrantedAuthority("ROLE_" + user.getRole()));
    }

    @Override
    public String getPassword() {
        return user.getPasswordHash();
    }

    @Override
    public String getUsername() {
        // Must return email to match JWT subject (used by JwtService.isTokenValid)
        return user.getEmail();
    }

    @Override
    public boolean isAccountNonExpired() {
        return true;
    }

    @Override
    public boolean isAccountNonLocked() {
        return true;
    }

    @Override
    public boolean isCredentialsNonExpired() {
        return true;
    }

    @Override
    public boolean isEnabled() {
        return true;
    }

    public User getUser() {
        return user;
    }
}
