package com.saf.config;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.event.ContextRefreshedEvent;
import org.springframework.context.event.EventListener;
import org.springframework.jdbc.core.JdbcTemplate;

import javax.sql.DataSource;
import java.sql.Connection;
import java.sql.SQLException;

@Configuration
public class DatabaseConnectionLogger {

    private static final Logger logger = LoggerFactory.getLogger(DatabaseConnectionLogger.class);

    @Autowired
    private DataSource dataSource;

    @Autowired
    private JdbcTemplate jdbcTemplate;

    @EventListener(ContextRefreshedEvent.class)
    public void logDatabaseConnection() {
        try (Connection connection = dataSource.getConnection()) {
            logger.info("Database connection established successfully");
            logger.info("Database URL: {}", connection.getMetaData().getURL());
            logger.info("Database User: {}", connection.getMetaData().getUserName());
            logger.info("Database Product: {}", connection.getMetaData().getDatabaseProductName());
            logger.info("Database Version: {}", connection.getMetaData().getDatabaseProductVersion());
            
            String dbVersion = jdbcTemplate.queryForObject("SELECT version()", String.class);
            logger.info("PostgreSQL Version: {}", dbVersion);
            
        } catch (SQLException e) {
            logger.error("Failed to establish database connection", e);
        }
    }
} 