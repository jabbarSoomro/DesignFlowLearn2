import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Users, Code, Send, Award } from 'lucide-react';
import AdminProblems from './problems';

export default function AdminDashboard() {
  const { data: analytics } = useQuery<any>({
    queryKey: ['/api/admin/analytics'],
  });

  const stats = [
    {
      label: 'Total Users',
      value: analytics?.totalUsers || 0,
      icon: Users,
      color: 'text-blue-600',
    },
    {
      label: 'Total Problems',
      value: analytics?.totalProblems || 0,
      icon: Code,
      color: 'text-green-600',
    },
    {
      label: 'Total Submissions',
      value: analytics?.totalSubmissions || 0,
      icon: Send,
      color: 'text-purple-600',
    },
    {
      label: 'Badges Awarded',
      value: analytics?.totalBadgesAwarded || 0,
      icon: Award,
      color: 'text-yellow-600',
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Admin Dashboard</h1>
          <p className="text-muted-foreground">Manage your platform</p>
        </div>

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

        <Tabs defaultValue="problems" className="space-y-6">
          <TabsList>
            <TabsTrigger value="problems">Problems</TabsTrigger>
            <TabsTrigger value="users">Users</TabsTrigger>
            <TabsTrigger value="badges">Badges</TabsTrigger>
          </TabsList>

          <TabsContent value="problems">
            <AdminProblems />
          </TabsContent>

          <TabsContent value="users">
            <Card>
              <CardHeader>
                <CardTitle>User Management</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">User management coming soon</p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="badges">
            <Card>
              <CardHeader>
                <CardTitle>Badge Management</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">Badge management coming soon</p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
