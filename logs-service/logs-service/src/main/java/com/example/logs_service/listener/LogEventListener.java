package com.example.logs_service.listener;

import com.example.logs_service.events.LogEvent;
import com.example.logs_service.model.LogEntry;
import com.example.logs_service.repository.LogEntryRepository;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.stereotype.Component;
import java.time.ZoneId;

@Component
public class LogEventListener {

    private final LogEntryRepository logRepository;

    public LogEventListener(LogEntryRepository logRepository) {
        this.logRepository = logRepository;
    }

    @RabbitListener(queues = "logs_queue")
    public void handleLogMessage(LogEvent event) {
        System.out.println(
                "### LOG PRIMIT [" + event.getLogType() + "/" + event.getOperationType() + "]: -> " + event.getMessage()
        );

        LogEntry logEntry = new LogEntry();
        logEntry.setMessage(event.getMessage());
        logEntry.setTimestamp(event.getTimestamp().toInstant().atZone(ZoneId.systemDefault()).toLocalDateTime());
        logEntry.setLogType(event.getLogType());
        logEntry.setOperationType(event.getOperationType());
        logRepository.save(logEntry);

        System.out.println("### Log detaliat salvat cu succes în baza de date!");
    }
}