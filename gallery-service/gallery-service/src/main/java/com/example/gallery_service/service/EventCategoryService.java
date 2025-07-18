package com.example.gallery_service.service;

import com.example.gallery_service.dto.CreateEventCategoryRequest;
import com.example.gallery_service.dto.EventCategoryDto;
import java.util.List;

public interface EventCategoryService {
    EventCategoryDto createCategory(CreateEventCategoryRequest request);
    List<EventCategoryDto> getAllCategories();
    void deleteCategory(Long categoryId);
}