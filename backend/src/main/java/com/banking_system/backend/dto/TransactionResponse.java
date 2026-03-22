package com.banking_system.backend.dto;

import com.banking_system.backend.enums.TransactionType;
import java.math.BigDecimal;
import java.time.LocalDateTime;

public record TransactionResponse(
    Long id,
    Long accountId,
    TransactionType type,
    BigDecimal amount,
    Long relatedAccountId,
    LocalDateTime createdAt
) {
}
