package com.ambula.patient;

import com.ambula.user.User;
import com.ambula.user.UserRepository;
import com.ambula.booking.Booking;
import com.ambula.booking.BookingRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class HealthSummaryService {

    private final HealthSummaryRepository healthSummaryRepository;
    private final UserRepository userRepository;
    private final BookingRepository bookingRepository;

    public HealthSummary getByEmail(String email) {
        return healthSummaryRepository.findByUserEmail(email)
                .orElseGet(() -> {
                    User user = userRepository.findByEmail(email)
                            .orElseThrow(() -> new RuntimeException("User not found"));
                    return HealthSummary.builder()
                            .user(user)
                            .build();
                });
    }

    public HealthSummary upsert(String email, HealthSummary newSummary) {
        HealthSummary existing = healthSummaryRepository.findByUserEmail(email)
                .orElseGet(() -> {
                    User user = userRepository.findByEmail(email)
                            .orElseThrow(() -> new RuntimeException("User not found"));
                    return HealthSummary.builder()
                            .user(user)
                            .build();
                });

        existing.setBloodGroup(newSummary.getBloodGroup());
        existing.setKnownConditions(newSummary.getKnownConditions());
        existing.setCurrentMedications(newSummary.getCurrentMedications());

        return healthSummaryRepository.save(existing);
    }

    public HealthSummary getByBookingId(Long bookingId) {
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new RuntimeException("Booking not found"));
        
        User patientUser = booking.getPatientUser();
        if (patientUser == null) {
            return new HealthSummary();
        }

        final User finalUser = patientUser;
        return healthSummaryRepository.findByUserId(patientUser.getId())
                .orElseGet(() -> HealthSummary.builder()
                        .user(finalUser)
                        .build());
    }
}
