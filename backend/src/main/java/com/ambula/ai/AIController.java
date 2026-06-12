package com.ambula.ai;

import com.ambula.ai.dto.FormattedPrescription;
import com.ambula.ai.dto.PrescriptionRequest;
import com.ambula.ai.dto.SpecialistSuggestion;
import com.ambula.ai.dto.SymptomRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/ai")
@RequiredArgsConstructor
public class AIController {

    private final GroqService groqService;

    @PostMapping("/suggest-specialist")
    public ResponseEntity<SpecialistSuggestion> suggestSpecialist(@RequestBody SymptomRequest request) {
        try {
            SpecialistSuggestion suggestion = groqService.suggestSpecialist(request.getSymptoms());
            return ResponseEntity.ok(suggestion);
        } catch (Exception e) {
            // Fallback: return default suggestion or throw exception depending on client configuration
            throw e;
        }
    }

    @PostMapping("/format-prescription")
    public ResponseEntity<FormattedPrescription> formatPrescription(@RequestBody PrescriptionRequest request) {
        try {
            FormattedPrescription prescription = groqService.formatPrescription(request.getRawNotes());
            return ResponseEntity.ok(prescription);
        } catch (Exception e) {
            throw e;
        }
    }
}
