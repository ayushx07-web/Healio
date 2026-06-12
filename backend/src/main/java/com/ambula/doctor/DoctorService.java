package com.ambula.doctor;

import com.ambula.user.UserRepository;
import com.ambula.slot.Slot;
import com.ambula.slot.SlotRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class DoctorService {

    private final DoctorRepository doctorRepository;
    private final UserRepository userRepository;
    private final SlotRepository slotRepository;

    public List<Doctor> search(String specialization, String location) {
        return doctorRepository.search(specialization, location);
    }

    public Doctor getById(Long id) {
        return doctorRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Doctor not found"));
    }

    public Long getUserIdFromEmail(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"))
                .getId();
    }

    public void blockSlot(Long slotId, String email) {
        Slot slot = slotRepository.findById(slotId)
                .orElseThrow(() -> new RuntimeException("Slot not found"));
        if (!slot.getDoctor().getUser().getEmail().equals(email)) {
            throw new RuntimeException("Unauthorized");
        }
        slot.setIsBlocked(true);
        slotRepository.save(slot);
    }

    public void unblockSlot(Long slotId, String email) {
        Slot slot = slotRepository.findById(slotId)
                .orElseThrow(() -> new RuntimeException("Slot not found"));
        if (!slot.getDoctor().getUser().getEmail().equals(email)) {
            throw new RuntimeException("Unauthorized");
        }
        slot.setIsBlocked(false);
        slotRepository.save(slot);
    }
}
