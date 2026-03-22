package com.banking_system.backend.config;

import com.banking_system.backend.service.TransactionService;
import com.banking_system.backend.service.decorator.FraudMonitoringDecorator;
import com.banking_system.backend.service.decorator.SmsNotificationDecorator;
import com.banking_system.backend.service.NotificationService;  

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Primary;
import org.springframework.beans.factory.annotation.Qualifier;

@Configuration
public class TransactionServiceConfig {

    @Bean
    @Primary
    public TransactionService decoratedTransactionService(@Qualifier("basicTransactionService") TransactionService basicTransactionService,
                                                          NotificationService notificationService) {
        TransactionService withFraudCheck = new FraudMonitoringDecorator(basicTransactionService);
        return new SmsNotificationDecorator(withFraudCheck, notificationService);
    }
}
