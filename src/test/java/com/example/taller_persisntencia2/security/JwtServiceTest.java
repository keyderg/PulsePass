package com.example.taller_persisntencia2.security;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.JwtBuilder;
import io.jsonwebtoken.Jws;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.NullAndEmptySource;
import org.junit.jupiter.params.provider.ValueSource;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.time.Clock;
import java.time.Duration;
import java.time.Instant;
import java.time.ZoneOffset;
import java.util.Base64;
import java.util.Date;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import com.example.taller_persisntencia2.exception.InvalidTokenException;

class JwtServiceTest {

    // Claves ficticias, solo para estas pruebas.
    private static final byte[] KEY_BYTES = "0123456789abcdef0123456789abcdef".getBytes(StandardCharsets.UTF_8); // 32 bytes
    private static final String SECRET = Base64.getEncoder().encodeToString(KEY_BYTES);
    private static final SecretKey KEY = Keys.hmacShaKeyFor(KEY_BYTES);

    private static final byte[] OTHER_KEY_BYTES = "fedcba9876543210fedcba9876543210".getBytes(StandardCharsets.UTF_8);
    private static final SecretKey OTHER_KEY = Keys.hmacShaKeyFor(OTHER_KEY_BYTES);

    private static final String ISSUER = "pulsepass-api";
    private static final Instant NOW = Instant.parse("2026-10-15T12:00:00Z");

    private static Clock fixed(Instant instant) {
        return Clock.fixed(instant, ZoneOffset.UTC);
    }

    private static JwtService service(String secretBase64, Clock clock) {
        return new JwtService(new JwtProperties(ISSUER, secretBase64, Duration.ofMinutes(15)), clock);
    }

    private static JwtService realClockService() {
        return service(SECRET, Clock.systemUTC());
    }

    private static JwtBuilder foreignToken(String issuer, String subject, Instant expiration) {
        JwtBuilder builder = Jwts.builder()
                .issuer(issuer)
                .issuedAt(new Date())
                .expiration(Date.from(expiration))
                .id("jti-prueba");
        if (subject != null) {
            builder.subject(subject);
        }
        return builder;
    }

    @Test
    void generatedTokenShouldRoundTripUserId() {
        JwtService service = service(SECRET, fixed(NOW));

        String token = service.generateToken(42L);

        assertThat(service.validateAndGetUserId(token)).isEqualTo(42L);
    }

    @Test
    void generatedTokenShouldContainRequiredClaimsAndHs256() {
        JwtService service = service(SECRET, fixed(NOW));

        String token = service.generateToken(42L);

        Jws<Claims> jws = Jwts.parser().verifyWith(KEY).clock(() -> Date.from(NOW)).build().parseSignedClaims(token);
        Claims claims = jws.getPayload();
        assertThat(jws.getHeader().getAlgorithm()).isEqualTo("HS256");
        assertThat(claims.getSubject()).isEqualTo("42");
        assertThat(claims.getIssuer()).isEqualTo(ISSUER);
        assertThat(claims.getIssuedAt()).isEqualTo(Date.from(NOW));
        assertThat(claims.getExpiration()).isEqualTo(Date.from(NOW.plusSeconds(900)));
        assertThat(claims.getId()).isNotBlank();
    }

    @Test
    void tokenShouldBeValidBeforeExpirationAndRejectedAfter() {
        String token = service(SECRET, fixed(NOW)).generateToken(1L);

        JwtService at14Minutes = service(SECRET, fixed(NOW.plus(Duration.ofMinutes(14))));
        JwtService at16Minutes = service(SECRET, fixed(NOW.plus(Duration.ofMinutes(16))));

        assertThat(at14Minutes.validateAndGetUserId(token)).isEqualTo(1L);
        assertThatThrownBy(() -> at16Minutes.validateAndGetUserId(token))
                .isInstanceOf(InvalidTokenException.class);
    }

    @Test
    void tokenWithWrongIssuerShouldBeRejected() {
        String token = foreignToken("otro-emisor", "1", Instant.now().plusSeconds(600))
                .signWith(KEY, Jwts.SIG.HS256).compact();

        assertThatThrownBy(() -> realClockService().validateAndGetUserId(token))
                .isInstanceOf(InvalidTokenException.class);
    }

    @Test
    void tokenWithTamperedSignatureShouldBeRejected() {
        JwtService service = realClockService();
        String[] parts = service.generateToken(7L).split("\\.");
        char first = parts[2].charAt(0);
        String tampered = parts[0] + "." + parts[1] + "." + (first == 'A' ? 'B' : 'A') + parts[2].substring(1);

        assertThatThrownBy(() -> service.validateAndGetUserId(tampered))
                .isInstanceOf(InvalidTokenException.class);
    }

    @Test
    void tokenSignedWithAnotherKeyShouldBeRejected() {
        String token = foreignToken(ISSUER, "1", Instant.now().plusSeconds(600))
                .signWith(OTHER_KEY, Jwts.SIG.HS256).compact();

        assertThatThrownBy(() -> realClockService().validateAndGetUserId(token))
                .isInstanceOf(InvalidTokenException.class);
    }

    @Test
    void unsignedTokenShouldBeRejected() {
        String token = foreignToken(ISSUER, "1", Instant.now().plusSeconds(600)).compact(); // alg=none

        assertThatThrownBy(() -> realClockService().validateAndGetUserId(token))
                .isInstanceOf(InvalidTokenException.class);
    }

    @Test
    void tokenWithDifferentHmacAlgorithmShouldBeRejectedEvenWithValidSignature() {
        byte[] longKeyBytes = "0123456789abcdef".repeat(4).getBytes(StandardCharsets.UTF_8); // 64 bytes
        SecretKey longKey = Keys.hmacShaKeyFor(longKeyBytes);
        JwtService service = service(Base64.getEncoder().encodeToString(longKeyBytes), Clock.systemUTC());
        String token = foreignToken(ISSUER, "1", Instant.now().plusSeconds(600))
                .signWith(longKey, Jwts.SIG.HS512).compact();

        assertThatThrownBy(() -> service.validateAndGetUserId(token))
                .isInstanceOf(InvalidTokenException.class);
    }

    @ParameterizedTest
    @NullAndEmptySource
    @ValueSource(strings = {" ", "abc", "a.b.c"})
    void malformedOrEmptyTokensShouldBeRejected(String token) {
        assertThatThrownBy(() -> realClockService().validateAndGetUserId(token))
                .isInstanceOf(InvalidTokenException.class);
    }

    @Test
    void tokenWithoutSubjectOrWithNonNumericSubjectShouldBeRejected() {
        String noSubject = foreignToken(ISSUER, null, Instant.now().plusSeconds(600))
                .signWith(KEY, Jwts.SIG.HS256).compact();
        String badSubject = foreignToken(ISSUER, "no-es-un-id", Instant.now().plusSeconds(600))
                .signWith(KEY, Jwts.SIG.HS256).compact();
        JwtService service = realClockService();

        assertThatThrownBy(() -> service.validateAndGetUserId(noSubject)).isInstanceOf(InvalidTokenException.class);
        assertThatThrownBy(() -> service.validateAndGetUserId(badSubject)).isInstanceOf(InvalidTokenException.class);
    }

    @Test
    void weakKeyShouldFailFast() {
        String weak = Base64.getEncoder().encodeToString("solo-16-bytes!!!".getBytes(StandardCharsets.UTF_8));

        assertThatThrownBy(() -> service(weak, Clock.systemUTC()))
                .isInstanceOf(IllegalStateException.class)
                .hasMessageContaining("32 bytes");
    }

    @Test
    void invalidBase64KeyShouldFailFast() {
        assertThatThrownBy(() -> service("###no-es-base64###", Clock.systemUTC()))
                .isInstanceOf(IllegalStateException.class)
                .hasMessageContaining("Base64");
    }

    @Test
    void shouldExposeTtlInSeconds() {
        assertThat(realClockService().getAccessTokenTtlSeconds()).isEqualTo(900L);
    }
}