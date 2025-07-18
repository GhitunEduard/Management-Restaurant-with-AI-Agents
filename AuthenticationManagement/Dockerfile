FROM maven:3.8.3-openjdk-17 AS builder
COPY ./src/ /root/src
COPY ./pom.xml /root/

WORKDIR /root
RUN mvn clean package -DskipTests

ENTRYPOINT ["java", "-jar", "/root/target/AuthenticationManagement-0.0.1-SNAPSHOT.jar"]

EXPOSE 8080