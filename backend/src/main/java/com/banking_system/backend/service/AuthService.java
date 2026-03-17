package com.banking_system.backend.service;

import com.banking_system.backend.entity.Customer;

public interface AuthService {

    Customer register(Customer customer);

    Customer login(String email, String password);
}