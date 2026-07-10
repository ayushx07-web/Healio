package com.ambula.booking;

import com.ambula.booking.dto.BookingRequest;
import com.ambula.booking.dto.BookingResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/bookings")
@RequiredArgsConstructor
public class BookingController {

    private final BookingService bookingService;

    @PostMapping
    public ResponseEntity<?> createBooking(
            @Valid @RequestBody BookingRequest request,
            Authentication auth) {
        try {
            if (auth != null) {
                boolean isPatient = auth.getAuthorities().stream()
                        .anyMatch(a -> a.getAuthority().equals("ROLE_PATIENT"));
                if (!isPatient) {
                    return ResponseEntity.status(403).body(Map.of(
                            "message", "Doctor accounts can't book appointments."
                    ));
                }
            }
            String userEmail = (auth != null) ? auth.getName() : null;
            BookingResponse response = bookingService.bookSlot(request, userEmail);
            return ResponseEntity.ok(response);
        } catch (SlotAlreadyTakenException e) {
            Map<String, Object> error = new java.util.HashMap<>();
            error.put("error", "SLOT_TAKEN");
            error.put("message", "This slot was just booked by someone else.");
            if (e.getNextAvailableSlot() != null) {
                error.put("nextAvailableSlotId", e.getNextAvailableSlot().getId());
                error.put("nextAvailableSlotTime", e.getNextAvailableSlot().getStartTime());
            }
            return ResponseEntity.status(409).body(error);
        }
    }
}
