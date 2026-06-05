package com.ambula.user;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "users")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String name;

    @Column(unique = true)
    private String email;

    private String phone;

    private String passwordHash;

    @Enumerated(EnumType.STRING)
    private Role role;

    public enum Role { PATIENT, DOCTOR }
}
