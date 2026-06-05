package com.ambula.booking;

import com.ambula.slot.Slot;
import com.ambula.user.User;
import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "bookings")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Booking {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne
    @JoinColumn(name = "slot_id", unique = true)
    private Slot slot;

    private String patientName;
    private Integer patientAge;
    private String patientPhone;

    @ManyToOne
    @JoinColumn(name = "patient_user_id")
    private User patientUser;

    @Column(unique = true)
    private String bookingRef;

    @Builder.Default
    private String status = "CONFIRMED";

    @Builder.Default
    private LocalDateTime createdAt = LocalDateTime.now();
}
