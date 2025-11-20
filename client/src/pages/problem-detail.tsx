import { useState } from 'react';
import { useParams, Link } from 'wouter';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { ReactFlowEditor } from '@/components/react-flow-editor';
import { ChevronLeft, Send, MessageSquare, Lightbulb } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import type { ProblemWithTags } from '@shared/schema';

const difficultyColors = {
  easy: 'text-green-600 bg-green-50 border-green-200 dark:text-green-400 dark:bg-green-950 dark:border-green-900',
  medium: 'text-yellow-600 bg-yellow-50 border-yellow-200 dark:text-yellow-400 dark:bg-yellow-950 dark:border-yellow-900',
  hard: 'text-red-600 bg-red-50 border-red-200 dark:text-red-400 dark:bg-red-950 dark:border-red-900',
};

export default function ProblemDetail() {
  const { slug } = useParams();
  const { toast } = useToast();
  const [showSubmitSheet, setShowSubmitSheet] = useState(false);
  const [explanation, setExplanation] = useState('');
  const [diagram, setDiagram] = useState<any>(null);

  const { data: problem, isLoading } = useQuery<ProblemWithTags>({
    queryKey: ['/api/problems', slug],
  });

  const submitMutation = useMutation({
    mutationFn: async (data: { diagramJson: any; explanation: string; problemId: string }) => {
      return await apiRequest('POST', '/api/submissions', data);
    },
    onSuccess: (data: any) => {
      toast({
        title: 'Submission successful!',
        description: `You scored ${data.score} points and earned ${data.xpAwarded} XP!`,
      });
      setShowSubmitSheet(false);
      setExplanation('');
      queryClient.invalidateQueries({ queryKey: ['/api/submissions'] });
    },
    onError: (error: any) => {
      toast({
        variant: 'destructive',
        title: 'Submission failed',
        description: error.message || 'Could not submit your solution',
      });
    },
  });

  const handleSubmit = () => {
    if (!diagram || !explanation.trim() || !problem) {
      toast({
        variant: 'destructive',
        title: 'Incomplete submission',
        description: 'Please create a diagram and provide an explanation',
      });
      return;
    }

    submitMutation.mutate({
      diagramJson: diagram,
      explanation,
      problemId: problem.id,
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Skeleton className="h-8 w-64 mb-4" />
          <Skeleton className="h-96 w-full" />
        </div>
      </div>
    );
  }

  if (!problem) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card>
          <CardContent className="py-12 text-center">
            <h2 className="text-2xl font-bold mb-2">Problem not found</h2>
            <p className="text-muted-foreground mb-4">
              The problem you're looking for doesn't exist
            </p>
            <Link href="/problems">
              <Button>Browse Problems</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Link href="/problems" data-testid="link-back">
          <Button variant="ghost" size="sm" className="mb-4 gap-2">
            <ChevronLeft className="h-4 w-4" />
            Back to Problems
          </Button>
        </Link>

        <div className="mb-6">
          <div className="flex items-start justify-between gap-4 mb-4">
            <div>
              <h1 className="text-3xl font-bold mb-2">{problem.title}</h1>
              <div className="flex flex-wrap items-center gap-2">
                <Badge
                  variant="outline"
                  className={difficultyColors[problem.difficulty as keyof typeof difficultyColors]}
                >
                  {problem.difficulty}
                </Badge>
                {problem.tags?.map((tag) => (
                  <Badge key={tag.id} variant="secondary">
                    {tag.name}
                  </Badge>
                ))}
              </div>
            </div>
            <Button onClick={() => setShowSubmitSheet(true)} data-testid="button-submit">
              <Send className="h-4 w-4 mr-2" />
              Submit Solution
            </Button>
          </div>
        </div>

        <Tabs defaultValue="description" className="space-y-6">
          <TabsList>
            <TabsTrigger value="description">Description</TabsTrigger>
            <TabsTrigger value="editor">Editor</TabsTrigger>
            <TabsTrigger value="hints">
              <Lightbulb className="h-4 w-4 mr-2" />
              Hints
            </TabsTrigger>
            <TabsTrigger value="discussions">
              <MessageSquare className="h-4 w-4 mr-2" />
              Discussions
            </TabsTrigger>
          </TabsList>

          <TabsContent value="description">
            <Card>
              <CardContent className="pt-6 prose dark:prose-invert max-w-none">
                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                  {problem.descriptionMdx}
                </ReactMarkdown>

                {problem.constraints && (
                  <div className="mt-6 p-4 bg-muted rounded-lg">
                    <h3 className="text-lg font-semibold mb-2">Constraints</h3>
                    <p className="text-sm text-muted-foreground">{problem.constraints}</p>
                  </div>
                )}

                {problem.requiredComponents && problem.requiredComponents.length > 0 && (
                  <div className="mt-6 p-4 bg-muted rounded-lg">
                    <h3 className="text-lg font-semibold mb-2">Required Components</h3>
                    <div className="flex flex-wrap gap-2">
                      {problem.requiredComponents.map((component, index) => (
                        <Badge key={index} variant="secondary">
                          {component}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="editor">
            <div className="h-[600px]">
              <ReactFlowEditor
                onSave={(diagram) => {
                  setDiagram(diagram);
                  toast({ title: 'Diagram saved!' });
                }}
                initialDiagram={problem.exampleDiagram}
              />
            </div>
          </TabsContent>

          <TabsContent value="hints">
            <Card>
              <CardContent className="pt-6 space-y-4">
                {problem.hints && problem.hints.length > 0 ? (
                  problem.hints.map((hint, index) => (
                    <div key={index} className="p-4 bg-muted rounded-lg">
                      <h4 className="font-medium mb-2">Hint {index + 1}</h4>
                      <p className="text-sm text-muted-foreground">{hint}</p>
                    </div>
                  ))
                ) : (
                  <p className="text-muted-foreground">No hints available for this problem</p>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="discussions">
            <Card>
              <CardContent className="pt-6">
                <p className="text-muted-foreground text-center py-8">
                  Discussions coming soon
                </p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      <Sheet open={showSubmitSheet} onOpenChange={setShowSubmitSheet}>
        <SheetContent className="w-full sm:max-w-[600px] overflow-y-auto">
          <SheetHeader>
            <SheetTitle>Submit Your Solution</SheetTitle>
            <SheetDescription>
              Provide an explanation for your system design diagram
            </SheetDescription>
          </SheetHeader>

          <div className="mt-6 space-y-4">
            <div>
              <Label>Your Diagram</Label>
              <div className="mt-2 p-4 bg-muted rounded-lg">
                <p className="text-sm text-muted-foreground">
                  {diagram ? `${diagram.nodes?.length || 0} components, ${diagram.edges?.length || 0} connections` : 'No diagram created yet'}
                </p>
              </div>
            </div>

            <div>
              <Label htmlFor="explanation">Explanation</Label>
              <Textarea
                id="explanation"
                placeholder="Explain your design choices, architecture decisions, and how your solution addresses the problem requirements..."
                value={explanation}
                onChange={(e) => setExplanation(e.target.value)}
                className="mt-2 min-h-48"
                data-testid="textarea-explanation"
              />
            </div>

            <Separator />

            <Button
              onClick={handleSubmit}
              disabled={submitMutation.isPending || !diagram || !explanation.trim()}
              className="w-full"
              data-testid="button-submit-solution"
            >
              {submitMutation.isPending ? 'Submitting...' : 'Submit Solution'}
            </Button>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}
