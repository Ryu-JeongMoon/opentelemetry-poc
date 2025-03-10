package poc.otlp;

import jakarta.persistence.EntityManager;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@SpringBootApplication
public class DemoApplication {

  @Autowired
  private EntityManager entityManager;

  public static void main(String[] args) {
    SpringApplication.run(DemoApplication.class, args);
  }

  @GetMapping("/api/users")
  public String getUsers() {
    entityManager.createNativeQuery("SELECT 1").getSingleResult(); // DB 쿼리
    return "Users fetched!";
  }

  @GetMapping("/api/error")
  public String error() {
    throw new RuntimeException("Test error");
  }
}
