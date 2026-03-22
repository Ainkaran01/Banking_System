package com.banking_system.backend.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.banking_system.backend.entity.BankTransaction;

import java.util.List;

public interface TransactionRepository extends JpaRepository<BankTransaction, Long> {
    List<BankTransaction> findByAccountIdOrderByCreatedAtDesc(Long accountId);
}
