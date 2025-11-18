import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'wouter';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import { Search, Filter, Code, CheckCircle2 } from 'lucide-react';
import type { ProblemWithTags } from '@shared/schema';

const difficultyColors = {
  easy: 'text-green-600 bg-green-50 border-green-200 dark:text-green-400 dark:bg-green-950 dark:border-green-900',
  medium: 'text-yellow-600 bg-yellow-50 border-yellow-200 dark:text-yellow-400 dark:bg-yellow-950 dark:border-yellow-900',
  hard: 'text-red-600 bg-red-50 border-red-200 dark:text-red-400 dark:bg-red-950 dark:border-red-900',
};

export default function Problems() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDifficulty, setSelectedDifficulty] = useState<string[]>([]);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);

  const { data: problems, isLoading } = useQuery<ProblemWithTags[]>({
    queryKey: ['/api/problems'],
  });

  const { data: tags } = useQuery<any[]>({
    queryKey: ['/api/tags'],
  });

  const filteredProblems = problems?.filter((problem) => {
    const matchesSearch = problem.title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDifficulty = selectedDifficulty.length === 0 || selectedDifficulty.includes(problem.difficulty);
    const matchesTags = selectedTags.length === 0 || problem.tags?.some(tag => selectedTags.includes(tag.id));
    return matchesSearch && matchesDifficulty && matchesTags;
  });

  const toggleDifficulty = (difficulty: string) => {
    setSelectedDifficulty(prev =>
      prev.includes(difficulty)
        ? prev.filter(d => d !== difficulty)
        : [...prev, difficulty]
    );
  };

  const toggleTag = (tagId: string) => {
    setSelectedTags(prev =>
      prev.includes(tagId)
        ? prev.filter(t => t !== tagId)
        : [...prev, tagId]
    );
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">System Design Problems</h1>
          <p className="text-muted-foreground">
            Practice your skills with {problems?.length || 0} curated problems
          </p>
        </div>

        <div className="flex flex-col lg:flex-row gap-6">
          <aside className="lg:w-64 shrink-0">
            <Card className="sticky top-20">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Filter className="h-4 w-4" />
                  Filters
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <Label className="text-sm font-medium mb-3 block">Difficulty</Label>
                  <div className="space-y-2">
                    {['easy', 'medium', 'hard'].map((difficulty) => (
                      <div key={difficulty} className="flex items-center gap-2">
                        <Checkbox
                          id={`difficulty-${difficulty}`}
                          checked={selectedDifficulty.includes(difficulty)}
                          onCheckedChange={() => toggleDifficulty(difficulty)}
                          data-testid={`checkbox-difficulty-${difficulty}`}
                        />
                        <Label
                          htmlFor={`difficulty-${difficulty}`}
                          className="text-sm capitalize cursor-pointer"
                        >
                          {difficulty}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>

                {tags && tags.length > 0 && (
                  <div>
                    <Label className="text-sm font-medium mb-3 block">Tags</Label>
                    <div className="space-y-2 max-h-64 overflow-y-auto">
                      {tags.map((tag) => (
                        <div key={tag.id} className="flex items-center gap-2">
                          <Checkbox
                            id={`tag-${tag.id}`}
                            checked={selectedTags.includes(tag.id)}
                            onCheckedChange={() => toggleTag(tag.id)}
                            data-testid={`checkbox-tag-${tag.name}`}
                          />
                          <Label
                            htmlFor={`tag-${tag.id}`}
                            className="text-sm cursor-pointer"
                          >
                            {tag.name}
                          </Label>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </aside>

          <div className="flex-1 space-y-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search problems..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
                data-testid="input-search"
              />
            </div>

            {isLoading ? (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {[...Array(6)].map((_, i) => (
                  <Card key={i}>
                    <CardHeader>
                      <Skeleton className="h-6 w-3/4 mb-2" />
                      <Skeleton className="h-4 w-full" />
                    </CardHeader>
                    <CardContent>
                      <Skeleton className="h-4 w-1/2" />
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : filteredProblems && filteredProblems.length > 0 ? (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {filteredProblems.map((problem) => (
                  <Link key={problem.id} href={`/problems/${problem.slug}`} data-testid={`link-problem-${problem.slug}`}>
                    <Card className="h-full hover-elevate active-elevate-2 transition-all">
                      <CardHeader>
                        <div className="flex items-start justify-between gap-2 mb-2">
                          <CardTitle className="text-lg">{problem.title}</CardTitle>
                          <Badge 
                            variant="outline" 
                            className={difficultyColors[problem.difficulty as keyof typeof difficultyColors]}
                          >
                            {problem.difficulty}
                          </Badge>
                        </div>
                        <CardDescription className="line-clamp-2">
                          {problem.descriptionMdx.split('\n')[0]}
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="flex flex-wrap gap-2">
                          {problem.tags?.slice(0, 3).map((tag) => (
                            <Badge key={tag.id} variant="secondary" className="text-xs">
                              {tag.name}
                            </Badge>
                          ))}
                          {problem.tags && problem.tags.length > 3 && (
                            <Badge variant="secondary" className="text-xs">
                              +{problem.tags.length - 3} more
                            </Badge>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>
            ) : (
              <Card>
                <CardContent className="py-12 text-center">
                  <Code className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                  <h3 className="text-lg font-semibold mb-2">No problems found</h3>
                  <p className="text-muted-foreground">
                    Try adjusting your filters or search term
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
