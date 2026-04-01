package com.banking_system.backend.service.impl;

import com.banking_system.backend.dto.LoanApplicationRequest;
import com.banking_system.backend.dto.LoanResponse;
import com.banking_system.backend.entity.Customer;
import com.banking_system.backend.entity.Loan;
import com.banking_system.backend.enums.LoanStatus;
import com.banking_system.backend.exception.BadRequestException;
import com.banking_system.backend.exception.ResourceNotFoundException;
import com.banking_system.backend.repository.CustomerRepository;
import com.banking_system.backend.repository.LoanRepository;
import com.banking_system.backend.service.LoanService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.List;

@Service
@RequiredArgsConstructor
public class LoanServiceImpl implements LoanService {

    private final LoanRepository loanRepository;
    private final CustomerRepository customerRepository;

    @Override
    public LoanResponse applyLoan(LoanApplicationRequest request) {
        Customer customer = customerRepository.findById(request.customerId())
            .orElseThrow(() -> new ResourceNotFoundException("Customer not found"));

        if (request.amount().compareTo(BigDecimal.valueOf(1_000_000)) > 0) {
            throw new BadRequestException("Loan amount exceeds eligibility limit");
        }

        Loan loan = Loan.builder()
            .customer(customer)
            .loanType(request.loanType())
            .amount(request.amount())
            .status(LoanStatus.PENDING)
            .build();

        return map(loanRepository.save(loan));
    }

    @Override
    public List<LoanResponse> getLoansByCustomer(Long customerId) {
        return loanRepository.findByCustomerIdOrderByAppliedAtDesc(customerId)
            .stream()
            .map(this::map)
            .toList();
    }

    private LoanResponse map(Loan loan) {
        return new LoanResponse(
            loan.getId(),
            loan.getCustomer().getId(),
            loan.getLoanType(),
            loan.getAmount(),
            loan.getStatus(),
            loan.getAppliedAt()
        );
    }
}
