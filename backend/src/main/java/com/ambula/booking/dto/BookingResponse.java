package com.ambula.booking.dto;

import lombok.*;
import java.time.LocalDateTime;

@Data @Builder
public class BookingResponse {
    private Long bookingId;
    private String bookingRef;
    private String patientName;
    private LocalDateTime slotStart;
    private String doctorName;
    private String specialization;
    private String status;
}
