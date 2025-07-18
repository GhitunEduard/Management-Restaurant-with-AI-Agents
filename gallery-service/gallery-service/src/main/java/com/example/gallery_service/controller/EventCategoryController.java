package com.example.gallery_service.controller;

import com.example.gallery_service.dto.CreateEventCategoryRequest;
import com.example.gallery_service.dto.EventCategoryDto;
import com.example.gallery_service.service.EventCategoryService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/categories")
@RequiredArgsConstructor
public class EventCategoryController {

    private final EventCategoryService eventCategoryService;

    @PostMapping
    public ResponseEntity<EventCategoryDto> createCategory(@RequestBody CreateEventCategoryRequest request) {
        EventCategoryDto createdCategory = eventCategoryService.createCategory(request);
        return new ResponseEntity<>(createdCategory, HttpStatus.CREATED);
    }

    @GetMapping
    public ResponseEntity<List<EventCategoryDto>> getAllCategories() {
        List<EventCategoryDto> categories = eventCategoryService.getAllCategories();
        return ResponseEntity.ok(categories);
    }

    @DeleteMapping("/{categoryId}")
    public ResponseEntity<Void> deleteCategory(@PathVariable Long categoryId) {
        eventCategoryService.deleteCategory(categoryId);
        return ResponseEntity.noContent().build();
    }
}