package com.example.taller_persisntencia2.domain;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "user_credentials")
public class UserCredential {

    @Id
    @Column(name = "user_id")
    private Long userId;

    @OneToOne(fetch = FetchType.LAZY, optional = false)
    @MapsId
    @JoinColumn(name = "user_id")
    private User user;

    @Column(name = "password_hash", nullable = false, length = 100)
    private String passwordHash;

    @Column(name = "password_changed_at")
    private LocalDateTime passwordChangedAt;

    protected UserCredential() {}

    public UserCredential(User user, String passwordHash) {
        this.user = user;
        this.passwordHash = passwordHash;
        this.passwordChangedAt = LocalDateTime.now();
    }

    public Long getUserId() { return userId; }
    public User getUser() { return user; }
    public String getPasswordHash() { return passwordHash; }
    public LocalDateTime getPasswordChangedAt() { return passwordChangedAt; }

    public void changePasswordHash(String newPasswordHash) {
        this.passwordHash = newPasswordHash;
        this.passwordChangedAt = LocalDateTime.now();
    }

}