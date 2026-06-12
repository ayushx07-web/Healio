package com.ambula.booking.dto;

import jakarta.validation.constraints.*;
import lombok.Data;

@Data
public class BookingRequest {

    @NotNull
    private Long slotId;

    @NotBlank
    private String patientName;

    @Min(1) @Max(120)
    private int patientAge;

    @NotBlank
    @Pattern(regexp = "^[6-9]\\d{9}$", message = "Enter a valid 10-digit Indian mobile number")
    private String patientPhone;
}
