package com.examly.springapp.repository;

import com.examly.springapp.model.Feedback;
import com.examly.springapp.model.FeedbackStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Map;

@Repository
public interface FeedbackRepository extends JpaRepository<Feedback, Long> {

    Page<Feedback> findAll(Pageable pageable);

    Page<Feedback> findByStatus(FeedbackStatus status, Pageable pageable);

    Page<Feedback> findByCategoryId(Long categoryId, Pageable pageable);

    @Query("SELECT f FROM Feedback f WHERE " +
           "LOWER(f.submitterName) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
           "LOWER(f.submitterEmail) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
           "LOWER(f.feedbackContent) LIKE LOWER(CONCAT('%', :search, '%'))")
    Page<Feedback> searchFeedback(@Param("search") String search, Pageable pageable);

    @Query("SELECT COUNT(f) FROM Feedback f WHERE f.status = :status")
    long countByStatus(@Param("status") FeedbackStatus status);

    @Query("SELECT AVG(f.rating) FROM Feedback f WHERE f.rating > 0")
    Double calculateAverageRating();

    @Query("SELECT f.status, COUNT(f) FROM Feedback f GROUP BY f.status")
    List<Object[]> countGroupedByStatus();

    // ✅ ADD THIS NEW METHOD for category distribution
    @Query("SELECT c.name, COUNT(f) FROM Feedback f JOIN f.category c GROUP BY c.name")
    List<Object[]> countGroupedByCategory();
}