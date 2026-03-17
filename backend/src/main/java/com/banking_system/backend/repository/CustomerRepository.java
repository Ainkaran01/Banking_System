package com.banking_system.backend.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import com.banking_system.backend.entity.Customer;

import java.util.Optional;

public interface CustomerRepository extends JpaRepository<Customer, Long> {
    Optional<Customer> findByEmail(String email);
}