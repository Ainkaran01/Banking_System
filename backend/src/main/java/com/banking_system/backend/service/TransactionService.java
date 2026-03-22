package com.banking_system.backend.service;

import com.banking_system.backend.dto.DepositRequest;
import com.banking_system.backend.dto.TransactionResponse;
import com.banking_system.backend.dto.TransferRequest;
import com.banking_system.backend.dto.WithdrawRequest;

import java.util.List;

public interface TransactionService {
    TransactionResponse deposit(DepositRequest request);
    TransactionResponse withdraw(WithdrawRequest request);
    TransactionResponse transfer(TransferRequest request);
    List<TransactionResponse> getTransactionsByAccount(Long accountId);
}
