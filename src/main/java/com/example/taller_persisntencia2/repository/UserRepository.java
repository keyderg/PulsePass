package com.example.taller_persisntencia2.repository;

import com.example.taller_persisntencia2.domain.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface UserRepository extends JpaRepository<User, Long> {

    Optional<User> findByEmailIgnoreCase(String email);
    Optional<User> findByUsername(String username);
    boolean existsByEmailIgnoreCase(String email);
    boolean existsByUsername(String username);

    @Query("""
            select new com.example.taller_persisntencia2.repository.AuthUserRow(
                u.id, u.username, u.active, c.passwordHash, r.id.role)
            from User u
            left join UserCredential c on c.userId = u.id
            left join UserRole r on r.id.userId = u.id
            where u.id = :id
            """)
    List<AuthUserRow> findAuthRowsById(@Param("id") Long id);

    @Query("""
            select new com.example.taller_persisntencia2.repository.AuthUserRow(
                u.id, u.username, u.active, c.passwordHash, r.id.role)
            from User u
            left join UserCredential c on c.userId = u.id
            left join UserRole r on r.id.userId = u.id
            where u.username = :identifier or lower(u.email) = lower(:identifier)
            """)
    List<AuthUserRow> findAuthRowsByIdentifier(@Param("identifier") String identifier);

    @Query("select u.id from User u where lower(u.email) = lower(:email)")
    Optional<Long> findIdByEmail(@Param("email") String email);

    @Query("select u.id from User u where u.username = :username")
    Optional<Long> findIdByUsername(@Param("username") String username);
}