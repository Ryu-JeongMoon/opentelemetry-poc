package poc.otlp;

import jakarta.persistence.EntityManager;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@CrossOrigin(origins = "http://localhost:3000")
public class OpenTelemetryController {

  private final Logger log = LoggerFactory.getLogger(OpenTelemetryController.class);

  private final EntityManager entityManager;

  public OpenTelemetryController(EntityManager entityManager) {
    this.entityManager = entityManager;
  }

  @GetMapping("/api/users")
  public String getUsers() {
    log.info("Fetching users");
    entityManager.createNativeQuery("SELECT 1").getSingleResult();
    return "Users fetched!";
  }

  @GetMapping("/api/error")
  public String error() {
    throw new RuntimeException("Test error");
  }
}
