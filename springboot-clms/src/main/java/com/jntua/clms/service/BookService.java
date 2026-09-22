package com.jntua.clms.service;

import com.jntua.clms.entity.Book;
import com.jntua.clms.entity.Category;
import com.jntua.clms.repository.BookRepository;
import com.jntua.clms.repository.CategoryRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;
import java.util.Optional;

@Service
public class BookService {

    @Autowired private BookRepository bookRepository;
    @Autowired private CategoryRepository categoryRepository;

    public List<Book> getAllActiveBooks() {
        return bookRepository.findAllActiveBooks();
    }

    public List<Book> searchBooks(String keyword) {
        if (keyword == null || keyword.isBlank()) return bookRepository.findAllActiveBooks();
        return bookRepository.searchByKeyword(keyword.trim());
    }

    public List<Book> getBooksByCategory(Long categoryId) {
        Category cat = categoryRepository.findById(categoryId).orElse(null);
        if (cat == null) return bookRepository.findAllActiveBooks();
        return bookRepository.findByCategoryAndStatus(cat, "active");
    }

    public Optional<Book> findById(Long id) {
        return bookRepository.findById(id);
    }

    public List<Category> getAllCategories() {
        return categoryRepository.findAll();
    }

    @Transactional
    public Book save(Book book) {
        return bookRepository.save(book);
    }

    @Transactional
    public void deleteById(Long id) {
        bookRepository.findById(id).ifPresent(b -> {
            b.setStatus("inactive");
            bookRepository.save(b);
        });
    }
}
