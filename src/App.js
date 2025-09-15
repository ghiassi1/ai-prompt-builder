import React, { useState, useEffect } from 'react';
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
  Loader
} from 'lucide-react';

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
  const [apiError, setApiError] = useState(null);

  // Backend API configuration
  const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';

  const promptTemplates = {
    contextual: {
      name: 'Contextual Prompt',
      template: 'In the context of [DOMAIN], [MAIN_REQUEST]. Consider [CONTEXT_DETAILS].',
      example:
        'In the context of space exploration, explain the concept of black holes. Consider recent discoveries and their implications for future missions.'
    },
    'specific-question': {
      name: 'Specific Question',
      template: '[SPECIFIC_QUESTION] Please provide [DETAIL_LEVEL] explanation including [REQUIRED_ELEMENTS].',
      example:
        'What
