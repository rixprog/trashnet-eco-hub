import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useToast } from '@/hooks/use-toast'
import { 
  Plus, 
  MapPin, 
  Trash2, 
  Settings, 
  BarChart3,
  AlertTriangle,
  CheckCircle,
  Clock,
  Wifi, // Added for connection status
  WifiOff // Added for connection status
} from 'lucide-react'
import { useQuery } from '@tanstack/react-query'; // Added for fetching real-time data
import { Progress } from '@/components/ui/progress'; // Added for fill level progress bar

// Updated BinData interface to match backend AdminBinData model
interface BinData {
  id: string
  name: string
  location: string
  lat: number
  lng: number
  status: 'active' | 'full' | 'maintenance' // Derived from fillLevel in backend
  fillLevel: number // Percentage 0-100
  lastEmptied: string
  totalCollections: number
  connection_status: 'online' | 'offline'; // New: Connection status from backend
  last_seen_timestamp: number; // New: Unix timestamp from backend
}

const API_BASE_URL = 'http://localhost:8000'; // Define API base URL

const Admin = () => {
  // Your original static bins data (UNCHANGED)
  const [bins, setBins] = useState<BinData[]>([
    {
      id: 'A01',
      name: 'Central Park Bin',
      location: '123 Park Ave, Central District',
      lat: 40.7829,
      lng: -73.9654,
      status: 'active',
      fillLevel: 45,
      lastEmptied: '2 hours ago',
      totalCollections: 156
    },
    {
      id: 'B03',
      name: 'Shopping Mall Entrance',
      location: '456 Mall Street, Shopping District',
      lat: 40.7589,
      lng: -73.9851,
      status: 'active',
      fillLevel: 78,
      lastEmptied: '4 hours ago',
      totalCollections: 243
    },
    {
      id: 'C05',
      name: 'Metro Station',
      location: '789 Metro Plaza, Transit Hub',
      lat: 40.7505,
      lng: -73.9934,
      status: 'full',
      fillLevel: 95,
      lastEmptied: '12 hours ago',
      totalCollections: 189
    }
  ])

  const [newBin, setNewBin] = useState({
    name: '',
    location: '',
    lat: '',
    lng: ''
  })

  const { toast } = useToast()

  // --- NEW: Fetch real-time bin data from backend ---
  const { data: fetchedBins, isLoading: isFetchingBins, error: fetchError } = useQuery<Record<string, BinData>>({
    queryKey: ['adminRealtimeBins'],
    queryFn: () => fetch(`${API_BASE_URL}/admin/bins-data`).then(res => res.json()),
    refetchInterval: 5000, // Refetch every 5 seconds for real-time updates
  });
  const fetchedBinsArray = fetchedBins ? Object.values(fetchedBins) : [];
  // --- END NEW ---

  const handleAddBin = () => {
    if (!newBin.name || !newBin.location || !newBin.lat || !newBin.lng) {
      toast({
        title: "Error",
        description: "Please fill in all fields",
        variant: "destructive"
      })
      return
    }

    const binId = `${String.fromCharCode(65 + bins.length)}${String(bins.length + 1).padStart(2, '0')}`
    
    const bin: BinData = {
      id: binId,
      name: newBin.name,
      location: newBin.location,
      lat: parseFloat(newBin.lat),
      lng: parseFloat(newBin.lng),
      status: 'active',
      fillLevel: 0,
      lastEmptied: 'Just added',
      totalCollections: 0,
      connection_status: 'online', // Default for newly added
      last_seen_timestamp: Math.floor(Date.now() / 1000) // Default for newly added
    }

    setBins([...bins, bin])
    setNewBin({ name: '', location: '', lat: '', lng: '' })
    
    toast({
      title: "Success",
      description: `Trash bin ${binId} added successfully`,
    })
  }

  const updateBinStatus = (binId: string, status: BinData['status']) => {
    setBins(bins.map(bin => 
      bin.id === binId ? { ...bin, status, fillLevel: status === 'maintenance' ? 0 : bin.fillLevel } : bin
    ))
    
    toast({
      title: "Status Updated",
      description: `Bin ${binId} status changed to ${status}`,
    })
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'default'
      case 'full': return 'secondary'
      case 'maintenance': return 'destructive'
      default: return 'outline'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active': return CheckCircle
      case 'full': return AlertTriangle
      case 'maintenance': return Clock
      default: return Trash2
    }
  }

  // --- NEW: Helper to get connection icon ---
  const getConnectionIcon = (status: BinData['connection_status']) => {
    switch (status) {
      case 'online':
        return <Wifi className="h-4 w-4 text-success" />;
      case 'offline':
        return <WifiOff className="h-4 w-4 text-muted-foreground" />;
      default:
        return null;
    }
  };
  // --- END NEW ---

  const overviewStats = {
    totalBins: bins.length,
    activeBins: bins.filter(b => b.status === 'active').length,
    fullBins: bins.filter(b => b.status === 'full').length,
    maintenanceBins: bins.filter(b => b.status === 'maintenance').length,
    avgFillLevel: bins.length > 0 ? Math.round(bins.reduce((acc, bin) => acc + bin.fillLevel, 0) / bins.length) : 0,
    totalCollections: bins.reduce((acc, bin) => acc + bin.totalCollections, 0)
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Municipality Admin Panel</h1>
        <p className="text-muted-foreground">
          Manage smart trash bins across your city and monitor their performance
        </p>
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="bins">Bin Management</TabsTrigger>
          <TabsTrigger value="add-bin">Add New Bin</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Stats Grid (UNCHANGED) */}
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-6">
            <Card className="shadow-card">
              <CardContent className="p-4 text-center">
                <Trash2 className="h-8 w-8 text-primary mx-auto mb-2" />
                <p className="text-2xl font-bold">{overviewStats.totalBins}</p>
                <p className="text-xs text-muted-foreground">Total Bins</p>
              </CardContent>
            </Card>
            <Card className="shadow-card">
              <CardContent className="p-4 text-center">
                <CheckCircle className="h-8 w-8 text-success mx-auto mb-2" />
                <p className="text-2xl font-bold">{overviewStats.activeBins}</p>
                <p className="text-xs text-muted-foreground">Active</p>
              </CardContent>
            </Card>
            <Card className="shadow-card">
              <CardContent className="p-4 text-center">
                <AlertTriangle className="h-8 w-8 text-warning mx-auto mb-2" />
                <p className className="text-2xl font-bold">{overviewStats.fullBins}</p>
                <p className="text-xs text-muted-foreground">Full</p>
              </CardContent>
            </Card>
            <Card className="shadow-card">
              <CardContent className="p-4 text-center">
                <Clock className="h-8 w-8 text-destructive mx-auto mb-2" />
                <p className="text-2xl font-bold">{overviewStats.maintenanceBins}</p>
                <p className="text-xs text-muted-foreground">Maintenance</p>
              </CardContent>
            </Card>
            <Card className="shadow-card">
              <CardContent className="p-4 text-center">
                <BarChart3 className="h-8 w-8 text-accent mx-auto mb-2" />
                <p className="text-2xl font-bold">{overviewStats.avgFillLevel}%</p>
                <p className="text-xs text-muted-foreground">Avg Fill Level</p>
              </CardContent>
            </Card>
            <Card className="shadow-card">
              <CardContent className="p-4 text-center">
                <Settings className="h-8 w-8 text-primary mx-auto mb-2" />
                <p className="text-2xl font-bold">{overviewStats.totalCollections}</p>
                <p className="text-xs text-muted-foreground">Total Collections</p>
              </CardContent>
            </Card>
          </div>

          {/* Recent Alerts (UNCHANGED) */}
          <Card className="shadow-card">
            <CardHeader>
              <CardTitle>Recent Alerts</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center space-x-3 p-3 bg-warning/10 rounded-lg border border-warning/20">
                  <AlertTriangle className="h-5 w-5 text-warning" />
                  <div>
                    <p className="font-medium">Bin C05 is 95% full</p>
                    <p className="text-sm text-muted-foreground">Metro Station - Requires immediate attention</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3 p-3 bg-destructive/10 rounded-lg border border-destructive/20">
                  <Clock className="h-5 w-5 text-destructive" />
                  <div>
                    <p className="font-medium">Bin A01 sensor malfunction</p>
                    <p className="text-sm text-muted-foreground">Central Park - Scheduled for maintenance</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="bins" className="space-y-6">
          <Card className="shadow-card">
            <CardHeader>
              <CardTitle>All Trash Bins</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {bins.map((bin) => {
                  const StatusIcon = getStatusIcon(bin.status)
                  return (
                    <div key={bin.id} className="border rounded-lg p-4 hover:shadow-card transition-smooth">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center space-x-3">
                          <StatusIcon className="h-5 w-5 text-muted-foreground" />
                          <div>
                            <h3 className="font-semibold">{bin.name}</h3>
                            <p className="text-sm text-muted-foreground">{bin.location}</p>
                          </div>
                        </div>
                        <Badge variant={getStatusColor(bin.status)}>
                          {bin.status}
                        </Badge>
                      </div>
                      
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                        <div>
                          <p className="text-xs text-muted-foreground">Fill Level</p>
                          <p className="font-semibold">{bin.fillLevel}%</p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">Collections</p>
                          <p className="font-semibold">{bin.totalCollections}</p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">Last Emptied</p>
                          <p className="font-semibold">{bin.lastEmptied}</p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">Coordinates</p>
                          <p className="font-semibold text-xs">{bin.lat.toFixed(4)}, {bin.lng.toFixed(4)}</p>
                        </div>
                      </div>

                      <div className="flex space-x-2">
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => updateBinStatus(bin.id, 'active')}
                          disabled={bin.status === 'active'}
                        >
                          Mark Active
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => updateBinStatus(bin.id, 'full')}
                          disabled={bin.status === 'full'}
                        >
                          Mark Full
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => updateBinStatus(bin.id, 'maintenance')}
                          disabled={bin.status === 'maintenance'}
                        >
                          Maintenance
                        </Button>
                      </div>
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="add-bin" className="space-y-6">
          <Card className="shadow-card">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Plus className="h-5 w-5" />
                <span>Add New Trash Bin</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">Bin Name</Label>
                  <Input
                    id="name"
                    placeholder="e.g., Central Park Bin"
                    value={newBin.name}
                    onChange={(e) => setNewBin({...newBin, name: e.target.value})}
                  />
                </div>
                <div>
                  <Label htmlFor="location">Location Address</Label>
                  <Input
                    id="location"
                    placeholder="e.g., 123 Park Avenue"
                    value={newBin.location}
                    onChange={(e) => setNewBin({...newBin, location: e.target.value})}
                  />
                </div>
                <div>
                  <Label htmlFor="lat">Latitude</Label>
                  <Input
                    id="lat"
                    type="number"
                    step="any"
                    placeholder="e.g., 40.7829"
                    value={newBin.lat}
                    onChange={(e) => setNewBin({...newBin, lat: e.target.value})}
                  />
                </div>
                <div>
                  <Label htmlFor="lng">Longitude</Label>
                  <Input
                    id="lng"
                    type="number"
                    step="any"
                    placeholder="e.g., -73.9654"
                    value={newBin.lng}
                    onChange={(e) => setNewBin({...newBin, lng: e.target.value})}
                  />
                </div>
              </div>
              
              <div className="pt-4 border-t">
                <Button onClick={handleAddBin} className="w-full md:w-auto">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Trash Bin
                </Button>
              </div>

              {/* Quick Add Note */}
              <div className="bg-secondary/30 p-4 rounded-lg">
                <h4 className="font-semibold mb-2 flex items-center">
                  <MapPin className="h-4 w-4 mr-2" />
                  Quick Add Instructions
                </h4>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Click on the map to automatically populate coordinates</li>
                  <li>• Use current location for quick setup</li>
                  <li>• Each bin gets a unique ID automatically</li>
                  <li>• New bins start with active status</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          <Card className="shadow-card">
            <CardHeader>
              <CardTitle>System Analytics</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12">
                <BarChart3 className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">Analytics Dashboard</h3>
                <p className="text-muted-foreground">
                  Detailed analytics and reporting will be available here including usage patterns, collection efficiency, and environmental impact metrics.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      
      {/* --- NEW: Real-time Bin Sensor Data Section --- */}
      <Card className="shadow-card mt-8">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Settings className="h-5 w-5 text-primary" />
            <span>Real-time Bin Sensor Data</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isFetchingBins && <div className="text-center py-4">Loading real-time bin data...</div>}
          {fetchError && <div className="text-center py-4 text-destructive">Error fetching real-time data: {fetchError.message}</div>}
          {!isFetchingBins && !fetchError && fetchedBinsArray.length === 0 && (
            <div className="text-center py-4 text-muted-foreground">No real-time bin data available.</div>
          )}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {fetchedBinsArray.map((bin) => (
              <Card key={`realtime-${bin.id}`} className="p-4 shadow-sm">
                <CardHeader className="flex flex-row items-center justify-between p-0 mb-3">
                  <CardTitle className="text-lg font-semibold">{bin.name}</CardTitle>
                  <Badge variant="outline">{bin.id}</Badge>
                </CardHeader>
                <CardContent className="p-0 text-sm space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-1">
                      {getConnectionIcon(bin.connection_status)}
                      <span className={`font-medium ${bin.connection_status === 'offline' ? 'text-muted-foreground' : 'text-success'}`}>
                        {bin.connection_status.charAt(0).toUpperCase() + bin.connection_status.slice(1)}
                      </span>
                    </div>
                    {/* Display actual bin status as derived in backend */}
                    <Badge variant={getStatusColor(bin.status)}>
                      {bin.status.charAt(0).toUpperCase() + bin.status.slice(1)}
                    </Badge>
                  </div>
                  <div>
                    <Label className="text-xs text-muted-foreground mb-1 block">Fill Level</Label>
                    <Progress value={bin.fillLevel} className="h-2" />
                    <span className="text-xs text-muted-foreground mt-1 block">{bin.fillLevel}% Full</span>
                  </div>
                  <div className="flex items-center text-xs text-muted-foreground">
                    <Clock className="h-3 w-3 mr-1" />
                    <span>Last Updated: {new Date(bin.last_seen_timestamp * 1000).toLocaleString()}</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>
      {/* --- END NEW Section --- */}
    </div>
  )
}

export default Admin