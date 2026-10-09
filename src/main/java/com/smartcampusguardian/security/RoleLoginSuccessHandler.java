package com.smartcampusguardian.security;
import jakarta.servlet.http.*; import java.io.IOException; import org.springframework.security.core.Authentication; import org.springframework.security.web.authentication.AuthenticationSuccessHandler; import org.springframework.stereotype.Component;
@Component public class RoleLoginSuccessHandler implements AuthenticationSuccessHandler {
 @Override public void onAuthenticationSuccess(HttpServletRequest request,HttpServletResponse response,Authentication auth) throws IOException {
  String target=auth.getAuthorities().stream().anyMatch(a->a.getAuthority().equals("ROLE_ADMIN"))?"/admin/dashboard":auth.getAuthorities().stream().anyMatch(a->a.getAuthority().equals("ROLE_SECURITY"))?"/security/dashboard":"/student/dashboard"; response.sendRedirect(target);
 }
}
