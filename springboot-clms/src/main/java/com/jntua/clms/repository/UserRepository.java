package com.jntua.clms.repository;

import com.jntua.clms.entity.User;
import com.jntua.clms.entity.Role;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByEmail(String email);
    Optional<User> findByMemberId(String memberId);
    boolean existsByEmail(String email);
    boolean existsByMemberId(String memberId);
    List<User> findByRole(Role role);
    List<User> findByStatus(String status);
}
