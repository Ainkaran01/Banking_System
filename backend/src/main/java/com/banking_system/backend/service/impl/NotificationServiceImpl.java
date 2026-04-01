package com.banking_system.backend.service.impl;

import com.banking_system.backend.entity.Customer;
import com.banking_system.backend.entity.NotificationLog;
import com.banking_system.backend.repository.AccountRepository;
import com.banking_system.backend.repository.CustomerRepository;
import com.banking_system.backend.repository.NotificationLogRepository;
import com.banking_system.backend.service.NotificationService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class NotificationServiceImpl implements NotificationService {

    private final CustomerRepository customerRepository;
    private final AccountRepository accountRepository;
    private final NotificationLogRepository notificationLogRepository;

    @Override
    public void sendNotification(Long accountOrCustomerId, String message) {
        Customer customer = customerRepository.findById(accountOrCustomerId)
            .orElseGet(() -> accountRepository.findById(accountOrCustomerId)
                .map(account -> account.getCustomer())
                .orElse(null));
        if (customer == null) {
            return;
        }
        notificationLogRepository.save(NotificationLog.builder()
            .customer(customer)
            .message(message)
            .build());
    }
}
