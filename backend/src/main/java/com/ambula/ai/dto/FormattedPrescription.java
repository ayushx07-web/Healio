package com.ambula.ai.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class FormattedPrescription {
    private String diagnosis;
    private List<MedicationItem> medications;
    private String advice;
    private String followUp;
    private String patientFriendlySummary;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class MedicationItem {
        private String name;
        private String dosage;
        private String frequency;
        private String duration;
    }
}
