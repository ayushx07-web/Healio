package com.ambula.ai;

public class GroqApiException extends RuntimeException {
    public GroqApiException(String message) {
        super(message);
    }
    public GroqApiException(String message, Throwable cause) {
        super(message, cause);
    }
}
