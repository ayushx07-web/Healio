package com.ambula.consultation;

import com.ambula.booking.Booking;
import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "consultations")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Consultation {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne
    @JoinColumn(name = "booking_id", unique = true)
    private Booking booking;

    private String diagnosisNotes;
    private String prescription;

    @Builder.Default
    private LocalDateTime createdAt = LocalDateTime.now();
}
