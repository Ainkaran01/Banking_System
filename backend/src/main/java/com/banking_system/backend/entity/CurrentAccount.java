package com.banking_system.backend.entity;

import com.banking_system.backend.enums.AccountType;
import jakarta.persistence.DiscriminatorValue;
import jakarta.persistence.Entity;

import java.math.BigDecimal;

@Entity
@DiscriminatorValue("CURRENT")
public class CurrentAccount extends Account {

    @Override
    public AccountType getAccountType() {
        return AccountType.CURRENT;
    }

    @Override
    public BigDecimal getMinimumBalance() {
        return BigDecimal.ZERO;
    }
}
