package com.banking_system.backend.service;

import com.banking_system.backend.dto.AccountResponse;
import com.banking_system.backend.dto.CreateAccountRequest;
import com.banking_system.backend.dto.RecipientLookupResponse;

import java.util.List;

public interface AccountService {
    AccountResponse createAccount(CreateAccountRequest request);
    AccountResponse getAccountDetails(Long accountId);
    void deactivateAccount(Long accountId);
    List<AccountResponse> getAccountsByCustomer(Long customerId);
    List<AccountResponse> getAllActiveAccounts();
    RecipientLookupResponse lookupRecipientByAccountNumber(String accountNumber);
}
