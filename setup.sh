
#!/bin/bash

# Create unique database name from request ID
DATABASE_NAME="1c34684a_ddf4_4711_a280_584959df9b94"

# Project output directory
OUTPUT_DIR="/home/coder/project/workspace/question_generation_service/solutions/1c34684a-ddf4-4711-a280-584959df9b94/springapp"

# Create database
mysql -u root -pexamly -e "CREATE DATABASE IF NOT EXISTS ${DATABASE_NAME};" 2>/dev/null || echo "Database creation failed, will use default"

# Generate Spring Boot project using Spring CLI
spring init \
  --type=maven-project \
  --language=java \
  --boot-version=3.4.0 \
  --packaging=jar \
  --java-version=17 \
  --groupId=com.examly \
  --artifactId=springapp \
  --name="Feedback Management System" \
  --description="Feedback Management System with Spring Boot" \
  --package-name=com.examly.springapp \
  --dependencies=web,data-jpa,validation,mysql \
  --build=maven \
  ${OUTPUT_DIR}

# Wait for project generation to complete
sleep 5

# Add MySQL configuration to application.properties
cat > "${OUTPUT_DIR}/src/main/resources/application.properties" << EOL
spring.datasource.url=jdbc:mysql://localhost:3306/${DATABASE_NAME}?createDatabaseIfNotExist=true
spring.datasource.username=root
spring.datasource.password=examly
spring.datasource.driver-class-name=com.mysql.cj.jdbc.Driver
spring.jpa.hibernate.ddl-auto=create
spring.jpa.show-sql=true
spring.jpa.properties.hibernate.format_sql=true
spring.jpa.properties.hibernate.dialect=org.hibernate.dialect.MySQLDialect
EOL
