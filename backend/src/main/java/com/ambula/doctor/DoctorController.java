package com.ambula.doctor;

import com.ambula.booking.Booking;
import com.ambula.booking.BookingRepository;
import com.ambula.slot.Slot;
import com.ambula.slot.SlotRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/api/doctors")
@RequiredArgsConstructor
public class DoctorController {

    private final DoctorService doctorService;
    private final SlotRepository slotRepository;
    private final BookingRepository bookingRepository;

    @GetMapping
    public ResponseEntity<List<Doctor>> search(
            @RequestParam(required = false) String specialization,
            @RequestParam(required = false) String location) {
        return ResponseEntity.ok(doctorService.search(specialization, location));
    }

    @GetMapping("/{id}")
    public ResponseEntity<Doctor> getProfile(@PathVariable Long id) {
        return ResponseEntity.ok(doctorService.getById(id));
    }

    @GetMapping("/{id}/slots")
    public ResponseEntity<List<Slot>> getAvailableSlots(@PathVariable Long id) {
        LocalDateTime now = LocalDateTime.now();
        LocalDateTime plusSeven = now.plusDays(7);
        return ResponseEntity.ok(slotRepository.findAvailableSlots(id, now, plusSeven));
    }

    @GetMapping("/dashboard/appointments")
    public ResponseEntity<List<Booking>> getAppointments(
            @RequestParam(defaultValue = "today") String range,
            Authentication auth) {
        Long doctorUserId = doctorService.getUserIdFromEmail(auth.getName());
        LocalDateTime now = LocalDateTime.now();

        if ("tomorrow".equalsIgnoreCase(range)) {
            LocalDateTime startOfTomorrow = now.plusDays(1).with(java.time.LocalTime.MIN);
            LocalDateTime endOfTomorrow = now.plusDays(1).with(java.time.LocalTime.MAX);
            return ResponseEntity.ok(bookingRepository.findTodaysBookingsForDoctor(
                    doctorUserId, startOfTomorrow, endOfTomorrow));
        } else if ("upcoming".equalsIgnoreCase(range)) {
            LocalDateTime startOfToday = now.with(java.time.LocalTime.MIN);
            return ResponseEntity.ok(bookingRepository.findUpcomingBookingsForDoctor(
                    doctorUserId, startOfToday));
        } else { // default is "today"
            LocalDateTime startOfToday = now.with(java.time.LocalTime.MIN);
            LocalDateTime endOfToday = now.with(java.time.LocalTime.MAX);
            return ResponseEntity.ok(bookingRepository.findTodaysBookingsForDoctor(
                    doctorUserId, startOfToday, endOfToday));
        }
    }

    @PostMapping("/slots/{slotId}/block")
    public ResponseEntity<?> blockSlot(@PathVariable Long slotId, Authentication auth) {
        doctorService.blockSlot(slotId, auth.getName());
        return ResponseEntity.ok().build();
    }

    @PostMapping("/slots/{slotId}/unblock")
    public ResponseEntity<?> unblockSlot(@PathVariable Long slotId, Authentication auth) {
        doctorService.unblockSlot(slotId, auth.getName());
        return ResponseEntity.ok().build();
    }
}
