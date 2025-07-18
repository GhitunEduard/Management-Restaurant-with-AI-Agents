package com.example.gallery_service.dto;

import lombok.Data;
import java.util.List;

@Data
public class EventCategoryDto {
    private Long id;
    private String name;
    private List<EventDto> events; // Vom afișa și evenimentele asociate
}