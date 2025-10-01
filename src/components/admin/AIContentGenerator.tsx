import React, { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Sparkles, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';

interface AIContentGeneratorProps {
  type: 'title' | 'description' | 'content' | 'image_prompt';
  onGenerated: (content: string) => void;
  currentValue?: string;
  agentSiteId?: string;
}

export function AIContentGenerator({ type, onGenerated, currentValue, agentSiteId }: AIContentGeneratorProps) {
  const [open, setOpen] = useState(false);
  const [prompt, setPrompt] = useState('');
  const [generating, setGenerating] = useState(false);
  const [generated, setGenerated] = useState<string[]>([]);
  const { toast } = useToast();

  const labels = {
    title: 'Generate Titles',
    description: 'Generate Description',
    content: 'Generate Content',
    image_prompt: 'Generate Image Prompt'
  };

  const placeholders = {
    title: 'E.g., "voter registration guide for young adults"',
    description: 'Enter the content title or topic',
    content: 'E.g., "how blockchain can improve civic engagement"',
    image_prompt: 'E.g., "community members voting together"'
  };

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      toast({
        title: 'Error',
        description: 'Please enter a prompt',
        variant: 'destructive'
      });
      return;
    }

    setGenerating(true);
    try {
      const { data, error } = await supabase.functions.invoke('generate-content', {
        body: { 
          type, 
          prompt: prompt.trim(),
          agentSiteId 
        }
      });

      if (error) throw error;

      if (type === 'title' && data.titles) {
        setGenerated(data.titles);
      } else if (data.description) {
        setGenerated([data.description]);
      } else if (data.content) {
        setGenerated([data.content]);
      } else if (data.prompt) {
        setGenerated([data.prompt]);
      } else if (data.text) {
        setGenerated([data.text]);
      }

      toast({
        title: 'Success',
        description: 'Content generated successfully!'
      });
    } catch (error) {
      console.error('Generation error:', error);
      toast({
        title: 'Error',
        description: 'Failed to generate content. Please try again.',
        variant: 'destructive'
      });
    } finally {
      setGenerating(false);
    }
  };

  const handleSelect = (content: string) => {
    onGenerated(content);
    setOpen(false);
    setPrompt('');
    setGenerated([]);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <Sparkles className="h-4 w-4" />
          Generate with AI
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>{labels[type]}</DialogTitle>
          <DialogDescription>
            Use AI to generate {type === 'title' ? 'creative titles' : type === 'description' ? 'compelling descriptions' : type === 'content' ? 'engaging content' : 'image prompts'} aligned with MetaKnyt's mission
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="prompt">What should the content be about?</Label>
            <Textarea
              id="prompt"
              placeholder={placeholders[type]}
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              rows={3}
            />
          </div>

          {currentValue && (
            <div className="space-y-2">
              <Label>Current Value</Label>
              <div className="p-3 bg-muted rounded-md text-sm">
                {currentValue}
              </div>
            </div>
          )}

          <Button 
            onClick={handleGenerate} 
            disabled={generating || !prompt.trim()}
            className="w-full gap-2"
          >
            {generating ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4" />
                Generate
              </>
            )}
          </Button>

          {generated.length > 0 && (
            <div className="space-y-3">
              <Label>Generated Options</Label>
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {generated.map((item, index) => (
                  <div
                    key={index}
                    className="p-3 bg-muted hover:bg-muted/80 rounded-md cursor-pointer transition-colors border border-transparent hover:border-primary"
                    onClick={() => handleSelect(item)}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <p className="text-sm flex-1">{item}</p>
                      <Badge variant="outline" className="shrink-0">Use</Badge>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}