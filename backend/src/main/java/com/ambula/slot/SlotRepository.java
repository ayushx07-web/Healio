package com.ambula.slot;

import jakarta.persistence.LockModeType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

public interface SlotRepository extends JpaRepository<Slot, Long> {

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("SELECT s FROM Slot s WHERE s.id = :id")
    Optional<Slot> findByIdWithLock(@Param("id") Long id);

    @Query("SELECT s FROM Slot s LEFT JOIN FETCH s.doctor d " +
           "WHERE d.id = :doctorId AND s.isBlocked = false " +
           "AND s.startTime >= :from AND s.startTime <= :to " +
           "AND s.id NOT IN (SELECT b.slot.id FROM Booking b WHERE b.status = 'CONFIRMED') " +
           "ORDER BY s.startTime")
    List<Slot> findAvailableSlots(@Param("doctorId") Long doctorId,
                                   @Param("from") LocalDateTime from,
                                   @Param("to") LocalDateTime to);

    @Query("SELECT s FROM Slot s WHERE s.doctor.id = :doctorId " +
           "AND s.startTime > :after AND s.isBlocked = false " +
           "AND s.id NOT IN (SELECT b.slot.id FROM Booking b WHERE b.status = 'CONFIRMED') " +
           "ORDER BY s.startTime")
    List<Slot> findNextAvailableSlots(@Param("doctorId") Long doctorId,
                                       @Param("after") LocalDateTime after);
}
