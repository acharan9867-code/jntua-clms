package com.jntua.clms.controller;

import com.jntua.clms.entity.*;
import com.jntua.clms.entity.Transaction.Status;
import com.jntua.clms.repository.*;
import com.jntua.clms.service.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.mvc.support.RedirectAttributes;
import java.math.BigDecimal;
import java.util.List;

@Controller
@RequestMapping("/admin")
public class LibrarianController {

    @Autowired private UserRepository userRepository;
    @Autowired private BookRepository bookRepository;
    @Autowired private BookRequestRepository bookRequestRepository;
    @Autowired private CategoryRepository categoryRepository;
    @Autowired private TransactionRepository transactionRepository;
    @Autowired private TransactionService transactionService;
    @Autowired private BookService bookService;

    private User currentAdmin(UserDetails ud) {
        return userRepository.findByEmail(ud.getUsername())
                .orElseThrow(() -> new RuntimeException("Admin not found"));
    }

    // ── Dashboard ──────────────────────────────────────────────────────────────
    @GetMapping("/dashboard")
    public String dashboard(@AuthenticationPrincipal UserDetails ud, Model model) {
        List<Transaction> pending = transactionRepository.findByStatus(Status.PENDING_ISSUE);
        List<Transaction> returnReq = transactionRepository.findByStatus(Status.RETURN_REQUESTED);
        List<Transaction> active = transactionRepository.findByStatus(Status.ACTIVE);
        List<Transaction> overdue = transactionService.getOverdueTransactions();
        List<BookRequest> bookReqs = bookRequestRepository.findByStatusOrderByCreatedAtDesc(BookRequest.Status.PENDING);

        model.addAttribute("pendingIssues", pending);
        model.addAttribute("returnRequests", returnReq);
        model.addAttribute("activeLoans", active);
        model.addAttribute("overdueLoans", overdue);
        model.addAttribute("bookRequests", bookReqs);
        model.addAttribute("totalBooks", bookRepository.count());
        model.addAttribute("totalUsers", userRepository.count());
        model.addAttribute("totalActive", active.size());
        return "librarian-dashboard";
    }

    // ── Confirm Issue ──────────────────────────────────────────────────────────
    @PostMapping("/confirm-issue/{txnId}")
    public String confirmIssue(@PathVariable Long txnId,
                               @AuthenticationPrincipal UserDetails ud,
                               RedirectAttributes ra) {
        try {
            transactionService.confirmIssue(txnId, currentAdmin(ud).getId());
            ra.addFlashAttribute("successMsg", "Book issued successfully.");
        } catch (Exception e) {
            ra.addFlashAttribute("errorMsg", e.getMessage());
        }
        return "redirect:/admin/dashboard";
    }

    // ── Confirm Return ─────────────────────────────────────────────────────────
    @PostMapping("/confirm-return/{txnId}")
    public String confirmReturn(@PathVariable Long txnId,
                                @AuthenticationPrincipal UserDetails ud,
                                RedirectAttributes ra) {
        try {
            Transaction t = transactionService.confirmReturn(txnId, currentAdmin(ud).getId());
            BigDecimal fine = t.getCalculatedFine();
            String msg = "Book returned. Fine: ₹" + fine;
            ra.addFlashAttribute("successMsg", msg);
        } catch (Exception e) {
            ra.addFlashAttribute("errorMsg", e.getMessage());
        }
        return "redirect:/admin/dashboard";
    }

    // ── Mark Lost / Damaged ───────────────────────────────────────────────────
    @PostMapping("/mark-condition/{txnId}")
    public String markCondition(@PathVariable Long txnId,
                                @RequestParam String condition,
                                @AuthenticationPrincipal UserDetails ud,
                                RedirectAttributes ra) {
        try {
            transactionService.markLostOrDamaged(txnId, condition, currentAdmin(ud).getId());
            ra.addFlashAttribute("successMsg", "Book marked as " + condition + ". Penalty applied.");
        } catch (Exception e) {
            ra.addFlashAttribute("errorMsg", e.getMessage());
        }
        return "redirect:/admin/dashboard";
    }

    // ── Fine Waiver ───────────────────────────────────────────────────────────
    @PostMapping("/adjust-fine/{txnId}")
    public String adjustFine(@PathVariable Long txnId,
                             @RequestParam BigDecimal adjustedAmount,
                             @RequestParam String reason,
                             @AuthenticationPrincipal UserDetails ud,
                             RedirectAttributes ra) {
        try {
            transactionService.adjustFine(txnId, adjustedAmount, reason, currentAdmin(ud).getId());
            ra.addFlashAttribute("successMsg", "Fine adjusted to ₹" + adjustedAmount);
        } catch (Exception e) {
            ra.addFlashAttribute("errorMsg", e.getMessage());
        }
        return "redirect:/admin/dashboard";
    }

    // ── Approve / Reject Book Request ─────────────────────────────────────────
    @PostMapping("/book-request/{id}/approve")
    public String approveBookRequest(@PathVariable Long id,
                                     @RequestParam(required = false) String adminNotes,
                                     @AuthenticationPrincipal UserDetails ud,
                                     RedirectAttributes ra) {
        bookRequestRepository.findById(id).ifPresent(req -> {
            req.setStatus(BookRequest.Status.APPROVED);
            req.setAdminNotes(adminNotes);
            req.setReviewedBy(currentAdmin(ud).getId());
            req.setReviewedAt(java.time.LocalDateTime.now());
            bookRequestRepository.save(req);
        });
        ra.addFlashAttribute("successMsg", "Book request approved.");
        return "redirect:/admin/dashboard";
    }

    @PostMapping("/book-request/{id}/reject")
    public String rejectBookRequest(@PathVariable Long id,
                                    @RequestParam(required = false) String adminNotes,
                                    @AuthenticationPrincipal UserDetails ud,
                                    RedirectAttributes ra) {
        bookRequestRepository.findById(id).ifPresent(req -> {
            req.setStatus(BookRequest.Status.REJECTED);
            req.setAdminNotes(adminNotes);
            req.setReviewedBy(currentAdmin(ud).getId());
            req.setReviewedAt(java.time.LocalDateTime.now());
            bookRequestRepository.save(req);
        });
        ra.addFlashAttribute("successMsg", "Book request rejected.");
        return "redirect:/admin/dashboard";
    }

    // ── Inventory Management ──────────────────────────────────────────────────
    @GetMapping("/books")
    public String manageBooks(Model model) {
        model.addAttribute("books", bookRepository.findAll());
        model.addAttribute("categories", categoryRepository.findAll());
        model.addAttribute("newBook", new Book());
        return "manage-books";
    }

    @PostMapping("/books/add")
    public String addBook(@RequestParam String title, @RequestParam String author,
                          @RequestParam(required = false) String isbn,
                          @RequestParam Long categoryId,
                          @RequestParam(defaultValue = "1") int copies,
                          @RequestParam(required = false) String shelfLocation,
                          @RequestParam(required = false) String description,
                          @RequestParam(required = false) BigDecimal price,
                          RedirectAttributes ra) {
        try {
            Book book = new Book();
            book.setTitle(title); book.setAuthor(author); book.setIsbn(isbn);
            book.setCategory(categoryRepository.findById(categoryId).orElse(null));
            book.setTotalCopies(copies); book.setAvailableCopies(copies);
            book.setShelfLocation(shelfLocation); book.setDescription(description);
            book.setPrice(price);
            bookService.save(book);
            ra.addFlashAttribute("successMsg", "Book added: " + title);
        } catch (Exception e) {
            ra.addFlashAttribute("errorMsg", e.getMessage());
        }
        return "redirect:/admin/books";
    }

    // ── Reports ───────────────────────────────────────────────────────────────
    @GetMapping("/reports")
    public String reports(Model model) {
        model.addAttribute("overdueLoans", transactionService.getOverdueTransactions());
        model.addAttribute("allUsers", userRepository.findAll());
        model.addAttribute("allBooks", bookRepository.findAll());
        return "reports";
    }
}
