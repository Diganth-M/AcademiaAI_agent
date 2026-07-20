package com.assignmenthelper.controller;

import com.assignmenthelper.dto.MessageResponse;
import com.assignmenthelper.dto.PasswordChangeRequest;
import com.assignmenthelper.dto.ProfileStatisticsDTO;
import com.assignmenthelper.dto.ProfileUpdateRequest;
import com.assignmenthelper.dto.UserProfileDTO;
import com.assignmenthelper.security.UserDetailsImpl;
import com.assignmenthelper.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.UUID;

@RestController
@RequestMapping("/api/users")
public class UserController {

    @Autowired
    private UserService userService;
    
    private final String UPLOAD_DIR = "uploads/profiles/";

    private Long getCurrentUserId() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
        return userDetails.getId();
    }

    @GetMapping("/profile")
    public ResponseEntity<UserProfileDTO> getUserProfile() {
        return ResponseEntity.ok(userService.getUserProfile(getCurrentUserId()));
    }

    @PutMapping("/profile")
    public ResponseEntity<UserProfileDTO> updateProfile(@RequestBody ProfileUpdateRequest request) {
        return ResponseEntity.ok(userService.updateProfile(getCurrentUserId(), request));
    }
    
    @PostMapping("/profile/image")
    public ResponseEntity<?> uploadProfileImage(@RequestParam("image") MultipartFile file) {
        if (file.isEmpty()) {
            return ResponseEntity.badRequest().body(new MessageResponse("Please select a file to upload"));
        }
        
        try {
            // Ensure directory exists
            Path uploadPath = Paths.get(UPLOAD_DIR);
            if (!Files.exists(uploadPath)) {
                Files.createDirectories(uploadPath);
            }
            
            // Validate file type
            String contentType = file.getContentType();
            if (contentType == null || (!contentType.equals("image/jpeg") && !contentType.equals("image/png") && !contentType.equals("image/webp"))) {
                return ResponseEntity.badRequest().body(new MessageResponse("Only JPG, PNG and WEBP formats are supported"));
            }
            
            // Generate unique filename
            String originalFilename = file.getOriginalFilename();
            String extension = originalFilename != null ? originalFilename.substring(originalFilename.lastIndexOf(".")) : "";
            String newFilename = "user-" + getCurrentUserId() + "-" + System.currentTimeMillis() + extension;
            
            Path filePath = uploadPath.resolve(newFilename);
            file.transferTo(filePath.toAbsolutePath().toFile());
            
            String imageUrl = "/" + UPLOAD_DIR + newFilename;
            UserProfileDTO updatedProfile = userService.updateProfileImage(getCurrentUserId(), imageUrl);
            
            return ResponseEntity.ok(updatedProfile);
            
        } catch (IOException e) {
            return ResponseEntity.internalServerError().body(new MessageResponse("Could not upload the file: " + e.getMessage()));
        }
    }
    
    @DeleteMapping("/profile/image")
    public ResponseEntity<?> removeProfileImage() {
        UserProfileDTO updatedProfile = userService.removeProfileImage(getCurrentUserId());
        return ResponseEntity.ok(updatedProfile);
    }
    
    @PutMapping("/profile/password")
    public ResponseEntity<?> changePassword(@RequestBody PasswordChangeRequest request) {
        try {
            userService.changePassword(getCurrentUserId(), request);
            return ResponseEntity.ok(new MessageResponse("Password changed successfully."));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(new MessageResponse(e.getMessage()));
        }
    }
    
    @GetMapping("/profile/statistics")
    public ResponseEntity<ProfileStatisticsDTO> getProfileStatistics() {
        return ResponseEntity.ok(userService.getProfileStatistics(getCurrentUserId()));
    }
}
