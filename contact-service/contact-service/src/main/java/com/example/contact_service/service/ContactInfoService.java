package com.example.contact_service.service;

import com.example.contact_service.dto.ContactInfoDTO;
import com.example.contact_service.model.ContactInfo;
import com.example.contact_service.repository.ContactInfoRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class ContactInfoService {

    private final ContactInfoRepository contactInfoRepository;

    @Transactional(readOnly = true)
    public ContactInfoDTO getContactInfo() {
        return contactInfoRepository.findAll().stream()
                .findFirst()
                .map(this::convertToDto)
                .orElse(null);
    }

    @Transactional
    public ContactInfoDTO createOrUpdateContactInfo(ContactInfoDTO contactInfoDTO) {
        ContactInfo contactInfo = contactInfoRepository.findAll().stream()
                .findFirst()
                .orElse(new ContactInfo());

        contactInfo.setAddress(contactInfoDTO.getAddress());
        contactInfo.setPhone(contactInfoDTO.getPhone());
        contactInfo.setEmail(contactInfoDTO.getEmail());
        contactInfo.setSchedule(contactInfoDTO.getSchedule());
        contactInfo.setFacebookUrl(contactInfoDTO.getFacebookUrl());
        contactInfo.setInstagramUrl(contactInfoDTO.getInstagramUrl());
        contactInfo.setTripadvisorUrl(contactInfoDTO.getTripadvisorUrl());

        ContactInfo savedContactInfo = contactInfoRepository.save(contactInfo);

        return convertToDto(savedContactInfo);
    }

    private ContactInfoDTO convertToDto(ContactInfo contactInfo) {
        ContactInfoDTO dto = new ContactInfoDTO();
        dto.setId(contactInfo.getId());
        dto.setAddress(contactInfo.getAddress());
        dto.setPhone(contactInfo.getPhone());
        dto.setEmail(contactInfo.getEmail());
        dto.setSchedule(contactInfo.getSchedule());
        dto.setFacebookUrl(contactInfo.getFacebookUrl());
        dto.setInstagramUrl(contactInfo.getInstagramUrl());
        dto.setTripadvisorUrl(contactInfo.getTripadvisorUrl());
        return dto;
    }
}