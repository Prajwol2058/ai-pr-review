const axios = require("axios");
const fs = require("fs");


// Define types for ESLint issue categories
type IssueCategories = {
    style: string[];
    performance: string[];
    seo: string[];
    other: string[];
};

// Categorize issues from ESLint report
const categorizeIssues = (report: string): IssueCategories => {
    const categories: IssueCategories = { style: [], performance: [], seo: [], other: [] };

    report.split("\n").forEach((line) => {
        if (line.includes("style")) categories.style.push(line);
        else if (line.includes("react-hooks/exhaustive-deps") || line.includes("re-render"))
            categories.performance.push(line);
        else if (line.includes("<Head>") || line.includes("alt") || line.includes("meta"))
            categories.seo.push(line);
        else if (line.trim()) categories.other.push(line);
    });

    return categories;
};

// Call OpenAI API to generate feedback
const getFeedback = async (report: string, categories: IssueCategories): Promise<string> => {
    const prompt = `
You're a senior Next.js TypeScript developer reviewing a pull request. 
Provide a thoughtful, constructive review with Next.js best practices:

1. **TypeScript Practices** — Ensure types are well-defined, avoid 'any'.
2. **Component Readability** — Naming, structure, reusability.
3. **Performance Optimizations** — Rerender issues, data fetching strategy (SSR/SSG/ISR).
4. **Styling Feedback** — Tailwind, styled-components, CSS modules misuse.
5. **SEO Concerns** — Ensure meta tags, alt text, proper Head usage.
6. **Positive Feedback** — Highlight clean code, good use of hooks.

ESLint Report:
${report}

Detected categories:
- Style: ${categories.style.length} issues
- Performance: ${categories.performance.length} issues
- SEO: ${categories.seo.length} issues
- Other: ${categories.other.length} issues
`;

    const response = await axios.post(
        "https://api.openai.com/v1/chat/completions",
        {
            model: "gpt-4",
            messages: [{ role: "user", content: prompt }],
        },
        {
            headers: {
                Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
                "Content-Type": "application/json",
            },
        }
    );

    return response.data.choices[0].message.content;
};

// Main function to run the review
const runReview = async (): Promise<void> => {
    try {
        const eslintReport = fs.readFileSync("eslint-report.txt", "utf-8");
        const categories = categorizeIssues(eslintReport);

        console.log("Categorized Issues:", categories);

        const feedback = await getFeedback(eslintReport, categories);

        console.log("AI Review Feedback:\n", feedback);

        fs.writeFileSync("ai-nextjs-review-feedback.txt", feedback);

        if (categories.seo.length > 0) {
            console.error("❌ PR blocked due to SEO errors.");
            process.exit(1);
        }
    } catch (error) {
        console.error("Error during the AI review:", error);
        process.exit(1);
    }
};

// Run the AI review process
runReview();
