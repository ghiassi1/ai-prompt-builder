import React, { useState, useEffect } from 'react';
import { Save, Copy, Download, RefreshCw, AlertCircle, CheckCircle, Plus, X, Eye, Settings } from 'lucide-react';

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
    }
  };

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '24px', backgroundColor: '#f9fafb', minHeight: '100vh' }}>
      <div style={{ backgroundColor: 'white', borderRadius: '8px', boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)' }}>
        <div style={{ borderBottom: '1px solid #e5e7eb', padding: '24px' }}>
          <h1 style={{ fontSize: '2rem', fontWeight: 'bold', color: '#111827', marginBottom: '8px' }}>AI Prompt Builder</h1>
          <p style={{ color: '#6b7280' }}>Create effective prompts using proven engineering techniques</p>
        </div>
        
        <div style={{ padding: '24px' }}>
          <h2 style={{ fontSize: '1.5rem', fontWeight: '600', marginBottom: '16px' }}>Manual Prompt Builder</h2>
          
          <div style={{ marginBottom: '24px' }}>
            <h3 style={{ fontSize: '1.125rem', fontWeight: '500', marginBottom: '12px' }}>Main Prompt</h3>
            <textarea
              value={mainPrompt}
              onChange={(e) => setMainPrompt(e.target.value)}
              placeholder="Write your main question or request here..."
              style={{
                width: '100%',
                padding: '12px',
                border: '1px solid #d1d5db',
                borderRadius: '6px',
                height: '120px',
                resize: 'vertical',
                fontFamily: 'inherit'
              }}
            />
          </div>

          <div style={{ marginBottom: '24px' }}>
            <h3 style={{ fontSize: '1.125rem', fontWeight: '500', marginBottom: '12px' }}>Preview</h3>
            <div style={{
              backgroundColor: '#f9fafb',
              padding: '16px',
              borderRadius: '6px',
              border: '1px solid #e5e7eb',
              minHeight: '100px'
            }}>
              {mainPrompt ? (
                <pre style={{ whiteSpace: 'pre-wrap', fontSize: '14px', margin: 0 }}>{mainPrompt}</pre>
              ) : (
                <p style={{ color: '#6b7280', fontStyle: 'italic', margin: 0 }}>Your prompt will appear here as you type.</p>
              )}
            </div>
          </div>

          <div style={{ display: 'flex', gap: '12px', paddingTop: '16px', borderTop: '1px solid #e5e7eb' }}>
            <button
              onClick={() => navigator.clipboard.writeText(mainPrompt)}
              disabled={!mainPrompt.trim()}
              style={{
                backgroundColor: mainPrompt.trim() ? '#10b981' : '#d1d5db',
                color: 'white',
                padding: '8px 16px',
                borderRadius: '6px',
                border: 'none',
                cursor: mainPrompt.trim() ? 'pointer' : 'not-allowed',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}
            >
              <Copy size={16} />
              Copy to Clipboard
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;