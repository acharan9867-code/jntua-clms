package com.jntua.clms.controller;

import com.jntua.clms.entity.*;
import com.jntua.clms.repository.UserRepository;
import com.jntua.clms.service.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.mvc.support.RedirectAttributes;
import java.util.List;

@Controller
@RequestMapping("/catalog")
public class CatalogController {

    @Autowired private BookService bookService;
    @Autowired private TransactionService transactionService;
    @Autowired private ReservationService reservationService;
    @Autowired private UserRepository userRepository;

    @GetMapping
    public String catalog(@RequestParam(required = false) String keyword,
                          @RequestParam(required = false) Long categoryId,
                          Model model) {
        List<Book> books = (keyword != null && !keyword.isBlank())
            ? bookService.searchBooks(keyword)
            : (categoryId != null ? bookService.getBooksByCategory(categoryId) : bookService.getAllActiveBooks());

        model.addAttribute("books", books);
        model.addAttribute("categories", bookService.getAllCategories());
        model.addAttribute("keyword", keyword);
        model.addAttribute("selectedCategory", categoryId);
        return "catalog";
    }

    @GetMapping("/{id}")
    public String bookDetail(@PathVariable Long id, Model model) {
        Book book = bookService.findById(id)
            .orElseThrow(() -> new RuntimeException("Book not found: " + id));
        model.addAttribute("book", book);
        return "book-detail";
    }

    @PostMapping("/borrow/{bookId}")
    public String requestBorrow(@PathVariable Long bookId,
                                @AuthenticationPrincipal UserDetails userDetails,
                                RedirectAttributes redirectAttr) {
        User user = userRepository.findByEmail(userDetails.getUsername())
            .orElseThrow(() -> new RuntimeException("User not found"));
        try {
            transactionService.requestBorrow(user.getId(), bookId);
            redirectAttr.addFlashAttribute("successMsg", "Borrow request submitted. Await librarian confirmation.");
        } catch (Exception e) {
            redirectAttr.addFlashAttribute("errorMsg", e.getMessage());
        }
        return "redirect:/catalog";
    }

    @PostMapping("/reserve/{bookId}")
    public String reserveBook(@PathVariable Long bookId,
                              @AuthenticationPrincipal UserDetails userDetails,
                              RedirectAttributes redirectAttr) {
        User user = userRepository.findByEmail(userDetails.getUsername())
            .orElseThrow(() -> new RuntimeException("User not found"));
        try {
            reservationService.reserveBook(user.getId(), bookId);
            redirectAttr.addFlashAttribute("successMsg", "Reservation added to the queue.");
        } catch (Exception e) {
            redirectAttr.addFlashAttribute("errorMsg", e.getMessage());
        }
        return "redirect:/catalog";
    }
}
