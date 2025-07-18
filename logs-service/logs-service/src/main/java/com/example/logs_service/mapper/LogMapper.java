package com.example.logs_service.mapper;

import com.example.logs_service.dto.LogResponseDTO;
import com.example.logs_service.model.LogEntry;
import org.springframework.stereotype.Component;

import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.stream.Collectors;

@Component
public class LogMapper {

    private static final DateTimeFormatter FORMATTER = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss");

    public LogResponseDTO toDto(LogEntry logEntry) {
        if (logEntry == null) {
            return null;
        }

        LogResponseDTO dto = new LogResponseDTO();
        dto.setId(logEntry.getId());
        dto.setMessage(logEntry.getMessage());
        dto.setTimestamp(logEntry.getTimestamp().format(FORMATTER));

        dto.setLogType(logEntry.getLogType());
        dto.setOperationType(logEntry.getOperationType());

        return dto;
    }

    public List<LogResponseDTO> toDtoList(List<LogEntry> logEntries) {
        return logEntries.stream()
                .map(this::toDto)
                .collect(Collectors.toList());
    }
}