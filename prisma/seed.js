const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding database...");

  // Clear existing data
  await prisma.payment.deleteMany({});
  await prisma.result.deleteMany({});
  await prisma.registration.deleteMany({});
  await prisma.announcement.deleteMany({});
  await prisma.course.deleteMany({});
  await prisma.student.deleteMany({});
  await prisma.admin.deleteMany({});

  console.log("Cleared old data.");

  // Hash passwords
  const adminPasswordHash = await bcrypt.hash("AdminPass123!", 10);
  const studentPasswordHash = await bcrypt.hash("StudentPass123!", 10);

  // 1. Create Admins
  const admin = await prisma.admin.create({
    data: {
      email: "admin@portal.com",
      password: adminPasswordHash,
      name: "Dean Olatunji",
    },
  });
  console.log("Created admin:", admin.email);

  // 2. Create Courses (40 Courses)
  // Let's create courses across 100, 200, 300, 400 levels, for Semesters 1 and 2
  const courseData = [
    // 100 Level, Semester 1
    { code: "CSC101", title: "Introduction to Computer Science", unit: 3, status: "CORE", level: 100, semester: 1 },
    { code: "MTH101", title: "Elementary Mathematics I", unit: 3, status: "CORE", level: 100, semester: 1 },
    { code: "PHY101", title: "General Physics I", unit: 3, status: "CORE", level: 100, semester: 1 },
    { code: "CHM101", title: "General Chemistry I", unit: 3, status: "ELECTIVE", level: 100, semester: 1 },
    { code: "GST101", title: "Communication in English I", unit: 2, status: "CORE", level: 100, semester: 1 },
    
    // 100 Level, Semester 2
    { code: "CSC102", title: "Introduction to Problem Solving", unit: 3, status: "CORE", level: 100, semester: 2 },
    { code: "MTH102", title: "Elementary Mathematics II", unit: 3, status: "CORE", level: 100, semester: 2 },
    { code: "PHY102", title: "General Physics II", unit: 3, status: "ELECTIVE", level: 100, semester: 2 },
    { code: "GST102", title: "Philosophy and Logic", unit: 2, status: "CORE", level: 100, semester: 2 },
    { code: "STA112", title: "Probability I", unit: 2, status: "ELECTIVE", level: 100, semester: 2 },

    // 200 Level, Semester 1
    { code: "CSC201", title: "Computer Programming I (Java)", unit: 3, status: "CORE", level: 200, semester: 1 },
    { code: "CSC205", title: "Digital Logic Design", unit: 3, status: "CORE", level: 200, semester: 1 },
    { code: "SEN201", title: "Introduction to Software Engineering", unit: 3, status: "CORE", level: 200, semester: 1 },
    { code: "MTH201", title: "Mathematical Methods I", unit: 3, status: "CORE", level: 200, semester: 1 },
    { code: "GST201", title: "Peace and Conflict Studies", unit: 2, status: "CORE", level: 200, semester: 1 },

    // 200 Level, Semester 2
    { code: "CSC202", title: "Data Structures & Algorithms", unit: 3, status: "CORE", level: 200, semester: 2 },
    { code: "CSC208", title: "Computer Architecture", unit: 3, status: "CORE", level: 200, semester: 2 },
    { code: "SEN202", title: "Software Requirement & Analysis", unit: 3, status: "CORE", level: 200, semester: 2 },
    { code: "STA202", title: "Statistics for Physical Sciences", unit: 2, status: "ELECTIVE", level: 200, semester: 2 },
    { code: "GST202", title: "Entrepreneurship Studies", unit: 2, status: "CORE", level: 200, semester: 2 },

    // 300 Level, Semester 1
    { code: "CSC301", title: "Object Oriented Programming (C++)", unit: 3, status: "CORE", level: 300, semester: 1 },
    { code: "CSC305", title: "Operating Systems", unit: 3, status: "CORE", level: 300, semester: 1 },
    { code: "CSC311", title: "Database Systems I", unit: 3, status: "CORE", level: 300, semester: 1 },
    { code: "SEN301", title: "Software Architecture & Design", unit: 3, status: "CORE", level: 300, semester: 1 },
    { code: "CSC315", title: "Web Technologies", unit: 2, status: "ELECTIVE", level: 300, semester: 1 },

    // 300 Level, Semester 2
    { code: "CSC302", title: "Automata Theory & Computability", unit: 3, status: "CORE", level: 300, semester: 2 },
    { code: "CSC306", title: "Data Communications & Networks", unit: 3, status: "CORE", level: 300, semester: 2 },
    { code: "SEN302", title: "Software Construction", unit: 3, status: "CORE", level: 300, semester: 2 },
    { code: "CSC312", title: "Database Systems II", unit: 3, status: "CORE", level: 300, semester: 2 },
    { code: "SEN306", title: "Software Testing & QA", unit: 2, status: "ELECTIVE", level: 300, semester: 2 },

    // 400 Level, Semester 1
    { code: "CSC401", title: "Algorithms & Complexity Analysis", unit: 3, status: "CORE", level: 400, semester: 1 },
    { code: "CSC405", title: "Artificial Intelligence", unit: 3, status: "CORE", level: 400, semester: 1 },
    { code: "SEN401", title: "Software Project Management", unit: 3, status: "CORE", level: 400, semester: 1 },
    { code: "CSC411", title: "Compiler Construction", unit: 3, status: "CORE", level: 400, semester: 1 },
    { code: "CSC421", title: "Machine Learning", unit: 3, status: "ELECTIVE", level: 400, semester: 1 },

    // 400 Level, Semester 2
    { code: "CSC402", title: "Distributed Systems", unit: 3, status: "CORE", level: 400, semester: 2 },
    { code: "CSC406", title: "Human Computer Interaction", unit: 2, status: "CORE", level: 400, semester: 2 },
    { code: "CSC499", title: "Research Project / Thesis", unit: 6, status: "CORE", level: 400, semester: 2 },
    { code: "SEN402", title: "Software Configuration Management", unit: 3, status: "CORE", level: 400, semester: 2 },
    { code: "CSC422", title: "Cryptography & Network Security", unit: 3, status: "ELECTIVE", level: 400, semester: 2 }
  ];

  for (const c of courseData) {
    await prisma.course.create({ data: c });
  }
  console.log(`Created ${courseData.length} courses.`);

  // 3. Create Students (20 Students)
  const departments = ["Computer Science", "Software Engineering", "Information Technology"];
  const faculties = ["Science", "Computing & Technology"];
  const sessions = ["2023/2024", "2024/2025", "2025/2026", "2026/2027"];

  const students = [];

  const names = [
    "Adebayo Benson", "Chidi Okafor", "Fatima Yusuf", "Ebunoluwa Coker",
    "John Doe", "Jane Smith", "Tunde Bakare", "Ngozi Obi",
    "Musa Audu", "Chioma Nwachukwu", "David Johnson", "Sarah Williams",
    "Emeka Azikiwe", "Aminu Kano", "Bisi Alabi", "Yinka Davies",
    "Michael Brown", "Elizabeth Davis", "Samuel Jackson", "Mary Taylor"
  ];

  for (let i = 0; i < 20; i++) {
    const paddedIndex = String(i + 1).padStart(3, "0");
    const matricNumber = `STA/2023/${paddedIndex}`;
    
    // Spread them across levels 100 - 400
    const level = 100 + (i % 4) * 100; // 100, 200, 300, 400
    const dept = departments[i % departments.length];
    const fac = faculties[i % faculties.length];
    const sess = sessions[i % sessions.length];

    const student = await prisma.student.create({
      data: {
        matricNumber,
        password: studentPasswordHash,
        name: names[i],
        email: `${names[i].toLowerCase().replace(/\s+/g, "")}@student.portal.com`,
        phone: `+234803${1000000 + i}`,
        department: dept,
        faculty: fac,
        level: level,
        session: sess,
        passportUrl: `https://images.unsplash.com/photo-${1534528741775 + i}-53994a69daeb?q=80&w=256&auto=format&fit=crop`
      }
    });
    students.push(student);
  }
  console.log(`Created ${students.length} students.`);

  // 4. Create Payments (3 mock payments per student)
  for (const s of students) {
    // School Fees: Paid for some, pending for some
    await prisma.payment.create({
      data: {
        studentMatric: s.matricNumber,
        title: "School Fees",
        amount: 150000.0,
        status: s.matricNumber.endsWith("0") || s.matricNumber.endsWith("2") || s.matricNumber.endsWith("4") || s.matricNumber.endsWith("6") || s.matricNumber.endsWith("8") ? "Paid" : "Pending",
      }
    });

    // Acceptance Fee: Paid for everyone (since they are admitted students)
    await prisma.payment.create({
      data: {
        studentMatric: s.matricNumber,
        title: "Acceptance Fee",
        amount: 25000.0,
        status: "Paid",
      }
    });

    // Medical Fee: Paid for some, pending for some
    await prisma.payment.create({
      data: {
        studentMatric: s.matricNumber,
        title: "Medical Fee",
        amount: 10000.0,
        status: s.matricNumber.endsWith("1") || s.matricNumber.endsWith("3") || s.matricNumber.endsWith("5") || s.matricNumber.endsWith("7") ? "Paid" : "Pending",
      }
    });
  }
  console.log("Created payments for all students.");

  // 5. Create Sample Registrations & Results
  // For students in higher levels, we seed their past semester results so they have a CGPA.
  // For their current level, we will create registrations.
  for (const s of students) {
    const currentLevel = s.level;

    // For levels lower than current level, seed results
    for (let lvl = 100; lvl <= 400; lvl += 100) {
      if (lvl < currentLevel) {
        // Find courses for this level
        const levelCourses = courseData.filter(c => c.level === lvl);
        
        for (const c of levelCourses) {
          // Determine a random score between 40 and 95
          const score = 50 + Math.floor(Math.random() * 45); // 50 to 95
          let grade = "F";
          let remark = "FAIL";
          if (score >= 70) { grade = "A"; remark = "PASS"; }
          else if (score >= 60) { grade = "B"; remark = "PASS"; }
          else if (score >= 50) { grade = "C"; remark = "PASS"; }
          else if (score >= 45) { grade = "D"; remark = "PASS"; }
          else if (score >= 40) { grade = "E"; remark = "PASS"; }

          // Create past registration
          await prisma.registration.create({
            data: {
              studentMatric: s.matricNumber,
              courseCode: c.code,
              semester: c.semester,
              session: "2023/2024", // simplified past session
            }
          });

          // Create result
          await prisma.result.create({
            data: {
              studentMatric: s.matricNumber,
              courseCode: c.code,
              score,
              grade,
              remark,
              semester: c.semester,
              session: "2023/2024"
            }
          });
        }
      } else if (lvl === currentLevel) {
        // Seed registration for current level first semester (currently active)
        const levelCourses = courseData.filter(c => c.level === lvl && c.semester === 1);
        for (const c of levelCourses) {
          await prisma.registration.create({
            data: {
              studentMatric: s.matricNumber,
              courseCode: c.code,
              semester: 1,
              session: s.session
            }
          });
        }
      }
    }
  }
  console.log("Created registrations and results (CGPAs seeded).");

  // 6. Create announcements
  const announcements = [
    {
      title: "First Semester Course Registration Deadline",
      content: "Please be informed that the portal for course registration for the 1st semester of the academic session will close on Friday next week. All students must complete their registration and submit before the deadline. Late registration will attract a penalty fee."
    },
    {
      title: "Medical Clearance Exercise",
      content: "The university health center wishes to announce that the medical clearance exercise for new and returning students starts tomorrow. Please present your payment receipt for the Medical Fee at the health center to retrieve your medical file."
    },
    {
      title: "Release of Supplementary Results",
      content: "The Senate has approved the release of supplementary results for the previous session. Students concerned are advised to check their results tab. Any discrepancies should be reported to the department coordinator immediately."
    }
  ];

  for (const a of announcements) {
    await prisma.announcement.create({ data: a });
  }
  console.log("Created announcements.");

  console.log("Database seeding completed successfully!");
}

main()
  .catch((e) => {
    console.error("Error seeding database:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
