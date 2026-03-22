package com.banking_system.backend.controller;

import com.banking_system.backend.dto.*;
import com.banking_system.backend.service.TransactionService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/transactions")
@RequiredArgsConstructor
public class TransactionController {

    private final TransactionService transactionService;

    @PostMapping("/deposit")
    public TransactionResponse deposit(@Valid @RequestBody DepositRequest request) {
        return transactionService.deposit(request);
    }

    @PostMapping("/withdraw")
    public TransactionResponse withdraw(@Valid @RequestBody WithdrawRequest request) {
        return transactionService.withdraw(request);
    }

    @PostMapping("/transfer")
    public TransactionResponse transfer(@Valid @RequestBody TransferRequest request) {
        return transactionService.transfer(request);
    }

    @GetMapping("/{accountId}")
    public List<TransactionResponse> getByAccount(@PathVariable Long accountId) {
        return transactionService.getTransactionsByAccount(accountId);
    }
}
