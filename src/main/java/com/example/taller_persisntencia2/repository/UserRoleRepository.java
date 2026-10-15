package com.example.taller_persisntencia2.repository;

import com.example.taller_persisntencia2.domain.UserRole;
import com.example.taller_persisntencia2.domain.UserRoleId;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface UserRoleRepository extends JpaRepository<UserRole, UserRoleId> {

    List<UserRole> findByIdUserId(Long userId);
}