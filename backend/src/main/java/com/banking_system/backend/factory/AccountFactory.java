package com.banking_system.backend.factory;

import com.banking_system.backend.entity.*;
import com.banking_system.backend.enums.AccountStatus;
import com.banking_system.backend.enums.AccountType;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;

@Component
public class AccountFactory {

    public Account createAccount(AccountType accountType, Customer customer) {
        Account account = switch (accountType) {
            case SAVINGS -> new SavingsAccount();
            case CURRENT -> new CurrentAccount();
            case FIXED_DEPOSIT -> new FixedDepositAccount();
        };
        account.setCustomer(customer);
        account.setStatus(AccountStatus.ACTIVE);
        account.setBalance(BigDecimal.ZERO);
        return account;
    }
}
