package com.jntua.clms.controller;

import com.jntua.clms.entity.*;
import com.jntua.clms.repository.*;
import com.jntua.clms.service.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.mvc.support.RedirectAttributes;

@Controller
@RequestMapping("/student")
public class StudentController {

    @Autowired private UserRepository userRepository;
    @Autowired private TransactionService transactionService;
    @Autowired private ReservationService reservationService;
    @Autowired private BookRequestRepository bookRequestRepository;

    @GetMapping("/dashboard")
    public String dashboard(@AuthenticationPrincipal UserDetails userDetails, Model model) {
        User user = userRepository.findByEmail(userDetails.getUsername())
            .orElseThrow(() -> new RuntimeException("User not found"));
        model.addAttribute("user", user);
        model.addAttribute("activeTransactions", transactionService.getActiveByUser(user));
        model.addAttribute("history", transactionService.getHistoryByUser(user));
        model.addAttribute("reservations", reservationService.getActiveByUser(user));
        model.addAttribute("bookRequests", bookRequestRepository.findByUser(user));
        return "student-dashboard";
    }

    @PostMapping("/return/{txnId}")
    public String requestReturn(@PathVariable Long txnId,
                                @AuthenticationPrincipal UserDetails userDetails,
                                RedirectAttributes redirectAttr) {
        try {
            transactionService.requestReturn(txnId);
            redirectAttr.addFlashAttribute("successMsg", "Return request submitted. Librarian will confirm.");
        } catch (Exception e) {
            redirectAttr.addFlashAttribute("errorMsg", e.getMessage());
        }
        return "redirect:/student/dashboard";
    }

    @PostMapping("/cancel-reservation/{resId}")
    public String cancelReservation(@PathVariable Long resId,
                                    @AuthenticationPrincipal UserDetails userDetails,
                                    RedirectAttributes redirectAttr) {
        User user = userRepository.findByEmail(userDetails.getUsername())
            .orElseThrow(() -> new RuntimeException("User not found"));
        try {
            reservationService.cancelReservation(resId, user.getId());
            redirectAttr.addFlashAttribute("successMsg", "Reservation cancelled.");
        } catch (Exception e) {
            redirectAttr.addFlashAttribute("errorMsg", e.getMessage());
        }
        return "redirect:/student/dashboard";
    }

    @PostMapping("/book-request")
    public String submitBookRequest(@RequestParam String bookTitle,
                                    @RequestParam(required = false) String author,
                                    @RequestParam(required = false) String isbn,
                                    @RequestParam(required = false) String reason,
                                    @AuthenticationPrincipal UserDetails userDetails,
                                    RedirectAttributes redirectAttr) {
        User user = userRepository.findByEmail(userDetails.getUsername())
            .orElseThrow(() -> new RuntimeException("User not found"));
        BookRequest req = new BookRequest();
        req.setUser(user);
        req.setBookTitle(bookTitle);
        req.setAuthor(author);
        req.setIsbn(isbn);
        req.setReason(reason);
        bookRequestRepository.save(req);
        redirectAttr.addFlashAttribute("successMsg", "Book request submitted for librarian review.");
        return "redirect:/student/dashboard";
    }
}
