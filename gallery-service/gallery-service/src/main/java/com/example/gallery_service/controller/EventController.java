package com.example.gallery_service.controller;

import com.example.gallery_service.dto.CreateEventRequest;
import com.example.gallery_service.dto.EventDto;
import com.example.gallery_service.service.EventService;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;

@RestController
@RequestMapping("/api/v1/events")
@RequiredArgsConstructor
public class EventController {

    private final EventService eventService;

    @PostMapping
    public ResponseEntity<EventDto> addEvent(
            @RequestParam("categoryId") Long categoryId,
            @RequestParam("eventData") String eventDataJson,
            @RequestParam("photo") MultipartFile photo) throws IOException {

        ObjectMapper objectMapper = new ObjectMapper();
        CreateEventRequest request = objectMapper.readValue(eventDataJson, CreateEventRequest.class);

        EventDto createdEvent = eventService.addEventToCategory(categoryId, request, photo);
        return new ResponseEntity<>(createdEvent, HttpStatus.CREATED);
    }

    @DeleteMapping("/{eventId}")
    public ResponseEntity<Void> deleteEvent(@PathVariable Long eventId) {
        eventService.deleteEvent(eventId);
        return ResponseEntity.noContent().build();
    }
}