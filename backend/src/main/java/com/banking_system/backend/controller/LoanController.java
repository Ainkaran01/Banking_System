package com.banking_system.backend.controller;

import com.banking_system.backend.dto.LoanApplicationRequest;
import com.banking_system.backend.dto.LoanResponse;
import com.banking_system.backend.service.LoanService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/loans")
@RequiredArgsConstructor
public class LoanController {

    private final LoanService loanService;

    @PostMapping("/apply")
    @ResponseStatus(HttpStatus.CREATED)
    public LoanResponse apply(@Valid @RequestBody LoanApplicationRequest request) {
        return loanService.applyLoan(request);
    }

    @GetMapping("/customer/{customerId}")
    public List<LoanResponse> getByCustomer(@PathVariable Long customerId) {
        return loanService.getLoansByCustomer(customerId);
    }
}
