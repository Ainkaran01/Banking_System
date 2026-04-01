package com.banking_system.backend.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.banking_system.backend.entity.Loan;

import java.util.List;

public interface LoanRepository extends JpaRepository<Loan, Long> {
    List<Loan> findByCustomerIdOrderByAppliedAtDesc(Long customerId);
}
