package com.examly.springapp;

import com.examly.springapp.controller.AdminFeedbackController;
import com.examly.springapp.controller.FeedbackController;
import com.examly.springapp.model.Feedback;
import com.examly.springapp.model.FeedbackStatus;
import com.examly.springapp.repository.FeedbackRepository;
import com.examly.springapp.service.FeedbackService;
import com.examly.springapp.service.FeedbackServiceImpl;
import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.ApplicationContext;
import org.springframework.core.env.Environment;
import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
class FeedbackManagementSystemTest {

    @Autowired
    private ApplicationContext applicationContext;

    @Autowired
    private Environment environment;

    @Test
    void contextLoads() {
        // Test 1: Application context loads successfully
        assertNotNull(applicationContext);
    }

    @Test
    void feedbackControllerBeanExists() {
        // Test 2: Check if FeedbackController bean exists
        assertTrue(applicationContext.containsBean("feedbackController"));
    }

    @Test
    void adminFeedbackControllerBeanExists() {
        // Test 3: Check if AdminFeedbackController bean exists
        assertTrue(applicationContext.containsBean("adminFeedbackController"));
    }

    @Test
    void feedbackServiceBeanExists() {
        // Test 4: Check if FeedbackService bean exists
        assertNotNull(applicationContext.getBean(FeedbackService.class));
    }

    @Test
    void feedbackRepositoryBeanExists() {
        // Test 5: Check if FeedbackRepository bean exists
        assertNotNull(applicationContext.getBean(FeedbackRepository.class));
    }

    @Test
    void databaseConnectionConfigured() {
        // Test 6: Database connection properties are configured
        String dbUrl = environment.getProperty("spring.datasource.url");
        assertNotNull(dbUrl);
        assertTrue(dbUrl.contains("app_db"));
    }

    @Test
    void hibernateDdlAutoConfigured() {
        // Test 7: Hibernate DDL auto property is configured
        String ddlAuto = environment.getProperty("spring.jpa.hibernate.ddl-auto");
        assertEquals("create", ddlAuto);
    }

    @Test
    void feedbackModelCanBeCreated() {
        // Test 8: Feedback model can be instantiated
        assertDoesNotThrow(() -> {
            Feedback feedback = new Feedback();
            feedback.setUserId("user123");
            feedback.setProductId("prod456");
            feedback.setRating(5);
            feedback.setComment("Great product!");
            feedback.setStatus(FeedbackStatus.PENDING);
        });
    }

    @Test
    void feedbackStatusEnumHasAllValues() {
        // Test 9: FeedbackStatus enum has all required values
        assertEquals(3, FeedbackStatus.values().length);
        assertNotNull(FeedbackStatus.valueOf("PENDING"));
        assertNotNull(FeedbackStatus.valueOf("APPROVED"));
        assertNotNull(FeedbackStatus.valueOf("REJECTED"));
    }

    @Test
    void feedbackServiceImplCanBeInstantiated() {
        // Test 10: FeedbackServiceImpl can be instantiated
        FeedbackService service = applicationContext.getBean(FeedbackService.class);
        assertTrue(service instanceof FeedbackServiceImpl);
    }

    @Test
    void mysqlDriverConfigured() {
        // Test 11: MySQL driver is configured
        String driver = environment.getProperty("spring.datasource.driver-class-name");
        assertEquals("com.mysql.cj.jdbc.Driver", driver);
    }

    @Test
    void databaseCredentialsConfigured() {
        // Test 12: Database credentials are configured
        String username = environment.getProperty("spring.datasource.username");
        String password = environment.getProperty("spring.datasource.password");
        assertEquals("root", username);
        assertEquals("examly", password);
    }

    @Test
    void jpaShowSqlEnabled() {
        // Test 13: JPA show SQL is enabled
        String showSql = environment.getProperty("spring.jpa.show-sql");
        assertEquals("true", showSql);
    }

    @Test
    void hibernateDialectConfigured() {
        // Test 14: Hibernate dialect is configured
        String dialect = environment.getProperty("spring.jpa.properties.hibernate.dialect");
        assertEquals("org.hibernate.dialect.MySQLDialect", dialect);
    }

    @Test
    void applicationHasRequiredBeans() {
        // Test 15: Application has all required beans
        assertTrue(applicationContext.getBeanDefinitionCount() > 10);
        assertNotNull(applicationContext.getBean(FeedbackController.class));
        assertNotNull(applicationContext.getBean(AdminFeedbackController.class));
        assertNotNull(applicationContext.getBean(FeedbackService.class));
        assertNotNull(applicationContext.getBean(FeedbackRepository.class));
    }
}