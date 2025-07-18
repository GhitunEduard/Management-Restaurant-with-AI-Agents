package com.example.AuthenticationManagement.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class LoginResponseDTO {
    private String message;
    private Long userId;
    private String role;
}
