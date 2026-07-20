package com.assignmenthelper.service;

import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.pdmodel.PDPage;
import org.apache.pdfbox.pdmodel.PDPageContentStream;
import org.apache.pdfbox.pdmodel.font.PDType1Font;
import org.springframework.stereotype.Service;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.util.ArrayList;
import java.util.List;

@Service
public class PdfGeneratorService {

    public byte[] generatePdfFromText(String title, String content) throws IOException {
        try (PDDocument document = new PDDocument();
             ByteArrayOutputStream baos = new ByteArrayOutputStream()) {

            PDType1Font font = PDType1Font.HELVETICA;
            PDType1Font boldFont = PDType1Font.HELVETICA_BOLD;

            float startY = 750f;
            float margin = 50f;
            float leading = 14.5f;
            float currentY = startY;

            PDPage page = new PDPage();
            document.addPage(page);

            PDPageContentStream contentStream = new PDPageContentStream(document, page);
            contentStream.setFont(boldFont, 16);
            contentStream.beginText();
            contentStream.setLeading(leading);
            contentStream.newLineAtOffset(margin, startY);
            contentStream.showText(title);
            contentStream.newLine();
            contentStream.newLine();
            currentY -= 2 * leading;

            contentStream.setFont(font, 12);
            
            String[] paragraphs = content.split("\n");
            for (String paragraph : paragraphs) {
                if (paragraph.trim().isEmpty()) {
                    if (currentY < margin + leading) {
                        contentStream.endText();
                        contentStream.close();
                        page = new PDPage();
                        document.addPage(page);
                        contentStream = new PDPageContentStream(document, page);
                        contentStream.setFont(font, 12);
                        contentStream.beginText();
                        contentStream.setLeading(leading);
                        contentStream.newLineAtOffset(margin, startY);
                        currentY = startY;
                    } else {
                        contentStream.newLine();
                        currentY -= leading;
                    }
                    continue;
                }
                
                // Simple word wrap
                List<String> lines = wrapText(paragraph, font, 12, 500);
                for (String line : lines) {
                    if (currentY < margin + leading) {
                        contentStream.endText();
                        contentStream.close();
                        page = new PDPage();
                        document.addPage(page);
                        contentStream = new PDPageContentStream(document, page);
                        contentStream.setFont(font, 12);
                        contentStream.beginText();
                        contentStream.setLeading(leading);
                        contentStream.newLineAtOffset(margin, startY);
                        currentY = startY;
                    }
                    contentStream.showText(line);
                    contentStream.newLine();
                    currentY -= leading;
                }
            }
            
            contentStream.endText();
            contentStream.close();

            document.save(baos);
            return baos.toByteArray();
        }
    }

    private List<String> wrapText(String text, PDType1Font font, float fontSize, float maxWidth) throws IOException {
        List<String> lines = new ArrayList<>();
        String[] words = text.split(" ");
        StringBuilder currentLine = new StringBuilder();

        for (String word : words) {
            // Strip unsupported characters (e.g., emojis or weird unicode) to prevent PDFBox errors
            word = word.replaceAll("[^\\x00-\\x7F]", "");
            
            if (word.isEmpty()) continue;

            String testLine = currentLine.length() > 0 ? currentLine + " " + word : word;
            float width = font.getStringWidth(testLine) / 1000 * fontSize;

            if (width > maxWidth) {
                if (currentLine.length() > 0) {
                    lines.add(currentLine.toString());
                    currentLine = new StringBuilder(word);
                } else {
                    lines.add(word); // Word itself is too long, just add it
                }
            } else {
                currentLine.append(currentLine.length() > 0 ? " " : "").append(word);
            }
        }
        if (currentLine.length() > 0) {
            lines.add(currentLine.toString());
        }
        return lines;
    }
}
