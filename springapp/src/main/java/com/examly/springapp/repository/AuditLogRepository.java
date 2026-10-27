package com.examly.springapp.repository;

import com.examly.springapp.model.AuditLog;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AuditLogRepository extends JpaRepository<AuditLog, Long> {

    List<AuditLog> findByAdminId(Long adminId);

    List<AuditLog> findByEntityIdAndEntityType(Long entityId, String entityType);
}