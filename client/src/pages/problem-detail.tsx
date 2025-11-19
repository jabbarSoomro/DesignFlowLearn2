import { DiscussionSection } from '@/components/discussion-section';

// ... (imports)

export default function ProblemDetail() {
  // ... (hooks)

  const submitMutation = useMutation({
    mutationFn: async (data: { diagramJson: any; explanation: string; problemId: string }) => {
      return await apiRequest('POST', '/api/submissions', data);
    },
    onSuccess: (data: any) => {
      const missing = data.missingComponents || [];

      toast({
        title: data.score === 100 ? 'Perfect Score!' : 'Submission successful!',
        description: (
          <div className="space-y-2">
            <p>You scored {data.score} points and earned {data.xpAwarded} XP!</p>
            {missing.length > 0 && (
              <div className="text-sm bg-destructive/10 p-2 rounded text-destructive">
                <p className="font-semibold">Missing components:</p>
                <ul className="list-disc list-inside">
                  {missing.map((c: string) => (
                    <li key={c} className="capitalize">{c}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        ),
        duration: 5000,
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

  // ... (rest of the component)

  <TabsContent value="discussions">
    <DiscussionSection problemId={problem.id} />
  </TabsContent>
        </Tabs >
      </div >
// ... (rest of the file)
