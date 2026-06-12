package com.ambula.booking;

import com.ambula.slot.Slot;
import lombok.Getter;

@Getter
public class SlotAlreadyTakenException extends RuntimeException {
    private final Slot nextAvailableSlot;

    public SlotAlreadyTakenException(Slot nextAvailableSlot) {
        super("Slot is already booked");
        this.nextAvailableSlot = nextAvailableSlot;
    }
}
