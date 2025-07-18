package com.example.logs_service.events;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.io.Serializable;
import java.util.Date;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class LogEvent implements Serializable {
    private String message;
    private String logType;
    private String operationType;
    private Date timestamp;
}