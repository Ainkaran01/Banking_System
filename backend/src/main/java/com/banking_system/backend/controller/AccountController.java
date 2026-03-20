package com.banking_system.backend.controller;

import com.banking_system.backend.dto.AccountResponse;
import com.banking_system.backend.dto.CreateAccountRequest;
import com.banking_system.backend.dto.RecipientLookupResponse;
import com.banking_system.backend.service.AccountService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/accounts")
@RequiredArgsConstructor
public class AccountController {

    private final AccountService accountService;

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public AccountResponse create(@Valid @RequestBody CreateAccountRequest request) {
        return accountService.createAccount(request);
    }

    @GetMapping("/{id}")
    public AccountResponse getById(@PathVariable Long id) {
        return accountService.getAccountDetails(id);
    }

    @GetMapping("/customer/{customerId}")
    public List<AccountResponse> getByCustomer(@PathVariable Long customerId) {
        return accountService.getAccountsByCustomer(customerId);
    }

    @GetMapping
    public List<AccountResponse> getAllActiveAccounts() {
        return accountService.getAllActiveAccounts();
    }

    @GetMapping("/lookup/{accountNumber}")
    public RecipientLookupResponse lookupByAccountNumber(@PathVariable String accountNumber) {
        return accountService.lookupRecipientByAccountNumber(accountNumber);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deactivate(@PathVariable Long id) {
        accountService.deactivateAccount(id);
    }
}
