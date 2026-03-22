package com.banking_system.backend.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.math.BigDecimal;

public record LoanApplicationRequest(
    @NotNull(message = "Customer id is required")
    Long customerId,
    @NotBlank(message = "Loan type is required")
    String loanType,
    @NotNull(message = "Amount is required")
    @DecimalMin(value = "1000.00", message = "Minimum loan amount is 1000")
    BigDecimal amount
) {
}
