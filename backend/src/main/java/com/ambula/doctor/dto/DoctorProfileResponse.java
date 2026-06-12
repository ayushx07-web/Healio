package com.ambula.doctor.dto;

import lombok.Builder;
import lombok.Data;

@Data @Builder
public class DoctorProfileResponse {
    private Long id;
    private String name;
    private String specialization;
    private String location;
    private Integer consultationFee;
    private String bio;
    private Integer experienceYears;
    private Double rating;
}
