package com.jntua.clms.service;

import com.jntua.clms.entity.*;
import com.jntua.clms.entity.Transaction.Status;
import com.jntua.clms.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.Optional;

@Service
public class TransactionService {

    @Autowired private TransactionRepository transactionRepository;
    @Autowired private BookRepository bookRepository;
    @Autowired private UserRepository userRepository;
    @Autowired private ReservationRepository reservationRepository;

    @Value("${library.lending.period.days:15}") private int lendingPeriodDays;
    @Value("${library.fine.per.day:1.0}") private double finePerDay;
    @Value("${library.lost.damaged.penalty:300.0}") private double lostDamagedPenalty;

    // Step 1: Student requests to borrow a book
    @Transactional
    public Transaction requestBorrow(Long userId, Long bookId) {
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new RuntimeException("User not found"));
        Book book = bookRepository.findById(bookId)
            .orElseThrow(() -> new RuntimeException("Book not found"));

        if (book.getAvailableCopies() < 1)
            throw new RuntimeException("No copies available. Please reserve the book.");

        long activeCount = transactionRepository.countActiveByUser(user);
        if (activeCount >= user.getMaxBooksAllowed())
            throw new RuntimeException("Borrowing limit reached (" + user.getMaxBooksAllowed() + " books).");

        boolean alreadyBorrowing = transactionRepository.findByUserAndBookAndStatusIn(
            user, book, List.of(Status.PENDING_ISSUE, Status.ACTIVE)).isPresent();
        if (alreadyBorrowing)
            throw new RuntimeException("You already have a pending/active borrow for this book.");

        Transaction txn = new Transaction();
        txn.setUser(user);
        txn.setBook(book);
        txn.setStatus(Status.PENDING_ISSUE);
        txn.setRequestDate(LocalDate.now());
        return transactionRepository.save(txn);
    }

    // Step 2: Librarian confirms issue
    @Transactional
    public Transaction confirmIssue(Long txnId, Long librarianId) {
        Transaction txn = transactionRepository.findById(txnId)
            .orElseThrow(() -> new RuntimeException("Transaction not found"));

        if (txn.getStatus() != Status.PENDING_ISSUE)
            throw new RuntimeException("Transaction is not in PENDING_ISSUE state.");

        Book book = txn.getBook();
        if (book.getAvailableCopies() < 1)
            throw new RuntimeException("No copies available to issue.");

        book.setAvailableCopies(book.getAvailableCopies() - 1);
        bookRepository.save(book);

        txn.setStatus(Status.ACTIVE);
        txn.setIssueDate(LocalDate.now());
        txn.setDueDate(LocalDate.now().plusDays(lendingPeriodDays));
        txn.setConfirmedBy(librarianId);
        txn.setConfirmedAt(LocalDateTime.now());
        return transactionRepository.save(txn);
    }

    // Student requests return
    @Transactional
    public Transaction requestReturn(Long txnId) {
        Transaction txn = transactionRepository.findById(txnId)
            .orElseThrow(() -> new RuntimeException("Transaction not found"));
        if (txn.getStatus() != Status.ACTIVE)
            throw new RuntimeException("Book is not currently active.");
        txn.setStatus(Status.RETURN_REQUESTED);
        return transactionRepository.save(txn);
    }

    // Librarian confirms return
    @Transactional
    public Transaction confirmReturn(Long txnId, Long librarianId) {
        Transaction txn = transactionRepository.findById(txnId)
            .orElseThrow(() -> new RuntimeException("Transaction not found"));
        if (txn.getStatus() != Status.RETURN_REQUESTED && txn.getStatus() != Status.ACTIVE)
            throw new RuntimeException("Transaction is not in a returnable state.");

        LocalDate today = LocalDate.now();
        LocalDate due = txn.getDueDate();
        BigDecimal fine = BigDecimal.ZERO;
        if (today.isAfter(due)) {
            long overdueDays = ChronoUnit.DAYS.between(due, today);
            fine = BigDecimal.valueOf(overdueDays * finePerDay);
        }

        txn.setReturnDate(today);
        txn.setStatus(Status.RETURNED);
        txn.setCalculatedFine(fine);
        txn.setConfirmedBy(librarianId);
        txn.setConfirmedAt(LocalDateTime.now());

        Book book = txn.getBook();
        book.setAvailableCopies(book.getAvailableCopies() + 1);
        bookRepository.save(book);

        // Notify next in reservation queue
        List<Reservation> queue = reservationRepository
            .findByBookAndStatusOrderByQueuePositionAsc(book, Reservation.Status.PENDING);
        if (!queue.isEmpty()) {
            Reservation next = queue.get(0);
            next.setStatus(Reservation.Status.READY_FOR_PICKUP);
            next.setNotifiedAt(LocalDateTime.now());
            reservationRepository.save(next);
        }

        return transactionRepository.save(txn);
    }

    // Mark as lost or damaged
    @Transactional
    public Transaction markLostOrDamaged(Long txnId, String condition, Long librarianId) {
        Transaction txn = transactionRepository.findById(txnId)
            .orElseThrow(() -> new RuntimeException("Transaction not found"));

        LocalDate today = LocalDate.now();
        LocalDate due = txn.getDueDate();
        BigDecimal lateFine = BigDecimal.ZERO;
        if (due != null && today.isAfter(due)) {
            long days = ChronoUnit.DAYS.between(due, today);
            lateFine = BigDecimal.valueOf(days * finePerDay);
        }

        txn.setStatus("lost".equalsIgnoreCase(condition) ? Status.LOST : Status.DAMAGED);
        txn.setReturnDate(today);
        txn.setCalculatedFine(lateFine);
        txn.setLostDamagedCharge(BigDecimal.valueOf(lostDamagedPenalty));
        txn.setConfirmedBy(librarianId);
        txn.setConfirmedAt(LocalDateTime.now());

        Book book = txn.getBook();
        book.setTotalCopies(book.getTotalCopies() - 1);
        if (book.getAvailableCopies() > book.getTotalCopies())
            book.setAvailableCopies(book.getTotalCopies());
        bookRepository.save(book);

        return transactionRepository.save(txn);
    }

    // Adjust fine (admin waiver)
    @Transactional
    public Transaction adjustFine(Long txnId, BigDecimal adjustedAmount, String reason, Long adminId) {
        Transaction txn = transactionRepository.findById(txnId)
            .orElseThrow(() -> new RuntimeException("Transaction not found"));
        txn.setAdjustedFine(adjustedAmount);
        txn.setWaiverReason(reason);
        txn.setAdjustedBy(adminId);
        return transactionRepository.save(txn);
    }

    public List<Transaction> getActiveByUser(User user) {
        return transactionRepository.findActiveByUser(user);
    }

    public List<Transaction> getHistoryByUser(User user) {
        return transactionRepository.findByUserAndStatus(user, Status.RETURNED);
    }

    public List<Transaction> getOverdueTransactions() {
        return transactionRepository.findOverdueTransactions(LocalDate.now());
    }

    public List<Transaction> getAllPendingOrActive() {
        return transactionRepository.findAllPendingOrActive();
    }

    public Optional<Transaction> findById(Long id) {
        return transactionRepository.findById(id);
    }
}
