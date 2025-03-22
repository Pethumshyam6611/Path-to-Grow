// CvRoute.js
const express = require("express");
const axios = require("axios");
const router = express.Router();
const multer = require("multer");
const pdfParse = require("pdf-parse");

// Configure multer for file uploads
const storage = multer.memoryStorage();
const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
});

router.post("/cv-analysis", upload.single("cv"), async (req, res) => {
  const { jobPosting } = req.body;
  const cvFile = req.file;

  if (!cvFile || !jobPosting) {
    console.log("Validation failed: Missing CV or job posting.");
    return res.status(400).json({ message: "Please upload a CV and provide a job posting." });
  }

  if (!process.env.GEMINI_API_KEY) {
    console.error("GEMINI_API_KEY is not set in environment variables.");
    return res.status(500).json({ message: "Server configuration error: API key missing." });
  }

  try {
    // Extract text from the CV
    console.log("Extracting text from CV...");
    const cvData = await pdfParse(cvFile.buffer);
    const cvText = cvData.text;
    console.log("CV text extracted:", cvText);

    const prompt = `
      I have a CV and a job posting. Analyze the CV against the job posting and provide a detailed response with the following sections under clear headings. For the "Skill Gap" section, list each skill in the exact format "SkillName - Current: X% Required: Y%" on a new line, with no additional text, tables, or symbols (e.g., no "|", "*", or "[]"). Example: "JavaScript - Current: 70% Required: 90%". Additionally, suggest job postings that suit the CV's profile in a new section called "Suggested Job Postings".:\n\n
      ### Match Score\n(Provide a percentage score indicating how well the CV matches the job posting, e.g., "75%".)\n
      ### Skill Gap\n(List the CV's current skills vs. required skills for the job posting, with percentage estimates for each skill. Format each skill as "SkillName - Current: X% Required: Y%", one per line. Do not include additional comments or symbols.)\n
      ### Recommendations\n(Provide specific recommendations to improve the CV for the job posting, e.g., "Learn Python to meet the job requirement." Include at least 3 recommendations. and also what jobs are suits for this CV)\n
      ### Suggested Job Postings\n(Based on the CV's skills, experience, and qualifications, suggest 3 job postings that would suit the candidate. For each job posting, provide a job title and a brief description of the role, e.g., "Frontend Developer - A role focusing on building user interfaces using React and JavaScript." List each job posting on a new line in the format "Job Title - Description".)\n
      Here is the CV text:\n${cvText}\n
      Here is the job posting:\n${jobPosting}
    `;

    console.log("Making request to Gemini API for CV analysis...");
    const response = await axios.post(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${process.env.GEMINI_API_KEY}`,
      {
        contents: [
          {
            parts: [
              {
                text: prompt,
              },
            ],
          },
        ],
      },
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    const aiResponse = response.data.candidates[0].content.parts[0].text;
    console.log("Gemini API response for CV analysis:", aiResponse);
    res.json({ cvAnalysis: aiResponse });
  } catch (error) {
    console.error("Error analyzing CV:", {
      message: error.message,
      response: error.response ? {
        status: error.response.status,
        data: error.response.data,
      } : "No response data",
    });
    res.status(500).json({
      message: "Error analyzing CV",
      error: error.response?.status ? `API Error: ${error.response.status}` : error.message
    });
  }
});

module.exports = router;