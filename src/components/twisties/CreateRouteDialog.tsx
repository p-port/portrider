
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Plus, X, MapPin, AlertTriangle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

interface CreateRouteDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onRouteCreated: () => void;
}

interface PitStop {
  name: string;
  address: string;
  type: string;
  description: string;
}

interface DangerZone {
  address: string;
  danger_type: string;
  description: string;
  severity: string;
}

export const CreateRouteDialog = ({ isOpen, onClose, onRouteCreated }: CreateRouteDialogProps) => {
  const { user } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Form state
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [startAddress, setStartAddress] = useState('');
  const [endAddress, setEndAddress] = useState('');
  const [difficulty, setDifficulty] = useState('');
  const [distance, setDistance] = useState('');
  const [duration, setDuration] = useState('');
  
  // Pit stops and danger zones
  const [pitStops, setPitStops] = useState<PitStop[]>([]);
  const [dangerZones, setDangerZones] = useState<DangerZone[]>([]);
  
  // New pit stop form
  const [newPitStop, setNewPitStop] = useState<PitStop>({
    name: '',
    address: '',
    type: '',
    description: ''
  });
  
  // New danger zone form
  const [newDangerZone, setNewDangerZone] = useState<DangerZone>({
    address: '',
    danger_type: '',
    description: '',
    severity: ''
  });

  const resetForm = () => {
    setTitle('');
    setDescription('');
    setStartAddress('');
    setEndAddress('');
    setDifficulty('');
    setDistance('');
    setDuration('');
    setPitStops([]);
    setDangerZones([]);
    setNewPitStop({ name: '', address: '', type: '', description: '' });
    setNewDangerZone({ address: '', danger_type: '', description: '', severity: '' });
  };

  const addPitStop = () => {
    if (newPitStop.name && newPitStop.address && newPitStop.type) {
      setPitStops([...pitStops, newPitStop]);
      setNewPitStop({ name: '', address: '', type: '', description: '' });
    }
  };

  const removePitStop = (index: number) => {
    setPitStops(pitStops.filter((_, i) => i !== index));
  };

  const addDangerZone = () => {
    if (newDangerZone.address && newDangerZone.danger_type && newDangerZone.description && newDangerZone.severity) {
      setDangerZones([...dangerZones, newDangerZone]);
      setNewDangerZone({ address: '', danger_type: '', description: '', severity: '' });
    }
  };

  const removeDangerZone = (index: number) => {
    setDangerZones(dangerZones.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    // Check for profanity
    const textToCheck = `${title} ${description}`;
    const { data: hasProfanity } = await supabase.rpc('contains_profanity', { text_content: textToCheck });
    
    if (hasProfanity) {
      toast.error('Please remove inappropriate language from your submission');
      return;
    }

    setIsSubmitting(true);

    try {
      // Create the route
      const { data: route, error: routeError } = await supabase
        .from('routes')
        .insert({
          created_by: user.id,
          title,
          description,
          start_point: { address: startAddress, lat: 0, lng: 0 }, // In real app, use geocoding
          end_point: { address: endAddress, lat: 0, lng: 0 },
          distance_km: distance ? parseFloat(distance) : null,
          estimated_duration_hours: duration ? parseFloat(duration) : null,
          difficulty_level: difficulty,
        })
        .select()
        .single();

      if (routeError) throw routeError;

      // Add pit stops
      if (pitStops.length > 0) {
        const pitStopData = pitStops.map((stop, index) => ({
          route_id: route.id,
          name: stop.name,
          location: { address: stop.address, lat: 0, lng: 0 },
          type: stop.type,
          description: stop.description,
          order_index: index + 1,
        }));

        const { error: pitStopError } = await supabase
          .from('route_pit_stops')
          .insert(pitStopData);

        if (pitStopError) throw pitStopError;
      }

      // Add danger zones
      if (dangerZones.length > 0) {
        const dangerZoneData = dangerZones.map((zone) => ({
          route_id: route.id,
          location: { address: zone.address, lat: 0, lng: 0 },
          danger_type: zone.danger_type,
          description: zone.description,
          severity: zone.severity,
        }));

        const { error: dangerZoneError } = await supabase
          .from('route_danger_zones')
          .insert(dangerZoneData);

        if (dangerZoneError) throw dangerZoneError;
      }

      toast.success('Route submitted successfully!');
      resetForm();
      onRouteCreated();
    } catch (error) {
      console.error('Error submitting route:', error);
      toast.error('Failed to submit route. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Submit New Route</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle>Route Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="title">Route Title *</Label>
                <Input
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Amazing mountain route through..."
                  required
                />
              </div>
              
              <div>
                <Label htmlFor="description">Description * (minimum 50 characters)</Label>
                <Textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe the route, scenery, road conditions, and what makes it special..."
                  rows={4}
                  required
                />
                <div className="text-sm text-muted-foreground mt-1">
                  {description.length}/50 characters minimum
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="start">Start Address *</Label>
                  <Input
                    id="start"
                    value={startAddress}
                    onChange={(e) => setStartAddress(e.target.value)}
                    placeholder="Starting point address"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="end">End Address *</Label>
                  <Input
                    id="end"
                    value={endAddress}
                    onChange={(e) => setEndAddress(e.target.value)}
                    placeholder="Ending point address"
                    required
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="difficulty">Difficulty Level *</Label>
                  <Select value={difficulty} onValueChange={setDifficulty} required>
                    <SelectTrigger>
                      <SelectValue placeholder="Select difficulty" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="easy">Easy</SelectItem>
                      <SelectItem value="moderate">Moderate</SelectItem>
                      <SelectItem value="hard">Hard</SelectItem>
                      <SelectItem value="expert">Expert</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="distance">Distance (km)</Label>
                  <Input
                    id="distance"
                    type="number"
                    step="0.1"
                    value={distance}
                    onChange={(e) => setDistance(e.target.value)}
                    placeholder="150.5"
                  />
                </div>
                <div>
                  <Label htmlFor="duration">Duration (hours)</Label>
                  <Input
                    id="duration"
                    type="number"
                    step="0.5"
                    value={duration}
                    onChange={(e) => setDuration(e.target.value)}
                    placeholder="3.5"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Pit Stops */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="h-5 w-5" />
                Pit Stops
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {pitStops.length > 0 && (
                <div className="space-y-2">
                  {pitStops.map((stop, index) => (
                    <div key={index} className="flex items-center gap-2 p-2 border rounded">
                      <Badge variant="outline">{stop.type.replace('_', ' ')}</Badge>
                      <span className="font-medium">{stop.name}</span>
                      <span className="text-muted-foreground">- {stop.address}</span>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removePitStop(index)}
                        className="ml-auto"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 border rounded bg-muted/50">
                <div>
                  <Label>Pit Stop Name</Label>
                  <Input
                    value={newPitStop.name}
                    onChange={(e) => setNewPitStop({...newPitStop, name: e.target.value})}
                    placeholder="Gas station, restaurant..."
                  />
                </div>
                <div>
                  <Label>Address</Label>
                  <Input
                    value={newPitStop.address}
                    onChange={(e) => setNewPitStop({...newPitStop, address: e.target.value})}
                    placeholder="Address or landmark"
                  />
                </div>
                <div>
                  <Label>Type</Label>
                  <Select value={newPitStop.type} onValueChange={(value) => setNewPitStop({...newPitStop, type: value})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="gas_station">Gas Station</SelectItem>
                      <SelectItem value="restaurant">Restaurant</SelectItem>
                      <SelectItem value="scenic_viewpoint">Scenic Viewpoint</SelectItem>
                      <SelectItem value="rest_area">Rest Area</SelectItem>
                      <SelectItem value="mechanic">Mechanic</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Description (optional)</Label>
                  <Input
                    value={newPitStop.description}
                    onChange={(e) => setNewPitStop({...newPitStop, description: e.target.value})}
                    placeholder="Additional details..."
                  />
                </div>
                <div className="md:col-span-2">
                  <Button type="button" onClick={addPitStop} className="w-full">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Pit Stop
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Danger Zones */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5" />
                Danger Zones
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {dangerZones.length > 0 && (
                <div className="space-y-2">
                  {dangerZones.map((zone, index) => (
                    <div key={index} className="flex items-center gap-2 p-2 border rounded">
                      <Badge variant="destructive">{zone.severity}</Badge>
                      <Badge variant="outline">{zone.danger_type.replace('_', ' ')}</Badge>
                      <span className="text-muted-foreground">{zone.address}</span>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeDangerZone(index)}
                        className="ml-auto"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 border rounded bg-muted/50">
                <div>
                  <Label>Location</Label>
                  <Input
                    value={newDangerZone.address}
                    onChange={(e) => setNewDangerZone({...newDangerZone, address: e.target.value})}
                    placeholder="Address or landmark"
                  />
                </div>
                <div>
                  <Label>Danger Type</Label>
                  <Select value={newDangerZone.danger_type} onValueChange={(value) => setNewDangerZone({...newDangerZone, danger_type: value})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="sharp_turn">Sharp Turn</SelectItem>
                      <SelectItem value="steep_grade">Steep Grade</SelectItem>
                      <SelectItem value="poor_road_condition">Poor Road Condition</SelectItem>
                      <SelectItem value="weather_hazard">Weather Hazard</SelectItem>
                      <SelectItem value="traffic_heavy">Heavy Traffic</SelectItem>
                      <SelectItem value="wildlife_crossing">Wildlife Crossing</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Severity</Label>
                  <Select value={newDangerZone.severity} onValueChange={(value) => setNewDangerZone({...newDangerZone, severity: value})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select severity" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                      <SelectItem value="extreme">Extreme</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Description</Label>
                  <Input
                    value={newDangerZone.description}
                    onChange={(e) => setNewDangerZone({...newDangerZone, description: e.target.value})}
                    placeholder="Describe the hazard..."
                  />
                </div>
                <div className="md:col-span-2">
                  <Button type="button" onClick={addDangerZone} className="w-full">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Danger Zone
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-end gap-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={isSubmitting || description.length < 50}
            >
              {isSubmitting ? 'Submitting...' : 'Submit Route'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
