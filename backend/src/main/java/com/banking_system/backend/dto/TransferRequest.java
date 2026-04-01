package com.banking_system.backend.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;

import java.math.BigDecimal;

public record TransferRequest(
    @NotNull(message = "From account id is required")
    Long fromAccountId,
    @NotNull(message = "To account id is required")
    Long toAccountId,
    @NotNull(message = "Amount is required")
    @DecimalMin(value = "0.01", message = "Amount must be greater than zero")
    BigDecimal amount
) {
}
