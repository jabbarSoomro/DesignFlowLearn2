import { Link } from 'wouter';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Code2, Trophy, Award, Users, ArrowRight, CheckCircle2 } from 'lucide-react';
import { useAuthStore } from '@/lib/auth-store';

export default function Home() {
  const { user } = useAuthStore();

  const features = [
    {
      icon: Code2,
      title: 'Visual Diagrams',
      description: 'Build system design diagrams with drag-and-drop components',
    },
    {
      icon: Trophy,
      title: 'Earn XP & Badges',
      description: 'Level up and unlock achievements as you solve problems',
    },
    {
      icon: Users,
      title: 'Compete & Learn',
      description: 'Join the leaderboard and learn from the community',
    },
  ];

  const components = [
    'Load Balancer',
    'Database',
    'Cache',
    'CDN',
    'Message Queue',
    'API Gateway',
    'Blob Storage',
    'Microservice',
  ];

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
        <div className="text-center mb-16">
          <Badge variant="secondary" className="mb-4">
            Learn System Design Visually
          </Badge>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-6">
            Master System Design
            <span className="block text-primary mt-2">One Diagram at a Time</span>
          </h1>
          <p className="text-lg sm:text-xl text-muted-foreground max-w-3xl mx-auto mb-8">
            Practice system design through interactive visual diagrams. Build solutions with real components, 
            earn XP, unlock badges, and compete with fellow learners.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            {user ? (
              <Link href="/problems" data-testid="link-browse-problems">
                <Button size="lg" className="gap-2">
                  Browse Problems
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            ) : (
              <>
                <Link href="/register" data-testid="link-get-started">
                  <Button size="lg" className="gap-2">
                    Get Started Free
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
                <Link href="/login" data-testid="link-login">
                  <Button size="lg" variant="outline">
                    Login
                  </Button>
                </Link>
              </>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
          {features.map((feature, index) => (
            <Card key={index} className="hover-elevate">
              <CardHeader>
                <feature.icon className="h-10 w-10 text-primary mb-2" />
                <CardTitle>{feature.title}</CardTitle>
                <CardDescription>{feature.description}</CardDescription>
              </CardHeader>
            </Card>
          ))}
        </div>

        <div className="bg-card border border-card-border rounded-lg p-8 mb-16">
          <h2 className="text-2xl font-semibold mb-4 text-center">
            Build with Real Components
          </h2>
          <p className="text-center text-muted-foreground mb-6">
            Drag and drop from 8+ system design components to create your solutions
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            {components.map((component) => (
              <Badge key={component} variant="secondary" className="text-sm">
                {component}
              </Badge>
            ))}
          </div>
        </div>

        <Card className="bg-primary text-primary-foreground border-primary">
          <CardContent className="p-8">
            <div className="max-w-2xl mx-auto text-center">
              <Award className="h-12 w-12 mx-auto mb-4" />
              <h2 className="text-2xl font-bold mb-4">
                Start Your Journey Today
              </h2>
              <p className="mb-6 opacity-90">
                Join thousands of learners mastering system design through hands-on practice
              </p>
              {!user && (
                <Link href="/register" data-testid="link-signup-cta">
                  <Button size="lg" variant="secondary">
                    Create Free Account
                  </Button>
                </Link>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
