package com.ambula.auth;

import com.ambula.auth.dto.LoginRequest;
import com.ambula.auth.dto.LoginResponse;
import com.ambula.config.JwtConfig;
import com.ambula.user.User;
import com.ambula.user.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtConfig jwtConfig;

    public LoginResponse login(LoginRequest request) {
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new RuntimeException("Invalid credentials"));

        if (!passwordEncoder.matches(request.getPassword(), user.getPasswordHash())) {
            throw new RuntimeException("Invalid credentials");
        }

        String token = jwtConfig.generateToken(user.getEmail());

        return LoginResponse.builder()
                .token(token)
                .user(LoginResponse.UserInfo.builder()
                        .id(user.getId())
                        .name(user.getName())
                        .email(user.getEmail())
                        .role(user.getRole().name())
                        .build())
                .build();
    }

    public LoginResponse register(LoginRequest request) {
        if (userRepository.findByEmail(request.getEmail()).isPresent()) {
            throw new RuntimeException("Email already registered");
        }

        User user = User.builder()
                .email(request.getEmail())
                .passwordHash(passwordEncoder.encode(request.getPassword()))
                .role(User.Role.PATIENT)
                .name(request.getName() != null && !request.getName().isBlank() ? request.getName() : "New User")
                .phone(request.getPhone())
                .build();

        User saved = userRepository.save(user);
        String token = jwtConfig.generateToken(saved.getEmail());

        return LoginResponse.builder()
                .token(token)
                .user(LoginResponse.UserInfo.builder()
                        .id(saved.getId())
                        .name(saved.getName())
                        .email(saved.getEmail())
                        .role(saved.getRole().name())
                        .build())
                .build();
    }
}
