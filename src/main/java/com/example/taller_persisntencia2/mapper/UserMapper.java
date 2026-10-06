package com.example.taller_persisntencia2.mapper;

import com.example.taller_persisntencia2.domain.User;
import com.example.taller_persisntencia2.dto.response.UserResponse;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface UserMapper {
    @Mapping(target = "firstName", source = "userProfile.firstName")
    @Mapping(target = "lastName", source = "userProfile.lastName")
    @Mapping(target = "birthDate", source = "userProfile.birthDate")
    UserResponse toResponse(User user);
}