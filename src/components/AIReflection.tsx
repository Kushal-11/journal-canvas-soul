import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Sparkles, Brain, Heart, Lightbulb, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface AIReflectionProps {
  journalContent: string;
  journalTitle: string;
}

interface ReflectionResponse {
  positiveInsights: string[];
  reflectionQuestions: string[];
  encouragement: string;
  growthAreas: string[];
}

export function AIReflection({ journalContent, journalTitle }: AIReflectionProps) {
  const [apiKey, setApiKey] = useState(() => localStorage.getItem('openai_api_key') || '');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [reflection, setReflection] = useState<ReflectionResponse | null>(null);
  const [showApiKeyInput, setShowApiKeyInput] = useState(!apiKey);
  const { toast } = useToast();

  const saveApiKey = () => {
    if (!apiKey.trim()) {
      toast({
        title: "API Key Required",
        description: "Please enter your OpenAI API key to enable AI reflection.",
        variant: "destructive"
      });
      return;
    }
    localStorage.setItem('openai_api_key', apiKey);
    setShowApiKeyInput(false);
    toast({
      title: "API Key Saved",
      description: "Your API key has been saved securely in your browser."
    });
  };

  const analyzeJournal = async () => {
    if (!apiKey) {
      setShowApiKeyInput(true);
      return;
    }

    if (!journalContent.trim()) {
      toast({
        title: "No Content",
        description: "Please write some content in your journal before requesting AI reflection.",
        variant: "destructive"
      });
      return;
    }

    setIsAnalyzing(true);
    
    try {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'gpt-4.1-2025-04-14',
          messages: [
            {
              role: 'system',
              content: `You are a compassionate AI reflection companion for "The Bright Side" journaling app. Your role is to provide thoughtful, positive, and encouraging analysis of journal entries. Always maintain a warm, supportive tone while offering genuine insights.

Analyze the journal entry and respond with a JSON object containing:
{
  "positiveInsights": ["3-4 positive observations about the user's thoughts, emotions, or experiences"],
  "reflectionQuestions": ["3-4 thoughtful questions to help the user explore their thoughts deeper"],
  "encouragement": "A warm, personalized message of encouragement and validation",
  "growthAreas": ["2-3 gentle suggestions for personal growth or positive actions"]
}

Focus on:
- Celebrating progress and positive moments
- Identifying strengths and resilience
- Offering gentle, constructive insights
- Encouraging self-compassion
- Highlighting patterns of growth
- Suggesting actionable next steps for wellbeing`
            },
            {
              role: 'user',
              content: `Please analyze this journal entry titled "${journalTitle}":\n\n${journalContent}`
            }
          ],
          temperature: 0.7,
          max_tokens: 1000
        }),
      });

      if (!response.ok) {
        throw new Error(`API Error: ${response.status}`);
      }

      const data = await response.json();
      const content = data.choices[0].message.content;
      
      try {
        const parsedReflection = JSON.parse(content);
        setReflection(parsedReflection);
        
        toast({
          title: "Reflection Complete",
          description: "Your AI companion has analyzed your journal entry with care."
        });
      } catch (parseError) {
        throw new Error('Failed to parse AI response');
      }
      
    } catch (error) {
      console.error('AI Analysis Error:', error);
      toast({
        title: "Analysis Failed",
        description: "Unable to analyze your journal. Please check your API key and try again.",
        variant: "destructive"
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  if (showApiKeyInput) {
    return (
      <Card className="bg-gradient-warm border-border shadow-soft">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-journal-title">
            <Sparkles className="h-5 w-5 text-primary" />
            AI Reflection Setup
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-journal-text">
            Enable AI-powered reflection and insights for your journal entries. Your API key is stored securely in your browser.
          </p>
          <div className="space-y-2">
            <Label htmlFor="apiKey" className="text-journal-title">OpenAI API Key</Label>
            <Input
              id="apiKey"
              type="password"
              placeholder="sk-..."
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              className="bg-background border-border"
            />
            <p className="text-xs text-journal-placeholder">
              Get your API key from{' '}
              <a href="https://platform.openai.com/api-keys" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                OpenAI Platform
              </a>
            </p>
          </div>
          <div className="flex gap-2">
            <Button onClick={saveApiKey} className="bg-gradient-accent text-primary-foreground">
              Save & Enable AI Reflection
            </Button>
            <Button variant="outline" onClick={() => setShowApiKeyInput(false)}>
              Cancel
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-serif font-semibold text-journal-title flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-primary" />
          AI Reflection
        </h3>
        <div className="flex gap-2">
          <Button
            onClick={analyzeJournal}
            disabled={isAnalyzing}
            className="bg-gradient-accent text-primary-foreground hover:opacity-90"
            size="sm"
          >
            {isAnalyzing ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Analyzing...
              </>
            ) : (
              <>
                <Brain className="h-4 w-4 mr-2" />
                Reflect
              </>
            )}
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowApiKeyInput(true)}
            className="text-journal-placeholder"
          >
            Settings
          </Button>
        </div>
      </div>

      {reflection && (
        <div className="space-y-4">
          {/* Encouragement */}
          <Card className="bg-gradient-warm border-border shadow-soft">
            <CardContent className="pt-4">
              <div className="flex items-start gap-3">
                <Heart className="h-5 w-5 text-primary mt-1 flex-shrink-0" />
                <div>
                  <h4 className="font-medium text-journal-title mb-2">Personal Message</h4>
                  <p className="text-journal-text leading-relaxed">{reflection.encouragement}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Positive Insights */}
          <Card className="bg-journal-content border-border shadow-soft">
            <CardContent className="pt-4">
              <div className="flex items-start gap-3">
                <Lightbulb className="h-5 w-5 text-primary mt-1 flex-shrink-0" />
                <div className="flex-1">
                  <h4 className="font-medium text-journal-title mb-3">Positive Insights</h4>
                  <ul className="space-y-2">
                    {reflection.positiveInsights.map((insight, index) => (
                      <li key={index} className="text-journal-text leading-relaxed flex items-start gap-2">
                        <span className="text-primary mt-1 flex-shrink-0">•</span>
                        {insight}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Reflection Questions */}
          <Card className="bg-journal-content border-border shadow-soft">
            <CardContent className="pt-4">
              <div className="flex items-start gap-3">
                <Brain className="h-5 w-5 text-primary mt-1 flex-shrink-0" />
                <div className="flex-1">
                  <h4 className="font-medium text-journal-title mb-3">Questions for Reflection</h4>
                  <ul className="space-y-2">
                    {reflection.reflectionQuestions.map((question, index) => (
                      <li key={index} className="text-journal-text leading-relaxed flex items-start gap-2">
                        <span className="text-primary mt-1 flex-shrink-0">?</span>
                        {question}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Growth Areas */}
          <Card className="bg-journal-content border-border shadow-soft">
            <CardContent className="pt-4">
              <div className="flex items-start gap-3">
                <Sparkles className="h-5 w-5 text-primary mt-1 flex-shrink-0" />
                <div className="flex-1">
                  <h4 className="font-medium text-journal-title mb-3">Growth Opportunities</h4>
                  <ul className="space-y-2">
                    {reflection.growthAreas.map((area, index) => (
                      <li key={index} className="text-journal-text leading-relaxed flex items-start gap-2">
                        <span className="text-primary mt-1 flex-shrink-0">→</span>
                        {area}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}