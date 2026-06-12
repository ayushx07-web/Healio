package com.ambula.consultation.dto;

import lombok.Data;

@Data
public class ConsultationRequest {
    private String diagnosisNotes;
    private String prescription;
}
