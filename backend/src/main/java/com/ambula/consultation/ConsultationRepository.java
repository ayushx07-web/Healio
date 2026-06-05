package com.ambula.consultation;

import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface ConsultationRepository extends JpaRepository<Consultation, Long> {
    Optional<Consultation> findByBookingId(Long bookingId);
}
