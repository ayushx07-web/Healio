package com.ambula.patient;

import com.ambula.user.User;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "health_summaries")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class HealthSummary {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne
    @JoinColumn(name = "user_id", unique = true)
    private User user;

    private String bloodGroup;
    private String knownConditions;
    private String currentMedications;
}
