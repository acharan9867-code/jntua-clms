package com.jntua.clms.controller;

import com.jntua.clms.entity.*;
import com.jntua.clms.repository.*;
import com.jntua.clms.service.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;
import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api")
public class ApiRestController {

    @Autowired private BookService bookService;
    @Autowired private UserRepository userRepository;
    @Autowired private TransactionService transactionService;
    @Autowired private ReservationService reservationService;
    @Autowired private BookRequestRepository bookRequestRepository;
    @Autowired private TransactionRepository transactionRepository;

    // ── Books ─────────────────────────────────────────────────────────────────
    @GetMapping("/books")
    public ResponseEntity<List<Book>> getBooks(@RequestParam(required = false) String keyword,
                                               @RequestParam(required = false) Long categoryId) {
        List<Book> books = (keyword != null && !keyword.isBlank())
            ? bookService.searchBooks(keyword)
            : (categoryId != null ? bookService.getBooksByCategory(categoryId) : bookService.getAllActiveBooks());
        return ResponseEntity.ok(books);
    }

    @GetMapping("/books/{id}")
    public ResponseEntity<Book> getBook(@PathVariable Long id) {
        return bookService.findById(id)
            .map(ResponseEntity::ok)
            .orElse(ResponseEntity.notFound().build());
    }

    // ── Transactions ──────────────────────────────────────────────────────────
    @PostMapping("/transactions/request-borrow")
    public ResponseEntity<?> requestBorrow(@RequestBody Map<String, Long> body,
                                           @AuthenticationPrincipal UserDetails ud) {
        try {
            User user = userRepository.findByEmail(ud.getUsername())
                .orElseThrow(() -> new RuntimeException("User not found"));
            Transaction txn = transactionService.requestBorrow(user.getId(), body.get("bookId"));
            return ResponseEntity.ok(Map.of("success", true, "transactionId", txn.getId(),
                "status", txn.getStatus(), "message", "Borrow request submitted."));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("success", false, "message", e.getMessage()));
        }
    }

    @PostMapping("/transactions/confirm-issue/{txnId}")
    public ResponseEntity<?> confirmIssue(@PathVariable Long txnId,
                                          @AuthenticationPrincipal UserDetails ud) {
        try {
            User admin = userRepository.findByEmail(ud.getUsername())
                .orElseThrow(() -> new RuntimeException("User not found"));
            Transaction t = transactionService.confirmIssue(txnId, admin.getId());
            return ResponseEntity.ok(Map.of("success", true, "dueDate", t.getDueDate(),
                "message", "Book issued. Due: " + t.getDueDate()));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("success", false, "message", e.getMessage()));
        }
    }

    @PostMapping("/transactions/request-return/{txnId}")
    public ResponseEntity<?> requestReturn(@PathVariable Long txnId,
                                           @AuthenticationPrincipal UserDetails ud) {
        try {
            Transaction t = transactionService.requestReturn(txnId);
            return ResponseEntity.ok(Map.of("success", true, "status", t.getStatus()));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("success", false, "message", e.getMessage()));
        }
    }

    @PostMapping("/transactions/confirm-return/{txnId}")
    public ResponseEntity<?> confirmReturn(@PathVariable Long txnId,
                                           @AuthenticationPrincipal UserDetails ud) {
        try {
            User admin = userRepository.findByEmail(ud.getUsername())
                .orElseThrow(() -> new RuntimeException("User not found"));
            Transaction t = transactionService.confirmReturn(txnId, admin.getId());
            return ResponseEntity.ok(Map.of("success", true, "fine", t.getCalculatedFine(),
                "message", "Book returned. Fine: ₹" + t.getCalculatedFine()));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("success", false, "message", e.getMessage()));
        }
    }

    @GetMapping("/transactions/my")
    public ResponseEntity<?> myTransactions(@AuthenticationPrincipal UserDetails ud) {
        User user = userRepository.findByEmail(ud.getUsername())
            .orElseThrow(() -> new RuntimeException("User not found"));
        return ResponseEntity.ok(Map.of(
            "active", transactionService.getActiveByUser(user),
            "history", transactionService.getHistoryByUser(user)
        ));
    }

    @GetMapping("/transactions/overdue")
    public ResponseEntity<List<Transaction>> overdue() {
        return ResponseEntity.ok(transactionService.getOverdueTransactions());
    }

    // ── Reservations ──────────────────────────────────────────────────────────
    @PostMapping("/reservations/reserve")
    public ResponseEntity<?> reserve(@RequestBody Map<String, Long> body,
                                     @AuthenticationPrincipal UserDetails ud) {
        try {
            User user = userRepository.findByEmail(ud.getUsername())
                .orElseThrow(() -> new RuntimeException("User not found"));
            Reservation res = reservationService.reserveBook(user.getId(), body.get("bookId"));
            return ResponseEntity.ok(Map.of("success", true, "queuePosition", res.getQueuePosition()));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("success", false, "message", e.getMessage()));
        }
    }

    // ── Users ─────────────────────────────────────────────────────────────────
    @GetMapping("/users/me")
    public ResponseEntity<?> me(@AuthenticationPrincipal UserDetails ud) {
        return userRepository.findByEmail(ud.getUsername())
            .map(u -> ResponseEntity.ok(Map.of(
                "id", u.getId(), "name", u.getName(), "email", u.getEmail(),
                "memberId", u.getMemberId(), "role", u.getRole(), "department", u.getDepartment())))
            .orElse(ResponseEntity.notFound().build());
    }
}
