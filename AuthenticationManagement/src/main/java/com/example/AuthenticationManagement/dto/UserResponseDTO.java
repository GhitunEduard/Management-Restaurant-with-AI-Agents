package com.example.AuthenticationManagement.dto;

import com.example.AuthenticationManagement.model.Role;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UserResponseDTO {
    private Long id;
    private String name;
    private String email;
    private String phone;
    private Role role;
    private String profileImageUrl;
}
