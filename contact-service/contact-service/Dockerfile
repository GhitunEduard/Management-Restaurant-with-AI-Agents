FROM maven:3.8.3-openjdk-17 AS builder
COPY ./src/ /root/src
COPY ./pom.xml /root/
#COPY ./target/EnergyManagement_Users-0.0.1-SNAPSHOT.jar /root/target/
WORKDIR /root
RUN mvn clean package -DskipTests

ENTRYPOINT ["java", "-jar", "/root/target/contact-service-0.0.1-SNAPSHOT.jar"]

EXPOSE 8080