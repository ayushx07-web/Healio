package com.ambula.consultation;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.util.List;
import java.util.Optional;

public interface ConsultationRepository extends JpaRepository<Consultation, Long> {
    Optional<Consultation> findByBookingId(Long bookingId);

    @Query("SELECT c FROM Consultation c JOIN FETCH c.booking b JOIN FETCH b.slot s " +
           "JOIN FETCH s.doctor d JOIN FETCH d.user " +
           "WHERE b.patientUser.email = :email ORDER BY c.createdAt DESC")
    List<Consultation> findAllByPatientEmail(@Param("email") String email);
}
