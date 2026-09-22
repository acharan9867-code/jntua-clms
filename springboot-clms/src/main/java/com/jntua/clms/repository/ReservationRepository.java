package com.jntua.clms.repository;

import com.jntua.clms.entity.Reservation;
import com.jntua.clms.entity.Reservation.Status;
import com.jntua.clms.entity.User;
import com.jntua.clms.entity.Book;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface ReservationRepository extends JpaRepository<Reservation, Long> {

    List<Reservation> findByUser(User user);
    List<Reservation> findByUserAndStatus(User user, Status status);
    List<Reservation> findByBookAndStatusOrderByQueuePositionAsc(Book book, Status status);

    @Query("SELECT MAX(r.queuePosition) FROM Reservation r WHERE r.book = :book AND r.status IN ('PENDING','READY_FOR_PICKUP')")
    Optional<Integer> findMaxQueuePositionForBook(@Param("book") Book book);

    boolean existsByUserAndBookAndStatusIn(User user, Book book, List<Status> statuses);

    @Query("SELECT r FROM Reservation r WHERE r.user = :user AND r.status IN ('PENDING','READY_FOR_PICKUP')")
    List<Reservation> findActiveByUser(@Param("user") User user);
}
