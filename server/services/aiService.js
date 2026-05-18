const openai = require('../config/openai');
const promptTemplates = require('../utils/promptTemplates');

// Helper to safely parse JSON from AI strings (including markdown-wrapped JSON blocks)
const cleanAndParseJSON = (str) => {
  try {
    return JSON.parse(str.trim());
  } catch (error) {
    // Match code blocks like ```json ... ``` or ``` ... ```
    const match = str.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
    if (match && match[1]) {
      try {
        return JSON.parse(match[1].trim());
      } catch (innerError) {
        console.error('Failed to parse extracted JSON content:', innerError.message);
      }
    }
    // Try to find the first [ or { and last ] or }
    const startBracket = Math.min(
      str.indexOf('[') !== -1 ? str.indexOf('[') : Infinity,
      str.indexOf('{') !== -1 ? str.indexOf('{') : Infinity
    );
    const endBracket = Math.max(str.lastIndexOf(']'), str.lastIndexOf('}'));

    if (startBracket !== Infinity && endBracket !== -1 && endBracket > startBracket) {
      try {
        return JSON.parse(str.slice(startBracket, endBracket + 1).trim());
      } catch (innerError) {
        console.error('Failed to parse bracket sliced content:', innerError.message);
      }
    }

    throw new Error('AI response was not in a valid JSON format');
  }
};

// Check if the OpenAI key is the default mock key or missing
const isMockKey = () => {
  const key = process.env.OPENAI_API_KEY || '';
  return !key || key.startsWith('mock') || key === 'sk-...';
};

/**
 * Generate PDF notes summary
 */
const generateSummary = async (documentText) => {
  if (isMockKey()) {
    return getMockSummary(documentText);
  }

  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        { role: 'user', content: promptTemplates.summaryPrompt(documentText.slice(0, 16000)) } // Limit text length
      ],
      temperature: 0.5
    });

    return response.choices[0].message.content;
  } catch (error) {
    console.warn('OpenAI error, falling back to mock summary:', error.message);
    return getMockSummary(documentText);
  }
};

/**
 * Generate automated MCQ quiz
 */
const generateQuiz = async (documentText, count = 5, difficulty = 'medium') => {
  if (isMockKey()) {
    return getMockQuiz(count, difficulty);
  }

  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        { role: 'user', content: promptTemplates.quizPrompt(count, difficulty, documentText.slice(0, 16000)) }
      ],
      response_format: { type: 'json_object' },
      temperature: 0.6
    });

    const parsed = cleanAndParseJSON(response.choices[0].message.content);
    // Support nested structure like { "questions": [...] } or standard list [...]
    return Array.isArray(parsed) ? parsed : (parsed.questions || parsed.quiz || []);
  } catch (error) {
    console.warn('OpenAI error, falling back to mock quiz:', error.message);
    return getMockQuiz(count, difficulty);
  }
};

/**
 * Generate study flashcards
 */
const generateFlashcards = async (documentText, count = 6) => {
  if (isMockKey()) {
    return getMockFlashcards(count);
  }

  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        { role: 'user', content: promptTemplates.flashcardPrompt(count, documentText.slice(0, 16000)) }
      ],
      response_format: { type: 'json_object' },
      temperature: 0.6
    });

    const parsed = cleanAndParseJSON(response.choices[0].message.content);
    return Array.isArray(parsed) ? parsed : (parsed.cards || parsed.flashcards || []);
  } catch (error) {
    console.warn('OpenAI error, falling back to mock flashcards:', error.message);
    return getMockFlashcards(count);
  }
};

/**
 * Generate study guide / viva questions
 */
const generateVivaQuestions = async (documentText, count = 5) => {
  if (isMockKey()) {
    return getMockViva(count);
  }

  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        { role: 'user', content: promptTemplates.vivaPrompt(count, documentText.slice(0, 16000)) }
      ],
      response_format: { type: 'json_object' },
      temperature: 0.6
    });

    const parsed = cleanAndParseJSON(response.choices[0].message.content);
    return Array.isArray(parsed) ? parsed : (parsed.questions || parsed.viva || []);
  } catch (error) {
    console.warn('OpenAI error, falling back to mock viva:', error.message);
    return getMockViva(count);
  }
};

/**
 * Explain/Simplify a technical topic
 */
const simplifyTopic = async (topic, context = '') => {
  if (isMockKey()) {
    return getMockSimplified(topic);
  }

  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        { role: 'user', content: promptTemplates.simplifierPrompt(topic, context.slice(0, 8000)) }
      ],
      temperature: 0.7
    });

    return response.choices[0].message.content;
  } catch (error) {
    console.warn('OpenAI error, falling back to mock simplified content:', error.message);
    return getMockSimplified(topic);
  }
};

/**
 * Generate Study Plan Timetable
 */
const generateStudyPlan = async (subjects, examDate, hoursPerDay = 3, weakSubjects = '', strongSubjects = '') => {
  if (isMockKey()) {
    return getMockStudyPlan(subjects, examDate);
  }

  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        {
          role: 'user',
          content: promptTemplates.studyPlanPrompt(subjects, examDate, hoursPerDay, weakSubjects, strongSubjects)
        }
      ],
      response_format: { type: 'json_object' },
      temperature: 0.6
    });

    return cleanAndParseJSON(response.choices[0].message.content);
  } catch (error) {
    console.warn('OpenAI error, falling back to mock study plan:', error.message);
    return getMockStudyPlan(subjects, examDate);
  }
};

/**
 * RAG/Standard PDF Context Q&A
 */
const askAI = async (question, context = '', history = []) => {
  if (isMockKey()) {
    return getMockChatResponse(question, context);
  }

  try {
    const messages = [
      { role: 'system', content: promptTemplates.chatSystemPrompt }
    ];

    // Add brief history (last 4 turns)
    const recentHistory = history.slice(-8);
    recentHistory.forEach(msg => {
      messages.push({
        role: msg.sender === 'user' ? 'user' : 'assistant',
        content: msg.text
      });
    });

    // Provide context with the final query
    messages.push({
      role: 'user',
      content: `Context:\n${context.slice(0, 14000)}\n\nQuestion:\n${question}`
    });

    const response = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: messages,
      temperature: 0.6
    });

    return response.choices[0].message.content;
  } catch (error) {
    console.warn('OpenAI Q&A error, falling back to mock chat response:', error.message);
    return getMockChatResponse(question, context);
  }
};

// ==========================================
// REALISTIC MOCK BACKEND DATA GENERATORS
// ==========================================

function getMockSummary(text) {
  return `# 📖 Study Notes & Summary

## 📌 Document Overview
This document covers advanced engineering principles, focusing on computational methods, structural systems design, and optimization models. It details key algorithms and mechanical metrics that define efficient engineering problem-solving.

---

## 🔑 Core Concepts & Mathematical Models

### 1. Finite Element Analysis (FEA)
*   **Definition:** Numerical technique for finding approximate solutions to boundary value problems for partial differential equations.
*   **Governing Formula:**
    $$\\mathbf{[K] \\{d\\} = \\{F\\}}$$
    Where:
    *   $\\mathbf{[K]}$ represents the **Global Stiffness Matrix**
    *   $\\mathbf{\\{d\\}}$ is the **Nodal Displacement Vector**
    *   $\\mathbf{\\{F\\}}$ denotes the **Applied External Load Vector**
*   **Key Step:** Discretizing the complex geometrical body into small, simple components (finite elements) connected by nodes.

### 2. Deep Neural Network Architectures in Modeling
*   **Definition:** Multi-layer machine learning topologies used to approximate complex transfer functions in system identification.
*   **Loss Optimization (Stochastic Gradient Descent):**
    $$\\theta_{t+1} = \\theta_t - \\eta \\nabla J(\\theta_t)$$
*   **Use-case:** Predicting structural failure rates based on live stress-strain sensor arrays.

---

## 💡 Key Takeaways
1.  **Stiffness Analysis** is crucial for structural rigidity and avoiding elastic collapse.
2.  **Boundary Conditions** dictate the uniqueness of numerical solutions in mechanical domains.
3.  Integration of **machine learning approximations** reduces the time needed for traditional iterative FEA analyses from hours to fractions of a second.
`;
}

function getMockQuiz(count, difficulty) {
  const quizPool = [
    {
      question: "In Finite Element Analysis (FEA), what does the equation [K]{d} = {F} represent?",
      options: [
        "A. Kinetic energy equation of multi-body systems",
        "B. Global structural balance expressing stiffness, nodal displacement, and force",
        "C. Dynamic fluid friction across boundaries",
        "D. Fourier thermal dispersion within solid nodes"
      ],
      correctAnswer: "B. Global structural balance expressing stiffness, nodal displacement, and force",
      explanation: "This is the governing linear algebraic formulation of structural FEA, where [K] is the global stiffness matrix, {d} is the nodal displacement vector, and {F} is the applied force vector."
    },
    {
      question: "Which of the following is a primary benefit of using overlapping chunks in PDF vector embeddings for RAG chatbots?",
      options: [
        "A. It reduces the size of the Pinecone vector database index",
        "B. It prevents loss of semantic context at the boundaries of adjacent chunks",
        "C. It speeds up the text parsing rate of pdf-parse",
        "D. It removes the need for OpenAI embedding models"
      ],
      correctAnswer: "B. It prevents loss of semantic context at the boundaries of adjacent chunks",
      explanation: "Using an overlap (e.g., 50 tokens) ensures that concepts extending across the chunk border are captured completely in both chunks, preventing query retrieval failures."
    },
    {
      question: "In machine learning regression models, what is the role of the learning rate parameter (η)?",
      options: [
        "A. It determines the number of layers in a neural network",
        "B. It scales the step size taken during gradient descent optimization",
        "C. It acts as the activation function for hidden layer units",
        "D. It specifies the maximum depth of decision trees"
      ],
      correctAnswer: "B. It scales the step size taken during gradient descent optimization",
      explanation: "The learning rate scales the size of updates to the weight vector during gradient descent, balancing training speed and numerical stability."
    },
    {
      question: "What is a boundary value problem in engineering mathematics?",
      options: [
        "A. A differential equation whose solution is constrained by conditions at the domain limits",
        "B. A probabilistic distribution utilizing randomized samples",
        "C. A logical evaluation strictly involving binary outputs",
        "C. A matrix inversion that results in a zero determinant"
      ],
      correctAnswer: "A. A differential equation whose solution is constrained by conditions at the domain limits",
      explanation: "Boundary value problems involve finding solutions to differential equations that satisfy specified constraints on the boundaries of the domain."
    },
    {
      question: "Which data structure is most suitable for storing high-dimensional vector embeddings for AI semantic search?",
      options: [
        "A. A doubly linked list",
        "B. A vector index (like Hierarchical Navigable Small World - HNSW in Pinecone)",
        "C. A standard relational SQL hash index",
        "D. A binary search tree"
      ],
      correctAnswer: "B. A vector index (like Hierarchical Navigable Small World - HNSW in Pinecone)",
      explanation: "Vector databases utilize graph-based algorithms like HNSW to quickly perform approximate nearest neighbor searches in multi-dimensional spaces."
    }
  ];

  return quizPool.slice(0, Math.min(count, quizPool.length));
}

function getMockFlashcards(count) {
  const cardPool = [
    {
      front: "Finite Element Method (FEM)",
      back: "A numerical method used to solve complex engineering problems by splitting a continuous domain into small, discrete elements connected at nodes."
    },
    {
      front: "Stiffness Matrix [K]",
      back: "An algebraic grid matrix representing the resistance of elements to deformation when an external load is applied."
    },
    {
      front: "Cosine Similarity",
      back: "A mathematical metric measuring the angular similarity between two multi-dimensional vectors, frequently used to score text relevancy in AI search."
    },
    {
      front: "Stochastic Gradient Descent (SGD)",
      back: "An optimization method that iteratively updates weights in small batches to find the minimum of a cost or loss function."
    },
    {
      front: "Tokenization",
      back: "The process of splitting raw text strings into smaller units (tokens) such as words or sub-words, which can be embedded numerically."
    },
    {
      front: "Retrieval-Augmented Generation (RAG)",
      back: "An AI architecture that queries a database (e.g. vector DB) to fetch relevant context documents, prepending them to the prompt to get accurate, grounded completions."
    }
  ];

  return cardPool.slice(0, Math.min(count, cardPool.length));
}

function getMockViva(count) {
  const vivaPool = [
    {
      question: "Explain the difference between a Local Stiffness Matrix and the Global Stiffness Matrix in structural analysis.",
      modelAnswer: "A local stiffness matrix defines the stiffness behavior of a single finite element in its local coordinate system. The global stiffness matrix is formed by mapping and assembling all individual local matrices into a unified coordinate framework representing the entire structural network."
    },
    {
      question: "Why does numerical integration (like Gaussian Quadrature) become necessary in FEA implementations?",
      modelAnswer: "In FEA, the stiffness equations often require integrating complex polynomial functions over arbitrary element geometries. Closed-form analytical integration is mathematically intractable or highly inefficient, so Gaussian Quadrature is used to approximate the integral using weighted sums at specific sample nodes."
    },
    {
      question: "How do you handle singularities or zero-determinant stiffness matrices in system simulation?",
      modelAnswer: "A zero determinant in the global stiffness matrix suggests the system is unstable or has rigid-body motion (floating/unrestrained). Applying proper boundary conditions (fixing nodal displacements) removes these unconstrained degrees of freedom, resolving the singularity."
    },
    {
      question: "Describe how semantic context is preserved when chunking technical engineering texts.",
      modelAnswer: "We use a recursive chunker that splits paragraphs logically while preserving an overlapping window of tokens (e.g. 50-100 words). This ensures boundary definitions, mathematical formulas, and contextual subjects are not severed, leaving coherent conceptual blocks in the vector space."
    }
  ];

  return vivaPool.slice(0, Math.min(count, vivaPool.length));
}

function getMockSimplified(topic) {
  return `### 💡 Simplifying: **"${topic}"** — Explained Simply!

Let's break this down without any of the heavy, confusing math. 

Imagine you are trying to explain this to a friend who has never taken an engineering class.

---

### 🏛️ The Analogy: The Lego Castle
Imagine you want to test if a massive, complicated Lego Castle will collapse if you place a heavy textbook on top of it.
*   **The Hard Way:** You try to calculate the physics of the entire castle all at once. This is nearly impossible because of all the custom angles, towers, and gates.
*   **The Smart Way (Our Topic):** You break the castle down into its individual **Lego bricks**. You already know exactly how strong a single, standard 2x4 Lego brick is! 
*   Now, you just calculate the forces on each individual Lego brick, and then **add them all together** to find out how the entire castle behaves.

That is exactly how we solve complex systems! We split a huge, weird shape into tiny, predictable blocks (elements) and sum them up at the joints (nodes).

---

### 🧱 Step-by-Step Breakdown

1.  **Discretization (Splitting):** We draw a virtual grid over the object. If we are testing a bridge, we split it into thousands of tiny triangles.
2.  **Local Behavior:** We calculate how each tiny triangle stretches or bends under stress.
3.  **The Assembly:** We use a massive grid (the **Stiffness Matrix**) to stitch all these individual triangle calculations together.
4.  **The Solution:** We solve for structural movement, telling us exactly where the bridge will bend, crack, or hold strong.

---

### 🌟 Real-World Application
This is the technology behind crash-testing virtual cars, modeling tectonic stresses in earthquake zones, or testing aircraft wings in digital wind tunnels before building them in real life.
`;
}

function getMockStudyPlan(subjects, examDate) {
  const subjectList = subjects.split(',').map(s => s.trim());
  const dateObj = new Date();
  const plan = [];

  for (let i = 0; i < 5; i++) {
    const sessionDate = new Date();
    sessionDate.setDate(dateObj.getDate() + i);
    const dateStr = sessionDate.toISOString().split('T')[0];

    const currentSub = subjectList[i % subjectList.length] || 'General Studies';
    plan.push({
      date: dateStr,
      day: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][sessionDate.getDay()],
      sessions: [
        {
          subject: currentSub,
          topic: `Review key formulas and fundamental chapters in ${currentSub}`,
          duration: "2 hours",
          type: "study"
        },
        {
          subject: currentSub,
          topic: `Practice AI-generated mock quizzes & resolve weaker concepts`,
          duration: "1 hour",
          type: "practice"
        }
      ]
    });
  }

  return {
    plan: plan,
    tips: [
      "Prioritize subjects you marked as weaker, allocating them the early, highly-focused study hours.",
      "Take a 10-minute active walking break every 50 minutes of deep studying.",
      "Run the StudyMind viva generator the day before the exam to test your instant technical recall."
    ]
  };
}

function getMockChatResponse(question, context) {
  const lowerQ = question.toLowerCase();

  if (lowerQ.includes('hi') || lowerQ.includes('hello') || lowerQ.includes('hey')) {
    return "Hello! I am StudyMind, your engineering AI copilot. Ask me anything about your uploaded study notes, and I'll break it down for you!";
  }

  return `Based on the uploaded engineering study material, here is a detailed breakdown answering your question: **"${question}"**

### 🔍 Explanation & Core Logic
In engineering modeling, the concept is analyzed by evaluating boundary constraints and system stiffness matrices. 
*   **Stiffness assembly:** The nodal joints hold the key physical boundaries.
*   **Stress dispersion:** External forces spread along coordinate nodes based on the elements' thickness and elasticity.

### 💡 Example Reference
If you review the notes on **FEA Governing Formulations**, the global load response is calculated as $\\mathbf{[K]\\{d\\} = \\{F\\}}$. When you ask about this subject, we are looking at how nodal displacements are resolved under these constraints.

Let me know if you would like me to generate a quick practice quiz specifically on this topic!`;
}

module.exports = {
  generateSummary,
  generateQuiz,
  generateFlashcards,
  generateVivaQuestions,
  simplifyTopic,
  generateStudyPlan,
  askAI
};
