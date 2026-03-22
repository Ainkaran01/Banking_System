package com.banking_system.backend.service.impl;

import com.banking_system.backend.dto.DepositRequest;
import com.banking_system.backend.dto.TransactionResponse;
import com.banking_system.backend.dto.TransferRequest;
import com.banking_system.backend.dto.WithdrawRequest;
import com.banking_system.backend.entity.Account;
import com.banking_system.backend.entity.BankTransaction;
import com.banking_system.backend.entity.FixedDepositAccount;
import com.banking_system.backend.enums.AccountStatus;
import com.banking_system.backend.enums.TransactionType;
import com.banking_system.backend.exception.BadRequestException;
import com.banking_system.backend.exception.ResourceNotFoundException;
import com.banking_system.backend.repository.AccountRepository;
import com.banking_system.backend.repository.TransactionRepository;
import com.banking_system.backend.service.TransactionService;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.List;

@Service("basicTransactionService")
@RequiredArgsConstructor
public class BasicTransactionServiceImpl implements TransactionService {

    private final AccountRepository accountRepository;
    private final TransactionRepository transactionRepository;
    private final JdbcTemplate jdbcTemplate;

    @Value("${app.transfer.use-stored-procedure:false}")
    private boolean useStoredProcedure;

    @Override
    @Transactional
    public TransactionResponse deposit(DepositRequest request) {
        Account account = getActiveAccount(request.accountId());
        account.setBalance(account.getBalance().add(request.amount()));
        accountRepository.save(account);

        BankTransaction tx = transactionRepository.save(BankTransaction.builder()
            .account(account)
            .type(TransactionType.DEPOSIT)
            .amount(request.amount())
            .build());

        return map(tx);
    }

    @Override
    @Transactional
    public TransactionResponse withdraw(WithdrawRequest request) {
        Account account = getActiveAccount(request.accountId());

        if (account instanceof FixedDepositAccount fd && !fd.isMatured()) {
            throw new BadRequestException("Fixed deposit cannot be withdrawn before maturity date.");
        }

        if (!account.canWithdraw(request.amount())) {
            throw new BadRequestException("Insufficient balance or withdrawal rule violation");
        }

        account.setBalance(account.getBalance().subtract(request.amount()));
        accountRepository.save(account);

        BankTransaction tx = transactionRepository.save(BankTransaction.builder()
            .account(account)
            .type(TransactionType.WITHDRAWAL)
            .amount(request.amount())
            .build());

        return map(tx);
    }

    @Override
    @Transactional
    public TransactionResponse transfer(TransferRequest request) {
        if (request.fromAccountId().equals(request.toAccountId())) {
            throw new BadRequestException("Source and destination accounts must be different");
        }

        if (useStoredProcedure) {
            jdbcTemplate.update("CALL transfer_money(?, ?, ?)", request.fromAccountId(), request.toAccountId(), request.amount());
            List<BankTransaction> latest = transactionRepository.findByAccountIdOrderByCreatedAtDesc(request.fromAccountId());
            if (latest.isEmpty()) {
                throw new BadRequestException("Transfer completed but no transaction record found");
            }
            return map(latest.get(0));
        }

        Account from = getActiveAccount(request.fromAccountId());
        Account to = getActiveAccount(request.toAccountId());

        if (!from.canWithdraw(request.amount())) {
            throw new BadRequestException("Insufficient balance");
        }

        from.setBalance(from.getBalance().subtract(request.amount()));
        to.setBalance(to.getBalance().add(request.amount()));
        accountRepository.save(from);
        accountRepository.save(to);

        BankTransaction debitTx = transactionRepository.save(BankTransaction.builder()
            .account(from)
            .type(TransactionType.TRANSFER_OUT)
            .amount(request.amount())
            .relatedAccountId(to.getId())
            .build());

        transactionRepository.save(BankTransaction.builder()
            .account(to)
            .type(TransactionType.TRANSFER_IN)
            .amount(request.amount())
            .relatedAccountId(from.getId())
            .build());

        return map(debitTx);
    }

    @Override
    public List<TransactionResponse> getTransactionsByAccount(Long accountId) {
        getActiveAccount(accountId);
        return transactionRepository.findByAccountIdOrderByCreatedAtDesc(accountId)
            .stream()
            .map(this::map)
            .toList();
    }

    private Account getActiveAccount(Long accountId) {
        Account account = accountRepository.findById(accountId)
            .orElseThrow(() -> new ResourceNotFoundException("Account not found"));
        if (account.getStatus() != AccountStatus.ACTIVE) {
            throw new BadRequestException("Account is inactive");
        }
        return account;
    }

    private TransactionResponse map(BankTransaction tx) {
        return new TransactionResponse(
            tx.getId(),
            tx.getAccount().getId(),
            tx.getType(),
            tx.getAmount(),
            tx.getRelatedAccountId(),
            tx.getCreatedAt()
        );
    }
}
