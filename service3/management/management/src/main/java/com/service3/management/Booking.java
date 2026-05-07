package com.service3.management;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import lombok.Data;
import java.time.LocalDateTime;

@Entity
@Data
public class Booking {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    private Long patientId;
    private Long roomId;
    private LocalDateTime bookingDate = LocalDateTime.now();
    private String status = "BOOKED"; // BOOKED, CHECKED_OUT, CANCELLED
}
