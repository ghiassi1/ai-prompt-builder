import React, { useState, useEffect } from "react";
import {
  Save,
  Copy,
  Download,
  RefreshCw,
  AlertCircle,
  CheckCircle,
  Plus,
  X,
  Eye,
  Settings,
  Wand2,
  Loader,
} from "lucide-react";

function App() {
  const [activeTab, setActiveTab] = useState("builder");
  const [promptType, setPromptType] = useState("");
  const [context, setContext] = useState("");
  const [userDetails, setUserDetails] = useState("");
  const [mainPrompt, setMainPrompt] = useState("");
  const [constraints, setConstraints] = useState([]);
  const [guidelines, setGuidelines] = useState([]);
  const [finalPrompt, setFinalPrompt] = useState("");
  const [savedPrompts, setSavedPrompts] = useState([]);
  const [analysis, setAnalysis] = useState(null);
  const [activeGenerator, setActiveGenerator] = useState("manual");
  const [generatorInput, setGeneratorInput] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [apiError, setApiError] = useState(null);

  // Backend API base
  const API_BASE_URL = process.env.REACT_APP_API_URL || "http://localhost:3001/api";

  const promptTemplates = {
    contextual: {
      name: "Contextual Prompt",
      template: "In the context of [DOMAIN], [MAIN_REQUEST]. Consider [CONTEXT_DETAILS].",
      example:
        "In the context of space exploration, explain the concept of black holes. Consider recent discoveries and their implications for future missions.",
    },
    "specific-question": {
      name: "Specific Question",
      template:
        "[SPECIFIC_QUESTION] Please provide [DETAIL_LEVEL] explanation including [REQUIRED_ELEMENTS].",
      example:
        "What are the key principles of supply and demand in economics? Please provide a detailed explanation including real-world examples and current market applications.",
    },
    "creative-writing": {
      name: "Creative Writing",
      template: 'Write a [FORMAT] that [CREATIVE_GOAL]. Begin with: "[OPENING_LINE]"',
      example:
        'Write a short story that explores themes of redemption and hope. Begin with: "The old lighthouse had been dark for thirty years."',
    },
    analysis: {
      name: "Analysis & Comparison",
      template:
        "Analyze and compare [SUBJECT_A] and [SUBJECT_B] in terms of [CRITERIA]. Focus on [SPECIFIC_ASPECTS].",
      example:
        "Analyze and compare renewable energy and fossil fuels in terms of environmental impact. Focus on long-term sustainability and economic implications.",
    },
    "step-by-step": {
      name: "Step-by-Step Guide",
      template:
        "Provide a step-by-step guide for [PROCESS]. Include [REQUIREMENTS] and address [POTENTIAL_CHALLENGES].",
      example:
        "Provide a step-by-step guide for implementing sustainable practices in small businesses. Include cost considerations and address common implementation challenges.",
    },
  };

  const constraintTypes = [
    { id: "length", label: "Word/Character Limit", placeholder: "e.g., 500 words maximum" },
    { id: "format", label: "Format Requirement", placeholder: "e.g., bullet points, formal tone" },
    { id: "audience", label: "Target Audience", placeholder: "e.g., beginners, experts, children" },
    { id: "style", label: "Writing Style", placeholder: "e.g., academic, conversational, technical" },
    { id: "scope", label: "Scope Limitation", placeholder: "e.g., focus on last 5 years, US only" },
    { id: "ethical", label: "Ethical Guidelines", placeholder: "e.g., avoid bias, include diverse perspectives" },
  ];

  // ----- Backend generation -----
  const generatePrompt = async () => {
    if (!generatorInput.trim()) return;

    setIsGenerating(true);
    setApiError(null);

    try {
      const res = await fetch(`${API_BASE_URL}/generate-prompt`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          description: generatorInput.trim(),
          userContext: userDetails.trim(),
          additionalContext: context.trim(),
        }),
      });

      if (!res.ok) throw new Error(`Server error: ${res.status}`);

      const data = await res.json();
      if (data.error) throw new Error(data.error);

      setMainPrompt(data.prompt || "");
      setActiveGenerator("manual");
    } catch (err) {
      console.error(err);
      setApiError(err.message);

      // Fallback demo
      setTimeout(() => {
        setApiError(null);
        generateFallbackPrompt();
      }, 3000);
    } finally {
      setIsGenerating(false);
    }
  };

  const generateFallbackPrompt = () => {
    const input = generatorInput.toLowerCase();
    let fallbackPrompt = "";

    if (input.includes("analyze") || input.includes("analysis")) {
      fallbackPrompt = `Please conduct a comprehensive analysis of ${extractMainTopic(
        generatorInput
      )}. 

Structure your analysis as follows:
1. Current state and key characteristics
2. Main challenges and opportunities  
3. Contributing factors and root causes
4. Potential solutions and recommendations
5. Implementation considerations and next steps

Provide specific examples, data points where relevant, and actionable insights.`;
    } else {
      fallbackPrompt = `Please provide a comprehensive response about ${extractMainTopic(
        generatorInput
      )}.

Address the following aspects:
1. Overview and key points
2. Important details and context
3. Practical implications and applications
4. Relevant examples or case studies
5. Best practices and recommendations

Structure your response clearly and provide actionable insights.`;
    }

    setMainPrompt(fallbackPrompt);
    setActiveGenerator("manual");
  };

  const extractMainTopic = (input) => {
    const clean = input
      .replace(/^(please |can you |help me |i want to |i need to |how to )/i, "")
      .replace(/(analyze|compare|explain|understand|write|create|improve|optimize|strategy|plan)/gi, "")
      .trim();
    return clean || "the topic you mentioned";
  };

  // ----- Builders -----
  const addConstraint = (type) => setConstraints((p) => [...p, { id: Date.now(), type, value: "" }]);
  const updateConstraint = (id, value) =>
    setConstraints((p) => p.map((c) => (c.id === id ? { ...c, value } : c)));
  const removeConstraint = (id) => setConstraints((p) => p.filter((c) => c.id !== id));

  const addGuideline = () => setGuidelines((p) => [...p, { id: Date.now(), text: "" }]);
  const updateGuideline = (id, text) =>
    setGuidelines((p) => p.map((g) => (g.id === id ? { ...g, text } : g)));
  const removeGuideline = (id) => setGuidelines((p) => p.filter((g) => g.id !== id));

  const analyzePrompt = (prompt) => {
    const issues = [];
    const strengths = [];

    const ambiguousTerms = ["best", "good", "recent", "many", "some", "often"];
    const hasAmbiguity =
      ambiguousTerms.some((t) => prompt.toLowerCase().includes(t)) &&
      !prompt.includes("specific") &&
      !prompt.includes("define");

    if (hasAmbiguity) issues.push("Contains potentially ambiguous terms that may need clarification");

    if (prompt.includes("context of") || prompt.includes("in terms of")) {
      strengths.push("Includes contextual framing");
    } else if (prompt.length > 20) {
      issues.push("Consider adding contextual framing for better results");
    }

    if (prompt.includes("?") && prompt.split("?").length > 2) {
      issues.push("Multiple questions detected - consider breaking into separate prompts");
    }

    if (/(explain|describe|analyze)/i.test(prompt)) strengths.push("Uses clear action verbs");

    if (prompt.includes("1.") || prompt.includes("•") || prompt.includes("include:")) {
      strengths.push("Well-structured with clear requirements");
    }

    if (prompt.length < 10) {
      issues.push("Prompt may be too short for complex responses");
    } else if (prompt.length > 500) {
      issues.push("Prompt may be too long - consider simplifying");
    } else {
      strengths.push("Appropriate length for clear communication");
    }

    return { issues, strengths };
  };

  useEffect(() => {
    let out = "";

    if (userDetails.trim()) out += `User context: ${userDetails.trim()}\n\n`;
    if (context.trim()) out += `Context: ${context.trim()}\n\n`;
    if (mainPrompt.trim()) out += mainPrompt.trim();

    if (constraints.length > 0) {
      const valid = constraints.filter((c) => c.value.trim());
      if (valid.length > 0) {
        out += "\n\nConstraints:\n";
        valid.forEach((c) => {
          const ct = constraintTypes.find((t) => t.id === c.type);
          out += `- ${ct.label}: ${c.value.trim()}\n`;
        });
      }
    }

    if (guidelines.length > 0) {
      const valid = guidelines.filter((g) => g.text.trim());
      if (valid.length > 0) {
        out += "\n\nAdditional Guidelines:\n";
        valid.forEach((g) => (out += `- ${g.text.trim()}\n`));
      }
    }

    setFinalPrompt(out);
    setAnalysis(out.trim() ? analyzePrompt(out) : null);
  }, [userDetails, context, mainPrompt, constraints, guidelines]);

  const loadTemplate = (key) => {
    const t = promptTemplates[key];
    setPromptType(key);
    setMainPrompt(t.example);
  };

  const savePrompt = () => {
    if (!finalPrompt.trim()) return;
    const newPrompt = {
      id: Date.now(),
      name: `Prompt ${savedPrompts.length + 1}`,
      content: finalPrompt,
      type: promptType,
      timestamp: new Date().toLocaleString(),
    };
    setSavedPrompts((p) => [...p, newPrompt]);
  };

  const copyToClipboard = () => finalPrompt && navigator.clipboard.writeText(finalPrompt);

  const downloadPrompt = () => {
    const blob = new Blob([finalPrompt], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "prompt.txt";
    a.click();
    URL.revokeObjectURL(url);
  };

  const clearAll = () => {
    setPromptType("");
    setContext("");
    setUserDetails("");
    setMainPrompt("");
    setConstraints([]);
    setGuidelines([]);
    setFinalPrompt("");
    setAnalysis(null);
  };

  return (
    <div style={{ maxWidth: "1400px", margin: "0 auto", padding: "24px", backgroundColor: "#f9fafb", minHeight: "100vh" }}>
      <div style={{ backgroundColor: "white", borderRadius: "8px", boxShadow: "0 4px 6px rgba(0,0,0,0.1)" }}>
        {/* Header */}
        <div style={{ borderBottom: "1px solid #e5e7eb", padding: "24px" }}>
          <h1 style={{ fontSize: "2rem", fontWeight: "bold", color: "#111827", marginBottom: "8px" }}>AI Prompt Builder</h1>
          <p style={{ color: "#6b7280" }}>Create effective prompts using proven engineering techniques</p>
        </div>

        {/* Tabs */}
        <div style={{ borderBottom: "1px solid #e5e7eb" }}>
          <nav style={{ display: "flex", gap: "32px", padding: "0 24px" }}>
            {[
              { id: "builder", label: "Prompt Builder", icon: Settings },
              { id: "preview", label: "Preview & Analysis", icon: Eye },
              { id: "saved", label: "Saved Prompts", icon: Save },
            ].map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  style={{
                    padding: "16px 4px",
                    borderBottom: activeTab === tab.id ? "2px solid #3b82f6" : "2px solid transparent",
                    fontWeight: 500,
                    fontSize: 14,
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    color: activeTab === tab.id ? "#3b82f6" : "#6b7280",
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                  }}
                >
                  <Icon size={16} />
                  {tab.label}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Content */}
        <div style={{ padding: "24px" }}>
          {activeTab === "builder" && (
            <div style={{ display: "flex", flexDirection: "column", gap: "32px" }}>
              {/* Mode toggle */}
              <div>
                <h2 style={{ fontSize: "1.25rem", fontWeight: 600, marginBottom: 16 }}>Generation Mode</h2>
                <div style={{ display: "flex", backgroundColor: "#f3f4f6", borderRadius: 8, padding: 4, width: "fit-content" }}>
                  <button
                    onClick={() => setActiveGenerator("manual")}
                    style={{
                      padding: "8px 16px",
                      borderRadius: 6,
                      transition: "all .2s",
                      display: "flex",
                      alignItems: "center",
                      gap: 8,
                      backgroundColor: activeGenerator === "manual" ? "white" : "transparent",
                      color: activeGenerator === "manual" ? "#3b82f6" : "#6b7280",
                      border: "none",
                      cursor: "pointer",
                      boxShadow: activeGenerator === "manual" ? "0 1px 2px rgba(0,0,0,.05)" : "none",
                    }}
                  >
                    <Settings size={16} />
                    Manual Builder
                  </button>
                  <button
                    onClick={() => setActiveGenerator("ai")}
                    style={{
                      padding: "8px 16px",
                      borderRadius: 6,
                      transition: "all .2s",
                      display: "flex",
                      alignItems: "center",
                      gap: 8,
                      backgroundColor: activeGenerator === "ai" ? "white" : "transparent",
                      color: activeGenerator === "ai" ? "#8b5cf6" : "#6b7280",
                      border: "none",
                      cursor: "pointer",
                      boxShadow: activeGenerator === "ai" ? "0 1px 2px rgba(0,0,0,.05)" : "none",
                    }}
                  >
                    <Wand2 size={16} />
                    AI Generator
                  </button>
                </div>
              </div>

              {/* AI section */}
              {activeGenerator === "ai" && (
                <div style={{ backgroundColor: "#faf5ff", border: "2px solid #e9d5ff", borderRadius: 12, padding: 24 }}>
                  <h3 style={{ fontSize: "1.125rem", fontWeight: 600, marginBottom: 12, display: "flex", alignItems: "center", gap: 8, color: "#7c3aed" }}>
                    <Wand2 size={20} />
                    AI Prompt Generator
                  </h3>
                  <p style={{ color: "#8b5cf6", fontSize: 14, marginBottom: 16 }}>
                    Describe what you want to achieve, and AI will generate an optimized prompt using proven engineering techniques.
                  </p>

                  {apiError && (
                    <div style={{ backgroundColor: "#fef2f2", border: "1px solid #fecaca", borderRadius: 6, padding: 12, marginBottom: 16 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 8, color: "#dc2626" }}>
                        <AlertCircle size={16} />
                        <span style={{ fontSize: 14 }}>API Error: {apiError}</span>
                      </div>
                      <p style={{ fontSize: 12, color: "#7f1d1d", marginTop: 4 }}>Falling back to demo mode in 3 seconds...</p>
                    </div>
                  )}

                  <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                    <textarea
                      value={generatorInput}
                      onChange={(e) => setGeneratorInput(e.target.value)}
                      placeholder="Example: I want to analyze customer feedback data to identify common complaints and suggest improvements..."
                      style={{
                        width: "100%",
                        padding: 12,
                        border: "2px solid #e9d5ff",
                        borderRadius: 8,
                        height: 100,
                        resize: "vertical",
                        fontFamily: "inherit",
                        fontSize: 14,
                      }}
                    />
                    <button
                      onClick={generatePrompt}
                      disabled={!generatorInput.trim() || isGenerating}
                      style={{
                        backgroundColor: generatorInput.trim() && !isGenerating ? "#8b5cf6" : "#d1d5db",
                        color: "white",
                        padding: "12px 24px",
                        borderRadius: 8,
                        border: "none",
                        cursor: generatorInput.trim() && !isGenerating ? "pointer" : "not-allowed",
                        display: "flex",
                        alignItems: "center",
                        gap: 8,
                        width: "fit-content",
                        fontSize: 14,
                        fontWeight: 500,
                      }}
                    >
                      {isGenerating ? (
                        <>
                          <Loader size={16} className="animate-spin" />
                          Generating...
                        </>
                      ) : (
                        <>
                          <Wand2 size={16} />
                          Generate Prompt
                        </>
                      )}
                    </button>
                  </div>
                </div>
              )}

              {/* Manual templates */}
              {activeGenerator === "manual" && (
                <>
                  <div>
                    <h2 style={{ fontSize: "1.25rem", fontWeight: 600, marginBottom: 16 }}>1. Choose a Template (Optional)</h2>
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: 16 }}>
                      {Object.entries(promptTemplates).map(([key, t]) => (
                        <div
                          key={key}
                          onClick={() => loadTemplate(key)}
                          style={{
                            padding: 16,
                            border: promptType === key ? "2px solid #3b82f6" : "2px solid #e5e7eb",
                            borderRadius: 8,
                            cursor: "pointer",
                            backgroundColor: promptType === key ? "#eff6ff" : "white",
                            transition: "all .2s",
                          }}
                        >
                          <h3 style={{ fontWeight: 500, marginBottom: 8 }}>{t.name}</h3>
                          <p style={{ fontSize: 14, color: "#6b7280" }}>{t.template}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h2 style={{ fontSize: "1.25rem", fontWeight: 600, marginBottom: 16 }}>2. User Context & Personalization</h2>
                    <textarea
                      value={userDetails}
                      onChange={(e) => setUserDetails(e.target.value)}
                      placeholder="Describe yourself, your role, preferences, or any personal context that should influence the response..."
                      style={{ width: "100%", padding: 12, border: "1px solid #d1d5db", borderRadius: 6, height: 80, resize: "vertical", fontFamily: "inherit" }}
                    />
                  </div>

                  <div>
                    <h2 style={{ fontSize: "1.25rem", fontWeight: 600, marginBottom: 16 }}>3. Context & Background</h2>
                    <textarea
                      value={context}
                      onChange={(e) => setContext(e.target.value)}
                      placeholder="Provide relevant context, background information, or domain-specific details..."
                      style={{ width: "100%", padding: 12, border: "1px solid #d1d5db", borderRadius: 6, height: 96, resize: "vertical", fontFamily: "inherit" }}
                    />
                  </div>
                </>
              )}

              {/* Main prompt */}
              <div>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
                  <h2 style={{ fontSize: "1.25rem", fontWeight: 600 }}>
                    {activeGenerator === "manual" ? "4. Main Prompt" : "Generated Prompt"}
                  </h2>
                  {activeGenerator === "ai" && mainPrompt && (
                    <button
                      onClick={() => setActiveGenerator("manual")}
                      style={{ fontSize: 14, color: "#3b82f6", background: "none", border: "none", cursor: "pointer", display: "flex", alignItems: "center", gap: 4 }}
                    >
                      <Settings size={14} />
                      Edit Manually
                    </button>
                  )}
                </div>
                <textarea
                  value={mainPrompt}
                  onChange={(e) => setMainPrompt(e.target.value)}
                  placeholder={activeGenerator === "ai" ? "Generated prompt will appear here..." : "Write your main question or request here..."}
                  style={{ width: "100%", padding: 12, border: "1px solid #d1d5db", borderRadius: 6, height: 128, resize: "vertical", fontFamily: "inherit" }}
                />
              </div>

              {/* Constraints */}
              <div>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
                  <h2 style={{ fontSize: "1.25rem", fontWeight: 600 }}>
                    {activeGenerator === "manual" ? "5. Constraints" : "Additional Constraints"}
                  </h2>
                  <div style={{ position: "relative" }}>
                    <select
                      onChange={(e) => {
                        if (e.target.value) {
                          addConstraint(e.target.value);
                          e.target.value = "";
                        }
                      }}
                      style={{ appearance: "none", backgroundColor: "#3b82f6", color: "white", padding: "8px 32px 8px 16px", borderRadius: 6, border: "none", cursor: "pointer" }}
                    >
                      <option value="">Add Constraint</option>
                      {constraintTypes.map((t) => (
                        <option key={t.id} value={t.id}>
                          {t.label}
                        </option>
                      ))}
                    </select>
                    <Plus style={{ position: "absolute", right: 8, top: "50%", transform: "translateY(-50%)", pointerEvents: "none", color: "white" }} size={16} />
                  </div>
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                  {constraints.map((c) => {
                    const ct = constraintTypes.find((x) => x.id === c.type);
                    return (
                      <div key={c.id} style={{ display: "flex", alignItems: "center", gap: 12 }}>
                        <div style={{ flex: 1 }}>
                          <label style={{ display: "block", fontSize: 14, fontWeight: 500, color: "#374151", marginBottom: 4 }}>{ct.label}</label>
                          <input
                            type="text"
                            value={c.value}
                            onChange={(e) => updateConstraint(c.id, e.target.value)}
                            placeholder={ct.placeholder}
                            style={{ width: "100%", padding: 8, border: "1px solid #d1d5db", borderRadius: 4 }}
                          />
                        </div>
                        <button onClick={() => removeConstraint(c.id)} style={{ color: "#ef4444", background: "none", border: "none", cursor: "pointer", marginTop: 24 }}>
                          <X size={16} />
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Additional Guidelines */}
              <div>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
                  <h2 style={{ fontSize: "1.25rem", fontWeight: 600 }}>
                    {activeGenerator === "manual" ? "6. Additional Guidelines" : "Additional Guidelines"}
                  </h2>
                  <button
                    onClick={addGuideline}
                    style={{ backgroundColor: "#10b981", color: "white", padding: "8px 16px", borderRadius: 6, border: "none", cursor: "pointer", display: "flex", alignItems: "center", gap: 8 }}
                  >
                    <Plus size={16} />
                    Add Guideline
                  </button>
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                  {guidelines.map((guideline) => (
                    <div key={guideline.id} style={{ display: "flex", alignItems: "center", gap: 12 }}>
                      <input
                        type="text"
                        value={guideline.text}
                        onChange={(e) => updateGuideline(guideline.id, e.target.value)}
                        placeholder="Enter additional guideline or instruction..."
                        style={{ flex: 1, padding: "8px", border: "1px solid #d1d5db", borderRadius: "4px" }}
                      />
                      <button
                        onClick={() => removeGuideline(guideline.id)}
                        style={{ color: "#ef4444", background: "none", border: "none", cursor: "pointer" }}
                      >
                        <X size={16} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Action Buttons */}
              <div style={{ display: "flex", flexWrap: "wrap", gap: 12, paddingTop: 16, borderTop: "1px solid #e5e7eb" }}>
                <button
                  onClick={savePrompt}
                  disabled={!finalPrompt.trim()}
                  style={{
                    backgroundColor: finalPrompt.trim() ? "#3b82f6" : "#d1d5db",
                    color: "white",
                    padding: "8px 16px",
                    borderRadius: 6,
                    border: "none",
                    cursor: finalPrompt.trim() ? "pointer" : "not-allowed",
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                  }}
                >
                  <Save size={16} />
                  Save Prompt
                </button>

                <button
                  onClick={copyToClipboard}
                  disabled={!finalPrompt.trim()}
                  style={{
                    backgroundColor: finalPrompt.trim() ? "#10b981" : "#d1d5db",
                    color: "white",
                    padding: "8px 16px",
                    borderRadius: 6,
                    border: "none",
                    cursor: finalPrompt.trim() ? "pointer" : "not-allowed",
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                  }}
                >
                  <Copy size={16} />
                  Copy
                </button>

                <button
                  onClick={downloadPrompt}
                  disabled={!finalPrompt.trim()}
                  style={{
                    backgroundColor: finalPrompt.trim() ? "#6366f1" : "#d1d5db",
                    color: "white",
                    padding: "8px 16px",
                    borderRadius: 6,
                    border: "none",
                    cursor: finalPrompt.trim() ? "pointer" : "not-allowed",
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                  }}
                >
                  <Download size={16} />
                  Download
                </button>

                <button
                  onClick={clearAll}
                  style={{ backgroundColor: "#f3f4f6", color: "#374151", padding: "8px 16px", borderRadius: 6, border: "1px solid #e5e7eb", display: "flex", alignItems: "center", gap: 8 }}
                >
                  <RefreshCw size={16} />
                  Clear All
                </button>
              </div>
            </div>
          )}

          {/* Preview & Analysis */}
          {activeTab === "preview" && (
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }}>
              <div style={{ border: "1px solid #e5e7eb", borderRadius: 8, padding: 16 }}>
                <h3 style={{ marginBottom: 8, fontWeight: 600 }}>Prompt Preview</h3>
                <pre style={{ whiteSpace: "pre-wrap", wordBreak: "break-word", background: "#f9fafb", padding: 12, borderRadius: 6, minHeight: 240 }}>
                  {finalPrompt || "Your composed prompt will appear here."}
                </pre>
              </div>
              <div style={{ border: "1px solid #e5e7eb", borderRadius: 8, padding: 16 }}>
                <h3 style={{ marginBottom: 8, fontWeight: 600, display: "flex", alignItems: "center", gap: 8 }}>
                  <CheckCircle size={16} /> Analysis
                </h3>
                {analysis ? (
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                    <div>
                      <h4 style={{ fontWeight: 600, marginBottom: 8 }}>Strengths</h4>
                      <ul>{analysis.strengths.map((s, i) => <li key={i}>• {s}</li>)}</ul>
                    </div>
                    <div>
                      <h4 style={{ fontWeight: 600, marginBottom: 8 }}>Issues</h4>
                      <ul>{analysis.issues.map((s, i) => <li key={i}>• {s}</li>)}</ul>
                    </div>
                  </div>
                ) : (
                  <p style={{ color: "#6b7280" }}>Start composing your prompt to see analysis.</p>
                )}
              </div>
            </div>
          )}

          {/* Saved Prompts */}
          {activeTab === "saved" && (
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              {savedPrompts.length === 0 ? (
                <p style={{ color: "#6b7280" }}>No saved prompts yet.</p>
              ) : (
                savedPrompts.map((p) => (
                  <div key={p.id} style={{ border: "1px solid #e5e7eb", borderRadius: 8, padding: 16 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                      <strong>{p.name}</strong>
                      <span style={{ color: "#6b7280" }}>{p.timestamp}</span>
                    </div>
                    <pre style={{ whiteSpace: "pre-wrap", wordBreak: "break-word", background: "#f9fafb", padding: 12, borderRadius: 6 }}>
                      {p.content}
                    </pre>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default App;
