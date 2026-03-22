package com.banking_system.backend.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.banking_system.backend.entity.NotificationLog;

public interface NotificationLogRepository extends JpaRepository<NotificationLog, Long> {
}
