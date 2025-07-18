package com.example.contact_service.controller;

import com.example.contact_service.dto.ContactInfoDTO;
import com.example.contact_service.service.ContactInfoService;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
class ContactInfoControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private ContactInfoService contactInfoService;

    @Autowired
    private ObjectMapper objectMapper;

    private ContactInfoDTO contactInfoDTO;

    @BeforeEach
    void setUp() {
        contactInfoDTO = new ContactInfoDTO();
        contactInfoDTO.setId(1L);
        contactInfoDTO.setAddress("Adresa Valida de Test Nr. 123");
        contactInfoDTO.setEmail("test.valid@test.com");
        // Am adăugat valori pentru câmpurile obligatorii
        contactInfoDTO.setPhone("0712345678");
        contactInfoDTO.setSchedule("L-V: 09:00 - 18:00");
    }

    @Test
    void whenGetInfo_andDataExists_thenReturn200Ok() throws Exception {
        when(contactInfoService.getContactInfo()).thenReturn(contactInfoDTO);

        mockMvc.perform(get("/api/contact"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.address").value(contactInfoDTO.getAddress()))
                .andExpect(jsonPath("$.email").value(contactInfoDTO.getEmail()));
    }

    @Test
    void whenGetInfo_andNoData_thenReturn404NotFound() throws Exception {
        when(contactInfoService.getContactInfo()).thenReturn(null);

        mockMvc.perform(get("/api/contact"))
                .andExpect(status().isNotFound());
    }

    @Test
    void whenCreateOrUpdateInfo_withValidData_thenReturn200Ok() throws Exception {
        when(contactInfoService.createOrUpdateContactInfo(any(ContactInfoDTO.class))).thenReturn(contactInfoDTO);

        mockMvc.perform(post("/api/contact")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(contactInfoDTO)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(1L));
    }
}