package com.example.taller_persisntencia2.security;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.validation.annotation.Validated;

import java.time.Duration;

@Validated
@ConfigurationProperties(prefix = "pulsepass.security.jwt")
public record JwtProperties(
        @NotBlank String issuer,
        @NotBlank String secretBase64,
        @NotNull Duration accessTokenTtl
) {
    @Override
    public String toString() {
        return "JwtProperties[issuer=" + issuer + ", secretBase64=***, accessTokenTtl=" + accessTokenTtl + "]";
    }
}