package com.example.taller_persisntencia2;

import com.example.taller_persisntencia2.domain.User;
import com.example.taller_persisntencia2.domain.UserProfile;
import com.example.taller_persisntencia2.repository.UserProfileRepository;
import com.example.taller_persisntencia2.repository.UserRepository;
import jakarta.transaction.Transactional;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.context.annotation.Import;

import java.time.LocalDate;

import static org.assertj.core.api.Assertions.assertThat;

@SpringBootTest
@Import(TestcontainersConfiguration.class)
@Transactional
class UserProfileIT {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private UserProfileRepository userProfileRepository;

    @Test
    void shouldSaveAndRetrieveUserWithProfile() {

        User user = new User("carlos_admin", "carlos@admin.com");
        user.setActive(true);
        userRepository.save(user);


        UserProfile profile = new UserProfile("Carlos", "Pérez", LocalDate.of(1995, 5, 12));
        profile.setCity("Cartagena");
        profile.setPhone("3001234567");


        user.assignProfile(profile);


        userProfileRepository.save(profile);


        UserProfile foundProfile = userProfileRepository.findById(profile.getId()).orElse(null);

        assertThat(foundProfile).isNotNull();
        assertThat(foundProfile.getFirstName()).isEqualTo("Carlos");
        assertThat(foundProfile.getUser().getEmail()).isEqualTo("carlos@admin.com");
    }
}