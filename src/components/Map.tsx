import { useState, useRef, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { 
  MapPin, 
  Search, 
  Navigation, 
  Clock,
  CheckCircle,
  AlertCircle,
  Trash2
} from 'lucide-react'

interface TrashBin {
  id: string
  name: string
  lat: number
  lng: number
  status: 'available' | 'full' | 'maintenance'
  fillLevel: number
  credits: number
  distance: string
  lastEmptied: string
}

const Map = () => {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedBin, setSelectedBin] = useState<TrashBin | null>(null)
  const [userLocation, setUserLocation] = useState<{lat: number, lng: number} | null>(null)
  
  // Mock data for trash bins
  const trashBins: TrashBin[] = [
    {
      id: 'A01',
      name: 'Central Park Bin',
      lat: 40.7829,
      lng: -73.9654,
      status: 'available',
      fillLevel: 45,
      credits: 15,
      distance: '0.2 km',
      lastEmptied: '2 hours ago'
    },
    {
      id: 'B03',
      name: 'Shopping Mall Entrance',
      lat: 40.7589,
      lng: -73.9851,
      status: 'available',
      fillLevel: 23,
      credits: 20,
      distance: '0.8 km',
      lastEmptied: '4 hours ago'
    },
    {
      id: 'C05',
      name: 'Metro Station',
      lat: 40.7505,
      lng: -73.9934,
      status: 'full',
      fillLevel: 95,
      credits: 0,
      distance: '1.2 km',
      lastEmptied: '12 hours ago'
    },
    {
      id: 'D07',
      name: 'University Campus',
      lat: 40.7282,
      lng: -73.9942,
      status: 'maintenance',
      fillLevel: 0,
      credits: 0,
      distance: '1.5 km',
      lastEmptied: '1 day ago'
    }
  ]

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'available': return 'bg-success'
      case 'full': return 'bg-warning'
      case 'maintenance': return 'bg-destructive'
      default: return 'bg-muted'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'available': return CheckCircle
      case 'full': return AlertCircle
      case 'maintenance': return AlertCircle
      default: return Trash2
    }
  }

  const getUserLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          })
        },
        (error) => {
          console.error('Error getting location:', error)
        }
      )
    }
  }

  useEffect(() => {
    getUserLocation()
  }, [])

  const filteredBins = trashBins.filter(bin =>
    bin.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    bin.id.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Find Nearby Trash Bins</h1>
        <p className="text-muted-foreground">
          Locate smart trash bins near you and earn EcoCredits for responsible disposal
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Map Area */}
        <div className="lg:col-span-2">
          <Card className="shadow-card">
            <CardContent className="p-0">
              {/* Mock Map Display */}
              <div className="relative h-96 bg-gradient-secondary rounded-lg overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center">
                  <div className="text-center p-8">
                    <MapPin className="h-16 w-16 text-primary mx-auto mb-4" />
                    <h3 className="text-xl font-semibold mb-2">Interactive Map</h3>
                    <p className="text-muted-foreground mb-4">
                      Map integration will show real-time locations of smart trash bins
                    </p>
                    <div className="grid grid-cols-2 gap-4 max-w-sm mx-auto">
                      {trashBins.slice(0, 4).map((bin) => {
                        const StatusIcon = getStatusIcon(bin.status)
                        return (
                          <div
                            key={bin.id}
                            className="flex items-center space-x-2 p-2 bg-background/80 rounded-lg cursor-pointer hover:bg-background transition-smooth"
                            onClick={() => setSelectedBin(bin)}
                          >
                            <div className={`w-3 h-3 rounded-full ${getStatusColor(bin.status)}`}></div>
                            <span className="text-xs font-medium">{bin.id}</span>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                </div>
                
                {/* Location Button */}
                <Button
                  size="sm"
                  className="absolute top-4 right-4 shadow-eco"
                  onClick={getUserLocation}
                >
                  <Navigation className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Selected Bin Details */}
          {selectedBin && (
            <Card className="mt-6 shadow-card">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Trash2 className="h-5 w-5 text-primary" />
                  <span>{selectedBin.name}</span>
                  <Badge variant={selectedBin.status === 'available' ? 'default' : 'secondary'}>
                    {selectedBin.status}
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Fill Level</p>
                    <p className="font-semibold">{selectedBin.fillLevel}%</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Credits Available</p>
                    <p className="font-semibold text-success">{selectedBin.credits}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Distance</p>
                    <p className="font-semibold">{selectedBin.distance}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Last Emptied</p>
                    <p className="font-semibold">{selectedBin.lastEmptied}</p>
                  </div>
                </div>
                <div className="mt-4 flex space-x-2">
                  <Button className="flex-1">
                    <Navigation className="h-4 w-4 mr-2" />
                    Get Directions
                  </Button>
                  <Button variant="outline">
                    <Clock className="h-4 w-4 mr-2" />
                    Check Status
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Search */}
          <Card className="shadow-card">
            <CardContent className="p-4">
              <div className="relative">
                <Search className="h-4 w-4 absolute left-3 top-3 text-muted-foreground" />
                <Input
                  placeholder="Search bins by name or ID..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </CardContent>
          </Card>

          {/* Quick Stats */}
          <Card className="shadow-card">
            <CardHeader>
              <CardTitle>Nearby Bins</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm">Available</span>
                  <span className="font-semibold text-success">
                    {trashBins.filter(bin => bin.status === 'available').length}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Full</span>
                  <span className="font-semibold text-warning">
                    {trashBins.filter(bin => bin.status === 'full').length}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Maintenance</span>
                  <span className="font-semibold text-destructive">
                    {trashBins.filter(bin => bin.status === 'maintenance').length}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Bin List */}
          <Card className="shadow-card">
            <CardHeader>
              <CardTitle>All Bins</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {filteredBins.map((bin) => {
                const StatusIcon = getStatusIcon(bin.status)
                return (
                  <div
                    key={bin.id}
                    className={`p-3 border rounded-lg cursor-pointer transition-smooth ${
                      selectedBin?.id === bin.id ? 'border-primary shadow-eco' : 'hover:shadow-card'
                    }`}
                    onClick={() => setSelectedBin(bin)}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <h4 className="font-medium text-sm">{bin.name}</h4>
                      <Badge variant="outline" className="text-xs">
                        {bin.id}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <div className="flex items-center space-x-1">
                        <StatusIcon className="h-3 w-3" />
                        <span>{bin.status}</span>
                      </div>
                      <span>{bin.distance}</span>
                    </div>
                    {bin.status === 'available' && (
                      <div className="mt-2 text-xs">
                        <span className="text-success font-medium">+{bin.credits} credits</span>
                      </div>
                    )}
                  </div>
                )
              })}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

export default Map