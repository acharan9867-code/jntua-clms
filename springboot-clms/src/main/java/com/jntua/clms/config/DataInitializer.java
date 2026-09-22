package com.jntua.clms.config;

import com.jntua.clms.entity.*;
import com.jntua.clms.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import java.math.BigDecimal;

@Component
public class DataInitializer implements CommandLineRunner {

    @Autowired private UserRepository userRepository;
    @Autowired private CategoryRepository categoryRepository;
    @Autowired private BookRepository bookRepository;
    @Autowired private PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) {
        if (userRepository.count() > 0) {
            System.out.println("✅ Database already has data — skipping seed.");
            return;
        }

        System.out.println("🌱 Seeding JNTUA CLMS database...");
        seedCategories();
        seedUsers();
        seedBooks();
        System.out.println("✅ Database seeded successfully!");
    }

    private void seedCategories() {
        String[][] cats = {
            {"Computer Science & Engineering","CSE","Core CS textbooks for B.Tech CSE curriculum"},
            {"Artificial Intelligence & Machine Learning","AI-ML","AI, ML, Deep Learning and Data Science"},
            {"Information Technology","IT","Networking, Web Development, Cybersecurity"},
            {"Electronics & Communication Engineering","ECE","Signals, Circuits, Communication Systems"},
            {"Electrical & Electronics Engineering","EEE","Power Systems, Electrical Machines, Control"},
            {"Mechanical Engineering","MECH","Thermodynamics, Fluid Mechanics, Manufacturing"},
            {"Civil Engineering","CIVIL","Structures, Geotechnics, Transportation"},
            {"Chemical Engineering","CHEM","Process Engineering, Thermodynamics, Reactions"},
            {"Mathematics","MATH","Engineering Mathematics, Statistics, Operations Research"},
            {"General Engineering","GEN","Physics, Chemistry, Drawing, Soft Skills"}
        };
        for (String[] c : cats) {
            Category cat = new Category();
            cat.setName(c[0]); cat.setCode(c[1]); cat.setDescription(c[2]);
            categoryRepository.save(cat);
        }
    }

    private void seedUsers() {
        // Admin / Librarian
        User admin = new User();
        admin.setMemberId("LIBRARIAN-01");
        admin.setName("Acharan Apilagunta");
        admin.setEmail("acharan9867@gmail.com");
        admin.setPasswordHash(passwordEncoder.encode("charan@143232"));
        admin.setRole(Role.ROLE_ADMIN);
        admin.setDepartment("Central Library");
        admin.setPhone("+91 8554 272433");
        admin.setMaxBooksAllowed(10);
        userRepository.save(admin);

        // Faculty
        User fac = new User();
        fac.setMemberId("JNTUA-FAC-101");
        fac.setName("Dr. K. Kavitha");
        fac.setEmail("fac.kavitha@jntua.ac.in");
        fac.setPasswordHash(passwordEncoder.encode("jntua@123"));
        fac.setRole(Role.ROLE_FACULTY);
        fac.setDepartment("Computer Science & Engineering");
        fac.setPhone("+91 94401 23456");
        fac.setMaxBooksAllowed(6);
        userRepository.save(fac);

        // Students
        String[][] students = {
            {"21001A0501","S. Charan Reddy","student.charan@gmail.com","jntua@123","Computer Science & Engineering","+91 98765 43210"},
            {"21001A0515","M. Deepika Rani","student.deepika@gmail.com","jntua@123","Computer Science & Engineering","+91 98765 43211"},
            {"22001A0542","B. Pavan Kumar","student.pavan@gmail.com","jntua@123","Computer Science & Engineering","+91 98765 43212"},
            {"22001A0588","G. Ananya","student.ananya@gmail.com","jntua@123","Computer Science & Engineering","+91 98765 43213"}
        };
        for (String[] s : students) {
            User st = new User();
            st.setMemberId(s[0]); st.setName(s[1]); st.setEmail(s[2]);
            st.setPasswordHash(passwordEncoder.encode(s[3]));
            st.setRole(Role.ROLE_STUDENT);
            st.setDepartment(s[4]); st.setPhone(s[5]);
            st.setMaxBooksAllowed(3);
            userRepository.save(st);
        }
    }

    private void seedBooks() {
        Category cse = categoryRepository.findByCode("CSE").orElseThrow();
        Category aiml = categoryRepository.findByCode("AI-ML").orElseThrow();
        Category math = categoryRepository.findByCode("MATH").orElseThrow();

        Object[][] books = {
            {"Introduction to Algorithms (CLRS)","Thomas H. Cormen","978-0262046305",cse,1250.00,5,"CSE-A01","The standard reference for modern algorithms. Covers sorting, graph algorithms, dynamic programming, and NP-completeness."},
            {"Operating System Concepts","Abraham Silberschatz","978-1119800361",cse,890.00,4,"CSE-A02","Processes, threads, memory management, file systems, and synchronization primitives."},
            {"Computer Networks","Andrew S. Tanenbaum","978-0133499452",cse,950.00,4,"CSE-A03","Layered network architecture, TCP/IP, routing, wireless networks and security."},
            {"Database System Concepts","Silberschatz, Korth","978-0078022159",cse,980.00,5,"CSE-A04","Relational model, SQL, normalization, transactions, and distributed databases."},
            {"Design Patterns","Gang of Four","978-0201633610",cse,1100.00,3,"CSE-A05","Creational, structural and behavioral design patterns for object-oriented software."},
            {"Artificial Intelligence: A Modern Approach","Russell, Norvig","978-0134610993",aiml,1350.00,4,"AI-A01","Comprehensive AI textbook: search, knowledge representation, planning, ML and robotics."},
            {"Deep Learning","Goodfellow, Bengio","978-0262035613",aiml,1500.00,3,"AI-A02","Mathematical foundations of deep learning: CNNs, RNNs, optimization and generative models."},
            {"Pattern Recognition and Machine Learning","Christopher Bishop","978-0387310732",aiml,1200.00,3,"AI-A03","Probabilistic graphical models, SVMs, neural networks and Bayesian methods."},
            {"Higher Engineering Mathematics","B.S. Grewal","978-8121910118",math,1238.00,8,"MTH-H01","Complete engineering math: algebra, calculus, ODE, PDE, transforms and statistics."},
            {"Advanced Engineering Mathematics","Erwin Kreyszig","978-0471488859",math,1283.00,6,"MTH-H02","ODEs, PDEs, linear algebra, complex analysis and numerical methods for engineers."},
            {"Engineering Thermodynamics","P.K. Nag","978-0074630068",categoryRepository.findByCode("MECH").orElseThrow(),912.00,5,"MECH-E03","Laws of thermodynamics, properties of steam, power cycles and thermodynamic relations."},
            {"Fluid Mechanics","R.K. Bansal","978-8181301230",categoryRepository.findByCode("MECH").orElseThrow(),1024.00,5,"MECH-E04","Fluid statics, Bernoulli equation, pipe flow and open channel hydraulics."},
            {"Structural Analysis Vol.1","S.S. Bhavikatti","978-8122400090",categoryRepository.findByCode("CIVIL").orElseThrow(),640.00,5,"CVL-F02","Statically determinate and indeterminate structures, arches and beams."},
            {"Engineering Physics","S.L. Gupta","978-8121932363",categoryRepository.findByCode("GEN").orElseThrow(),680.00,6,"GEN-I01","Optics, quantum mechanics, thermodynamics, semiconductors and nanotechnology."},
            {"Engineering Chemistry","Jain and Jain","978-8121932416",categoryRepository.findByCode("GEN").orElseThrow(),720.00,6,"GEN-I02","Electrochemistry, corrosion, polymers, fuels, water chemistry and environment."}
        };

        for (Object[] b : books) {
            Book book = new Book();
            book.setTitle((String)b[0]);
            book.setAuthor((String)b[1]);
            book.setIsbn((String)b[2]);
            book.setCategory((Category)b[3]);
            book.setPrice(BigDecimal.valueOf((Double)b[4]));
            book.setTotalCopies((Integer)b[5]);
            book.setAvailableCopies((Integer)b[5]);
            book.setShelfLocation((String)b[6]);
            book.setDescription((String)b[7]);
            bookRepository.save(book);
        }
    }
}
