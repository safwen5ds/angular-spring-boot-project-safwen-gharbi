package com.saf.web.controller;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/logs")
@CrossOrigin(origins = "http://localhost:4200", allowCredentials = "true")
public class LogController {

    private static final Logger logger = LoggerFactory.getLogger(LogController.class);

    @PostMapping
    public ResponseEntity<Void> logFrontendEvent(@RequestBody Map<String, Object> logEntry) {
        String level = (String) logEntry.getOrDefault("level", "INFO");
        String message = (String) logEntry.getOrDefault("message", "");
        Object data = logEntry.getOrDefault("data", null);
        String source = (String) logEntry.getOrDefault("source", "unknown");
        String timestamp = (String) logEntry.getOrDefault("timestamp", "");
        String userAgent = (String) logEntry.getOrDefault("userAgent", "");
        String url = (String) logEntry.getOrDefault("url", "");

        String logMessage = String.format("[%s] [%s] [%s] %s - URL: %s - UserAgent: %s", 
                timestamp, source, level, message, url, userAgent);

        switch (level.toUpperCase()) {
            case "ERROR":
                logger.error(logMessage, data);
                break;
            case "WARN":
                logger.warn(logMessage, data);
                break;
            case "DEBUG":
                logger.debug(logMessage, data);
                break;
            default:
                logger.info(logMessage, data);
                break;
        }

        return ResponseEntity.ok().build();
    }
} 