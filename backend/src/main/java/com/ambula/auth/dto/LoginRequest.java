package com.ambula.auth.dto;

import lombok.Data;

@Data
public class LoginRequest {
    private String email;
    private String password;
    private String name;
    private String phone;
}
