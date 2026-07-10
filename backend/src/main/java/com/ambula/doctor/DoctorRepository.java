package com.ambula.doctor;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.util.List;
import java.util.Optional;

public interface DoctorRepository extends JpaRepository<Doctor, Long> {

    @Query("SELECT d FROM Doctor d WHERE " +
           "LOWER(d.specialization) LIKE LOWER(:specialization) AND " +
           "LOWER(d.location) LIKE LOWER(:location)")
    List<Doctor> search(@Param("specialization") String specialization,
                        @Param("location") String location);

    Optional<Doctor> findByUserId(Long userId);
}
