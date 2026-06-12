package com.ambula.booking;

import com.ambula.booking.dto.BookingRequest;
import com.ambula.booking.dto.BookingResponse;
import com.ambula.slot.Slot;
import com.ambula.slot.SlotRepository;
import com.ambula.user.User;
import com.ambula.user.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Isolation;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class BookingService {

    private final BookingRepository bookingRepository;
    private final SlotRepository slotRepository;
    private final UserRepository userRepository;

    /**
     * DOUBLE-BOOKING PREVENTION STRATEGY
     *
     * Two mechanisms work together:
     *
     * 1. PESSIMISTIC_WRITE lock via @Lock(PESSIMISTIC_WRITE) in SlotRepository
     *    - Translates to SELECT ... FOR UPDATE in PostgreSQL
     *    - Any concurrent transaction trying to lock the SAME slot row will BLOCK
     *      until this transaction commits or rolls back
     *    - This serializes concurrent requests at the DB row level
     *
     * 2. UNIQUE constraint on bookings.slot_id
     *    - Even if two transactions somehow pass the lock check simultaneously
     *      (e.g., different DB isolation levels or a bug), PostgreSQL will
     *      reject the second INSERT with a unique constraint violation
     *    - This is the safety net
     *
     * Result: Under any level of concurrency, only ONE booking per slot succeeds.
     * The second request gets a SlotAlreadyTakenException and receives the
     * next available slot from the same doctor.
     */
    @Transactional(isolation = Isolation.SERIALIZABLE)
    public BookingResponse bookSlot(BookingRequest request, String userEmail) {

        // Step 1: Acquire pessimistic write lock on the slot row
        Slot slot = slotRepository.findByIdWithLock(request.getSlotId())
                .orElseThrow(() -> new RuntimeException("Slot not found"));

        // Step 2: Check if slot is available (locked row, so no race condition)
        if (Boolean.TRUE.equals(slot.getIsBlocked())) {
            throw new SlotAlreadyTakenException(getNextAvailableSlot(slot));
        }

        boolean alreadyBooked = bookingRepository.existsBySlotId(request.getSlotId());
        if (alreadyBooked) {
            throw new SlotAlreadyTakenException(getNextAvailableSlot(slot));
        }

        // Fetch patient user if authenticated email is provided
        User patientUser = null;
        if (userEmail != null) {
            patientUser = userRepository.findByEmail(userEmail).orElse(null);
        }

        // Step 3: Create booking — only one transaction reaches here per slot
        Booking booking = Booking.builder()
                .slot(slot)
                .patientName(request.getPatientName())
                .patientAge(request.getPatientAge())
                .patientPhone(request.getPatientPhone())
                .patientUser(patientUser)
                .bookingRef(UUID.randomUUID().toString().toUpperCase().replace("-", "").substring(0, 10))
                .status("CONFIRMED")
                .build();

        Booking saved = bookingRepository.save(booking);

        return BookingResponse.builder()
                .bookingId(saved.getId())
                .bookingRef(saved.getBookingRef())
                .patientName(saved.getPatientName())
                .slotStart(slot.getStartTime())
                .doctorName(slot.getDoctor().getUser().getName())
                .specialization(slot.getDoctor().getSpecialization())
                .status("CONFIRMED")
                .build();
    }

    private Slot getNextAvailableSlot(Slot currentSlot) {
        List<Slot> nextSlots = slotRepository.findNextAvailableSlots(
                currentSlot.getDoctor().getId(),
                currentSlot.getStartTime()
        );
        return nextSlots.isEmpty() ? null : nextSlots.get(0);
    }
}
