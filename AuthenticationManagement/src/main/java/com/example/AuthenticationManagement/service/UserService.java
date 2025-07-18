package com.example.AuthenticationManagement.service;

import com.example.AuthenticationManagement.dto.UserRequestDTO;
import com.example.AuthenticationManagement.dto.UserResponseDTO;
import com.example.AuthenticationManagement.model.User;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;
import java.util.Optional;

public interface UserService extends UserDetailsService {
    UserResponseDTO createUser(UserRequestDTO dto);
    List<UserResponseDTO> getAllUsers();
    UserResponseDTO getUserById(Long id);
    void deleteUser(Long id);
    UserResponseDTO updateUser(Long id, UserRequestDTO dto);
    Optional<User> findByEmail(String email);
    String storeProfileImage(Long userId, MultipartFile file) throws IOException;
}