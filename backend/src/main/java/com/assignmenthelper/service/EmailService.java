package com.assignmenthelper.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
public class EmailService {

    @Autowired
    private JavaMailSender mailSender;

    public void sendPasswordResetOtp(String toEmail, String otp) {
        SimpleMailMessage message = new SimpleMailMessage();
        message.setTo(toEmail);
        message.setSubject("Assignment Helper Agent - Password Reset Verification");
        
        String body = "Hello,\n\n"
                + "Your verification code is:\n\n"
                + otp + "\n\n"
                + "This code is valid for 10 minutes.\n\n"
                + "Do not share this code with anyone.\n\n"
                + "Regards,\n"
                + "Assignment Helper Agent";
                
        message.setText(body);
        
        try {
            mailSender.send(message);
        } catch (Exception e) {
            System.err.println("=========================================================");
            System.err.println("FAILED TO SEND EMAIL. MISSING CONFIG IN application.properties");
            System.err.println("To fix this, add your Gmail and App Password to application.properties.");
            System.err.println("MOCK EMAIL SENT. OTP CODE IS: " + otp);
            System.err.println("=========================================================");
        }
    }

    @Autowired
    private PdfGeneratorService pdfGeneratorService;

    public void sendStudyMaterialEmail(String toEmail, String userName, String contentType, String topic, String content) {
        try {
            jakarta.mail.internet.MimeMessage mimeMessage = mailSender.createMimeMessage();
            org.springframework.mail.javamail.MimeMessageHelper helper = new org.springframework.mail.javamail.MimeMessageHelper(mimeMessage, true, "UTF-8");

            helper.setTo(toEmail);
            helper.setSubject("Your AI Generated Study Material");

            StringBuilder htmlMsg = new StringBuilder();
            htmlMsg.append("<h3>Hello ").append(userName).append(",</h3>");
            htmlMsg.append("<p>Thank you for using Assignment Helper Agent.</p>");
            htmlMsg.append("<p>Your requested study material has been generated successfully.</p>");
            htmlMsg.append("<h4>Content Details:</h4>");
            htmlMsg.append("<ul>");
            htmlMsg.append("<li><b>Content Type:</b> ").append(contentType).append("</li>");
            htmlMsg.append("<li><b>Topic:</b> ").append(topic).append("</li>");
            htmlMsg.append("<li><b>Generated On:</b> ").append(java.time.LocalDateTime.now().format(java.time.format.DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss"))).append("</li>");
            htmlMsg.append("</ul>");

            if (content.length() > 1000) {
                htmlMsg.append("<p>The complete generated content is attached below as a PDF.</p>");
                byte[] pdfBytes = pdfGeneratorService.generatePdfFromText(contentType + " - " + topic, content);
                helper.addAttachment("StudyMaterial.pdf", new org.springframework.core.io.ByteArrayResource(pdfBytes));
            } else {
                htmlMsg.append("<p>The complete generated content is included below:</p>");
                htmlMsg.append("<hr/>");
                htmlMsg.append("<pre style='font-family: inherit; white-space: pre-wrap;'>").append(content).append("</pre>");
            }

            htmlMsg.append("<br/><p>We hope this helps with your learning.</p>");
            htmlMsg.append("<p>Best Regards,<br/>Assignment Helper Agent<br/>AI Powered Learning Platform</p>");

            helper.setText(htmlMsg.toString(), true);
            mailSender.send(mimeMessage);

        } catch (Exception e) {
            System.err.println("Failed to send HTML email: " + e.getMessage());
            e.printStackTrace();
        }
    }
}
