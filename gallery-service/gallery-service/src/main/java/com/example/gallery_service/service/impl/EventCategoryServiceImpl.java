package com.example.gallery_service.service;

import com.example.gallery_service.dto.CreateEventCategoryRequest;
import com.example.gallery_service.dto.EventCategoryDto;
import com.example.gallery_service.mapper.EventCategoryMapper;
import com.example.gallery_service.model.EventCategory;
import com.example.gallery_service.repository.EventCategoryRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class EventCategoryServiceImpl implements EventCategoryService {

    private final EventCategoryRepository categoryRepository;
    private final EventCategoryMapper categoryMapper;
    private final EventService eventService;

    @Override // Adnotarea indică faptul că suprascriem o metodă din interfață
    @Transactional
    public EventCategoryDto createCategory(CreateEventCategoryRequest request) {
        EventCategory newCategory = categoryMapper.toEntity(request);
        EventCategory savedCategory = categoryRepository.save(newCategory);
        return categoryMapper.toDto(savedCategory);
    }

    @Override
    @Transactional(readOnly = true)
    public List<EventCategoryDto> getAllCategories() {
        return categoryRepository.findAll().stream()
                .map(categoryMapper::toDto)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public void deleteCategory(Long categoryId) {
        EventCategory category = categoryRepository.findById(categoryId)
                .orElseThrow(() -> new EntityNotFoundException("Categoria nu a fost găsită cu id-ul: " + categoryId));

        List<Long> eventIds = category.getEvents().stream().map(event -> event.getId()).collect(Collectors.toList());
        for (Long eventId : eventIds) {
            eventService.deleteEvent(eventId);
        }

        categoryRepository.deleteById(categoryId);
    }
}