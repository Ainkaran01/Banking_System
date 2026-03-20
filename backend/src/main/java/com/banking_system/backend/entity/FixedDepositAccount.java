package com.banking_system.backend.entity;

import com.banking_system.backend.enums.AccountType;
import com.banking_system.backend.enums.DepositPeriod;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDate;

@Entity
@DiscriminatorValue("FIXED_DEPOSIT")
@Getter
@Setter
public class FixedDepositAccount extends Account {

    @Column
    private LocalDate maturityDate;

    @Enumerated(EnumType.STRING)
    @Column
    private DepositPeriod depositPeriod;

    @Column(precision = 5, scale = 2)
    private BigDecimal interestRate;

    @Column(precision = 19, scale = 2)
    private BigDecimal initialDeposit;

    @Override
    public AccountType getAccountType() {
        return AccountType.FIXED_DEPOSIT;
    }

    @Override
    public BigDecimal getMinimumBalance() {
        return BigDecimal.ZERO;
    }

    public boolean isMatured() {
        return maturityDate != null && !maturityDate.isAfter(LocalDate.now());
    }

    @Override
    public boolean canWithdraw(BigDecimal amount) {
        if (!isMatured()) {
            return false;
        }
        return super.canWithdraw(amount);
    }
}
