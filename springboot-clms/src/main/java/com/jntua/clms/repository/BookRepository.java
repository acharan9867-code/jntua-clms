package com.jntua.clms.repository;

import com.jntua.clms.entity.Book;
import com.jntua.clms.entity.Category;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface BookRepository extends JpaRepository<Book, Long> {

    @Query("SELECT b FROM Book b WHERE b.status = 'active' AND " +
           "(LOWER(b.title) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
           " LOWER(b.author) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
           " LOWER(b.isbn) LIKE LOWER(CONCAT('%', :keyword, '%')))")
    List<Book> searchByKeyword(@Param("keyword") String keyword);

    List<Book> findByCategoryAndStatus(Category category, String status);
    List<Book> findByStatus(String status);
    List<Book> findByAvailableCopiesGreaterThanAndStatus(int copies, String status);

    @Query("SELECT b FROM Book b WHERE b.status = 'active' ORDER BY b.title ASC")
    List<Book> findAllActiveBooks();

    @Query("SELECT b FROM Book b WHERE b.status = 'active' AND b.availableCopies > 0 ORDER BY b.title ASC")
    List<Book> findAllAvailableBooks();
}
