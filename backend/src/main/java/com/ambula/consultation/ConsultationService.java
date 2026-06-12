package com.ambula.consultation;

import com.ambula.booking.Booking;
import com.ambula.booking.BookingRepository;
import com.ambula.consultation.dto.ConsultationRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class ConsultationService {

    private final ConsultationRepository consultationRepository;
    private final BookingRepository bookingRepository;

    public Consultation save(Long bookingId, ConsultationRequest request) {
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new RuntimeException("Booking not found"));

        Consultation consultation = consultationRepository.findByBookingId(bookingId)
                .orElse(Consultation.builder()
                        .booking(booking)
                        .build());

        consultation.setDiagnosisNotes(request.getDiagnosisNotes());
        consultation.setPrescription(request.getPrescription());

        return consultationRepository.save(consultation);
    }

    public Consultation getByBookingId(Long bookingId) {
        return consultationRepository.findByBookingId(bookingId)
                .orElse(null);
    }
}
