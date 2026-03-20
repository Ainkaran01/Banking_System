package com.banking_system.backend.repository;

import com.banking_system.backend.entity.Account;
import com.banking_system.backend.enums.AccountStatus;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface AccountRepository extends JpaRepository<Account, Long> {
    List<Account> findByCustomerIdAndStatus(Long customerId, AccountStatus status);
    List<Account> findByStatus(AccountStatus status);
    boolean existsByAccountNumber(String accountNumber);
    Optional<Account> findByAccountNumber(String accountNumber);
}
