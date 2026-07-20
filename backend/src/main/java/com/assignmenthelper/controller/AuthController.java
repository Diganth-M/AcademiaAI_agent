package com.assignmenthelper.controller;

import com.assignmenthelper.dto.JwtResponse;
import com.assignmenthelper.dto.LoginRequest;
import com.assignmenthelper.dto.MessageResponse;
import com.assignmenthelper.dto.RegisterRequest;
import com.assignmenthelper.model.User;
import com.assignmenthelper.repository.UserRepository;
import com.assignmenthelper.security.JwtUtils;
import com.assignmenthelper.security.UserDetailsImpl;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;
import jakarta.validation.Valid;
import java.security.SecureRandom;
import java.time.LocalDateTime;
import java.util.Optional;
import com.assignmenthelper.dto.*;
import com.assignmenthelper.model.PasswordResetToken;
import com.assignmenthelper.repository.PasswordResetTokenRepository;
import com.assignmenthelper.service.EmailService;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    @Autowired
    AuthenticationManager authenticationManager;

    @Autowired
    UserRepository userRepository;

    @Autowired
    PasswordEncoder encoder;

    @Autowired
    JwtUtils jwtUtils;

    @PostMapping("/login")
    public ResponseEntity<?> authenticateUser(@RequestBody LoginRequest loginRequest) {
        
        // First check if user exists
        boolean userExists = userRepository.existsByUsername(loginRequest.getUsername()) || 
                             userRepository.existsByEmail(loginRequest.getUsername());
        
        if (!userExists) {
            return ResponseEntity.badRequest().body(new MessageResponse("User not registered. Please register first."));
        }

        try {
            Authentication authentication = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(loginRequest.getUsername(), loginRequest.getPassword()));

            SecurityContextHolder.getContext().setAuthentication(authentication);
            String jwt = jwtUtils.generateJwtToken(authentication);

            UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();

            return ResponseEntity.ok(new JwtResponse(jwt,
                    userDetails.getId(),
                    userDetails.getUsername(),
                    userDetails.getEmail()));
        } catch (org.springframework.security.authentication.BadCredentialsException e) {
            return ResponseEntity.badRequest().body(new MessageResponse("Invalid password."));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new MessageResponse("Login failed: " + e.getMessage()));
        }
    }

    @PostMapping("/register")
    public ResponseEntity<?> registerUser(@RequestBody RegisterRequest signUpRequest) {
        if (userRepository.existsByUsername(signUpRequest.getUsername())) {
            return ResponseEntity.badRequest().body(new MessageResponse("Error: Username is already taken!"));
        }

        if (userRepository.existsByEmail(signUpRequest.getEmail())) {
            return ResponseEntity.badRequest().body(new MessageResponse("Error: Email is already in use!"));
        }

        // Create new user's account
        User user = new User();
        user.setUsername(signUpRequest.getUsername());
        user.setEmail(signUpRequest.getEmail());
        user.setPassword(encoder.encode(signUpRequest.getPassword()));

        userRepository.save(user);

        return ResponseEntity.ok(new MessageResponse("User registered successfully!"));
    }

    @Autowired
    PasswordResetTokenRepository tokenRepository;

    @Autowired
    EmailService emailService;

    private String generateOTP() {
        SecureRandom random = new SecureRandom();
        int num = random.nextInt(1000000);
        return String.format("%06d", num);
    }

    @PostMapping("/forgot-password")
    public ResponseEntity<?> forgotPassword(@Valid @RequestBody ForgotPasswordRequest request) {
        String email = request.getEmail();
        Optional<User> userOpt = userRepository.findByEmail(email);
        
        if (userOpt.isPresent()) {
            tokenRepository.deleteByEmail(email); // Invalidate previous tokens
            
            String otp = generateOTP();
            PasswordResetToken token = new PasswordResetToken();
            token.setEmail(email);
            token.setOtp(otp);
            token.setCreatedTime(LocalDateTime.now());
            token.setExpiryTime(LocalDateTime.now().plusMinutes(10));
            tokenRepository.save(token);
            
            emailService.sendPasswordResetOtp(email, otp);
        }
        
        // Prevent revealing if email exists
        return ResponseEntity.ok(new MessageResponse("If the email is registered, a verification code has been sent."));
    }

    @PostMapping("/verify-otp")
    public ResponseEntity<?> verifyOtp(@Valid @RequestBody VerifyOtpRequest request) {
        Optional<PasswordResetToken> tokenOpt = tokenRepository.findTopByEmailOrderByCreatedTimeDesc(request.getEmail());
        
        if (tokenOpt.isEmpty()) {
            return ResponseEntity.badRequest().body(new MessageResponse("Invalid or expired OTP"));
        }
        
        PasswordResetToken token = tokenOpt.get();
        
        if (token.isUsed()) {
            return ResponseEntity.badRequest().body(new MessageResponse("OTP already used"));
        }
        
        if (token.getExpiryTime().isBefore(LocalDateTime.now())) {
            return ResponseEntity.badRequest().body(new MessageResponse("OTP has expired"));
        }
        
        if (token.getAttempts() >= 5) {
            return ResponseEntity.badRequest().body(new MessageResponse("Maximum verification attempts reached. Request a new OTP."));
        }
        
        if (!token.getOtp().equals(request.getOtp())) {
            token.setAttempts(token.getAttempts() + 1);
            tokenRepository.save(token);
            return ResponseEntity.badRequest().body(new MessageResponse("Invalid OTP"));
        }
        
        token.setVerified(true);
        tokenRepository.save(token);
        
        return ResponseEntity.ok(new MessageResponse("OTP Verified"));
    }

    @PostMapping("/reset-password")
    public ResponseEntity<?> resetPassword(@Valid @RequestBody ResetPasswordRequest request) {
        if (!request.getNewPassword().equals(request.getConfirmPassword())) {
            return ResponseEntity.badRequest().body(new MessageResponse("Passwords do not match"));
        }
        
        Optional<PasswordResetToken> tokenOpt = tokenRepository.findTopByEmailOrderByCreatedTimeDesc(request.getEmail());
        if (tokenOpt.isEmpty() || !tokenOpt.get().isVerified() || tokenOpt.get().isUsed()) {
            return ResponseEntity.badRequest().body(new MessageResponse("Unauthorized request"));
        }
        
        Optional<User> userOpt = userRepository.findByEmail(request.getEmail());
        if (userOpt.isEmpty()) {
            return ResponseEntity.badRequest().body(new MessageResponse("User not found"));
        }
        
        User user = userOpt.get();
        user.setPassword(encoder.encode(request.getNewPassword()));
        userRepository.save(user);
        
        PasswordResetToken token = tokenOpt.get();
        token.setUsed(true);
        tokenRepository.save(token);
        
        // Delete expired/used tokens for this user to clean up
        tokenRepository.deleteByEmail(user.getEmail());
        
        return ResponseEntity.ok(new MessageResponse("Password changed successfully"));
    }

    @PostMapping("/resend-otp")
    public ResponseEntity<?> resendOtp(@Valid @RequestBody ResendOtpRequest request) {
        String email = request.getEmail();
        Optional<PasswordResetToken> lastTokenOpt = tokenRepository.findTopByEmailOrderByCreatedTimeDesc(email);
        
        if (lastTokenOpt.isPresent()) {
            PasswordResetToken lastToken = lastTokenOpt.get();
            // Rate limit: 60 seconds
            if (lastToken.getCreatedTime().plusSeconds(60).isAfter(LocalDateTime.now())) {
                return ResponseEntity.badRequest().body(new MessageResponse("Please wait 60 seconds before requesting a new OTP."));
            }
        }
        
        Optional<User> userOpt = userRepository.findByEmail(email);
        if (userOpt.isPresent()) {
            tokenRepository.deleteByEmail(email); // Invalidate previous tokens
            
            String otp = generateOTP();
            PasswordResetToken token = new PasswordResetToken();
            token.setEmail(email);
            token.setOtp(otp);
            token.setCreatedTime(LocalDateTime.now());
            token.setExpiryTime(LocalDateTime.now().plusMinutes(10));
            tokenRepository.save(token);
            
            emailService.sendPasswordResetOtp(email, otp);
        }
        
        return ResponseEntity.ok(new MessageResponse("If the email is registered, a new OTP has been sent."));
    }
}
