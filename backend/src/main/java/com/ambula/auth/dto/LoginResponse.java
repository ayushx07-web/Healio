package com.ambula.auth.dto;

import lombok.Builder;
import lombok.Data;

@Data @Builder
public class LoginResponse {
    private String token;
    private UserInfo user;

    @Data @Builder
    public static class UserInfo {
        private Long id;
        private String name;
        private String email;
        private String role;
    }
}
