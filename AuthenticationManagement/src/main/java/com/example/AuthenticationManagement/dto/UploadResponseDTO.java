package com.example.AuthenticationManagement.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class UploadResponseDTO {
    private String fileName;
    private String imageUrl;
}
