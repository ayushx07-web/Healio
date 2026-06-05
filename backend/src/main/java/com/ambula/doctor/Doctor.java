package com.ambula.doctor;

import com.ambula.user.User;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "doctors")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Doctor {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne
    @JoinColumn(name = "user_id")
    private User user;

    private String specialization;
    private String location;
    private Integer consultationFee;
    private String bio;
    private Integer experienceYears;
    private Double rating;
}
