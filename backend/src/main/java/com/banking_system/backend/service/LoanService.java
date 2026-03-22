package com.banking_system.backend.service;

import com.banking_system.backend.dto.LoanApplicationRequest;
import com.banking_system.backend.dto.LoanResponse;

import java.util.List;

public interface LoanService {
    LoanResponse applyLoan(LoanApplicationRequest request);
    List<LoanResponse> getLoansByCustomer(Long customerId);
}
