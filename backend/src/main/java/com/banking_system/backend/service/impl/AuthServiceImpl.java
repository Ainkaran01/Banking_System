package com.banking_system.backend.service.impl;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;

import com.banking_system.backend.entity.Customer;
import com.banking_system.backend.repository.CustomerRepository;
import com.banking_system.backend.service.AuthService;

@Service
public class AuthServiceImpl implements AuthService {

    @Autowired
    private CustomerRepository customerRepository;

    @Autowired
    private BCryptPasswordEncoder passwordEncoder;

    @Override
    public Customer register(Customer customer) {

        // CHECK IF EMAIL ALREADY EXISTS
        if (customerRepository.existsByEmail(customer.getEmail())) {
            throw new RuntimeException("Email already registered");
        }

        // ENCRYPT PASSWORD
        customer.setPassword(passwordEncoder.encode(customer.getPassword()));

        // SAVE
        return customerRepository.save(customer);
    }

    @Override
    public Customer login(String email, String password) {

        Customer customer = customerRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        // check encrypted password
        if (!passwordEncoder.matches(password, customer.getPassword())) {
            throw new RuntimeException("Invalid password");
        }

        return customer;
    }
}