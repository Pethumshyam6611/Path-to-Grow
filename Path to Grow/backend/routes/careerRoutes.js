const express = require("express");
const axios = require("axios");
const router = express.Router();

router.post("/career-recommendation", async (req, res) => {
  const { skills, educationLevel, degree, experience, jobRole } = req.body;
  console.log("Received data:", req.body);

  if (!skills || !educationLevel || !jobRole) {
    return res.status(400).json({ message: "Please fill in all required fields: skills, education level, and job role." });
  }

  if (!process.env.GEMINI_API_KEY) {
    console.error("GEMINI_API_KEY is not set in environment variables.");
    return res.status(500).json({ message: "Server configuration error: API key missing." });
  }

  const exp = experience || "None";

  // Parse the skills string to extract skill names and percentages
  const skillList = skills.split(", ").map(skill => {
    const match = skill.match(/(.+)\s*\((\d+)%\)/);
    return match ? { name: match[1].trim(), proficiency: parseInt(match[2]) } : null;
  }).filter(skill => skill !== null);

  // Format skills for the prompt
  const skillsWithPercentages = skillList.map(skill => `${skill.name} (${skill.proficiency}%)`).join(", ");

  const prompt = `
  I have skills: ${skillsWithPercentages}, education: ${educationLevel}, degree: ${degree || "None"}, experience: ${exp} years, and I want to be a ${jobRole}. Provide a detailed response with the following sections under clear headings. For the "Skill Gap" section, use the exact percentages I provided for my current skills (e.g., if I said JavaScript (70%), use 70% as my current proficiency for JavaScript). List each skill in the exact format "SkillName - Current: X% Required: Y%" on a new line, with no additional text, tables, or symbols (e.g., no "|", "*", or "[]"). Example: "JavaScript - Current: 70% Required: 90%".\n\n
  ### Career Recommendation\n(Provide a concise recommendation on how to achieve my goal of becoming a ${jobRole}.)\n
  ### Skill Gap\n(First, state whether my current skills (${skillsWithPercentages}) are relevant to the job role of ${jobRole}. Then, if any of my skills are not relevant to ${jobRole}, list them in a statement like "The following skills are not required for the job role of ${jobRole}: [list of skills]." If all skills are relevant, state "All your skills are relevant to the job role of ${jobRole}." Next, list my current skills with the percentages I provided vs. the required skills for ${jobRole}, with percentage estimates for each required skill. Format each skill as "SkillName - Current: X% Required: Y%", one per line. If a skill I provided is not relevant, set its required percentage to 0%. If a required skill is missing from my list, set its current percentage to 0%. Do not include additional comments or symbols beyond the relevance statement, unnecessary skills statement, and the skill list.)\n
  ### Roadmap\n(A detailed step-by-step plan to reach ${jobRole}, including specific actions, timelines, and milestones. Ensure at least 3 steps with clear tasks.)\n
  ### Learning Resources\n(Provide specific online resources with URLs for developing required skills for ${jobRole}, e.g., "JavaScript: https://www.coursera.org/professional-certificates/google-ux-design". Include at least one resource per required skill.)
`;

  try {
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
    console.log("AI response:", aiResponse);
    res.json({ recommendations: aiResponse });
  } catch (error) {
    console.error("Error fetching recommendations:", error.message, error.response?.data);
    res.status(500).json({ message: "Error generating recommendations. Please try again later." });
  }
});

module.exports = router;