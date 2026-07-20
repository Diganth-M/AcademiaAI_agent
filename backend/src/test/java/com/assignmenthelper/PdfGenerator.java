package com.assignmenthelper;

import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.pdmodel.PDPage;
import org.apache.pdfbox.pdmodel.PDPageContentStream;
import org.apache.pdfbox.pdmodel.font.PDType1Font;

import java.io.File;
import java.io.IOException;

public class PdfGenerator {
    
    public static void createPdf(String filename, String title, String[] content) {
        try (PDDocument document = new PDDocument()) {
            PDPage page = new PDPage();
            document.addPage(page);

            PDPageContentStream contentStream = new PDPageContentStream(document, page);
            
            contentStream.beginText();
            contentStream.setFont(PDType1Font.HELVETICA_BOLD, 16);
            contentStream.newLineAtOffset(50, 700);
            contentStream.showText(title);
            contentStream.endText();
            
            contentStream.beginText();
            contentStream.setFont(PDType1Font.HELVETICA, 12);
            contentStream.newLineAtOffset(50, 670);
            contentStream.setLeading(14.5f);
            
            for (String line : content) {
                // simple wrapping is not supported natively by PDFBox easy functions, so we just write short lines
                contentStream.showText(line);
                contentStream.newLine();
            }
            
            contentStream.endText();
            contentStream.close();

            File file = new File(filename);
            file.getParentFile().mkdirs();
            document.save(file);
            System.out.println("Created: " + file.getAbsolutePath());
        } catch (IOException e) {
            e.printStackTrace();
        }
    }

    public static void main(String[] args) {
        String dir = "src/main/resources/default-documents/";
        
        createPdf(dir + "java-basics.pdf", "Java Basics", new String[]{
            "Learn Java syntax, variables, data types, operators, loops, arrays, methods,",
            "classes, and exception handling.",
            "Java is a high-level, class-based, object-oriented programming language.",
            "Topics covered:",
            "1. Variables and Data Types",
            "2. Control Flow (if, loops)",
            "3. Object Oriented Programming Concepts",
            "4. Exception Handling"
        });
        
        createPdf(dir + "python-basics.pdf", "Python Basics", new String[]{
            "Learn Python syntax, variables, collections, conditions, loops, functions,",
            "modules, and exception handling.",
            "Python is an interpreted, high-level, general-purpose programming language.",
            "Topics covered:",
            "1. Variables and Data Structures",
            "2. Control Flow",
            "3. Functions and Modules",
            "4. File I/O and Exceptions"
        });
        
        createPdf(dir + "oops-concepts.pdf", "OOP Concepts", new String[]{
            "Learn classes, objects, inheritance, polymorphism, abstraction, encapsulation,",
            "interfaces, and real-world examples.",
            "Object-oriented programming is a programming paradigm based on the concept of objects.",
            "Topics covered:",
            "1. Encapsulation",
            "2. Abstraction",
            "3. Inheritance",
            "4. Polymorphism"
        });
        
        createPdf(dir + "sql-basics.pdf", "SQL Basics", new String[]{
            "Learn databases, tables, SQL queries, CRUD operations, joins, constraints,",
            "aggregate functions, subqueries, and normalization.",
            "SQL is a domain-specific language used in programming and designed for managing data.",
            "Topics covered:",
            "1. SELECT, INSERT, UPDATE, DELETE",
            "2. JOINS (INNER, LEFT, RIGHT)",
            "3. GROUP BY and Aggregate Functions",
            "4. Subqueries and Normalization"
        });
    }
}
