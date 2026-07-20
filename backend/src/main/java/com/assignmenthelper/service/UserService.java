package com.assignmenthelper.service;

import com.assignmenthelper.dto.PasswordChangeRequest;
import com.assignmenthelper.dto.ProfileStatisticsDTO;
import com.assignmenthelper.dto.ProfileUpdateRequest;
import com.assignmenthelper.dto.UserProfileDTO;
import com.assignmenthelper.model.User;
import com.assignmenthelper.model.UserProfile;
import com.assignmenthelper.repository.UserRepository;
import com.assignmenthelper.repository.UserProfileRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.Optional;

@Service
public class UserService {

    @Autowired
    private UserRepository userRepository;
    
    @Autowired
    private UserProfileRepository userProfileRepository;
    
    @Autowired
    private PasswordEncoder passwordEncoder;

    public Optional<User> findById(Long id) {
        return userRepository.findById(id);
    }

    public UserProfileDTO getUserProfile(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        UserProfile profile = user.getUserProfile();
        if (profile == null) {
            profile = new UserProfile();
            profile.setUser(user);
            profile = userProfileRepository.save(profile);
            user.setUserProfile(profile);
            userRepository.save(user);
        }
        
        return mapToDTO(user, profile);
    }

    public UserProfileDTO updateProfile(Long userId, ProfileUpdateRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        UserProfile profile = user.getUserProfile();
        if (profile == null) {
            profile = new UserProfile();
            profile.setUser(user);
        }
        
        profile.setFullName(request.getFullName());
        profile.setGender(request.getGender());
        profile.setDateOfBirth(request.getDateOfBirth());
        profile.setMobileNumber(request.getMobileNumber());
        profile.setAddressLine1(request.getAddressLine1());
        profile.setAddressLine2(request.getAddressLine2());
        profile.setCity(request.getCity());
        profile.setState(request.getState());
        profile.setCountry(request.getCountry());
        profile.setPostalCode(request.getPostalCode());
        profile.setInstitutionName(request.getInstitutionName());
        profile.setCourse(request.getCourse());
        profile.setDepartment(request.getDepartment());
        profile.setSemester(request.getSemester());
        profile.setPreferredLanguage(request.getPreferredLanguage());
        profile.setBio(request.getBio());
        
        userProfileRepository.save(profile);
        
        return mapToDTO(user, profile);
    }
    
    public UserProfileDTO updateProfileImage(Long userId, String imageUrl) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        UserProfile profile = user.getUserProfile();
        if (profile == null) {
            profile = new UserProfile();
            profile.setUser(user);
        }
        
        profile.setProfileImageUrl(imageUrl);
        userProfileRepository.save(profile);
        
        return mapToDTO(user, profile);
    }
    
    public UserProfileDTO removeProfileImage(Long userId) {
        return updateProfileImage(userId, null);
    }
    
    public void changePassword(Long userId, PasswordChangeRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
                
        if (!passwordEncoder.matches(request.getCurrentPassword(), user.getPassword())) {
            throw new RuntimeException("Current password is incorrect");
        }
        
        if (!request.getNewPassword().equals(request.getConfirmNewPassword())) {
            throw new RuntimeException("New passwords do not match");
        }
        
        user.setPassword(passwordEncoder.encode(request.getNewPassword()));
        userRepository.save(user);
    }
    
    public ProfileStatisticsDTO getProfileStatistics(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
                
        ProfileStatisticsDTO stats = new ProfileStatisticsDTO();
        stats.setAccountCreatedDate(user.getCreatedAt());
        stats.setLastLoginDate(user.getLastLoginAt());
        stats.setEmailVerified(user.getEmailVerified());
        
        // In a real application, you'd fetch these from actual repositories
        // For now we mock these counts as instructed if they don't exist yet in the repo level
        stats.setUploadedDocumentsCount(0L);
        stats.setGeneratedAssignmentsCount(0L);
        stats.setGeneratedMcqsCount(0L);
        stats.setGeneratedVivaQuestionsCount(0L);
        
        return stats;
    }

    private UserProfileDTO mapToDTO(User user, UserProfile profile) {
        UserProfileDTO dto = new UserProfileDTO();
        dto.setId(user.getId());
        dto.setUsername(user.getUsername());
        dto.setEmail(user.getEmail());
        dto.setEmailVerified(user.getEmailVerified());
        dto.setCreatedAt(user.getCreatedAt());
        dto.setLastLoginAt(user.getLastLoginAt());
        
        if (profile != null) {
            dto.setFullName(profile.getFullName());
            dto.setGender(profile.getGender());
            dto.setDateOfBirth(profile.getDateOfBirth());
            dto.setMobileNumber(profile.getMobileNumber());
            dto.setAddressLine1(profile.getAddressLine1());
            dto.setAddressLine2(profile.getAddressLine2());
            dto.setCity(profile.getCity());
            dto.setState(profile.getState());
            dto.setCountry(profile.getCountry());
            dto.setPostalCode(profile.getPostalCode());
            dto.setInstitutionName(profile.getInstitutionName());
            dto.setCourse(profile.getCourse());
            dto.setDepartment(profile.getDepartment());
            dto.setSemester(profile.getSemester());
            dto.setPreferredLanguage(profile.getPreferredLanguage());
            dto.setBio(profile.getBio());
            dto.setProfileImageUrl(profile.getProfileImageUrl());
            
            // Calculate completion percentage
            dto.setProfileCompletion(calculateCompletion(profile));
        }
        
        return dto;
    }
    
    private int calculateCompletion(UserProfile profile) {
        int totalFields = 10;
        int filledFields = 0;
        
        if (profile.getProfileImageUrl() != null && !profile.getProfileImageUrl().isEmpty()) filledFields++;
        if (profile.getFullName() != null && !profile.getFullName().isEmpty()) filledFields++;
        if (profile.getGender() != null && !profile.getGender().isEmpty()) filledFields++;
        if (profile.getDateOfBirth() != null) filledFields++;
        if (profile.getMobileNumber() != null && !profile.getMobileNumber().isEmpty()) filledFields++;
        if (profile.getAddressLine1() != null && !profile.getAddressLine1().isEmpty()) filledFields++;
        if (profile.getInstitutionName() != null && !profile.getInstitutionName().isEmpty()) filledFields++;
        if (profile.getCourse() != null && !profile.getCourse().isEmpty()) filledFields++;
        if (profile.getPreferredLanguage() != null && !profile.getPreferredLanguage().isEmpty()) filledFields++;
        if (profile.getBio() != null && !profile.getBio().isEmpty()) filledFields++;
        
        return (filledFields * 100) / totalFields;
    }
}
