package com.assignmenthelper;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
public class AssignmentHelperApplication {

	public static void main(String[] args) {
		SpringApplication.run(AssignmentHelperApplication.class, args);
	}

    @Bean
    public CommandLineRunner fixDatabaseConstraints(JdbcTemplate jdbcTemplate) {
        return args -> {
            try {
                jdbcTemplate.execute("ALTER TABLE chat_sessions MODIFY document_id BIGINT NULL");
                System.out.println("Successfully altered chat_sessions table.");
            } catch (Exception e) {
                System.out.println("Could not alter chat_sessions table: " + e.getMessage());
            }
        };
    }

}
