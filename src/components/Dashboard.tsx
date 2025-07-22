import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { 
  Coins, 
  TrendingUp, 
  Recycle, 
  Award,
  Calendar,
  BarChart3,
  Leaf,
  Target
} from 'lucide-react'

const Dashboard = () => {
  const stats = [
    {
      title: "EcoCredits Balance",
      value: "2,847",
      icon: Coins,
      description: "+247 this month",
      trend: "+12%",
      color: "text-success"
    },
    {
      title: "Items Recycled",
      value: "156",
      icon: Recycle,
      description: "This month",
      trend: "+8%",
      color: "text-primary"
    },
    {
      title: "CO₂ Saved",
      value: "48.2 kg",
      icon: Leaf,
      description: "Environmental impact",
      trend: "+15%",
      color: "text-accent"
    },
    {
      title: "Achievement Rank",
      value: "#127",
      icon: Award,
      description: "In your area",
      trend: "↑23",
      color: "text-warning"
    }
  ]

  const recentActivities = [
    { type: "Plastic Bottle", credits: 15, time: "2 hours ago", location: "Bin #A01" },
    { type: "Aluminum Can", credits: 20, time: "5 hours ago", location: "Bin #B03" },
    { type: "Paper", credits: 10, time: "1 day ago", location: "Bin #A01" },
    { type: "Glass Bottle", credits: 25, time: "2 days ago", location: "Bin #C05" },
  ]

  const availableSchemes = [
    { name: "Bus Pass Discount", credits: 500, discount: "20% off", category: "Transport" },
    { name: "Grocery Voucher", credits: 800, discount: "₹100 off", category: "Shopping" },
    { name: "Movie Ticket", credits: 1200, discount: "Buy 1 Get 1", category: "Entertainment" },
    { name: "Plant a Tree", credits: 300, discount: "Certificate", category: "Environment" },
  ]

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Welcome Section */}
      <div className="bg-gradient-hero rounded-2xl p-8 text-primary-foreground shadow-eco">
        <h1 className="text-3xl font-bold mb-2">Welcome back to TrashNet! 🌱</h1>
        <p className="text-primary-foreground/90 text-lg">
          You're making a real difference for our environment. Keep up the great work!
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => (
          <Card key={stat.title} className="bg-gradient-card border-0 shadow-card hover:shadow-eco transition-smooth">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">{stat.title}</p>
                  <h3 className="text-2xl font-bold">{stat.value}</h3>
                  <p className="text-xs text-muted-foreground mt-1">{stat.description}</p>
                </div>
                <div className="flex flex-col items-end">
                  <div className={`p-2 rounded-lg bg-gradient-primary`}>
                    <stat.icon className="h-5 w-5 text-primary-foreground" />
                  </div>
                  <Badge variant="secondary" className="mt-2 text-xs">
                    {stat.trend}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Activity */}
        <div className="lg:col-span-2">
          <Card className="shadow-card">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <BarChart3 className="h-5 w-5 text-primary" />
                <span>Recent Activity</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentActivities.map((activity, index) => (
                  <div key={index} className="flex items-center justify-between p-4 bg-secondary/30 rounded-lg">
                    <div className="flex items-center space-x-4">
                      <div className="w-2 h-2 bg-primary rounded-full"></div>
                      <div>
                        <p className="font-medium">{activity.type}</p>
                        <p className="text-sm text-muted-foreground">{activity.location}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-success">+{activity.credits} credits</p>
                      <p className="text-xs text-muted-foreground">{activity.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Progress & Goals */}
        <div className="space-y-6">
          <Card className="shadow-card">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Target className="h-5 w-5 text-primary" />
                <span>Monthly Goal</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span>156 / 200 items</span>
                    <span>78%</span>
                  </div>
                  <Progress value={78} className="h-2" />
                </div>
                <p className="text-sm text-muted-foreground">
                  44 more items to reach your monthly goal and earn a bonus!
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-card">
            <CardHeader>
              <CardTitle>Environmental Impact</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm">Trees Saved</span>
                  <span className="font-semibold">12.3</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Water Conserved</span>
                  <span className="font-semibold">234L</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Energy Saved</span>
                  <span className="font-semibold">89 kWh</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Available Schemes */}
      <Card className="shadow-card">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Award className="h-5 w-5 text-primary" />
            <span>Available Reward Schemes</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {availableSchemes.map((scheme, index) => (
              <div key={index} className="p-4 border rounded-lg hover:shadow-card transition-smooth bg-gradient-card">
                <div className="flex justify-between items-start mb-3">
                  <Badge variant="secondary">{scheme.category}</Badge>
                  <span className="text-sm font-semibold text-primary">{scheme.credits} credits</span>
                </div>
                <h4 className="font-semibold mb-2">{scheme.name}</h4>
                <p className="text-sm text-success mb-3">{scheme.discount}</p>
                <Button size="sm" className="w-full" disabled={2847 < scheme.credits}>
                  {2847 >= scheme.credits ? 'Claim Now' : 'Need More Credits'}
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default Dashboard