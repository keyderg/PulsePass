package com.example.taller_persisntencia2.security;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.ExpiredJwtException;
import io.jsonwebtoken.JwtException;
import io.jsonwebtoken.JwtParser;
import io.jsonwebtoken.Jws;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.MalformedJwtException;
import io.jsonwebtoken.UnsupportedJwtException;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;
import io.jsonwebtoken.security.SignatureException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import javax.crypto.SecretKey;
import java.time.Clock;
import java.time.Duration;
import java.time.Instant;
import java.util.Date;
import java.util.UUID;

import com.example.taller_persisntencia2.exception.InvalidTokenException;

@Service
public class JwtService {

    private static final Logger log = LoggerFactory.getLogger(JwtService.class);
    private static final int MIN_KEY_BYTES = 32;

    private final SecretKey key;
    private final String issuer;
    private final Duration accessTokenTtl;
    private final Clock clock;
    private final JwtParser parser;

    public JwtService(JwtProperties properties, Clock clock) {
        this.key = buildKey(properties.secretBase64());
        this.issuer = properties.issuer();
        this.accessTokenTtl = properties.accessTokenTtl();
        this.clock = clock;
        this.parser = Jwts.parser()
                .verifyWith(key)                          // API nueva: verifica la firma con esta clave
                .requireIssuer(issuer)                    // rechaza otro issuer
                .clock(() -> Date.from(clock.instant()))  // misma hora que usamos para emitir
                .build();
    }

    private static SecretKey buildKey(String secretBase64) {
        byte[] bytes;
        try {
            bytes = Decoders.BASE64.decode(secretBase64);
        } catch (RuntimeException e) {
            throw new IllegalStateException("PULSEPASS_JWT_SECRET_BASE64 no es Base64 válido");
        }
        if (bytes.length < MIN_KEY_BYTES) {
            throw new IllegalStateException(
                    "PULSEPASS_JWT_SECRET_BASE64 debe medir al menos 32 bytes una vez decodificada");
        }
        return Keys.hmacShaKeyFor(bytes);
    }

    /** Emite un JWT HS256 con sub (id persistente), iss, iat, exp y jti. Sin roles ni datos personales. */
    public String generateToken(Long userId) {
        Instant now = clock.instant();
        return Jwts.builder()
                .subject(userId.toString())
                .issuer(issuer)
                .issuedAt(Date.from(now))
                .expiration(Date.from(now.plus(accessTokenTtl)))
                .id(UUID.randomUUID().toString())
                .signWith(key, Jwts.SIG.HS256)
                .compact();
    }

    public long getAccessTokenTtlSeconds() {
        return accessTokenTtl.toSeconds();
    }

    /**
     * Valida firma, issuer, expiración, sub y algoritmo, y devuelve el id de usuario del claim "sub".
     * Cualquier problema lanza InvalidTokenException.
     */
    public Long validateAndGetUserId(String token) {
        try {
            Jws<Claims> jws = parser.parseSignedClaims(token);

            // verifyWith acepta HS256/384/512 con esta clave: exigimos HS256 explícitamente.
            if (!Jwts.SIG.HS256.getId().equals(jws.getHeader().getAlgorithm())) {
                throw new InvalidTokenException("Algoritmo no permitido");
            }

            Claims claims = jws.getPayload();
            if (claims.getExpiration() == null) {
                throw new InvalidTokenException("Falta exp");
            }
            String subject = claims.getSubject();
            if (subject == null || subject.isBlank()) {
                throw new InvalidTokenException("Falta sub");
            }
            if (claims.getId() == null || claims.getId().isBlank()) {
                throw new InvalidTokenException("Falta jti");
            }
            return Long.parseLong(subject);

        } catch (ExpiredJwtException e) {
            throw rejected("expirado", e);
        } catch (MalformedJwtException e) {
            throw rejected("malformado", e);
        } catch (SignatureException e) {
            throw rejected("firma inválida", e);
        } catch (UnsupportedJwtException e) {
            throw rejected("no soportado", e);
        } catch (JwtException | IllegalArgumentException e) {
            // issuer incorrecto, token vacío/nulo, sub no numérico, etc.
            throw rejected("inválido", e);
        }
    }

    private InvalidTokenException rejected(String reason, Exception cause) {
        // Solo el motivo y la clase: nunca el token ni el mensaje original.
        log.debug("JWT rechazado ({}): {}", reason, cause.getClass().getSimpleName());
        return new InvalidTokenException("Token inválido", cause);
    }
}