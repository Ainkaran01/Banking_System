package com.banking_system.backend.service.decorator;

import com.banking_system.backend.dto.DepositRequest;
import com.banking_system.backend.dto.TransactionResponse;
import com.banking_system.backend.dto.TransferRequest;
import com.banking_system.backend.dto.WithdrawRequest;
import com.banking_system.backend.service.TransactionService;

import java.util.List;

public abstract class TransactionServiceDecorator implements TransactionService {

    protected final TransactionService delegate;

    protected TransactionServiceDecorator(TransactionService delegate) {
        this.delegate = delegate;
    }

    @Override
    public TransactionResponse deposit(DepositRequest request) {
        return delegate.deposit(request);
    }

    @Override
    public TransactionResponse withdraw(WithdrawRequest request) {
        return delegate.withdraw(request);
    }

    @Override
    public TransactionResponse transfer(TransferRequest request) {
        return delegate.transfer(request);
    }

    @Override
    public List<TransactionResponse> getTransactionsByAccount(Long accountId) {
        return delegate.getTransactionsByAccount(accountId);
    }
}
