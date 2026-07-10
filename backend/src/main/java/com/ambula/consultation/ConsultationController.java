package com.ambula.consultation;

import com.ambula.consultation.dto.ConsultationRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/consultations")
@RequiredArgsConstructor
public class ConsultationController {

    private final ConsultationService consultationService;

    @PostMapping("/{bookingId}")
    public ResponseEntity<Consultation> save(
            @PathVariable Long bookingId,
            @RequestBody ConsultationRequest request) {
        return ResponseEntity.ok(consultationService.save(bookingId, request));
    }

    @GetMapping("/my-prescriptions")
    public ResponseEntity<List<Consultation>> getMyPrescriptions(Authentication auth) {
        return ResponseEntity.ok(consultationService.getMyConsultations(auth.getName()));
    }

    @GetMapping("/{bookingId}")
    public ResponseEntity<Consultation> get(@PathVariable Long bookingId) {
        return ResponseEntity.ok(consultationService.getByBookingId(bookingId));
    }
}
