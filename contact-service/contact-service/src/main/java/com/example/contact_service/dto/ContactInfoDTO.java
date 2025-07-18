package com.example.contact_service.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;
import org.hibernate.validator.constraints.URL;

@Getter
@Setter
public class ContactInfoDTO {

    private Long id;

    @NotBlank(message = "Adresa nu poate fi goală.")
    @Size(min = 10, max = 255, message = "Adresa trebuie să aibă între 10 și 255 de caractere.")
    private String address;

    @NotBlank(message = "Numărul de telefon nu poate fi gol.")
    private String phone;

    @NotBlank(message = "Emailul nu poate fi gol.")
    @Email(message = "Adresa de email nu este validă.")
    private String email;

    @NotBlank(message = "Programul nu poate fi gol.")
    private String schedule;

    @URL(message = "URL-ul pentru Facebook nu este valid.")
    private String facebookUrl;

    @URL(message = "URL-ul pentru Instagram nu este valid.")
    private String instagramUrl;

    @URL(message = "URL-ul pentru TripAdvisor nu este valid.")
    private String tripadvisorUrl;
}