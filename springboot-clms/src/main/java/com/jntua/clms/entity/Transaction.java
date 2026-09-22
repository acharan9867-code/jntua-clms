package com.jntua.clms.entity;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "transactions")
public class Transaction {

    public enum Status {
        PENDING_ISSUE, ACTIVE, RETURN_REQUESTED, RETURNED, LOST, DAMAGED, PENDING_RENEWAL
    }

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "book_id", nullable = false)
    private Book book;

    private LocalDate requestDate;
    private LocalDate issueDate;
    private LocalDate dueDate;
    private LocalDate returnDate;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Status status = Status.PENDING_ISSUE;

    @Column(precision = 10, scale = 2)
    private BigDecimal calculatedFine = BigDecimal.ZERO;

    @Column(precision = 10, scale = 2)
    private BigDecimal lostDamagedCharge = BigDecimal.ZERO;

    @Column(precision = 10, scale = 2)
    private BigDecimal adjustedFine;

    private String waiverReason;
    private Long adjustedBy;

    @Column(precision = 10, scale = 2)
    private BigDecimal totalPaid = BigDecimal.ZERO;

    private String notes;
    private Long confirmedBy;
    private LocalDateTime confirmedAt;
    private int renewalCount = 0;

    @Column(updatable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    // ── Getters & Setters ──────────────────────────────────────────────────────
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public User getUser() { return user; }
    public void setUser(User user) { this.user = user; }
    public Book getBook() { return book; }
    public void setBook(Book book) { this.book = book; }
    public LocalDate getRequestDate() { return requestDate; }
    public void setRequestDate(LocalDate requestDate) { this.requestDate = requestDate; }
    public LocalDate getIssueDate() { return issueDate; }
    public void setIssueDate(LocalDate issueDate) { this.issueDate = issueDate; }
    public LocalDate getDueDate() { return dueDate; }
    public void setDueDate(LocalDate dueDate) { this.dueDate = dueDate; }
    public LocalDate getReturnDate() { return returnDate; }
    public void setReturnDate(LocalDate returnDate) { this.returnDate = returnDate; }
    public Status getStatus() { return status; }
    public void setStatus(Status status) { this.status = status; }
    public BigDecimal getCalculatedFine() { return calculatedFine; }
    public void setCalculatedFine(BigDecimal calculatedFine) { this.calculatedFine = calculatedFine; }
    public BigDecimal getLostDamagedCharge() { return lostDamagedCharge; }
    public void setLostDamagedCharge(BigDecimal lostDamagedCharge) { this.lostDamagedCharge = lostDamagedCharge; }
    public BigDecimal getAdjustedFine() { return adjustedFine; }
    public void setAdjustedFine(BigDecimal adjustedFine) { this.adjustedFine = adjustedFine; }
    public String getWaiverReason() { return waiverReason; }
    public void setWaiverReason(String waiverReason) { this.waiverReason = waiverReason; }
    public Long getAdjustedBy() { return adjustedBy; }
    public void setAdjustedBy(Long adjustedBy) { this.adjustedBy = adjustedBy; }
    public BigDecimal getTotalPaid() { return totalPaid; }
    public void setTotalPaid(BigDecimal totalPaid) { this.totalPaid = totalPaid; }
    public String getNotes() { return notes; }
    public void setNotes(String notes) { this.notes = notes; }
    public Long getConfirmedBy() { return confirmedBy; }
    public void setConfirmedBy(Long confirmedBy) { this.confirmedBy = confirmedBy; }
    public LocalDateTime getConfirmedAt() { return confirmedAt; }
    public void setConfirmedAt(LocalDateTime confirmedAt) { this.confirmedAt = confirmedAt; }
    public int getRenewalCount() { return renewalCount; }
    public void setRenewalCount(int renewalCount) { this.renewalCount = renewalCount; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}
