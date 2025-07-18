package com.example.logs_service.dto;

import lombok.Data;

@Data
public class LogResponseDTO {
    private Long id;
    private String message;
    private String timestamp;
    private String logType;
    private String operationType;
}