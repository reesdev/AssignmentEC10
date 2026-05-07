package com.service1.customer;

import java.util.Map;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class MainController {
    @GetMapping("/health")
    public Map<String, String> health() {
        return Map.of("status", "OK", "service", "service-1-java");
    }
}
