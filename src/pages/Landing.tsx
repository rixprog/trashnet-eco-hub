import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { NavLink } from 'react-router-dom'
import { 
  ArrowRight, 
  Leaf, 
  MapPin, 
  Coins, 
  Bot,
  Recycle,
  TrendingUp,
  Award,
  Users,
  Globe,
  Sparkles,
  Shield
} from 'lucide-react'
import heroImage from '@/assets/trashnet-hero.jpg'

const Landing = () => {
  const features = [
    {
      icon: Coins,
      title: 'Earn EcoCredits',
      description: 'Get rewarded for every item you recycle with our smart trash bins',
      gradient: 'from-yellow-400 to-orange-500'
    },
    {
      icon: MapPin,
      title: 'Smart Bin Network',
      description: 'Find the nearest available trash bin with real-time fill level data',
      gradient: 'from-blue-400 to-cyan-500'
    },
    {
      icon: Bot,
      title: 'AI Assistant',
      description: 'Get instant help with credits, rewards, and recycling tips powered by Gemini 2.0',
      gradient: 'from-purple-400 to-pink-500'
    },
    {
      icon: Award,
      title: 'Reward Schemes',
      description: 'Redeem your credits for discounts, vouchers, and eco-friendly rewards',
      gradient: 'from-green-400 to-emerald-500'
    }
  ]

  const stats = [
    { icon: Users, value: '10K+', label: 'Active Users' },
    { icon: Recycle, value: '1M+', label: 'Items Recycled' },
    { icon: Globe, value: '500+', label: 'Smart Bins' },
    { icon: TrendingUp, value: '75%', label: 'CO₂ Reduction' }
  ]

  const benefits = [
    'Real-time bin tracking and navigation',
    'Instant credit rewards for recycling',
    'AI-powered recycling guidance',
    'Municipality dashboard for bin management',
    'Environmental impact analytics',
    'Reward marketplace with local businesses'
  ]

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-hero">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-accent/20"></div>
        <div 
          className="absolute inset-0 bg-cover bg-center opacity-10" 
          style={{ backgroundImage: `url(${heroImage})` }}
        ></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-32">
          <div className="text-center text-primary-foreground">
            <div className="flex justify-center mb-6">
              <Badge className="bg-primary-foreground/20 text-primary-foreground border-primary-foreground/30 px-4 py-2">
                <Sparkles className="h-4 w-4 mr-2" />
                Smart Waste Management Platform
              </Badge>
            </div>
            
            <h1 className="text-5xl lg:text-7xl font-bold mb-6 leading-tight">
              Welcome to{' '}
              <span className="bg-gradient-to-r from-white to-primary-foreground/80 bg-clip-text text-transparent">
                TrashNet
              </span>
            </h1>
            
            <p className="text-xl lg:text-2xl mb-8 text-primary-foreground/90 max-w-3xl mx-auto leading-relaxed">
              Transform waste management with AI-powered smart bins, earn EcoCredits for recycling, 
              and make a real environmental impact in your community
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <NavLink to="/dashboard">
                <Button size="lg" className="bg-primary-foreground text-primary hover:bg-primary-foreground/90 px-8 py-4 text-lg font-semibold shadow-eco">
                  Get Started
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </NavLink>
              <NavLink to="/map">
                <Button size="lg" variant="outline" className="border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/10 px-8 py-4 text-lg">
                  Find Bins Near Me
                  <MapPin className="ml-2 h-5 w-5" />
                </Button>
              </NavLink>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <Card key={index} className="text-center shadow-card bg-gradient-card border-0">
                <CardContent className="p-6">
                  <stat.icon className="h-8 w-8 text-primary mx-auto mb-3" />
                  <div className="text-3xl font-bold text-primary mb-1">{stat.value}</div>
                  <div className="text-sm text-muted-foreground">{stat.label}</div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-gradient-secondary">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl lg:text-5xl font-bold mb-6">
              Why Choose{' '}
              <span className="bg-gradient-primary bg-clip-text text-transparent">
                TrashNet?
              </span>
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Experience the future of waste management with our comprehensive smart bin ecosystem
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-16">
            {features.map((feature, index) => (
              <Card key={index} className="group hover:shadow-eco transition-smooth bg-gradient-card border-0 overflow-hidden">
                <CardContent className="p-8">
                  <div className="flex items-center mb-6">
                    <div className={`p-3 rounded-xl bg-gradient-to-r ${feature.gradient} shadow-glow`}>
                      <feature.icon className="h-6 w-6 text-white" />
                    </div>
                    <h3 className="text-2xl font-bold ml-4">{feature.title}</h3>
                  </div>
                  <p className="text-muted-foreground text-lg leading-relaxed">
                    {feature.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="text-4xl lg:text-5xl font-bold mb-6">
                Complete{' '}
                <span className="bg-gradient-primary bg-clip-text text-transparent">
                  Ecosystem
                </span>
              </h2>
              <p className="text-xl text-muted-foreground mb-8">
                TrashNet provides a comprehensive platform for users, municipalities, and businesses 
                to work together towards a sustainable future.
              </p>
              
              <div className="space-y-4">
                {benefits.map((benefit, index) => (
                  <div key={index} className="flex items-center space-x-3">
                    <div className="w-6 h-6 rounded-full bg-gradient-primary flex items-center justify-center flex-shrink-0">
                      <div className="w-2 h-2 bg-primary-foreground rounded-full"></div>
                    </div>
                    <p className="text-lg">{benefit}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="relative">
              <div className="bg-gradient-primary rounded-2xl p-8 shadow-eco">
                <div className="bg-primary-foreground/10 rounded-xl p-6 mb-6">
                  <div className="flex items-center space-x-4 mb-4">
                    <div className="w-12 h-12 bg-primary-foreground/20 rounded-full flex items-center justify-center">
                      <Leaf className="h-6 w-6 text-primary-foreground" />
                    </div>
                    <div>
                      <h4 className="text-primary-foreground font-semibold">Environmental Impact</h4>
                      <p className="text-primary-foreground/80 text-sm">Real-time tracking</p>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center text-primary-foreground">
                      <span>Trees Saved</span>
                      <span className="font-bold">12.3K</span>
                    </div>
                    <div className="flex justify-between items-center text-primary-foreground">
                      <span>CO₂ Reduced</span>
                      <span className="font-bold">48.2 tons</span>
                    </div>
                    <div className="flex justify-between items-center text-primary-foreground">
                      <span>Water Conserved</span>
                      <span className="font-bold">234K liters</span>
                    </div>
                  </div>
                </div>
                
                <div className="text-center">
                  <p className="text-primary-foreground/90 text-lg">
                    Join thousands of users making a difference
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-hero">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="text-primary-foreground">
            <h2 className="text-4xl lg:text-5xl font-bold mb-6">
              Ready to Make an Impact?
            </h2>
            <p className="text-xl mb-8 text-primary-foreground/90">
              Join the TrashNet community and start earning rewards while helping the environment
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <NavLink to="/dashboard">
                <Button size="lg" className="bg-primary-foreground text-primary hover:bg-primary-foreground/90 px-8 py-4 text-lg font-semibold shadow-eco">
                  Start Your Journey
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </NavLink>
              <NavLink to="/admin">
                <Button size="lg" variant="outline" className="border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/10 px-8 py-4 text-lg">
                  <Shield className="mr-2 h-5 w-5" />
                  Municipality Portal
                </Button>
              </NavLink>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}

export default Landing