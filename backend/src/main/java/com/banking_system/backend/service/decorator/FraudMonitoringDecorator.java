package com.banking_system.backend.service.decorator;

import com.banking_system.backend.dto.DepositRequest;
import com.banking_system.backend.dto.TransactionResponse;
import com.banking_system.backend.dto.TransferRequest;
import com.banking_system.backend.dto.WithdrawRequest;
import com.banking_system.backend.exception.BadRequestException;
import com.banking_system.backend.service.TransactionService;

import java.math.BigDecimal;

public class FraudMonitoringDecorator extends TransactionServiceDecorator {

    private static final BigDecimal SINGLE_TX_LIMIT = BigDecimal.valueOf(1_000_000);

    public FraudMonitoringDecorator(TransactionService delegate) {
        super(delegate);
    }

    @Override
    public TransactionResponse deposit(DepositRequest request) {
        validateAmount(request.amount());
        return super.deposit(request);
    }

    @Override
    public TransactionResponse withdraw(WithdrawRequest request) {
        validateAmount(request.amount());
        return super.withdraw(request);
    }

    @Override
    public TransactionResponse transfer(TransferRequest request) {
        validateAmount(request.amount());
        return super.transfer(request);
    }

    private void validateAmount(BigDecimal amount) {
        if (amount.compareTo(SINGLE_TX_LIMIT) > 0) {
            throw new BadRequestException("Transaction flagged by fraud monitoring");
        }
    }
}
