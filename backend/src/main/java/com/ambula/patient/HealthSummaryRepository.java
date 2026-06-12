package com.ambula.patient;

import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface HealthSummaryRepository extends JpaRepository<HealthSummary, Long> {
    Optional<HealthSummary> findByUserEmail(String email);
    Optional<HealthSummary> findByUserId(Long userId);
}
