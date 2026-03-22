package com.banking_system.backend.service.decorator;

import com.banking_system.backend.dto.DepositRequest;
import com.banking_system.backend.dto.TransactionResponse;
import com.banking_system.backend.dto.TransferRequest;
import com.banking_system.backend.dto.WithdrawRequest;
import com.banking_system.backend.service.NotificationService;
import com.banking_system.backend.service.TransactionService;

public class SmsNotificationDecorator extends TransactionServiceDecorator {

    private final NotificationService notificationService;

    public SmsNotificationDecorator(TransactionService delegate, NotificationService notificationService) {
        super(delegate);
        this.notificationService = notificationService;
    }

    @Override
    public TransactionResponse deposit(DepositRequest request) {
        TransactionResponse response = super.deposit(request);
        notificationService.sendNotification(response.accountId(), "SMS: Deposit of " + response.amount() + " successful.");
        return response;
    }

    @Override
    public TransactionResponse withdraw(WithdrawRequest request) {
        TransactionResponse response = super.withdraw(request);
        notificationService.sendNotification(response.accountId(), "SMS: Withdrawal of " + response.amount() + " successful.");
        return response;
    }

    @Override
    public TransactionResponse transfer(TransferRequest request) {
        TransactionResponse response = super.transfer(request);
        notificationService.sendNotification(response.accountId(), "SMS: Transfer of " + response.amount() + " completed.");
        return response;
    }
}
