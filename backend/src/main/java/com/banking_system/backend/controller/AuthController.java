package com.banking_system.backend.controller;


import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import com.banking_system.backend.entity.Customer;
import com.banking_system.backend.service.AuthService;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    @Autowired
    private AuthService authService;

    @PostMapping("/register")
    public Customer register(@RequestBody Customer customer) {
        return authService.register(customer);
    }

    @PostMapping("/login")
    public Customer login(@RequestBody Customer customer) {
        return authService.login(customer.getEmail(), customer.getPassword());
    }
}
