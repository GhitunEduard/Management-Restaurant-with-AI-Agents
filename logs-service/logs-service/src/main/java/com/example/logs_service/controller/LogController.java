package com.example.logs_service.controller;

import com.example.logs_service.dto.LogResponseDTO;
import com.example.logs_service.service.LogService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/logs")
public class LogController {
    private final LogService logService;

    @Autowired
    public LogController(LogService logService) {
        this.logService = logService;
    }

    @GetMapping
    public ResponseEntity<List<LogResponseDTO>> getLogs() {
        List<LogResponseDTO> logs = logService.getLatestLogs();
        return ResponseEntity.ok(logs);
    }
}