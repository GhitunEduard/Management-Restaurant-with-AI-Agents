package com.example.gallery_service.service;

import com.example.gallery_service.dto.CreateEventRequest;
import com.example.gallery_service.dto.EventDto;
import org.springframework.web.multipart.MultipartFile;

public interface EventService {
    EventDto addEventToCategory(Long categoryId, CreateEventRequest request, MultipartFile photo);
    void deleteEvent(Long eventId);
}