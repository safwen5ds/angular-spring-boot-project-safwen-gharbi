package com.saf.business.services;

import com.saf.exceptions.DuplicateUserException;
import io.jsonwebtoken.Claims;
import org.springframework.http.ResponseEntity;

public interface AuthService {
    ResponseEntity<?> authenticate(String email, String password);
    ResponseEntity<?> authenticateSocialUser(String email, String name, String photoUrl, String provider, String id) throws DuplicateUserException;
    Claims validateToken(String token);
}
