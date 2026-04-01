package com.banking_system.backend.controller;


import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import com.banking_system.backend.entity.Customer;
import com.banking_system.backend.service.AuthService;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    @Autowired
    private AuthService authService;

    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody Customer customer) {
        try {
            Customer saved = authService.register(customer);
            return ResponseEntity.ok(saved);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PostMapping("/login")
    public Customer login(@RequestBody Customer customer) {
        return authService.login(customer.getEmail(), customer.getPassword());
    }
}
