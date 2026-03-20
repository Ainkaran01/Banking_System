package com.banking_system.backend.dto;

import com.banking_system.backend.enums.AccountType;
import com.banking_system.backend.enums.DepositPeriod;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

import java.math.BigDecimal;

public record CreateAccountRequest(
    @NotNull(message = "Customer id is required")
    Long customerId,
    @NotNull(message = "Account type is required")
    AccountType accountType,
    DepositPeriod depositPeriod,
    @Positive(message = "Initial deposit must be positive")
    BigDecimal initialDeposit
) {
}
