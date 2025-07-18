package com.example.gallery_service.service.impl;

import com.example.gallery_service.dto.CreateEventRequest;
import com.example.gallery_service.dto.EventDto;
import com.example.gallery_service.mapper.EventMapper;
import com.example.gallery_service.model.Event;
import com.example.gallery_service.model.EventCategory;
import com.example.gallery_service.repository.EventCategoryRepository;
import com.example.gallery_service.repository.EventRepository;
import com.example.gallery_service.service.EventService;
import com.example.gallery_service.service.FileStorageService;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

@Service
@RequiredArgsConstructor
public class EventServiceImpl implements EventService {

    private final EventRepository eventRepository;
    private final EventCategoryRepository categoryRepository;
    private final EventMapper eventMapper;
    private final FileStorageService fileStorageService;

    @Override
    @Transactional
    public EventDto addEventToCategory(Long categoryId, CreateEventRequest request, MultipartFile photo) {
        EventCategory category = categoryRepository.findById(categoryId)
                .orElseThrow(() -> new EntityNotFoundException("Categoria nu a fost găsită cu id-ul: " + categoryId));

        String fileName = fileStorageService.storeFile(photo);

        Event newEvent = eventMapper.toEntity(request);
        newEvent.setCategory(category);
        newEvent.setPhotoUrl(fileName);

        Event savedEvent = eventRepository.save(newEvent);

        return eventMapper.toDto(savedEvent);
    }

    @Override
    @Transactional
    public void deleteEvent(Long eventId) {
        Event event = eventRepository.findById(eventId)
                .orElseThrow(() -> new EntityNotFoundException("Evenimentul nu a fost găsit cu id-ul: " + eventId));

        fileStorageService.deleteFile(event.getPhotoUrl());

        eventRepository.delete(event);
    }
}