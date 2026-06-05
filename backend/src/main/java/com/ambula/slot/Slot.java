package com.ambula.slot;

import com.ambula.doctor.Doctor;
import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "slots")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Slot {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "doctor_id")
    private Doctor doctor;

    private LocalDateTime startTime;
    private LocalDateTime endTime;
    @Builder.Default
    private Boolean isBlocked = false;
}
