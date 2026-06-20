package com.ambula.booking;

import com.ambula.booking.dto.BookingRequest;
import com.ambula.booking.dto.BookingResponse;
import com.ambula.doctor.Doctor;
import com.ambula.doctor.DoctorRepository;
import com.ambula.slot.Slot;
import com.ambula.slot.SlotRepository;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.concurrent.*;

import static org.assertj.core.api.Assertions.assertThat;

@SpringBootTest
public class BookingServiceConcurrencyTest {

    @Autowired
    private BookingService bookingService;

    @Autowired
    private SlotRepository slotRepository;

    @Autowired
    private DoctorRepository doctorRepository;

    @Test
    public void testConcurrentBookingPreventsDoubleBooking() throws InterruptedException {
        // Find a doctor to associate the test slot with
        Doctor doctor = doctorRepository.findAll().stream().findFirst()
                .orElseThrow(() -> new AssertionError("No doctor found in seeded database"));

        // Create a new, unique slot specifically for this concurrency test
        Slot slot = Slot.builder()
                .doctor(doctor)
                .startTime(LocalDateTime.now().plusDays(15).withHour(10).withMinute(0).withSecond(0).withNano(0))
                .endTime(LocalDateTime.now().plusDays(15).withHour(10).withMinute(30).withSecond(0).withNano(0))
                .isBlocked(false)
                .build();
        slot = slotRepository.save(slot);

        final Long slotId = slot.getId();

        // Prepare the booking request
        BookingRequest request = new BookingRequest();
        request.setSlotId(slotId);
        request.setPatientName("Concurrent Patient");
        request.setPatientAge(30);
        request.setPatientPhone("9876543210");

        int numberOfThreads = 2;
        ExecutorService executor = Executors.newFixedThreadPool(numberOfThreads);
        CyclicBarrier barrier = new CyclicBarrier(numberOfThreads);
        List<Callable<BookingResponse>> tasks = new ArrayList<>();

        for (int i = 0; i < numberOfThreads; i++) {
            tasks.add(() -> {
                barrier.await(); // ensure both threads start bookSlot at the exact same moment
                return bookingService.bookSlot(request, null);
            });
        }

        List<Future<BookingResponse>> futures = executor.invokeAll(tasks);
        executor.shutdown();

        int successCount = 0;
        int failureCount = 0;
        Throwable bookingException = null;

        for (Future<BookingResponse> future : futures) {
            try {
                BookingResponse res = future.get();
                if (res != null) {
                    successCount++;
                }
            } catch (ExecutionException e) {
                failureCount++;
                bookingException = e.getCause();
            }
        }

        // Verify that exactly ONE thread successfully booked the slot
        assertThat(successCount).isEqualTo(1);
        assertThat(failureCount).isEqualTo(1);
        assertThat(bookingException).isInstanceOfAny(SlotAlreadyTakenException.class, org.springframework.dao.DataIntegrityViolationException.class);
    }
}
