package com.example.taller_persisntencia2.dto.response;

public record AuthResponse(
        String accessToken,
        String tokenType,
        long expiresIn
) {
    // El token es un secreto: no debe salir en logs.
    @Override
    public String toString() {
        return "AuthResponse[accessToken=***, tokenType=" + tokenType + ", expiresIn=" + expiresIn + "]";
    }
}