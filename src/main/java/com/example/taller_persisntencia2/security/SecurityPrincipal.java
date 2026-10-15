package com.example.taller_persisntencia2.security;

import org.springframework.security.core.CredentialsContainer;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import java.util.Collection;
import java.util.List;
import java.util.Objects;

public class SecurityPrincipal implements UserDetails, CredentialsContainer {

    private final Long id;
    private final String username;
    private final List<GrantedAuthority> authorities;
    private final boolean active;
    private String passwordHash;

    public SecurityPrincipal(Long id, String username, String passwordHash,
                             List<GrantedAuthority> authorities, boolean active) {
        this.id = id;
        this.username = username;
        this.passwordHash = passwordHash;
        this.authorities = List.copyOf(authorities);
        this.active = active;
    }

    /** Id persistente del usuario: es el que va en el claim "sub" y se compara con la propiedad de recursos. */
    public Long getId() { return id; }

    @Override public String getUsername() { return username; }
    @Override public String getPassword() { return passwordHash; }
    @Override public Collection<? extends GrantedAuthority> getAuthorities() { return authorities; }

    /** "activo" del PRD: un usuario desactivado queda deshabilitado. */
    @Override public boolean isEnabled() { return active; }

    @Override public boolean isAccountNonExpired() { return true; }
    @Override public boolean isAccountNonLocked() { return true; }
    @Override public boolean isCredentialsNonExpired() { return true; }

    /** Spring Security llama esto tras autenticar para no mantener el hash en memoria. */
    @Override public void eraseCredentials() { this.passwordHash = null; }

    @Override
    public boolean equals(Object o) {
        return this == o || (o instanceof SecurityPrincipal other && Objects.equals(id, other.id));
    }

    @Override
    public int hashCode() { return Objects.hash(id); }

    @Override
    public String toString() {
        return "SecurityPrincipal[id=" + id + ", username=" + username + ", active=" + active + "]";
    }
}