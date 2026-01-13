package de.dsm.backend.services;

import de.dsm.backend.models.mails.ContactMailData;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.MailException;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import lombok.extern.slf4j.Slf4j;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@Slf4j
@RequiredArgsConstructor
public class EmailService {
    private final JavaMailSender mailSender;

    @Value("${admin.email}")
    private String adminEmail;

    public void sendContactMessage(ContactMailData contact) {
        try {
            SimpleMailMessage mail = new SimpleMailMessage();
            mail.setTo(adminEmail);
            mail.setSubject("New contact message");
            mail.setText("""
                    New message received:
                    
                    Name: %s
                    Email: %s
                    
                    Message:
                    %s
                    """.formatted(contact.name(), contact.email(), contact.message()
            ));

            mailSender.send(mail);
        } catch (MailException e) {
            log.error("Email send failed for {}", contact.email(), e);
            throw e;
        }
    }
}
