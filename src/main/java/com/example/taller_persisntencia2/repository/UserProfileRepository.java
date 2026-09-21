package com.example.taller_persisntencia2.repository;

import com.example.taller_persisntencia2.domain.UserProfile;
import org.springframework.data.jpa.repository.JpaRepository;

public interface UserProfileRepository extends JpaRepository<UserProfile, Long> {
}
