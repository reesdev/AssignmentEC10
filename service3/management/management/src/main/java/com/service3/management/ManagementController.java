package com.service3.management;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/manage")
public class ManagementController {

    @Autowired private RoomRepository roomRepository;
    @Autowired private BookingRepository bookingRepository;
    @Autowired private PaymentRepository paymentRepository;


    @GetMapping("/rooms")
    public List<Room> getAllRooms() {
        return roomRepository.findAll();
    }

    @PostMapping("/rooms")
    public Room createRoom(@RequestBody Room room) {
        return roomRepository.save(room);
    }


    @GetMapping("/bookings")
    public List<Booking> getAllBookings() {
        return bookingRepository.findAll();
    }

    @PostMapping("/bookings")
    public Booking createBooking(@RequestBody Booking booking) {
        return bookingRepository.save(booking);
    }

    @GetMapping("/bookings/{id}")
    public Booking getBooking(@PathVariable Long id) {
        return bookingRepository.findById(id).orElse(null);
    }

    @PutMapping("/bookings/{id}/checkout")
    public Booking checkoutBooking(@PathVariable Long id) {
        Booking booking = bookingRepository.findById(id).orElse(null);
        if (booking == null) return null;

        // Cek apakah sudah ada pembayaran untuk booking ini
        List<Payment> payments = paymentRepository.findAll(); 
        boolean isPaid = payments.stream()
            .anyMatch(p -> p.getBookingId().equals(id));

        if (!isPaid) {
            throw new RuntimeException("Payment required before checkout!");
        }

        booking.setStatus("CHECKED_OUT");
        return bookingRepository.save(booking);
    }

    @PutMapping("/bookings/{id}/cancel")
    public Booking cancelBooking(@PathVariable Long id) {
        Booking booking = bookingRepository.findById(id).orElse(null);
        if (booking != null) {
            booking.setStatus("CANCELLED");
            return bookingRepository.save(booking);
        }
        return null;
    }


    @GetMapping("/payments")
    public List<Payment> getAllPayments() {
        return paymentRepository.findAll();
    }

    @PostMapping("/payments")
    public Payment processPayment(@RequestBody Payment payment) {
        return paymentRepository.save(payment);
    }

    @GetMapping("/payments/{id}")
    public Payment getPayment(@PathVariable Long id) {
        return paymentRepository.findById(id).orElse(null);
    }
}
