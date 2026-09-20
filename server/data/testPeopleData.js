/**
 * ─────────────────────────────────────────────────────────────────────────────
 * REALISTIC TEST PEOPLE DATA — SINGLE SOURCE OF TRUTH
 *
 * Used by `server/scripts/seedPeople.js` (and the E2E attendance test) to create
 * believable students, teachers, class-incharges and HODs for EVERY department of
 * every school defined in `server/data/universityData.js`.
 *
 * Edit ONLY this file when you want to change names, subject offerings,
 * OD / Medical reasons or the seeded volumes.
 * ─────────────────────────────────────────────────────────────────────────────
 */

// ── Volumes ──────────────────────────────────────────────────────────────────
const COUNTS = {
  studentsPerDept: 25,    // 25 students in each department
  teachersPerDept: 10,    // 10 teachers in each department
  inchesPerDept: 1,       // 1 class in-charge per department
  hodPerDept: 1,          // 1 HOD per department
  deanPerSchool: 1,       // 1 Dean per school
  subjectsPerClass: 4,    // 4 subjects taught by the department faculty
  attendanceDays: 15,     // weekdays of attendance history to generate
  presentTodayRatio: 0.86 // share of students who scan when attendance is taken
};

// ── Credentials (passes validatePassword: 8+, upper, lower, number, symbol) ──
const CREDENTIALS = {
  studentPassword: "Student@123",
  facultyPassword: "Faculty@123",
  adminPassword: "Admin@1234",
  studentDomain: "student.tks-univ.edu",
  facultyDomain: "tks-univ.edu"
};

// ── Name pools (South-Indian heavy, matching the university's location) ──────
const FIRST_NAMES = [
  "Aarav", "Aarthi", "Abhinaya", "Aditya", "Aishwarya", "Akash", "Akshaya", "Amirtha",
  "Ananya", "Aravind", "Archana", "Arjun", "Ashwin", "Bala", "Bhavana", "Bharath",
  "Chandru", "Charulatha", "Deepak", "Deepika", "Devika", "Dharshini", "Dinesh", "Divya",
  "Elango", "Gayathri", "Gokul", "Gowtham", "Hariharan", "Harini", "Iniya", "Ishwarya",
  "Jagan", "Janani", "Jayakumar", "Jeevitha", "Kalaiselvan", "Kamalesh", "Kavya", "Keerthana",
  "Krishna", "Lakshmi", "Lavanya", "Logesh", "Madhan", "Mahalakshmi", "Manikandan", "Meenakshi",
  "Mohan", "Mythili", "Nandhini", "Naveen", "Nithya", "Pavithra", "Pooja", "Praveen",
  "Priyadarshini", "Ragul", "Rajesh", "Ramya", "Ranjith", "Rashmi", "Ravindra", "Rithika",
  "Sabari", "Sakthi", "Sanjay", "Santhiya", "Saravanan", "Shalini", "Sharath", "Shruthi",
  "Siddharth", "Sneha", "Sowmya", "Sudharsan", "Sujitha", "Surya", "Swetha", "Tamilselvi",
  "Tharun", "Uma", "Vaishnavi", "Varsha", "Vasanth", "Vignesh", "Vijayalakshmi", "Vinodhini",
  "Vishal", "Yamini", "Yuvaraj", "Zeenath"
];

const LAST_NAMES = [
  "Aiyer", "Arumugam", "Balakrishnan", "Chandrasekar", "Chellappa", "Dhanasekaran",
  "Duraisamy", "Ganesan", "Gunasekaran", "Iyer", "Jayaraman", "Kaliyappan", "Kannan",
  "Karthikeyan", "Kumaravel", "Lakshmanan", "Madhavan", "Manickam", "Murugesan",
  "Nagarajan", "Natarajan", "Palanisamy", "Pandian", "Parthasarathy", "Perumal",
  "Prabhakaran", "Radhakrishnan", "Rajagopal", "Ramasamy", "Rangarajan", "Ravichandran",
  "Sankaralingam", "Sekar", "Selvakumar", "Shanmugam", "Sivakumar", "Subramanian",
  "Sundaram", "Thangavelu", "Vaidyanathan", "Venkatesan", "Vijayaraghavan"
];

// ── Subject offerings per department code (falls back to a generated set) ────
const SUBJECTS_BY_DEPT = {
  CSE:        ["Data Structures & Algorithms", "Operating Systems", "Database Management Systems", "Computer Networks"],
  AIDS_SCE:   ["Machine Learning Foundations", "Data Visualisation", "Deep Learning Architectures", "Big Data Analytics"],
  IT:         ["Web Technologies", "Information Security", "Cloud Computing", "Software Engineering"],
  CYS:        ["Ethical Hacking", "Cryptography", "Digital Forensics", "Network Security"],
  AAI:        ["Neural Networks", "Natural Language Processing", "Computer Vision", "Reinforcement Learning"],
  ECE:        ["Digital Signal Processing", "VLSI Design", "Antenna & Wave Propagation", "Microcontrollers"],
  EEE:        ["Electrical Machines", "Power Systems", "Control Systems", "Power Electronics"],
  MECH:       ["Thermodynamics", "Fluid Mechanics", "Machine Design", "Manufacturing Technology"],
  CIVIL:      ["Structural Analysis", "Surveying", "Concrete Technology", "Geotechnical Engineering"],
  MBBS:       ["Human Anatomy", "Medical Physiology", "Pathology", "Community Medicine"],
  ANAT:       ["Gross Anatomy", "Histology", "Embryology", "Neuroanatomy"],
  BIOCH:      ["Clinical Biochemistry", "Enzymology", "Metabolic Regulation", "Molecular Biology"],
  MICRO:      ["General Microbiology", "Immunology", "Medical Virology", "Clinical Bacteriology"],
  PHARM_MED:  ["Clinical Pharmacology", "Pharmacotherapeutics", "Toxicology", "Drug Monitoring"],
  PHYSIOL:    ["Systemic Physiology", "Cardiovascular Physiology", "Endocrinology", "Applied Physiology"],
  CHEM:       ["Organic Chemistry", "Physical Chemistry", "Inorganic Chemistry", "Analytical Chemistry"],
  MATH:       ["Real Analysis", "Linear Algebra", "Numerical Methods", "Probability & Statistics"],
  PHYS:       ["Classical Mechanics", "Quantum Mechanics", "Electromagnetism", "Solid State Physics"],
  TAM:        ["Sangam Literature", "Modern Tamil Poetry", "Tamil Grammar", "Comparative Dravidian"],
  ENG:        ["British Literature", "Literary Criticism", "Applied Linguistics", "Communication Skills"],
  AGRI:       ["Agronomy", "Soil Science", "Plant Pathology", "Agricultural Economics"],
  CT:         ["Cardiac Anatomy", "Echocardiography", "Cardiac Catheterisation", "Pacemaker Technology"],
  MLT:        ["Haematology", "Clinical Pathology", "Medical Parasitology", "Blood Banking"],
  OPT:        ["Geometrical Optics", "Contact Lens Practice", "Binocular Vision", "Low Vision Aids"],
  OTAT:       ["Anaesthesia Technology", "Operation Theatre Management", "Sterilisation Protocols", "Surgical Pharmacology"],
  PA:         ["Clinical Medicine", "Surgical Assisting", "Emergency Care", "Patient Communication"],
  RIT:        ["Radiographic Physics", "CT Imaging", "MRI Technology", "Radiation Safety"],
  CPT:        ["Perfusion Technology", "Cardiopulmonary Bypass", "ECMO Basics", "Myocardial Protection"],
  COMM:       ["Financial Accounting", "Corporate Law", "Business Statistics", "Income Tax Practice"],
  AF:         ["Financial Management", "Cost Accounting", "Auditing Standards", "Banking & Insurance"],
  CS_SCS:     ["Programming in Java", "Data Structures", "Computer Organization", "Software Testing"],
  AIDS_SCS:   ["Python for AI", "Data Mining", "Statistical Modelling", "AI Ethics"],
  BA_SMS:     ["Principles of Management", "Marketing Management", "Organisational Behaviour", "Business Analytics"],
  FT:         ["Financial Technology Systems", "Blockchain for Finance", "Digital Payments", "Risk Analytics"],
  DSS:        ["National Security Studies", "Defence Economics", "Geopolitics", "Strategic Analysis"],
  IRPP:       ["International Relations Theory", "Public Policy Analysis", "Diplomacy", "Global Governance"],
  SW:         ["Community Development", "Case Work Practice", "Social Policy", "Counselling Skills"],
  LIS:        ["Library Classification", "Digital Archives", "Information Retrieval", "Knowledge Management"],
  ECON:       ["Microeconomics", "Macroeconomics", "Econometrics", "Development Economics"],
  NUR:        ["Medical Surgical Nursing", "Community Health Nursing", "Paediatric Nursing", "Nursing Ethics"],
  PHARM:      ["Pharmaceutics", "Pharmacognosy", "Pharmaceutical Chemistry", "Hospital Pharmacy"],
  PHYSIO:     ["Musculoskeletal Physiotherapy", "Neuro Physiotherapy", "Cardio-Respiratory Physiotherapy", "Electrotherapy"]
};

// ── On-Duty (OD) events — approved institutional duty ────────────────────────
const OD_REASONS = [
  "Paper presentation at IEEE International Conference on Computing (Pune)",
  "Representing the university at the Anna University inter-college hackathon",
  "NSS seven-day rural immersion camp at Kanchipuram village cluster",
  "National-level basketball tournament (South Zone) at Coimbatore",
  "Volunteer duty for the university's annual cultural fest 'Takshashila Utsav'",
  "Industrial visit to Zoho Corporation campus, Chennai",
  "Campus placement drive — TCS National Qualifier Test (Phase 1)",
  "IEEE student branch executive committee meeting and tech talk",
  "State-level robotics competition — final round at IIT Madras Research Park",
  "Blood donation and health awareness camp organised by the Red Ribbon Club",
  "Model United Nations (MUN) delegation representing Tamil Nadu",
  "Field survey camp for the department's live industry project"
];

// ── Medical leave reasons — verified hospitalisation / illness ───────────────
const MEDICAL_REASONS = [
  "Viral fever with high temperature — 3 days of bed rest advised",
  "Dengue treatment — admitted at Takshashila Medical Centre",
  "Fracture of the right forearm — plaster cast immobilisation",
  "Severe migraine episodes — neurologist advised rest",
  "Wisdom tooth extraction surgery — post-operative recovery",
  "Typhoid — five days of hospitalisation and IV therapy",
  "Acute conjunctivitis — ophthalmologist advised isolation",
  "Ankle ligament sprain during sports practice — physiotherapy",
  "Food poisoning — admitted to the emergency ward overnight",
  "Bronchial asthma flare-up — nebulisation treatment",
  "Appendicitis — laparoscopic surgery and recovery",
  "Chickenpox — infectious, home quarantine for a week"
];

module.exports = {
  COUNTS,
  CREDENTIALS,
  FIRST_NAMES,
  LAST_NAMES,
  SUBJECTS_BY_DEPT,
  OD_REASONS,
  MEDICAL_REASONS
};
