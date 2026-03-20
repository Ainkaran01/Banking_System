package com.banking_system.backend.entity;

import com.banking_system.backend.enums.AccountType;
import jakarta.persistence.DiscriminatorValue;
import jakarta.persistence.Entity;

import java.math.BigDecimal;

@Entity
@DiscriminatorValue("SAVINGS")
public class SavingsAccount extends Account {

    @Override
    public AccountType getAccountType() {
        return AccountType.SAVINGS;
    }

    @Override
    public BigDecimal getMinimumBalance() {
        return BigDecimal.valueOf(500);
    }
}
