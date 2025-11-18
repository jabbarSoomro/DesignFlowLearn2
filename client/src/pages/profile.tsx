import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import { Separator } from '@/components/ui/separator';
import { Trophy, Award, CheckCircle2, TrendingUp, Calendar } from 'lucide-react';
import { useAuthStore } from '@/lib/auth-store';
import type { UserWithBadges, Submission } from '@shared/schema';

export default function Profile() {
  const { user: currentUser } = useAuthStore();

  const { data: userDetails, isLoading: userLoading } = useQuery<UserWithBadges>({
    queryKey: ['/api/users', currentUser?.id],
    enabled: !!currentUser,
  });

  const { data: submissions, isLoading: submissionsLoading } = useQuery<Submission[]>({
    queryKey: ['/api/submissions'],
  });

  const { data: badges } = useQuery<any[]>({
    queryKey: ['/api/badges'],
  });

  const stats = [
    {
      label: 'Total XP',
      value: userDetails?.xp || 0,
      icon: Trophy,
      color: 'text-yellow-600',
    },
    {
      label: 'Problems Solved',
      value: submissions?.length || 0,
      icon: CheckCircle2,
      color: 'text-green-600',
    },
    {
      label: 'Badges Earned',
      value: userDetails?.badges?.length || 0,
      icon: Award,
      color: 'text-purple-600',
    },
    {
      label: 'Avg Score',
      value: submissions?.length
        ? Math.round(submissions.reduce((acc, s) => acc + s.score, 0) / submissions.length)
        : 0,
      icon: TrendingUp,
      color: 'text-blue-600',
    },
  ];

  const nextBadge = badges?.find(
    (badge) => !userDetails?.badges?.some((ub) => ub.id === badge.id) && badge.xpRequired
  );

  const progressToNextBadge = nextBadge
    ? Math.min(((userDetails?.xp || 0) / nextBadge.xpRequired) * 100, 100)
    : 100;

  if (userLoading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Skeleton className="h-64 w-full mb-6" />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <Skeleton key={i} className="h-32" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Card className="mb-8">
          <CardContent className="pt-6">
            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
              <Avatar className="h-24 w-24">
                <AvatarFallback className="text-3xl bg-primary text-primary-foreground">
                  {currentUser?.name.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>

              <div className="flex-1 text-center sm:text-left">
                <h1 className="text-3xl font-bold mb-2">{currentUser?.name}</h1>
                <p className="text-muted-foreground mb-4">{currentUser?.email}</p>
                <div className="flex flex-wrap justify-center sm:justify-start gap-2">
                  <Badge variant="secondary" className="capitalize">
                    {currentUser?.role}
                  </Badge>
                  <Badge variant="outline" className="gap-1">
                    <Trophy className="h-3 w-3" />
                    {currentUser?.xp} XP
                  </Badge>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {stats.map((stat, index) => (
            <Card key={index}>
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <stat.icon className={`h-5 w-5 ${stat.color}`} />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold mb-1">{stat.value}</div>
                <p className="text-sm text-muted-foreground">{stat.label}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Badges</CardTitle>
              <CardDescription>
                {userDetails?.badges?.length || 0} of {badges?.length || 0} badges earned
              </CardDescription>
            </CardHeader>
            <CardContent>
              {userDetails?.badges && userDetails.badges.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {userDetails.badges.map((badge) => (
                    <div
                      key={badge.id}
                      className="flex items-start gap-3 p-3 rounded-lg border bg-card"
                    >
                      <div className="text-2xl">{badge.icon}</div>
                      <div>
                        <div className="font-medium">{badge.name}</div>
                        <div className="text-sm text-muted-foreground">
                          {badge.description}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Award className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                  <p className="text-muted-foreground">No badges earned yet</p>
                </div>
              )}

              {nextBadge && (
                <>
                  <Separator className="my-6" />
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium">Next Badge: {nextBadge.name}</span>
                      <span className="text-sm text-muted-foreground">
                        {userDetails?.xp}/{nextBadge.xpRequired} XP
                      </span>
                    </div>
                    <Progress value={progressToNextBadge} />
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Recent Submissions</CardTitle>
              <CardDescription>Your latest problem solutions</CardDescription>
            </CardHeader>
            <CardContent>
              {submissions && submissions.length > 0 ? (
                <div className="space-y-3">
                  {submissions.slice(0, 5).map((submission) => (
                    <div
                      key={submission.id}
                      className="flex items-center justify-between p-3 rounded-lg border bg-card"
                    >
                      <div className="flex-1">
                        <div className="font-medium text-sm mb-1">
                          Problem #{submission.problemId.slice(0, 8)}
                        </div>
                        <div className="text-xs text-muted-foreground flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {new Date(submission.createdAt).toLocaleDateString()}
                        </div>
                      </div>
                      <Badge variant={submission.score >= 80 ? 'default' : 'secondary'}>
                        {submission.score} pts
                      </Badge>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <CheckCircle2 className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                  <p className="text-muted-foreground">No submissions yet</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
