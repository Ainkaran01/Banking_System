package com.banking_system.backend.service;

public interface NotificationService {
    void sendNotification(Long customerId, String message);
}
