package com.service3.management;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import lombok.Data;

@Entity
@Data
public class Payment {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    private Long bookingId;
    private String type; // Consultation, Medicine, Surgery
    private Double amount;
    private String description;
    private String status = "PENDING"; // PENDING, PAID, REFUNDED
}
