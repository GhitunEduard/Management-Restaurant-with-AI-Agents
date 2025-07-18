package com.example.AuthenticationManagement.dto;

import com.example.AuthenticationManagement.model.Role;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UserRequestDTO {
    private String name;
    private String email;
    private String phone;
    private String password;
    private Role role;
    private String profileImageUrl;
}
