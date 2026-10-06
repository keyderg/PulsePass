package com.example.taller_persisntencia2.service;

import com.example.taller_persisntencia2.dto.request.RegisterUserRequest;
import com.example.taller_persisntencia2.dto.response.UserResponse;

public interface UserService {
    UserResponse register(RegisterUserRequest request);
    UserResponse findByEmail(String email);
    UserResponse findByUsername(String username);
}