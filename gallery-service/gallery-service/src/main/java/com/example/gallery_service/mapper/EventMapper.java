package com.example.gallery_service.mapper;

import com.example.gallery_service.dto.CreateEventRequest;
import com.example.gallery_service.dto.EventDto;
import com.example.gallery_service.model.Event;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface EventMapper {
    EventDto toDto(Event event);
    @Mapping(target = "id", ignore = true)
    @Mapping(target = "photoUrl", ignore = true)
    @Mapping(target = "category", ignore = true)
    Event toEntity(CreateEventRequest request);
}