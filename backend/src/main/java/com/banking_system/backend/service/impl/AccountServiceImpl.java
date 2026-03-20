package com.banking_system.backend.service.impl;

import com.banking_system.backend.dto.AccountResponse;
import com.banking_system.backend.dto.CreateAccountRequest;
import com.banking_system.backend.dto.RecipientLookupResponse;
import com.banking_system.backend.entity.Account;
import com.banking_system.backend.entity.Customer;
import com.banking_system.backend.entity.FixedDepositAccount;
import com.banking_system.backend.enums.AccountStatus;
import com.banking_system.backend.enums.AccountType;
import com.banking_system.backend.enums.DepositPeriod;
import com.banking_system.backend.exception.BadRequestException;
import com.banking_system.backend.exception.ResourceNotFoundException;
import com.banking_system.backend.factory.AccountFactory;
import com.banking_system.backend.repository.AccountRepository;
import com.banking_system.backend.repository.CustomerRepository;
import com.banking_system.backend.service.AccountService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.util.List;
import java.util.concurrent.ThreadLocalRandom;

@Service
@RequiredArgsConstructor
public class AccountServiceImpl implements AccountService {

    private final AccountRepository accountRepository;
    private final CustomerRepository customerRepository;
    private final AccountFactory accountFactory;
    private static final int ACCOUNT_NUMBER_MIN = 1_000_000;
    private static final int ACCOUNT_NUMBER_MAX = 10_000_000;
    private static final int ACCOUNT_NUMBER_MAX_ATTEMPTS = 20;

    @Override
    public AccountResponse createAccount(CreateAccountRequest request) {
        Customer customer = customerRepository.findById(request.customerId())
            .orElseThrow(() -> new ResourceNotFoundException("Customer not found"));

        Account account = accountFactory.createAccount(request.accountType(), customer);
        account.setAccountNumber(generateUniqueAccountNumber());

        if (request.accountType() == AccountType.FIXED_DEPOSIT) {
            if (request.depositPeriod() == null || request.initialDeposit() == null) {
                throw new BadRequestException("Deposit period and initial deposit amount are required for Fixed Deposit accounts");
            }
            DepositPeriod period = request.depositPeriod();
            BigDecimal initialDeposit = request.initialDeposit();
            BigDecimal rate = period.getInterestRate();

            // Simple interest: maturityAmount = P * (1 + rate/100 * days/365)
            BigDecimal interest = initialDeposit
                .multiply(rate)
                .divide(new BigDecimal("100"), 10, RoundingMode.HALF_UP)
                .multiply(new BigDecimal(period.getDays()))
                .divide(new BigDecimal("365"), 2, RoundingMode.HALF_UP);
            BigDecimal maturityAmount = initialDeposit.add(interest);

            FixedDepositAccount fd = (FixedDepositAccount) account;
            fd.setDepositPeriod(period);
            fd.setInterestRate(rate);
            fd.setInitialDeposit(initialDeposit);
            fd.setBalance(maturityAmount);
            fd.setMaturityDate(LocalDate.now().plusDays(period.getDays()));
        }

        Account saved = accountRepository.save(account);
        return map(saved);
    }

    @Override
    public AccountResponse getAccountDetails(Long accountId) {
        Account account = accountRepository.findById(accountId)
            .orElseThrow(() -> new ResourceNotFoundException("Account not found"));
        return map(account);
    }

    @Override
    public void deactivateAccount(Long accountId) {
        Account account = accountRepository.findById(accountId)
            .orElseThrow(() -> new ResourceNotFoundException("Account not found"));
        account.setStatus(AccountStatus.INACTIVE);
        accountRepository.save(account);
    }

    @Override
    public List<AccountResponse> getAccountsByCustomer(Long customerId) {
        return accountRepository.findByCustomerIdAndStatus(customerId, AccountStatus.ACTIVE)
            .stream()
            .map(this::map)
            .toList();
    }

    @Override
    public List<AccountResponse> getAllActiveAccounts() {
        return accountRepository.findByStatus(AccountStatus.ACTIVE)
            .stream()
            .map(this::map)
            .toList();
    }

    @Override
    public RecipientLookupResponse lookupRecipientByAccountNumber(String accountNumber) {
        if (accountNumber == null || !accountNumber.matches("\\d{7}")) {
            throw new BadRequestException("Account number must be a 7-digit value");
        }

        Account account = accountRepository.findByAccountNumber(accountNumber)
            .orElseThrow(() -> new ResourceNotFoundException("Account number not found"));

        if (account.getStatus() != AccountStatus.ACTIVE) {
            throw new BadRequestException("Destination account is inactive");
        }

        return new RecipientLookupResponse(
            account.getId(),
            account.getAccountNumber(),
            account.getCustomer().getName(),
            account.getCustomer().getId()
        );
    }

    private String generateUniqueAccountNumber() {
        for (int i = 0; i < ACCOUNT_NUMBER_MAX_ATTEMPTS; i++) {
            String candidate = String.valueOf(ThreadLocalRandom.current()
                .nextInt(ACCOUNT_NUMBER_MIN, ACCOUNT_NUMBER_MAX));
            if (!accountRepository.existsByAccountNumber(candidate)) {
                return candidate;
            }
        }
        throw new BadRequestException("Unable to generate unique account number. Please retry.");
    }

    private AccountResponse map(Account account) {
        LocalDate maturityDate = null;
        BigDecimal interestRate = null;
        String depositPeriod = null;
        String depositPeriodLabel = null;
        BigDecimal initialDeposit = null;
        BigDecimal maturityAmount = null;

        if (account instanceof FixedDepositAccount fd) {
            maturityDate = fd.getMaturityDate();
            interestRate = fd.getInterestRate();
            if (fd.getDepositPeriod() != null) {
                depositPeriod = fd.getDepositPeriod().name();
                depositPeriodLabel = fd.getDepositPeriod().getLabel();
            }
            initialDeposit = fd.getInitialDeposit();
            maturityAmount = fd.getBalance();
        }

        return new AccountResponse(
            account.getId(),
            account.getAccountNumber(),
            account.getCustomer().getId(),
            account.getAccountType(),
            account.getBalance(),
            account.getStatus(),
            account.getCreatedAt(),
            maturityDate,
            interestRate,
            depositPeriod,
            depositPeriodLabel,
            initialDeposit,
            maturityAmount
        );
    }
}
