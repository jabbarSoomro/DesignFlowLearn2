import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Trophy, Medal, Award, TrendingUp } from 'lucide-react';
import { useAuthStore } from '@/lib/auth-store';
import type { LeaderboardEntry } from '@shared/schema';

export default function Leaderboard() {
  const { user } = useAuthStore();

  const { data: leaderboard, isLoading } = useQuery<LeaderboardEntry[]>({
    queryKey: ['/api/leaderboard'],
  });

  const topThree = leaderboard?.slice(0, 3) || [];
  const remaining = leaderboard?.slice(3) || [];

  const getRankIcon = (rank: number) => {
    if (rank === 1) return <Medal className="h-5 w-5 text-yellow-500" />;
    if (rank === 2) return <Medal className="h-5 w-5 text-gray-400" />;
    if (rank === 3) return <Medal className="h-5 w-5 text-amber-600" />;
    return null;
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2 flex items-center gap-2">
            <Trophy className="h-8 w-8 text-primary" />
            Leaderboard
          </h1>
          <p className="text-muted-foreground">
            Top performers in system design mastery
          </p>
        </div>

        {isLoading ? (
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <Card key={i}>
                <CardContent className="p-6">
                  <div className="flex items-center gap-4">
                    <Skeleton className="h-12 w-12 rounded-full" />
                    <div className="flex-1">
                      <Skeleton className="h-5 w-48 mb-2" />
                      <Skeleton className="h-4 w-32" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="space-y-6">
            {topThree.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                {topThree.map((entry) => (
                  <Card
                    key={entry.user.id}
                    className={`
                      ${entry.user.id === user?.id ? 'ring-2 ring-primary' : ''}
                      ${entry.rank === 1 ? 'md:order-2' : entry.rank === 2 ? 'md:order-1' : 'md:order-3'}
                    `}
                  >
                    <CardHeader className="text-center pb-4">
                      <div className="flex justify-center mb-3">
                        {getRankIcon(entry.rank)}
                      </div>
                      <div className="flex justify-center mb-3">
                        <Avatar className="h-16 w-16">
                          <AvatarFallback className="text-xl bg-primary text-primary-foreground">
                            {entry.user.name.charAt(0).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                      </div>
                      <CardTitle className="text-lg">{entry.user.name}</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">XP</span>
                        <Badge variant="secondary" className="gap-1">
                          <TrendingUp className="h-3 w-3" />
                          {entry.user.xp}
                        </Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">Solved</span>
                        <Badge variant="secondary">{entry.solvedCount}</Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">Badges</span>
                        <Badge variant="secondary" className="gap-1">
                          <Award className="h-3 w-3" />
                          {entry.badges.length}
                        </Badge>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}

            <Card>
              <CardHeader>
                <CardTitle>Rankings</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {remaining.map((entry) => (
                    <div
                      key={entry.user.id}
                      className={`
                        flex items-center gap-4 p-4 rounded-lg
                        ${entry.user.id === user?.id ? 'bg-primary/10 border border-primary' : 'hover-elevate'}
                      `}
                      data-testid={`leaderboard-entry-${entry.rank}`}
                    >
                      <div className="w-8 text-center font-bold text-muted-foreground">
                        #{entry.rank}
                      </div>

                      <Avatar className="h-10 w-10">
                        <AvatarFallback className="bg-primary text-primary-foreground">
                          {entry.user.name.charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>

                      <div className="flex-1">
                        <div className="font-medium">{entry.user.name}</div>
                        <div className="text-sm text-muted-foreground">
                          {entry.solvedCount} problems solved
                        </div>
                      </div>

                      <div className="flex items-center gap-4">
                        <Badge variant="secondary" className="gap-1">
                          <Trophy className="h-3 w-3" />
                          {entry.user.xp} XP
                        </Badge>
                        {entry.badges.length > 0 && (
                          <Badge variant="outline" className="gap-1">
                            <Award className="h-3 w-3" />
                            {entry.badges.length}
                          </Badge>
                        )}
                      </div>
                    </div>
                  ))}

                  {remaining.length === 0 && topThree.length === 0 && (
                    <div className="text-center py-12">
                      <Trophy className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                      <h3 className="text-lg font-semibold mb-2">No rankings yet</h3>
                      <p className="text-muted-foreground">
                        Be the first to solve problems and climb the leaderboard!
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
