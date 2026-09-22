package com.jntua.clms.service;

import com.jntua.clms.entity.*;
import com.jntua.clms.entity.Reservation.Status;
import com.jntua.clms.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;

@Service
public class ReservationService {

    @Autowired private ReservationRepository reservationRepository;
    @Autowired private BookRepository bookRepository;
    @Autowired private UserRepository userRepository;

    @Transactional
    public Reservation reserveBook(Long userId, Long bookId) {
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new RuntimeException("User not found"));
        Book book = bookRepository.findById(bookId)
            .orElseThrow(() -> new RuntimeException("Book not found"));

        if (book.getAvailableCopies() > 0)
            throw new RuntimeException("Book is available for direct borrowing.");

        boolean alreadyReserved = reservationRepository.existsByUserAndBookAndStatusIn(
            user, book, List.of(Status.PENDING, Status.READY_FOR_PICKUP));
        if (alreadyReserved)
            throw new RuntimeException("You already have an active reservation for this book.");

        int queuePos = reservationRepository.findMaxQueuePositionForBook(book).orElse(0) + 1;

        Reservation res = new Reservation();
        res.setUser(user);
        res.setBook(book);
        res.setQueuePosition(queuePos);
        res.setStatus(Status.PENDING);
        return reservationRepository.save(res);
    }

    @Transactional
    public void cancelReservation(Long reservationId, Long userId) {
        Reservation res = reservationRepository.findById(reservationId)
            .orElseThrow(() -> new RuntimeException("Reservation not found"));
        if (!res.getUser().getId().equals(userId))
            throw new RuntimeException("Unauthorized cancellation.");
        res.setStatus(Status.CANCELLED);
        reservationRepository.save(res);
    }

    public List<Reservation> getActiveByUser(User user) {
        return reservationRepository.findActiveByUser(user);
    }

    public List<Reservation> getQueueForBook(Book book) {
        return reservationRepository.findByBookAndStatusOrderByQueuePositionAsc(book, Status.PENDING);
    }
}
