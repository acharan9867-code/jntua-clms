package com.jntua.clms.repository;

import com.jntua.clms.entity.BookRequest;
import com.jntua.clms.entity.BookRequest.Status;
import com.jntua.clms.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface BookRequestRepository extends JpaRepository<BookRequest, Long> {
    List<BookRequest> findByStatus(Status status);
    List<BookRequest> findByUser(User user);
    List<BookRequest> findByStatusOrderByCreatedAtDesc(Status status);
    List<BookRequest> findAllByOrderByCreatedAtDesc();
}
