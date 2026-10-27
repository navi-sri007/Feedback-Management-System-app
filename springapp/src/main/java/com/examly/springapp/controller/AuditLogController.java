package com.examly.springapp.controller;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.examly.springapp.dto.AuditLogDTO;
import com.examly.springapp.model.AuditLog;
import com.examly.springapp.repository.AuditLogRepository;

@RestController
@RequestMapping("/api/v1/audit-logs")
@CrossOrigin("*")
public class AuditLogController {

    @Autowired
    private AuditLogRepository auditLogRepository;

    @GetMapping
    public ResponseEntity<List<AuditLogDTO>> getAllAuditLogs() {
        List<AuditLog> auditLogs = auditLogRepository.findAll();
        List<AuditLogDTO> dtos = auditLogs.stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
        return ResponseEntity.ok(dtos);
    }

    @GetMapping("/entity/{entityId}/{entityType}")
    public ResponseEntity<List<AuditLogDTO>> getAuditLogsForEntity(
            @PathVariable Long entityId,
            @PathVariable String entityType) {
        List<AuditLog> auditLogs = auditLogRepository.findByEntityIdAndEntityType(entityId, entityType);
        List<AuditLogDTO> dtos = auditLogs.stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
        return ResponseEntity.ok(dtos);
    }

    @GetMapping("/admin/{adminId}")
    public ResponseEntity<List<AuditLogDTO>> getAuditLogsByAdmin(@PathVariable Long adminId) {
        List<AuditLog> auditLogs = auditLogRepository.findByAdminId(adminId);
        List<AuditLogDTO> dtos = auditLogs.stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
        return ResponseEntity.ok(dtos);
    }

    private AuditLogDTO convertToDTO(AuditLog auditLog) {
        AuditLogDTO dto = new AuditLogDTO();
        dto.setId(auditLog.getId());
        dto.setAction(auditLog.getAction());
        dto.setEntityType(auditLog.getEntityType());
        dto.setEntityId(auditLog.getEntityId());
        dto.setTimestamp(auditLog.getTimestamp());
        dto.setDetails(auditLog.getDetails());
        
        if (auditLog.getAdmin() != null) {
            dto.setAdminUsername(auditLog.getAdmin().getUsername());
            dto.setAdminEmail(auditLog.getAdmin().getEmail());
        }
        
        return dto;
    }
}