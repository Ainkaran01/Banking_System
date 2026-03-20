package com.banking_system.backend.dto;

public record RecipientLookupResponse(
    Long accountId,
    String accountNumber,
    String customerName,
    Long customerId
) {
}
