package com.example.taller_persisntencia2.dto.request;

import com.example.taller_persisntencia2.validation.MaxUtf8Bytes;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.time.LocalDate;

public record RegisterUserRequest(
        @NotBlank(message = "Username is required")
        String username,

        @NotBlank(message = "Email is required")
        @Email(message = "Email must be valid")
        String email,

        @NotBlank(message = "First name is required")
        String firstName,

        @NotBlank(message = "Last name is required")
        String lastName,

        String phone,

        String city,

        @NotNull(message = "Birth date is required")
        LocalDate birthDate,

        @NotBlank(message = "Password is required")
        @Size(min = 12, message = "Password must be at least 12 characters")
        @MaxUtf8Bytes(value = 72, message = "Password must not exceed 72 bytes")
        String password
) {
        @Override
        public String toString() {
                return "RegisterUserRequest[username=" + username + ", email=" + email + ", password=***]";
        }
}