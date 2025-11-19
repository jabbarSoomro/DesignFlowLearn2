import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import type { Problem } from '@shared/schema';

export default function AdminProblems() {
  const { toast } = useToast();
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingProblem, setEditingProblem] = useState<Problem | null>(null);

  const { data: problems, isLoading } = useQuery<Problem[]>({
    queryKey: ['/api/admin/problems'],
  });

  const createMutation = useMutation({
    mutationFn: async (data: any) => {
      return await apiRequest('POST', '/api/admin/problems', data);
    },
    onSuccess: () => {
      toast({ title: 'Problem created successfully' });
      setIsCreateOpen(false);
      queryClient.invalidateQueries({ queryKey: ['/api/admin/problems'] });
      queryClient.invalidateQueries({ queryKey: ['/api/problems'] });
    },
    onError: (error: any) => {
      toast({
        variant: 'destructive',
        title: 'Failed to create problem',
        description: error.message,
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      return await apiRequest('DELETE', `/api/admin/problems/${id}`, {});
    },
    onSuccess: () => {
      toast({ title: 'Problem deleted successfully' });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/problems'] });
      queryClient.invalidateQueries({ queryKey: ['/api/problems'] });
    },
    onError: (error: any) => {
      toast({
        variant: 'destructive',
        title: 'Failed to delete problem',
        description: error.message,
      });
    },
  });

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this problem?')) {
      deleteMutation.mutate(id);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Manage Problems</h1>
          <p className="text-muted-foreground">Create and manage system design problems</p>
        </div>
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button data-testid="button-create-problem">
              <Plus className="h-4 w-4 mr-2" />
              Create Problem
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Create New Problem</DialogTitle>
              <DialogDescription>
                Add a new system design problem for learners
              </DialogDescription>
            </DialogHeader>
            <ProblemForm
              onSubmit={(data) => createMutation.mutate(data)}
              isLoading={createMutation.isPending}
            />
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Problems</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <p className="text-muted-foreground">Loading...</p>
          ) : problems && problems.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Title</TableHead>
                  <TableHead>Difficulty</TableHead>
                  <TableHead>Slug</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {problems.map((problem) => (
                  <TableRow key={problem.id}>
                    <TableCell className="font-medium">{problem.title}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className="capitalize">
                        {problem.difficulty}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-muted-foreground font-mono text-sm">
                      {problem.slug}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setEditingProblem(problem)}
                          data-testid={`button-edit-${problem.slug}`}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDelete(problem.id)}
                          data-testid={`button-delete-${problem.slug}`}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <p className="text-muted-foreground text-center py-8">
              No problems yet. Create your first one!
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function ProblemForm({ onSubmit, isLoading }: { onSubmit: (data: any) => void; isLoading: boolean }) {
  const { data: tags } = useQuery<any[]>({
    queryKey: ['/api/tags'],
  });

  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    difficulty: 'medium',
    descriptionMdx: '',
    constraints: '',
    requiredComponents: '',
    hints: [''],
    tags: [] as string[],
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      ...formData,
      requiredComponents: formData.requiredComponents.split(',').map((c) => c.trim()).filter(Boolean),
      hints: formData.hints.filter(h => h.trim()),
    });
  };

  const addHint = () => {
    setFormData({ ...formData, hints: [...formData.hints, ''] });
  };

  const updateHint = (index: number, value: string) => {
    const newHints = [...formData.hints];
    newHints[index] = value;
    setFormData({ ...formData, hints: newHints });
  };

  const removeHint = (index: number) => {
    const newHints = formData.hints.filter((_, i) => i !== index);
    setFormData({ ...formData, hints: newHints });
  };

  const toggleTag = (tagId: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.includes(tagId)
        ? prev.tags.filter(t => t !== tagId)
        : [...prev.tags, tagId]
    }));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="title">Title</Label>
        <Input
          id="title"
          value={formData.title}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          required
          data-testid="input-title"
        />
      </div>

      <div>
        <Label htmlFor="slug">Slug</Label>
        <Input
          id="slug"
          value={formData.slug}
          onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
          placeholder="design-twitter"
          required
          data-testid="input-slug"
        />
      </div>

      <div>
        <Label htmlFor="difficulty">Difficulty</Label>
        <Select
          value={formData.difficulty}
          onValueChange={(value) => setFormData({ ...formData, difficulty: value })}
        >
          <SelectTrigger data-testid="select-difficulty">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="easy">Easy</SelectItem>
            <SelectItem value="medium">Medium</SelectItem>
            <SelectItem value="hard">Hard</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label htmlFor="description">Description (Markdown)</Label>
        <Textarea
          id="description"
          value={formData.descriptionMdx}
          onChange={(e) => setFormData({ ...formData, descriptionMdx: e.target.value })}
          className="min-h-32 font-mono text-sm"
          required
          data-testid="textarea-description"
        />
      </div>

      <div>
        <Label htmlFor="constraints">Constraints (optional)</Label>
        <Textarea
          id="constraints"
          value={formData.constraints}
          onChange={(e) => setFormData({ ...formData, constraints: e.target.value })}
          data-testid="textarea-constraints"
        />
      </div>

      <div>
        <Label>Hints</Label>
        <div className="space-y-2">
          {formData.hints.map((hint, index) => (
            <div key={index} className="flex gap-2">
              <Input
                value={hint}
                onChange={(e) => updateHint(index, e.target.value)}
                placeholder={`Hint ${index + 1}`}
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => removeHint(index)}
                disabled={formData.hints.length === 1}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ))}
          <Button type="button" variant="outline" size="sm" onClick={addHint}>
            <Plus className="h-4 w-4 mr-2" />
            Add Hint
          </Button>
        </div>
      </div>

      <div>
        <Label>Tags</Label>
        <div className="flex flex-wrap gap-2 mt-2">
          {tags?.map((tag) => (
            <Badge
              key={tag.id}
              variant={formData.tags.includes(tag.id) ? "default" : "outline"}
              className="cursor-pointer"
              onClick={() => toggleTag(tag.id)}
            >
              {tag.name}
            </Badge>
          ))}
        </div>
      </div>

      <div>
        <Label htmlFor="components">Required Components (comma-separated)</Label>
        <Input
          id="components"
          value={formData.requiredComponents}
          onChange={(e) => setFormData({ ...formData, requiredComponents: e.target.value })}
          placeholder="loadbalancer, cache, database"
          required
          data-testid="input-components"
        />
      </div>

      <Button type="submit" disabled={isLoading} className="w-full" data-testid="button-submit-problem">
        {isLoading ? 'Creating...' : 'Create Problem'}
      </Button>
    </form>
  );
}
