package com.example.taller_persisntencia2.security;

import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.time.Clock;

@Configuration
@EnableConfigurationProperties(JwtProperties.class)
public class JwtConfig {

    /** Reloj inyectable: permite probar tokens vencidos sin esperar 15 minutos. */
    @Bean
    public Clock clock() {
        return Clock.systemUTC();
    }
}