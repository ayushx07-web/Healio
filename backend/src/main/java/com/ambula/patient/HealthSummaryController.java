package com.ambula.patient;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/patient/health-summary")
@RequiredArgsConstructor
public class HealthSummaryController {

    private final HealthSummaryService healthSummaryService;

    @GetMapping
    public ResponseEntity<HealthSummary> getMySummary(Authentication auth) {
        return ResponseEntity.ok(healthSummaryService.getByEmail(auth.getName()));
    }

    @PutMapping
    public ResponseEntity<HealthSummary> upsertSummary(
            @RequestBody HealthSummary summary,
            Authentication auth) {
        return ResponseEntity.ok(healthSummaryService.upsert(auth.getName(), summary));
    }

    @GetMapping("/by-booking/{bookingId}")
    public ResponseEntity<HealthSummary> getForDoctor(@PathVariable Long bookingId) {
        return ResponseEntity.ok(healthSummaryService.getByBookingId(bookingId));
    }
}
