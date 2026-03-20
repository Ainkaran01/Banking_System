package com.banking_system.backend.dto;

import com.banking_system.backend.enums.AccountStatus;
import com.banking_system.backend.enums.AccountType;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

public record AccountResponse(
    Long id,
    String accountNumber,
    Long customerId,
    AccountType accountType,
    BigDecimal balance,
    AccountStatus status,
    LocalDateTime createdAt,
    LocalDate maturityDate,
    BigDecimal interestRate,
    String depositPeriod,
    String depositPeriodLabel,
    BigDecimal initialDeposit,
    BigDecimal maturityAmount
) {
}
