package com.example.taller_persisntencia2.repository;

import com.example.taller_persisntencia2.domain.UserCredential;
import org.springframework.data.jpa.repository.JpaRepository;

public interface UserCredentialRepository extends JpaRepository<UserCredential, Long> {
}