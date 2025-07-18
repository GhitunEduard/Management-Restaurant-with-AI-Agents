package com.example.contact_service.controller;

import com.example.contact_service.dto.ContactInfoDTO;
import com.example.contact_service.service.ContactInfoService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/contact")
@RequiredArgsConstructor
@CrossOrigin(origins = {"https://adminapp-g3ll.vercel.app", "https://clientapp-lx5b.vercel.app"})
public class ContactInfoController {

    private final ContactInfoService contactInfoService;

    @GetMapping
    public ResponseEntity<ContactInfoDTO> getInfo() {
        ContactInfoDTO contactInfo = contactInfoService.getContactInfo();
        if (contactInfo != null) {
            return ResponseEntity.ok(contactInfo);
        } else {
            return ResponseEntity.notFound().build();
        }
    }

    @PostMapping
    public ResponseEntity<ContactInfoDTO> createOrUpdateInfo(@Valid @RequestBody ContactInfoDTO contactInfoDTO) {
        ContactInfoDTO savedContactInfo = contactInfoService.createOrUpdateContactInfo(contactInfoDTO);
        return ResponseEntity.ok(savedContactInfo);
    }
}