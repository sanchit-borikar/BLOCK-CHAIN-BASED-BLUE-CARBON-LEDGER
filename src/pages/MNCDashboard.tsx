import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Navigation } from "@/components/ui/navigation";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';
import { 
  Building, 
  TrendingUp, 
  ShoppingCart, 
  FileText, 
  MapPin, 
  Target,
  BarChart3,
  Waves,
  DollarSign
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

const mockPurchaseData = [
  { month: "Jan", credits: 80 },
  { month: "Feb", credits: 120 },
  { month: "Mar", credits: 150 },
  { month: "Apr", credits: 200 },
  { month: "May", credits: 180 },
  { month: "Jun", credits: 220 }
];

const mockOffsetData = [
  { name: "Manufacturing", value: 40, color: "#3b82f6" },
  { name: "Transportation", value: 30, color: "#10b981" },
  { name: "Operations", value: 20, color: "#f59e0b" },
  { name: "Other", value: 10, color: "#ef4444" }
];

const MNCDashboard = () => {
  const { profile, signOut } = useAuth();
  const [recentPurchases] = useState([
    { id: 1, project: "Mangrove Restoration Project", credits: 100, price: 60, seller: "Green Earth Foundation", date: "2024-01-15" },
    { id: 2, project: "Coastal Conservation", credits: 75, price: 55, seller: "Ocean Blue NGO", date: "2024-01-10" },
    { id: 3, project: "Blue Carbon Initiative", credits: 150, price: 62, seller: "Marine Conservation Society", date: "2024-01-05" }
  ]);

  return (
    <div className="min-h-screen bg-background">
      <Navigation userRole="mnc" onSignOut={signOut} />
      
      <main className="container mx-auto px-4 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500/20 to-purple-500/20 flex items-center justify-center">
              <Building className="w-6 h-6 text-primary" />
            </div>
            <br />
            <br />
            <br />
            <br />
            <br />
            <br />
            <br />
            <div>
              <h1 className="text-3xl font-bold text-foreground">
                Welcome back, {profile?.full_name || 'Corporate Partner'}
              </h1>
              <p className="text-muted-foreground">
                {profile?.organization_name} • MNC Dashboard
              </p>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="glass-card border-border/50">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total Credits Purchased</p>
                  <p className="text-2xl font-bold text-foreground">2,350</p>
                  <p className="text-xs text-green-500 flex items-center mt-1">
                    <TrendingUp className="w-3 h-3 mr-1" />
                    +18% from last month
                  </p>
                </div>
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                  <ShoppingCart className="w-6 h-6 text-primary" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="glass-card border-border/50">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Carbon Offset (tCO2)</p>
                  <p className="text-2xl font-bold text-foreground">1,880</p>
                  <p className="text-xs text-green-500 flex items-center mt-1">
                    <Target className="w-3 h-3 mr-1" />
                    76% of annual goal
                  </p>
                </div>
                <div className="w-12 h-12 bg-green-500/10 rounded-lg flex items-center justify-center">
                  <Target className="w-6 h-6 text-green-500" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="glass-card border-border/50">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Investment (₹)</p>
                  <p className="text-2xl font-bold text-foreground">₹14,10,000</p>
                  <p className="text-xs text-blue-500 flex items-center mt-1">
                    <DollarSign className="w-3 h-3 mr-1" />
                    Average ₹600/credit
                  </p>
                </div>
                <div className="w-12 h-12 bg-blue-500/10 rounded-lg flex items-center justify-center">
                  <DollarSign className="w-6 h-6 text-blue-500" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="glass-card border-border/50">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Sustainability Score</p>
                  <p className="text-2xl font-bold text-foreground">8.7/10</p>
                  <p className="text-xs text-teal-500 flex items-center mt-1">
                    <Waves className="w-3 h-3 mr-1" />
                    Industry leading
                  </p>
                </div>
                <div className="w-12 h-12 bg-teal-500/10 rounded-lg flex items-center justify-center">
                  <BarChart3 className="w-6 h-6 text-teal-500" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <Card className="glass-card border-border/50">
            <CardHeader>
              <CardTitle className="text-foreground">Monthly Credit Purchases</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={mockPurchaseData}>
                  <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                  <XAxis dataKey="month" className="text-muted-foreground" />
                  <YAxis className="text-muted-foreground" />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'hsl(var(--card))', 
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px'
                    }} 
                  />
                  <Bar dataKey="credits" fill="hsl(var(--primary))" className="opacity-80" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card className="glass-card border-border/50">
            <CardHeader>
              <CardTitle className="text-foreground">Carbon Offset Distribution</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={mockOffsetData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {mockOffsetData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Recent Purchases */}
        <Card className="glass-card border-border/50 mb-8">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-foreground">Recent Purchases</CardTitle>
              <Button asChild className="bg-primary text-primary-foreground hover:bg-primary/90">
                <Link to="/marketplace">
                  <ShoppingCart className="w-4 h-4 mr-2" />
                  Browse Marketplace
                </Link>
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentPurchases.map((purchase) => (
                <div key={purchase.id} className="flex items-center justify-between p-4 border border-border/50 rounded-lg hover:bg-accent/50 transition-colors">
                  <div className="flex items-center space-x-4">
                    <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                      <Waves className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-foreground">{purchase.project}</h3>
                      <p className="text-sm text-muted-foreground">
                        From {purchase.seller}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <div className="text-right">
                      <p className="font-semibold text-foreground">{purchase.credits} Credits</p>
                      <p className="text-sm text-muted-foreground">₹{purchase.price}/credit</p>
                    </div>
                    <Badge variant="secondary">
                      Completed
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card className="glass-card border-border/50 hover:bg-accent/20 transition-colors cursor-pointer"
                onClick={() => window.location.href = '/marketplace'}>
            <CardContent className="p-6 text-center">
              <ShoppingCart className="w-12 h-12 text-primary mx-auto mb-4" />
              <h3 className="font-semibold text-foreground mb-2">Buy Credits</h3>
              <p className="text-sm text-muted-foreground">Purchase verified carbon credits</p>
            </CardContent>
          </Card>

          <Card className="glass-card border-border/50 hover:bg-accent/20 transition-colors cursor-pointer"
                onClick={() => window.location.href = '/marketplace'}>
            <CardContent className="p-6 text-center">
              <BarChart3 className="w-12 h-12 text-primary mx-auto mb-4" />
              <h3 className="font-semibold text-foreground mb-2">Sell Credits</h3>
              <p className="text-sm text-muted-foreground">List your excess credits for sale</p>
            </CardContent>
          </Card>

          <Card className="glass-card border-border/50 hover:bg-accent/20 transition-colors cursor-pointer"
                onClick={() => window.location.href = '/transactions'}>
            <CardContent className="p-6 text-center">
              <FileText className="w-12 h-12 text-primary mx-auto mb-4" />
              <h3 className="font-semibold text-foreground mb-2">View Reports</h3>
              <p className="text-sm text-muted-foreground">Access transaction history and reports</p>
            </CardContent>
          </Card>

          <Card className="glass-card border-border/50 hover:bg-accent/20 transition-colors cursor-pointer"
                onClick={() => window.location.href = '/profile'}>
            <CardContent className="p-6 text-center">
              <Target className="w-12 h-12 text-primary mx-auto mb-4" />
              <h3 className="font-semibold text-foreground mb-2">Set Goals</h3>
              <p className="text-sm text-muted-foreground">Configure sustainability targets</p>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default MNCDashboard;