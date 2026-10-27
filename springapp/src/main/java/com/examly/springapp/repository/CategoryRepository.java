package com.examly.springapp.repository;

import com.examly.springapp.model.Category;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface CategoryRepository extends JpaRepository<Category, Long> {

    Optional<Category> findByName(String name);

    boolean existsByName(String name);

    // ✅ Add a query to get all categories with feedback count
    @Query("SELECT c, COUNT(f) FROM Category c LEFT JOIN c.feedbackList f GROUP BY c")
    List<Object[]> findAllWithFeedbackCount();
}