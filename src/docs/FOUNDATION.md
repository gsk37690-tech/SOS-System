# Phase 1 Foundation

The application uses Java 21, Spring Boot, Spring MVC, Spring Security, Spring Data JPA, Thymeleaf, and MySQL 8. Database credentials are read only from `SCG_DB_*` environment variables; see `.env.example`.

`schema.sql` is intentionally idempotent: it creates absent tables with `CREATE TABLE IF NOT EXISTS` and contains no `DROP`, `TRUNCATE`, or database-creation statement. Spring JPA runs in `validate` mode, so it validates—not modifies—the mapped schema after initialization.

Set local PowerShell variables before starting:

```powershell
$env:SCG_DB_USERNAME = 'root'
$env:SCG_DB_PASSWORD = 'your-local-password'
mvn spring-boot:run
```

The Phase 1 seed script creates the eight fictional campus zones with `INSERT IGNORE`, so existing data is not overwritten. Demo identities will be introduced with BCrypt hashes in the authentication phase. This avoids committing a plaintext password or an opaque, unverified password hash.

To verify the packaged application without a MySQL password, use the isolated smoke profile (H2 is included only for this check):

```powershell
java -jar target/smart-campus-guardian-0.0.1-SNAPSHOT.jar --spring.profiles.active=smoke
```
