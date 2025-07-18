package com.example.logs_service.model;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import java.time.LocalDateTime;

@Getter
@Setter
@Entity
@Table(name = "logs")
public class LogEntry {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 512)
    private String message;

    @Column(nullable = false)
    private LocalDateTime timestamp;

    @Column(name = "log_type")
    private String logType;

    @Column(name = "operation_type")
    private String operationType;
}