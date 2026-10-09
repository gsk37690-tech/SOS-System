package com.smartcampusguardian.controller;
import org.springframework.stereotype.Controller; import org.springframework.web.bind.annotation.GetMapping;
@Controller public class PortalController {
 @GetMapping("/login") String login(){return "auth/login";} @GetMapping("/register") String register(){return "auth/register";}
 @GetMapping("/student/dashboard") String student(){return "student/dashboard";} @GetMapping("/admin/dashboard") String admin(){return "admin/dashboard";} @GetMapping("/security/dashboard") String security(){return "security/dashboard";}
}
