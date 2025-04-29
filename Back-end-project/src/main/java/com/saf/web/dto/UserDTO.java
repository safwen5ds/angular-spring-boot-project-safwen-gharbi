package com.saf.web.dto;

import com.saf.dao.entities.User;
import lombok.Data;
import java.time.LocalDateTime;

@Data
public class UserDTO {
    private Long id;
    private String email;
    private String name;
    private String photoUrl;
    private String password;
    private boolean isAdmin;
    private String provider;
    private String providerId;
    private LocalDateTime createdAt;
    private LocalDateTime lastLogin;

    public static UserDTO fromUser(User user) {
        UserDTO dto = new UserDTO();
        dto.setId(user.getId());
        dto.setEmail(user.getEmail());
        dto.setName(user.getName());
        dto.setPhotoUrl(user.getPhotoUrl());
        dto.setPassword(user.getPassword());
        dto.setAdmin(user.isAdmin());
        dto.setProvider(user.getProvider());
        dto.setProviderId(user.getProviderId());
        dto.setCreatedAt(user.getCreatedAt());
        dto.setLastLogin(user.getLastLogin());
        return dto;
    }

    public static User toUser(UserDTO dto) {
        User user = new User();
        user.setId(dto.getId());
        user.setEmail(dto.getEmail());
        user.setName(dto.getName());
        user.setPhotoUrl(dto.getPhotoUrl());
        user.setPassword(dto.getPassword());
        user.setAdmin(dto.isAdmin());
        user.setProvider(dto.getProvider());
        user.setProviderId(dto.getProviderId());
        user.setCreatedAt(dto.getCreatedAt());
        user.setLastLogin(dto.getLastLogin());
        return user;
    }
} 