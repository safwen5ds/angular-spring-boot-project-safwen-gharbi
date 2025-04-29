package com.saf.web.controller;

import com.saf.dao.entities.User;
import com.saf.dao.repository.UserRepository;
import com.saf.business.services.AuthService;
import com.saf.exceptions.DuplicateUserException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "http://localhost:4200", allowCredentials = "true")
public class AuthController {
    private final AuthService authService;
    private final UserRepository userRepository;

    @Autowired
    public AuthController(
            AuthService authService,
            UserRepository userRepository
    ) {
        this.authService     = authService;
        this.userRepository  = userRepository;
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody Map<String, String> credentials) {
        String email    = credentials.get("email");
        String password = credentials.get("password");
        return authService.authenticate(email, password);
    }

    @PostMapping("/social-login")
    public ResponseEntity<?> socialLogin(@RequestBody Map<String, String> socialUser) throws DuplicateUserException {
        String email    = socialUser.get("email");
        String name     = socialUser.get("name");
        String photoUrl = socialUser.get("photoUrl");
        String provider = socialUser.get("provider");
        String id       = socialUser.get("id");
        return authService.authenticateSocialUser(email, name, photoUrl, provider, id);
    }

    @PostMapping("/validate")
    public ResponseEntity<?> validateToken(@RequestBody Map<String, String> tokenMap) {
        String token = tokenMap.get("token");
        try {
            authService.validateToken(token);
            return ResponseEntity.ok().build();
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Invalid token");
        }
    }

    @GetMapping("/users")
    public List<Map<String, Object>> listUsers() {
        return userRepository.findAll()
            .stream()
            .map(this::extractEmailAndLastLogin)
            .collect(Collectors.toList());
    }

    private Map<String, Object> extractEmailAndLastLogin(User u) {
        Map<String, Object> m = new HashMap<>();
        m.put("email",     u.getEmail());
        m.put("lastLogin", u.getLastLogin());
        return m;
    }
}
