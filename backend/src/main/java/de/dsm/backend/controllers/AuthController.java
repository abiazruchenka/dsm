package de.dsm.backend.controllers;

import de.dsm.backend.config.JwtUtil;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
@Validated
@Tag(name = "Authentication", description = "Authentication operations")
public class AuthController {

    private final JwtUtil jwtUtil;

    @Value("${admin.username}")
    private String adminUsername;

    @Value("${admin.password}")
    private String adminPassword;

    @Value("${admin.email}")
    private String adminEmail;

    @PostMapping("/login")
    public ResponseEntity<Map<String, Object>> login(@Valid @RequestBody LoginRequest request) {
        // Проверяем credentials из конфига
        boolean isValidCredentials = request.getEmail().equals(adminEmail) || 
                                     request.getEmail().equals(adminUsername);
        boolean isValidPassword = request.getPassword().equals(adminPassword);

        if (!isValidCredentials || !isValidPassword) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("error", "Invalid credentials"));
        }

        // Генерируем JWT токен
        String token = jwtUtil.generateToken(adminUsername, adminEmail);

        // Создаем объект пользователя
        Map<String, Object> user = new HashMap<>();
        user.put("username", adminUsername);
        user.put("email", adminEmail);
        user.put("roles", new String[]{"ROLE_ADMIN"});

        Map<String, Object> response = new HashMap<>();
        response.put("token", token);
        response.put("user", user);

        return ResponseEntity.ok(response);
    }

    // DTO для запроса логина
    public static class LoginRequest {
        private String email;
        private String password;

        public String getEmail() {
            return email;
        }

        public void setEmail(String email) {
            this.email = email;
        }

        public String getPassword() {
            return password;
        }

        public void setPassword(String password) {
            this.password = password;
        }
    }
}
