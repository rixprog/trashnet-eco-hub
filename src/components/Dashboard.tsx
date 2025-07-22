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

// Import React hooks for state and effects, and react-query
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';

// Assuming your backend URL
const API_BASE_URL = 'http://localhost:8000'; // Make sure this matches your FastAPI server

// Define the interface for the data received from the backend
interface UserCreditsResponse {
  user_id: string;
  credits: number;
  recycled_items: Array<{
    category: string;
    item_name: string;
    timestamp: string;
    bin_id: string;
    credits: number; // ADDED: Now includes the credits for this specific item
  }>;
}

// Function to fetch data from your FastAPI backend
const fetchUserCredits = async (userId: string): Promise<UserCreditsResponse> => {
  const response = await fetch(`${API_BASE_URL}/user-credits/${userId}`);
  if (!response.ok) {
    throw new Error('Failed to fetch user credits');
  }
  return response.json();
};

const Dashboard = () => {
  // Hardcode user ID for demo. In a real app, this would come from auth context.
  const userId = 'user1'; 

  // Use react-query to fetch and manage data
  const { data, isLoading, error } = useQuery<UserCreditsResponse>({
    queryKey: ['userCredits', userId],
    queryFn: () => fetchUserCredits(userId),
    refetchInterval: 5000, // Refetch every 5 seconds for real-time updates
  });

  // Handle loading and error states
  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <p>Loading dashboard data...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center min-h-screen text-red-500">
        <p>Error loading dashboard: {error.message}</p>
      </div>
    );
  }

  // Calculate real-time stats based on fetched data
  const ecoCreditsBalance = data?.credits || 0;
  const totalItemsRecycled = data?.recycled_items?.length || 0;
  // Example CO2 saved: 0.5 kg per item. Adjust as per your logic.
  const co2Saved = (totalItemsRecycled * 0.5).toFixed(2); 

  // Updated stats array to use real data
  const stats = [
    {
      title: "EcoCredits Balance",
      value: ecoCreditsBalance.toLocaleString(), // Format number with commas
      icon: Coins,
      description: "+247 this month", // This is still mock data, as backend doesn't provide this delta
      trend: "+12%", // This is still mock data
      color: "text-success"
    },
    {
      title: "Items Recycled",
      value: totalItemsRecycled.toLocaleString(), // Use real count
      icon: Recycle,
      description: "This month",
      trend: "+8%", // This is still mock data
      color: "text-primary"
    },
    {
      title: "CO₂ Saved",
      value: `${co2Saved} kg`, // Use real calculated value
      icon: Leaf,
      description: "Environmental impact",
      trend: "+15%", // This is still mock data
      color: "text-accent"
    },
    {
      title: "Achievement Rank",
      value: "#127", // This is still mock data
      icon: Award,
      description: "In your area",
      trend: "↑23", // This is still mock data
      color: "text-warning"
    }
  ]

  // Use the actual recycled items from the backend for recent activities
  // Slice to show only the last 4 items (or whatever quantity fits your UI)
  const recentActivities = data?.recycled_items
    ?.slice(-4) // Get last 4 items
    .reverse() // Show most recent first
    .map(item => ({
      type: item.item_name || item.category, // Use specific item name, fallback to category
      credits: item.credits, // CHANGED THIS: Use the actual credits from the item data
      time: new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }), // Format time
      location: `Bin #${item.bin_id}` // Use actual bin ID
    })) || [];


  const availableSchemes = [
    { name: "Bus Pass Discount", credits: 500, discount: "20% off", category: "Transport" },
    { name: "Grocery Voucher", credits: 800, discount: "₹100 off", category: "Shopping" },
    { name: "Movie Ticket", credits: 1200, discount: "Buy 1 Get 1", category: "Entertainment" },
    { name: "Plant a Tree", credits: 300, discount: "Certificate", category: "Environment" },
  ]

  // Monthly Goal
  const monthlyGoalTarget = 200; // Hardcoded goal
  const monthlyGoalProgress = Math.min(100, (totalItemsRecycled / monthlyGoalTarget) * 100);
  const itemsRemainingForGoal = Math.max(0, monthlyGoalTarget - totalItemsRecycled);

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
                {recentActivities.length > 0 ? (
                  recentActivities.map((activity, index) => (
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
                  ))
                ) : (
                  <p className="text-muted-foreground text-center py-4">No recent recycling activity yet.</p>
                )}
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
                    {/* Use real-time items recycled */}
                    <span>{totalItemsRecycled} / {monthlyGoalTarget} items</span>
                    <span>{monthlyGoalProgress.toFixed(0)}%</span>
                  </div>
                  <Progress value={monthlyGoalProgress} className="h-2" />
                </div>
                <p className="text-sm text-muted-foreground">
                  {itemsRemainingForGoal} more items to reach your monthly goal and earn a bonus!
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
                {/* These are still hardcoded as no backend data for them */}
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
                {/* Use ecoCreditsBalance for the disabled state check */}
                <Button size="sm" className="w-full" disabled={ecoCreditsBalance < scheme.credits}>
                  {ecoCreditsBalance >= scheme.credits ? 'Claim Now' : 'Need More Credits'}
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