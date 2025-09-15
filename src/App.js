import React, { useState, useEffect } from 'react';
import { Save, Copy, Download, RefreshCw, AlertCircle, CheckCircle, Plus, X, Eye, Settings, Wand2, Loader } from 'lucide-react';

function App() {
  const [activeTab, setActiveTab] = useState('builder');
  const [promptType, setPromptType] = useState('');
  const [context, setContext] = useState('');
  const [userDetails, setUserDetails] = useState('');
  const [mainPrompt, setMainPrompt] = useState('');
  const [constraints, setConstraints] = useState([]);
  const [guidelines, setGuidelines] = useState([]);
  const [finalPrompt, setFinalPrompt] = useState('');
  const [savedPrompts, setSavedPrompts] = useState([]);
  const [analysis, setAnalysis] = useState(null);
  const [activeGenerator, setActiveGenerator] = useState('manual');
  const [generatorInput, setGeneratorInput] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);

  const promptTemplates = {
    'contextual': {
      name: 'Contextual Prompt',
      template: 'In the context of [DOMAIN], [MAIN_REQUEST]. Consider [CONTEXT_DETAILS].',
      example: 'In the context of space exploration, explain the concept of black holes. Consider recent discoveries and their implications for future missions.'
    },
    'specific-question': {
      name: 'Specific Question',
      template: '[SPECIFIC_QUESTION] Please provide [DETAIL_LEVEL] explanation including [REQUIRED_ELEMENTS].',
      example: 'What are the key principles of supply and demand in economics? Please provide a detailed explanation including real-world examples and current market applications.'
    },
    'creative-writing': {
      name: 'Creative Writing',
      template: 'Write a [FORMAT] that [CREATIVE_GOAL]. Begin with: "[OPENING_LINE]"',
      example: 'Write a short story that explores themes of redemption and hope. Begin with: "The old lighthouse had been dark for thirty years."'
    },
    'analysis': {
      name: 'Analysis & Comparison',
      template: 'Analyze and compare [SUBJECT_A] and [SUBJECT_B] in terms of [CRITERIA]. Focus on [SPECIFIC_ASPECTS].',
      example: 'Analyze and compare renewable energy and fossil fuels in terms of environmental impact. Focus on long-term sustainability and economic implications.'
    },
    'step-by-step': {
      name: 'Step-by-Step Guide',
      template: 'Provide a step-by-step guide for [PROCESS]. Include [REQUIREMENTS] and address [POTENTIAL_CHALLENGES].',
      example: 'Provide a step-by-step guide for implementing sustainable practices in small businesses. Include cost considerations and address common implementation challenges.'
    }
  };

  const constraintTypes = [
    { id: 'length', label: 'Word/Character Limit', placeholder: 'e.g., 500 words maximum' },
    { id: 'format', label: 'Format Requirement', placeholder: 'e.g., bullet points, formal tone' },
    { id: 'audience', label: 'Target Audience', placeholder: 'e.g., beginners, experts, children' },
    { id: 'style', label: 'Writing Style', placeholder: 'e.g., academic, conversational, technical' },
    { id: 'scope', label: 'Scope Limitation', placeholder: 'e.g., focus on last 5 years, US only' },
    { id: 'ethical', label: 'Ethical Guidelines', placeholder: 'e.g., avoid bias, include diverse perspectives' }
  ];

  // Demo AI generation with intelligent responses based on input
  const generateDemoPrompt = async () => {
    if (!generatorInput.trim()) return;
    
    setIsGenerating(true);
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const input = generatorInput.toLowerCase();
    let generatedPrompt = '';
    
    // Intelligent response generation based on keywords
    if (input.includes('analyze') || input.includes('analysis')) {
      generatedPrompt = `Please conduct a comprehensive analysis of ${extractMainTopic(generatorInput)}. 

Structure your analysis as follows:
1. Current state and key characteristics
2. Main challenges and opportunities  
3. Contributing factors and root causes
4. Potential solutions and recommendations
5. Implementation considerations and next steps

Provide specific examples, data points where relevant, and actionable insights. Ensure your analysis is objective, well-reasoned, and considers multiple perspectives.`;

    } else if (input.includes('compare') || input.includes('comparison')) {
      generatedPrompt = `Compare and contrast ${extractMainTopic(generatorInput)} across the following dimensions:

1. Key similarities and differences
2. Advantages and disadvantages of each
3. Use cases and applications
4. Performance metrics and outcomes
5. Cost-benefit considerations

Provide specific examples and evidence to support your comparison. Structure your response with clear headings and conclude with recommendations for when to use each option.`;

    } else if (input.includes('explain') || input.includes('understand')) {
      generatedPrompt = `Provide a clear, comprehensive explanation of ${extractMainTopic(generatorInput)}.

Please include:
- A concise definition and overview
- Key concepts and principles
- How it works (step-by-step if applicable)
- Real-world examples and applications
- Common misconceptions or pitfalls
- Why this is important or relevant

Tailor your explanation for someone who is intelligent but may not have deep expertise in this specific area.`;

    } else if (input.includes('strategy') || input.includes('plan')) {
      generatedPrompt = `Develop a strategic approach for ${extractMainTopic(generatorInput)}.

Your response should include:
1. Situation analysis and key considerations
2. Clear objectives and success metrics
3. Specific strategies and tactics
4. Implementation timeline and phases
5. Resource requirements and constraints
6. Risk assessment and mitigation strategies
7. Monitoring and evaluation methods

Provide actionable recommendations that are realistic and results-oriented.`;

    } else if (input.includes('write') || input.includes('create') || input.includes('content')) {
      generatedPrompt = `Create compelling content about ${extractMainTopic(generatorInput)}.

Content requirements:
- Engaging and informative tone
- Clear structure with logical flow
- Specific examples and evidence
- Actionable insights or takeaways
- Appropriate length and format for the intended audience

Consider the target audience's needs, interests, and level of expertise when crafting your response.`;

    } else if (input.includes('improve') || input.includes('optimize')) {
      generatedPrompt = `Provide recommendations to improve and optimize ${extractMainTopic(generatorInput)}.

Focus on:
1. Current performance assessment
2. Key areas for improvement
3. Specific optimization strategies
4. Best practices and proven methods
5. Implementation priorities and quick wins
6. Long-term optimization roadmap
7. Success metrics and tracking methods

Ensure recommendations are practical, evidence-based, and prioritized by impact and feasibility.`;

    } else {
      // Generic but intelligent fallback
      generatedPrompt = `Please provide a comprehensive response about ${extractMainTopic(generatorInput)}.

Address the following aspects:
1. Overview and key points
2. Important details and context
3. Practical implications and applications
4. Relevant examples or case studies
5. Best practices and recommendations
6. Common challenges and how to address them

Structure your response clearly and provide actionable insights that would be valuable for decision-making and implementation.`;
    }
    
    setMainPrompt(generatedPrompt);
    setActiveGenerator('manual');
    setIsGenerating(false);
  };

  // Helper function to extract main topic from user input
  const extractMainTopic = (input) => {
    // Remove common prompt words to get the core topic
    const cleanInput = input
      .replace(/^(please |can you |help me |i want to |i need to |how to )/i, '')
      .replace(/(analyze|compare|explain|understand|write|create|improve|optimize|strategy|plan)/gi, '')
      .trim();
    
    return cleanInput || 'the topic you mentioned';
  };

  const addConstraint = (type) => {
    setConstraints([...constraints, { id: Date.now(), type, value: '' }]);
  };

  const updateConstraint = (id, value) => {
    setConstraints(constraints.map(c => c.id === id ? { ...c, value } : c));
  };

  const removeConstraint = (id) => {
    setConstraints(constraints.filter(c => c.id !== id));
  };

  const addGuideline = () => {
    setGuidelines([...guidelines, { id: Date.now(), text: '' }]);
  };

  const updateGuideline = (id, text) => {
    setGuidelines(guidelines.map(g => g.id === id ? { ...g, text } : g));
  };

  const removeGuideline = (id) => {
    setGuidelines(guidelines.filter(g => g.id !== id));
  };

  const analyzePrompt = (prompt) => {
    const issues = [];
    const strengths = [];
    
    // Check for ambiguity
    const ambiguousTerms = ['best', 'good', 'recent', 'many', 'some', 'often'];
    const hasAmbiguity = ambiguousTerms.some(term => 
      prompt.toLowerCase().includes(term) && !prompt.includes('specific') && !prompt.includes('define')
    );
    
    if (hasAmbiguity) {
      issues.push('Contains potentially ambiguous terms that may need clarification');
    }

    // Check for context
    if (prompt.includes('context of') || prompt.includes('in terms of')) {
      strengths.push('Includes contextual framing');
    } else if (prompt.length > 20) {
      issues.push('Consider adding contextual framing for better results');
    }

    // Check for specificity
    if (prompt.includes('?') && prompt.split('?').length > 2) {
      issues.push('Multiple questions detected - consider breaking into separate prompts');
    }

    if (prompt.includes('explain') || prompt.includes('describe') || prompt.includes('analyze')) {
      strengths.push('Uses clear action verbs');
    }

    // Check for structure
    if (prompt.includes('1.') || prompt.includes('•') || prompt.includes('include:')) {
      strengths.push('Well-structured with clear requirements');
    }

    // Check length
    if (prompt.length < 10) {
      issues.push('Prompt may be too short for complex responses');
    } else if (prompt.length > 500) {
      issues.push('Prompt may be too long - consider simplifying');
    } else {
      strengths.push('Appropriate length for clear communication');
    }

    return { issues, strengths };
  };

  useEffect(() => {
    let prompt = '';
    
    // Add user details if provided
    if (userDetails.trim()) {
      prompt += `User context: ${userDetails.trim()}\n\n`;
    }
    
    // Add context if provided
    if (context.trim()) {
      prompt += `Context: ${context.trim()}\n\n`;
    }
    
    // Add main prompt
    if (mainPrompt.trim()) {
      prompt += mainPrompt.trim();
    }
    
    // Add constraints
    if (constraints.length > 0) {
      const validConstraints = constraints.filter(c => c.value.trim());
      if (validConstraints.length > 0) {
        prompt += '\n\nConstraints:\n';
        validConstraints.forEach(constraint => {
          const constraintType = constraintTypes.find(ct => ct.id === constraint.type);
          prompt += `- ${constraintType.label}: ${constraint.value.trim()}\n`;
        });
      }
    }
    
    // Add guidelines
    if (guidelines.length > 0) {
      const validGuidelines = guidelines.filter(g => g.text.trim());
      if (validGuidelines.length > 0) {
        prompt += '\n\nAdditional Guidelines:\n';
        validGuidelines.forEach(guideline => {
          prompt += `- ${guideline.text.trim()}\n`;
        });
      }
    }
    
    setFinalPrompt(prompt);
    
    // Analyze the prompt
    if (prompt.trim()) {
      setAnalysis(analyzePrompt(prompt));
    } else {
      setAnalysis(null);
    }
  }, [userDetails, context, mainPrompt, constraints, guidelines]);

  const loadTemplate = (templateKey) => {
    const template = promptTemplates[templateKey];
    setPromptType(templateKey);
    setMainPrompt(template.example);
  };

  const savePrompt = () => {
    if (finalPrompt.trim()) {
      const newPrompt = {
        id: Date.now(),
        name: `Prompt ${savedPrompts.length + 1}`,
        content: finalPrompt,
        type: promptType,
        timestamp: new Date().toLocaleString()
      };
      setSavedPrompts([...savedPrompts, newPrompt]);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(finalPrompt);
  };

  const downloadPrompt = () => {
    const blob = new Blob([finalPrompt], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'prompt.txt';
    a.click();
    URL.revokeObjectURL(url);
  };

  const clearAll = () => {
    setPromptType('');
    setContext('');
    setUserDetails('');
    setMainPrompt('');
    setConstraints([]);
    setGuidelines([]);
  };

  return (
    <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '24px', backgroundColor: '#f9fafb', minHeight: '100vh' }}>
      <div style={{ backgroundColor: 'white', borderRadius: '8px', boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)' }}>
        {/* Header */}
        <div style={{ borderBottom: '1px solid #e5e7eb', padding: '24px' }}>
          <h1 style={{ fontSize: '2rem', fontWeight: 'bold', color: '#111827', marginBottom: '8px' }}>AI Prompt Builder</h1>
          <p style={{ color: '#6b7280' }}>Create effective prompts using proven engineering techniques</p>
        </div>

        {/* Navigation Tabs */}
        <div style={{ borderBottom: '1px solid #e5e7eb' }}>
          <nav style={{ display: 'flex', gap: '32px', padding: '0 24px' }}>
            {[
              { id: 'builder', label: 'Prompt Builder', icon: Settings },
              { id: 'preview', label: 'Preview & Analysis', icon: Eye },
              { id: 'saved', label: 'Saved Prompts', icon: Save }
            ].map(tab => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  style={{
                    padding: '16px 4px',
                    borderBottom: activeTab === tab.id ? '2px solid #3b82f6' : '2px solid transparent',
                    fontWeight: '500',
                    fontSize: '14px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    color: activeTab === tab.id ? '#3b82f6' : '#6b7280',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer'
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
        <div style={{ padding: '24px' }}>
          {activeTab === 'builder' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
              {/* Generation Mode Toggle */}
              <div>
                <h2 style={{ fontSize: '1.25rem', fontWeight: '600', marginBottom: '16px' }}>Generation Mode</h2>
                <div style={{ display: 'flex', backgroundColor: '#f3f4f6', borderRadius: '8px', padding: '4px', width: 'fit-content' }}>
                  <button
                    onClick={() => setActiveGenerator('manual')}
                    style={{
                      padding: '8px 16px',
                      borderRadius: '6px',
                      transition: 'all 0.2s',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      backgroundColor: activeGenerator === 'manual' ? 'white' : 'transparent',
                      color: activeGenerator === 'manual' ? '#3b82f6' : '#6b7280',
                      border: 'none',
                      cursor: 'pointer',
                      boxShadow: activeGenerator === 'manual' ? '0 1px 2px rgba(0, 0, 0, 0.05)' : 'none'
                    }}
                  >
                    <Settings size={16} />
                    Manual Builder
                  </button>
                  <button
                    onClick={() => setActiveGenerator('ai')}
                    style={{
                      padding: '8px 16px',
                      borderRadius: '6px',
                      transition: 'all 0.2s',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      backgroundColor: activeGenerator === 'ai' ? 'white' : 'transparent',
                      color: activeGenerator === 'ai' ? '#8b5cf6' : '#6b7280',
                      border: 'none',
                      cursor: 'pointer',
                      boxShadow: activeGenerator === 'ai' ? '0 1px 2px rgba(0, 0, 0, 0.05)' : 'none'
                    }}
                  >
                    <Wand2 size={16} />
                    AI Generator
                  </button>
                </div>
              </div>

              {/* AI Generator Section */}
              {activeGenerator === 'ai' && (
                <div style={{ backgroundColor: '#faf5ff', border: '2px solid #e9d5ff', borderRadius: '12px', padding: '24px' }}>
                  <h3 style={{ fontSize: '1.125rem', fontWeight: '600', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px', color: '#7c3aed' }}>
                    <Wand2 size={20} />
                    AI Prompt Generator
                  </h3>
                  <p style={{ color: '#8b5cf6', fontSize: '14px', marginBottom: '16px' }}>
                    Describe what you want to achieve, and AI will generate an optimized prompt using proven engineering techniques.
                  </p>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    <textarea
                      value={generatorInput}
                      onChange={(e) => setGeneratorInput(e.target.value)}
                      placeholder="Example: I want to analyze customer feedback data to identify common complaints and suggest improvements for our product..."
                      style={{
                        width: '100%',
                        padding: '12px',
                        border: '2px solid #e9d5ff',
                        borderRadius: '8px',
                        height: '100px',
                        resize: 'vertical',
                        fontFamily: 'inherit',
                        fontSize: '14px'
                      }}
                    />
                    <button
                      onClick={generateDemoPrompt}
                      disabled={!generatorInput.trim() || isGenerating}
                      style={{
                        backgroundColor: generatorInput.trim() && !isGenerating ? '#8b5cf6' : '#d1d5db',
                        color: 'white',
                        padding: '12px 24px',
                        borderRadius: '8px',
                        border: 'none',
                        cursor: generatorInput.trim() && !isGenerating ? 'pointer' : 'not-allowed',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        width: 'fit-content',
                        fontSize: '14px',
                        fontWeight: '500'
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

              {/* Manual Builder (existing content) */}
              {activeGenerator === 'manual' && (
                <>
                  {/* Template Selection */}
                  <div>
                    <h2 style={{ fontSize: '1.25rem', fontWeight: '600', marginBottom: '16px' }}>1. Choose a Template (Optional)</h2>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '16px' }}>
                      {Object.entries(promptTemplates).map(([key, template]) => (
                        <div
                          key={key}
                          onClick={() => loadTemplate(key)}
                          style={{
                            padding: '16px',
                            border: promptType === key ? '2px solid #3b82f6' : '2px solid #e5e7eb',
                            borderRadius: '8px',
                            cursor: 'pointer',
                            backgroundColor: promptType === key ? '#eff6ff' : 'white',
                            transition: 'all 0.2s'
                          }}
                        >
                          <h3 style={{ fontWeight: '500', marginBottom: '8px' }}>{template.name}</h3>
                          <p style={{ fontSize: '14px', color: '#6b7280' }}>{template.template}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* User Details */}
                  <div>
                    <h2 style={{ fontSize: '1.25rem', fontWeight: '600', marginBottom: '16px' }}>2. User Context & Personalization</h2>
                    <textarea
                      value={userDetails}
                      onChange={(e) => setUserDetails(e.target.value)}
                      placeholder="Describe yourself, your role, preferences, or any personal context that should influence the response..."
                      style={{
                        width: '100%',
                        padding: '12px',
                        border: '1px solid #d1d5db',
                        borderRadius: '6px',
                        height: '80px',
                        resize: 'vertical',
                        fontFamily: 'inherit'
                      }}
                    />
                  </div>

                  {/* Context Setting */}
                  <div>
                    <h2 style={{ fontSize: '1.25rem', fontWeight: '600', marginBottom: '16px' }}>3. Context & Background</h2>
                    <textarea
                      value={context}
                      onChange={(e) => setContext(e.target.value)}
                      placeholder="Provide relevant context, background information, or domain-specific details..."
                      style={{
                        width: '100%',
                        padding: '12px',
                        border: '1px solid #d1d5db',
                        borderRadius: '6px',
                        height: '96px',
                        resize: 'vertical',
                        fontFamily: 'inherit'
                      }}
                    />
                  </div>
                </>
              )}

              {/* Main Prompt - always visible */}
              <div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
                  <h2 style={{ fontSize: '1.25rem', fontWeight: '600' }}>
                    {activeGenerator === 'manual' ? '4. Main Prompt' : 'Generated Prompt'}
                  </h2>
                  {activeGenerator === 'ai' && mainPrompt && (
                    <button
                      onClick={() => setActiveGenerator('manual')}
                      style={{
                        fontSize: '14px',
                        color: '#3b82f6',
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px'
                      }}
                    >
                      <Settings size={14} />
                      Edit Manually
                    </button>
                  )}
                </div>
                <textarea
                  value={mainPrompt}
                  onChange={(e) => setMainPrompt(e.target.value)}
                  placeholder={
                    activeGenerator === 'ai' 
                      ? "Generated prompt will appear here..." 
                      : "Write your main question or request here..."
                  }
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: '1px solid #d1d5db',
                    borderRadius: '6px',
                    height: '128px',
                    resize: 'vertical',
                    fontFamily: 'inherit'
                  }}
                />
              </div>

              {/* Constraints */}
              <div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
                  <h2 style={{ fontSize: '1.25rem', fontWeight: '600' }}>
                    {activeGenerator === 'manual' ? '5. Constraints' : 'Additional Constraints'}
                  </h2>
                  <div style={{ position: 'relative' }}>
                    <select
                      onChange={(e) => {
                        if (e.target.value) {
                          addConstraint(e.target.value);
                          e.target.value = '';
                        }
                      }}
                      style={{
                        appearance: 'none',
                        backgroundColor: '#3b82f6',
                        color: 'white',
                        padding: '8px 32px 8px 16px',
                        borderRadius: '6px',
                        border: 'none',
                        cursor: 'pointer'
                      }}
                    >
                      <option value="">Add Constraint</option>
                      {constraintTypes.map(type => (
                        <option key={type.id} value={type.id}>{type.label}</option>
                      ))}
                    </select>
                    <Plus style={{ position: 'absolute', right: '8px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', color: 'white' }} size={16} />
                  </div>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {constraints.map(constraint => {
                    const constraintType = constraintTypes.find(ct => ct.id === constraint.type);
                    return (
                      <div key={constraint.id} style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div style={{ flex: 1 }}>
                          <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '4px' }}>
                            {constraintType.label}
                          </label>
                          <input
                            type="text"
                            value={constraint.value}
                            onChange={(e) => updateConstraint(constraint.id, e.target.value)}
                            placeholder={constraintType.placeholder}
                            style={{
                              width: '100%',
                              padding: '8px',
                              border: '1px solid #d1d5db',
                              borderRadius: '4px'
                            }}
                          />
                        </div>
                        <button
                          onClick={() => removeConstraint(constraint.id)}
                          style={{
                            color: '#ef4444',
                            background: 'none',
                            border: 'none',
                            cursor: 'pointer',
                            marginTop: '24px'
                          }}
                        >
                          <X size={16} />
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Additional Guidelines */}
              <div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
                  <h2 style={{ fontSize: '1.25rem', fontWeight: '600' }}>
                    {activeGenerator === 'manual' ? '6. Additional Guidelines' : 'Additional Guidelines'}
                  </h2>
                  <button
                    onClick={addGuideline}
                    style={{
                      backgroundColor: '#10b981',
                      color: 'white',
                      padding: '8px 16px',
                      borderRadius: '6px',
                      border: 'none',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px'
                    }}
                  >
                    <Plus size={16} />
                    Add Guideline
                  </button>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {guidelines.map(guideline => (
                    <div key={guideline.id} style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <input
                        type="text"
                        value={guideline.text}
                        onChange={(e) => updateGuideline(guideline.id, e.target.value)}
                        placeholder="Enter additional guideline or instruction..."
                        style={{
                          flex: 1,
                          padding: '8px',
                          border: '1px solid #d1d5db',
                          borderRadius: '4px'
                        }}
                      />
                      <button
                        onClick={() => removeGuideline(guideline.id)}
                        style={{
                          color: '#ef4444',
                          background: 'none',
                          border: 'none',
                          cursor: 'pointer'
                        }}
                      >
                        <X size={16} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Action Buttons */}
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', paddingTop: '16px', borderTop: '1px solid #e5e7eb' }}>
                <button
                  onClick={savePrompt}
                  disabled={!finalPrompt.trim()}
                  style={{
                    backgroundColor: finalPrompt.trim() ? '#3b82f6' : '#d1d5db',
                    color: 'white',
                    padding: '8px 16px',
                    borderRadius: '6px',
                    border: 'none',
                    cursor: finalPrompt.trim() ? 'pointer' : 'not-allowed',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                  }}
                >
                  <Save size={16} />
                  Save Prompt
                </button>
                <button
                  onClick={copyToClipboard}
                  disabled={!finalPrompt.trim()}
                  style={{
                    backgroundColor: finalPrompt.trim() ? '#10b981' : '#d1d5db',
                    color: 'white',
                    padding: '8px 16px',
                    borderRadius: '6px',
                    border: 'none',
                    cursor: finalPrompt.trim() ? 'pointer' : 'not-allowed',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                  }}
                >
                  <Copy size={16} />
                  Copy to Clipboard
                </button>
                <button
                  onClick={downloadPrompt}
                  disabled={!finalPrompt.trim()}
                  style={{
                    backgroundColor: finalPrompt.trim() ? '#8b5cf6' : '#d1d5db',
                    color: 'white',
                    padding: '8px 16px',
                    borderRadius: '6px',
                    border: 'none',
                    cursor: finalPrompt.trim() ? 'pointer' : 'not-allowed',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                  }}
                >
                  <Download size={16} />
                  Download
                </button>
                <button
                  onClick={clearAll}
                  style={{
                    backgroundColor: '#ef4444',
                    color: 'white',
                    padding: '8px 16px',
                    borderRadius: '6px',
                    border: 'none',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                  }}
                >
                  <RefreshCw size={16} />
                  Clear All
                </button>
              </div>
            </div>
          )}

          {activeTab === 'preview' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              <h2 style={{ fontSize: '1.5rem', fontWeight: '600' }}>Prompt Preview & Analysis</h2>
              
              {/* Final Prompt Display */}
              <div>
                <h3 style={{ fontSize: '1.125rem', fontWeight: '500', marginBottom: '12px' }}>Generated Prompt</h3>
                <div style={{
                  backgroundColor: '#f9fafb',
                  padding: '16px',
                  borderRadius: '6px',
                  border: '1px solid #e5e7eb',
                  minHeight: '128px'
                }}>
                  {finalPrompt ? (
                    <pre style={{ whiteSpace: 'pre-wrap', fontSize: '14px', margin: 0, fontFamily: 'inherit' }}>{finalPrompt}</pre>
                  ) : (
                    <p style={{ color: '#6b7280', fontStyle: 'italic', margin: 0 }}>Build your prompt in the Builder tab to see the preview here.</p>
                  )}
                </div>
              </div>

              {/* Analysis */}
              {analysis && (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px' }}>
                  {/* Strengths */}
                  <div>
                    <h3 style={{ fontSize: '1.125rem', fontWeight: '500', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px', color: '#059669' }}>
                      <CheckCircle size={20} />
                      Strengths
                    </h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      {analysis.strengths.length > 0 ? (
                        analysis.strengths.map((strength, index) => (
                          <div key={index} style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', color: '#059669' }}>
                            <CheckCircle size={16} style={{ marginTop: '2px', flexShrink: 0 }} />
                            <span style={{ fontSize: '14px' }}>{strength}</span>
                          </div>
                        ))
                      ) : (
                        <p style={{ color: '#6b7280', fontSize: '14px' }}>No specific strengths detected yet.</p>
                      )}
                    </div>
                  </div>

                  {/* Issues */}
                  <div>
                    <h3 style={{ fontSize: '1.125rem', fontWeight: '500', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px', color: '#d97706' }}>
                      <AlertCircle size={20} />
                      Suggestions for Improvement
                    </h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      {analysis.issues.length > 0 ? (
                        analysis.issues.map((issue, index) => (
                          <div key={index} style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', color: '#d97706' }}>
                            <AlertCircle size={16} style={{ marginTop: '2px', flexShrink: 0 }} />
                            <span style={{ fontSize: '14px' }}>{issue}</span>
                          </div>
                        ))
                      ) : (
                        <p style={{ color: '#6b7280', fontSize: '14px' }}>No issues detected. Your prompt looks good!</p>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Character/Word Count */}
              {finalPrompt && (
                <div style={{ backgroundColor: '#eff6ff', padding: '16px', borderRadius: '6px' }}>
                  <h3 style={{ fontWeight: '500', marginBottom: '8px' }}>Prompt Statistics</h3>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: '16px', fontSize: '14px' }}>
                    <div>
                      <span style={{ color: '#6b7280' }}>Characters:</span>
                      <span style={{ marginLeft: '8px', fontWeight: '500' }}>{finalPrompt.length}</span>
                    </div>
                    <div>
                      <span style={{ color: '#6b7280' }}>Words:</span>
                      <span style={{ marginLeft: '8px', fontWeight: '500' }}>{finalPrompt.trim().split(/\s+/).length}</span>
                    </div>
                    <div>
                      <span style={{ color: '#6b7280' }}>Lines:</span>
                      <span style={{ marginLeft: '8px', fontWeight: '500' }}>{finalPrompt.split('\n').length}</span>
                    </div>
                    <div>
                      <span style={{ color: '#6b7280' }}>Questions:</span>
                      <span style={{ marginLeft: '8px', fontWeight: '500' }}>{(finalPrompt.match(/\?/g) || []).length}</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'saved' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              <h2 style={{ fontSize: '1.5rem', fontWeight: '600' }}>Saved Prompts</h2>
              
              {savedPrompts.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '48px' }}>
                  <Save size={48} style={{ margin: '0 auto 16px auto', color: '#d1d5db' }} />
                  <p style={{ color: '#6b7280' }}>No saved prompts yet. Build and save prompts to see them here.</p>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  {savedPrompts.map(prompt => (
                    <div key={prompt.id} style={{ border: '1px solid #e5e7eb', borderRadius: '6px', padding: '16px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                        <h3 style={{ fontWeight: '500' }}>{prompt.name}</h3>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', color: '#6b7280' }}>
                          {prompt.type && (
                            <span style={{ backgroundColor: '#f3f4f6', padding: '4px 8px', borderRadius: '4px' }}>
                              {promptTemplates[prompt.type]?.name || prompt.type}
                            </span>
                          )}
                          <span>{prompt.timestamp}</span>
                        </div>
                      </div>
                      <div style={{ backgroundColor: '#f9fafb', padding: '12px', borderRadius: '4px', fontSize: '14px', marginBottom: '12px', maxHeight: '128px', overflow: 'auto' }}>
                        <pre style={{ whiteSpace: 'pre-wrap', margin: 0, fontFamily: 'inherit' }}>{prompt.content}</pre>
                      </div>
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <button
                          onClick={() => navigator.clipboard.writeText(prompt.content)}
                          style={{
                            color: '#3b82f6',
                            background: 'none',
                            border: 'none',
                            cursor: 'pointer',
                            fontSize: '14px',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px'
                          }}
                        >
                          <Copy size={14} />
                          Copy
                        </button>
                        <button
                          onClick={() => {
                            setSavedPrompts(savedPrompts.filter(p => p.id !== prompt.id));
                          }}
                          style={{
                            color: '#ef4444',
                            background: 'none',
                            border: 'none',
                            cursor: 'pointer',
                            fontSize: '14px',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px'
                          }}
                        >
                          <X size={14} />
                          Delete
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default App;
