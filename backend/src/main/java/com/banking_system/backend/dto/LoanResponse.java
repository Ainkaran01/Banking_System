package com.banking_system.backend.dto;

import com.banking_system.backend.enums.LoanStatus;
import java.math.BigDecimal;
import java.time.LocalDateTime;

public record LoanResponse(
    Long id,
    Long customerId,
    String loanType,
    BigDecimal amount,
    LoanStatus status,
    LocalDateTime appliedAt
) {
}
