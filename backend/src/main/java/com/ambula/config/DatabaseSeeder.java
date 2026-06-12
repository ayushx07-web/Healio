package com.ambula.config;

import com.ambula.doctor.Doctor;
import com.ambula.doctor.DoctorRepository;
import com.ambula.slot.Slot;
import com.ambula.slot.SlotRepository;
import com.ambula.user.User;
import com.ambula.user.UserRepository;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.ArrayList;
import java.util.List;

@Component
@RequiredArgsConstructor
public class DatabaseSeeder implements CommandLineRunner {

    private static final Logger log = LoggerFactory.getLogger(DatabaseSeeder.class);

    private final UserRepository userRepository;
    private final DoctorRepository doctorRepository;
    private final SlotRepository slotRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    @Transactional
    public void run(String... args) throws Exception {
        if (userRepository.count() == 0) {
            log.info("Seeding database with mock users and doctors...");
            String defaultPasswordHash = passwordEncoder.encode("password123");

            // 1. Seed Users
            User u1 = User.builder()
                    .name("Dr. Priya Sharma")
                    .email("priya@ambula.com")
                    .phone("9876543210")
                    .passwordHash(defaultPasswordHash)
                    .role(User.Role.DOCTOR)
                    .build();

            User u2 = User.builder()
                    .name("Dr. Rahul Mehta")
                    .email("rahul@ambula.com")
                    .phone("9876543211")
                    .passwordHash(defaultPasswordHash)
                    .role(User.Role.DOCTOR)
                    .build();

            User u3 = User.builder()
                    .name("Dr. Ananya Iyer")
                    .email("ananya@ambula.com")
                    .phone("9876543212")
                    .passwordHash(defaultPasswordHash)
                    .role(User.Role.DOCTOR)
                    .build();

            User u4 = User.builder()
                    .name("Ravi Kumar")
                    .email("ravi@test.com")
                    .phone("9876543213")
                    .passwordHash(defaultPasswordHash)
                    .role(User.Role.PATIENT)
                    .build();

            userRepository.saveAll(List.of(u1, u2, u3, u4));

            // 2. Seed Doctors
            Doctor d1 = Doctor.builder()
                    .user(u1)
                    .specialization("Cardiologist")
                    .location("Delhi, Connaught Place")
                    .consultationFee(800)
                    .bio("Senior cardiologist with 12 years experience. Specializes in preventive cardiology.")
                    .experienceYears(12)
                    .rating(4.8)
                    .build();

            Doctor d2 = Doctor.builder()
                    .user(u2)
                    .specialization("Dermatologist")
                    .location("Delhi, Lajpat Nagar")
                    .consultationFee(600)
                    .bio("Expert in skin conditions, cosmetic dermatology, and hair treatment.")
                    .experienceYears(8)
                    .rating(4.6)
                    .build();

            Doctor d3 = Doctor.builder()
                    .user(u3)
                    .specialization("General Physician")
                    .location("Delhi, Vasant Kunj")
                    .consultationFee(400)
                    .bio("General practice with focus on preventive health and chronic disease management.")
                    .experienceYears(6)
                    .rating(4.7)
                    .build();

            doctorRepository.saveAll(List.of(d1, d2, d3));
            log.info("Basic user and doctor seeding completed.");
        }

        // 3. Generate slots for the next 7 days dynamically if they don't already exist
        log.info("Updating booking slots for the next 7 days...");
        List<Doctor> doctors = doctorRepository.findAll();
        List<Slot> slotsToCreate = new ArrayList<>();
        LocalDate today = LocalDate.now();

        // Build a set of existing slots to avoid duplicates
        java.util.Set<String> existingSlots = new java.util.HashSet<>();
        for (Slot s : slotRepository.findAll()) {
            existingSlots.add(s.getDoctor().getId() + "_" + s.getStartTime());
        }

        for (Doctor doctor : doctors) {
            for (int dayOffset = 0; dayOffset < 7; dayOffset++) {
                LocalDate date = today.plusDays(dayOffset);
                for (int hour = 9; hour < 17; hour++) {
                    // :00 slot
                    LocalDateTime startTime1 = LocalDateTime.of(date, LocalTime.of(hour, 0));
                    LocalDateTime endTime1 = LocalDateTime.of(date, LocalTime.of(hour, 30));
                    String key1 = doctor.getId() + "_" + startTime1;
                    if (!existingSlots.contains(key1)) {
                        slotsToCreate.add(Slot.builder()
                                .doctor(doctor)
                                .startTime(startTime1)
                                .endTime(endTime1)
                                .isBlocked(false)
                                .build());
                    }

                    // :30 slot
                    LocalDateTime startTime2 = LocalDateTime.of(date, LocalTime.of(hour, 30));
                    LocalDateTime endTime2 = LocalDateTime.of(date, LocalTime.of(hour + 1, 0));
                    String key2 = doctor.getId() + "_" + startTime2;
                    if (!existingSlots.contains(key2)) {
                        slotsToCreate.add(Slot.builder()
                                .doctor(doctor)
                                .startTime(startTime2)
                                .endTime(endTime2)
                                .isBlocked(false)
                                .build());
                    }
                }
            }
        }

        if (!slotsToCreate.isEmpty()) {
            slotRepository.saveAll(slotsToCreate);
            log.info("Successfully added {} new future slots.", slotsToCreate.size());
        } else {
            log.info("All slots for the next 7 days are already up to date.");
        }
    }
}
