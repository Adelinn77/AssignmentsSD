package com.university.forum_app.service;

import com.sendgrid.Method;
import com.sendgrid.Request;
import com.sendgrid.Response;
import com.sendgrid.SendGrid;
import com.sendgrid.helpers.mail.Mail;
import com.sendgrid.helpers.mail.objects.Content;
import com.sendgrid.helpers.mail.objects.Email;
import com.twilio.Twilio;
import com.twilio.rest.api.v2010.account.Message;
import com.twilio.type.PhoneNumber;
import com.university.forum_app.entity.User;
import com.university.forum_app.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

import java.io.IOException;

@Service
public class NotificationService {

    @Autowired
    private UserRepository userRepository;

    @Value("${sendgrid.enabled:false}")
    private boolean sendGridEnabled;

    @Value("${sendgrid.api-key:}")
    private String sendGridApiKey;

    @Value("${sendgrid.from-email:}")
    private String sendGridFromEmail;

    @Value("${twilio.enabled:false}")
    private boolean twilioEnabled;

    @Value("${twilio.account-sid:}")
    private String twilioAccountSid;

    @Value("${twilio.auth-token:}")
    private String twilioAuthToken;

    @Value("${twilio.from-number:}")
    private String twilioFromNumber;

    public boolean isBlocked(String username) {
        if (isBlank(username)) {
            return false;
        }

        User user = userRepository.findByUsername(username);
        return user != null && user.isAccessRestricted();
    }

    @Async
    public void sendAccountBlockedNotifications(String username) {
        System.out.println("BLOCKED LOGIN NOTIFICATION STARTED FOR USER: " + username);

        if (isBlank(username)) {
            System.out.println("USERNAME IS BLANK");
            return;
        }

        User user = userRepository.findByUsername(username);
        if (user == null) {
            System.out.println("USER NOT FOUND: " + username);
            return;
        }

        if (!user.isAccessRestricted()) {
            System.out.println("USER IS NOT BLOCKED: " + username);
            return;
        }

        System.out.println("USER EMAIL: " + user.getEmail());
        System.out.println("USER PHONE: " + user.getPhone());

        sendBlockedEmail(user);
        sendBlockedSms(user);
    }

    private void sendBlockedEmail(User user) {
        System.out.println("SENDGRID EMAIL METHOD STARTED");
        System.out.println("sendGridEnabled = " + sendGridEnabled);
        System.out.println("sendGridApiKey blank = " + isBlank(sendGridApiKey));
        System.out.println("sendGridFromEmail = " + sendGridFromEmail);
        System.out.println("recipient email = " + user.getEmail());

        if (!sendGridEnabled || isBlank(sendGridApiKey) || isBlank(sendGridFromEmail) || isBlank(user.getEmail())) {
            System.out.println("SENDGRID CONFIG INVALID OR EMAIL MISSING");
            return;
        }

        Email sender = new Email(sendGridFromEmail);
        Email receiver = new Email(user.getEmail());
        Content content = new Content("text/plain", "Your account has been blocked. Please contact support.");
        Mail mail = new Mail(sender, "Account blocked", receiver, content);

        SendGrid sendGrid = new SendGrid(sendGridApiKey);
        Request request = new Request();

        try {
            request.setMethod(Method.POST);
            request.setEndpoint("mail/send");
            request.setBody(mail.build());

            Response response = sendGrid.api(request);

            System.out.println("SENDGRID STATUS CODE: " + response.getStatusCode());
            System.out.println("SENDGRID BODY: " + response.getBody());
        } catch (IOException exception) {
            System.out.println("SENDGRID EXCEPTION");
            exception.printStackTrace();
        }
    }

    private void sendBlockedSms(User user) {
        System.out.println("TWILIO SMS METHOD STARTED");
        System.out.println("twilioEnabled = " + twilioEnabled);
        System.out.println("twilioAccountSid blank = " + isBlank(twilioAccountSid));
        System.out.println("twilioAuthToken blank = " + isBlank(twilioAuthToken));
        System.out.println("twilioFromNumber = " + twilioFromNumber);
        System.out.println("recipient phone = " + user.getPhone());

        if (!twilioEnabled || isBlank(twilioAccountSid) || isBlank(twilioAuthToken) || isBlank(twilioFromNumber) || isBlank(user.getPhone())) {
            System.out.println("TWILIO CONFIG INVALID OR PHONE MISSING");
            return;
        }

        try {
            Twilio.init(twilioAccountSid, twilioAuthToken);

            Message message = Message.creator(
                    new PhoneNumber(user.getPhone()),
                    new PhoneNumber(twilioFromNumber),
                    "Your account has been blocked. Please contact support."
            ).create();

            System.out.println("TWILIO MESSAGE SID: " + message.getSid());
        } catch (RuntimeException exception) {
            System.out.println("TWILIO EXCEPTION");
            exception.printStackTrace();
        }
    }

    private boolean isBlank(String value) {
        return value == null || value.trim().isEmpty();
    }
}