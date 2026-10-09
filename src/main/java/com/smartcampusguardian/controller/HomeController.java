package com.smartcampusguardian.controller;

import java.util.Map;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class HomeController {
    @GetMapping("/") public Map<String, String> status() { return Map.of("application", "SMART CAMPUS GUARDIAN", "status", "foundation-ready"); }
}
