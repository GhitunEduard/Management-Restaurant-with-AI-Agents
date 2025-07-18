package com.example.contact_service.service;

import com.example.contact_service.dto.ContactInfoDTO;
import com.example.contact_service.model.ContactInfo;
import com.example.contact_service.repository.ContactInfoRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Collections;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class ContactInfoServiceTest {

    @Mock
    private ContactInfoRepository contactInfoRepository;

    @InjectMocks
    private ContactInfoService contactInfoService;

    private ContactInfo contactInfo;
    private ContactInfoDTO contactInfoDTO;

    @BeforeEach
    void setUp() {
        contactInfo = new ContactInfo();
        contactInfo.setId(1L);
        contactInfo.setAddress("Adresa Test");
        contactInfo.setPhone("0123456789");
        contactInfo.setEmail("test@test.com");

        contactInfoDTO = new ContactInfoDTO();
        contactInfoDTO.setAddress("Adresa Test DTO");
        contactInfoDTO.setPhone("0123456789 DTO");
        contactInfoDTO.setEmail("test-dto@test.com");
    }

    @Test
    void whenGetContactInfo_andDataExists_thenReturnContactInfoDTO() {
        when(contactInfoRepository.findAll()).thenReturn(List.of(contactInfo));
        ContactInfoDTO foundDto = contactInfoService.getContactInfo();
        assertThat(foundDto).isNotNull();
        assertThat(foundDto.getAddress()).isEqualTo(contactInfo.getAddress());
    }

    @Test
    void whenGetContactInfo_andNoData_thenReturnNull() {
        when(contactInfoRepository.findAll()).thenReturn(Collections.emptyList());
        ContactInfoDTO foundDto = contactInfoService.getContactInfo();
        assertThat(foundDto).isNull();
    }

    @Test
    void whenCreateOrUpdateContactInfo_andNoExistingData_thenCreatesNew() {
        when(contactInfoRepository.findAll()).thenReturn(Collections.emptyList());
        when(contactInfoRepository.save(any(ContactInfo.class))).thenAnswer(invocation -> {
            ContactInfo savedInfo = invocation.getArgument(0);
            savedInfo.setId(1L);
            return savedInfo;
        });

        ContactInfoDTO resultDto = contactInfoService.createOrUpdateContactInfo(contactInfoDTO);

        assertThat(resultDto).isNotNull();
        assertThat(resultDto.getId()).isEqualTo(1L);
        assertThat(resultDto.getAddress()).isEqualTo(contactInfoDTO.getAddress());
    }

    @Test
    void whenCreateOrUpdateContactInfo_withExistingData_thenUpdates() {
        // Arrange
        when(contactInfoRepository.findAll()).thenReturn(List.of(contactInfo));
        when(contactInfoRepository.save(any(ContactInfo.class))).thenAnswer(invocation -> invocation.getArgument(0));

        // Salvăm valoarea originală ÎNAINTE de a apela metoda
        String originalPhone = contactInfo.getPhone();

        // Act
        ContactInfoDTO resultDto = contactInfoService.createOrUpdateContactInfo(contactInfoDTO);

        // Assert
        assertThat(resultDto).isNotNull();
        assertThat(resultDto.getId()).isEqualTo(contactInfo.getId());
        assertThat(resultDto.getAddress()).isEqualTo(contactInfoDTO.getAddress());

        // Comparăm valoarea nouă cu cea originală, pe care am salvat-o
        assertThat(resultDto.getPhone()).isNotEqualTo(originalPhone);
    }
}