package com.jntua.clms.repository;

import com.jntua.clms.entity.Transaction;
import com.jntua.clms.entity.Transaction.Status;
import com.jntua.clms.entity.User;
import com.jntua.clms.entity.Book;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface TransactionRepository extends JpaRepository<Transaction, Long> {

    List<Transaction> findByUser(User user);
    List<Transaction> findByStatus(Status status);
    List<Transaction> findByUserAndStatus(User user, Status status);

    @Query("SELECT t FROM Transaction t WHERE t.user = :user AND t.status IN ('PENDING_ISSUE','ACTIVE','RETURN_REQUESTED','PENDING_RENEWAL')")
    List<Transaction> findActiveByUser(@Param("user") User user);

    @Query("SELECT COUNT(t) FROM Transaction t WHERE t.user = :user AND t.status IN ('PENDING_ISSUE','ACTIVE','RETURN_REQUESTED','PENDING_RENEWAL')")
    long countActiveByUser(@Param("user") User user);

    @Query("SELECT t FROM Transaction t WHERE t.status = 'ACTIVE' AND t.dueDate < :today")
    List<Transaction> findOverdueTransactions(@Param("today") LocalDate today);

    Optional<Transaction> findByUserAndBookAndStatusIn(User user, Book book, List<Status> statuses);

    @Query("SELECT t FROM Transaction t WHERE t.status IN ('PENDING_ISSUE','ACTIVE','RETURN_REQUESTED','PENDING_RENEWAL') ORDER BY t.createdAt DESC")
    List<Transaction> findAllPendingOrActive();
}
