package com.ambula.booking;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.List;

public interface BookingRepository extends JpaRepository<Booking, Long> {
    boolean existsBySlotId(Long slotId);

    @Query("SELECT b FROM Booking b JOIN FETCH b.slot s JOIN FETCH s.doctor d JOIN FETCH d.user " +
           "WHERE d.user.id = :doctorUserId AND s.startTime >= :startOfDay AND s.startTime <= :endOfDay " +
           "ORDER BY s.startTime")
    List<Booking> findTodaysBookingsForDoctor(
            @Param("doctorUserId") Long doctorUserId,
            @Param("startOfDay") LocalDateTime startOfDay,
            @Param("endOfDay") LocalDateTime endOfDay
    );

    @Query("SELECT b FROM Booking b JOIN FETCH b.slot s JOIN FETCH s.doctor d JOIN FETCH d.user " +
           "WHERE d.user.id = :doctorUserId AND s.startTime >= :start " +
           "ORDER BY s.startTime")
    List<Booking> findUpcomingBookingsForDoctor(
            @Param("doctorUserId") Long doctorUserId,
            @Param("start") LocalDateTime start
    );
}
