package com.example.gallery_service.mapper;

import com.example.gallery_service.dto.CreateEventCategoryRequest;
import com.example.gallery_service.dto.EventCategoryDto;
import com.example.gallery_service.model.EventCategory;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring", uses = EventMapper.class)
public interface EventCategoryMapper {
    EventCategoryDto toDto(EventCategory eventCategory);
    @Mapping(target = "id", ignore = true)
    @Mapping(target = "events", ignore = true)
    EventCategory toEntity(CreateEventCategoryRequest request);
}