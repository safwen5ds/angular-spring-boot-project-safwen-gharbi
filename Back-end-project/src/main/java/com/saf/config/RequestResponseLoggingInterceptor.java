package com.saf.config;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;
import org.springframework.web.servlet.HandlerInterceptor;
import org.springframework.web.servlet.ModelAndView;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;

@Component
public class RequestResponseLoggingInterceptor implements HandlerInterceptor {

    private static final Logger logger = LoggerFactory.getLogger(RequestResponseLoggingInterceptor.class);
    private static final DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss.SSS");

    @Override
    public boolean preHandle(HttpServletRequest request, HttpServletResponse response, Object handler) {
        String timestamp = LocalDateTime.now().format(formatter);
        String requestURI = request.getRequestURI();
        String method = request.getMethod();
        String remoteAddr = request.getRemoteAddr();
        
        logger.info("[{}] Incoming request: {} {} from {}", timestamp, method, requestURI, remoteAddr);
        
        java.util.Enumeration<String> headerNames = request.getHeaderNames();
        while (headerNames.hasMoreElements()) {
            String headerName = headerNames.nextElement();
            logger.debug("Request Header: {} = {}", headerName, request.getHeader(headerName));
        }
        
        request.setAttribute("startTime", System.currentTimeMillis());
        
        return true;
    }

    @Override
    public void postHandle(HttpServletRequest request, HttpServletResponse response, Object handler, ModelAndView modelAndView) {
    }

    @Override
    public void afterCompletion(HttpServletRequest request, HttpServletResponse response, Object handler, Exception ex) {
        String timestamp = LocalDateTime.now().format(formatter);
        String requestURI = request.getRequestURI();
        String method = request.getMethod();
        int status = response.getStatus();
        
        long startTime = (Long) request.getAttribute("startTime");
        long duration = System.currentTimeMillis() - startTime;
        
        logger.info("[{}] Completed request: {} {} - Status: {} - Duration: {}ms", 
                timestamp, method, requestURI, status, duration);
        
        if (ex != null) {
            logger.error("Request failed with exception", ex);
        }
    }
} 