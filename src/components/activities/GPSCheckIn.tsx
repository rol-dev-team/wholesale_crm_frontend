import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { MapPin, Loader2, CheckCircle2, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";

interface GPSCoordinates {
  latitude: number;
  longitude: number;
  accuracy: number;
  timestamp: string;
}

interface GPSCheckInProps {
  onCheckIn: (coordinates: GPSCoordinates, justification?: string) => void;
  targetLocation?: { latitude: number; longitude: number };
  allowedRadius?: number; // in meters
  isCompleted?: boolean;
  completedAt?: string;
  existingCoordinates?: GPSCoordinates;
  compact?: boolean;
}

export function GPSCheckIn({
  onCheckIn,
  targetLocation,
  allowedRadius = 500, // default 500 meters
  isCompleted,
  completedAt,
  existingCoordinates,
  compact = false,
}: GPSCheckInProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [coordinates, setCoordinates] = useState<GPSCoordinates | null>(existingCoordinates || null);
  const [needsJustification, setNeedsJustification] = useState(false);
  const [justification, setJustification] = useState("");
  const [distance, setDistance] = useState<number | null>(null);

  // Calculate distance between two coordinates using Haversine formula
  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
    const R = 6371e3; // Earth's radius in meters
    const φ1 = (lat1 * Math.PI) / 180;
    const φ2 = (lat2 * Math.PI) / 180;
    const Δφ = ((lat2 - lat1) * Math.PI) / 180;
    const Δλ = ((lon2 - lon1) * Math.PI) / 180;

    const a =
      Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
      Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c;
  };

  const handleCheckIn = async () => {
    if (!navigator.geolocation) {
      setError("Geolocation is not supported by your browser");
      return;
    }

    setIsLoading(true);
    setError(null);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const coords: GPSCoordinates = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy,
          timestamp: new Date().toISOString(),
        };

        setCoordinates(coords);

        // Check if within allowed radius (if target location is provided)
        if (targetLocation) {
          const dist = calculateDistance(
            coords.latitude,
            coords.longitude,
            targetLocation.latitude,
            targetLocation.longitude
          );
          setDistance(dist);

          if (dist > allowedRadius) {
            setNeedsJustification(true);
            setIsLoading(false);
            return;
          }
        }

        onCheckIn(coords);
        setIsLoading(false);
      },
      (err) => {
        setIsLoading(false);
        switch (err.code) {
          case err.PERMISSION_DENIED:
            setError("Location permission denied. Please click the location icon in your browser's address bar and allow access, then try again.");
            break;
          case err.POSITION_UNAVAILABLE:
            setError("Location information unavailable. Please ensure GPS is enabled on your device.");
            break;
          case err.TIMEOUT:
            setError("Location request timed out. Please try again.");
            break;
          default:
            setError("An error occurred getting your location. Please try again.");
        }
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      }
    );
  };

  const handleSubmitWithJustification = () => {
    if (coordinates && justification.trim()) {
      onCheckIn(coordinates, justification);
      setNeedsJustification(false);
    }
  };

  if (isCompleted && existingCoordinates) {
    if (compact) {
      return (
        <span className="inline-flex items-center gap-1 text-xs text-success">
          <CheckCircle2 className="h-3 w-3" />
          Checked In
        </span>
      );
    }
    return (
      <Card className="border-success/50 bg-success/5">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium flex items-center gap-2 text-success">
            <CheckCircle2 className="h-4 w-4" />
            GPS Check-in Completed
          </CardTitle>
          <CardDescription>
            Checked in at {new Date(completedAt || existingCoordinates.timestamp).toLocaleString()}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <div className="flex gap-4">
            <div>
              <span className="text-muted-foreground">Latitude:</span>{" "}
              {existingCoordinates.latitude.toFixed(6)}
            </div>
            <div>
              <span className="text-muted-foreground">Longitude:</span>{" "}
              {existingCoordinates.longitude.toFixed(6)}
            </div>
          </div>
          <div>
            <span className="text-muted-foreground">Accuracy:</span>{" "}
            {existingCoordinates.accuracy.toFixed(0)}m
          </div>
        </CardContent>
      </Card>
    );
  }

  if (needsJustification) {
    return (
      <Card className="border-warning/50 bg-warning/5">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium flex items-center gap-2 text-warning">
            <AlertTriangle className="h-4 w-4" />
            Outside Allowed Radius
          </CardTitle>
          <CardDescription>
            You are {distance ? `${(distance / 1000).toFixed(2)}km` : "far"} from the meeting
            location. Please provide a justification.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="justification">Justification *</Label>
            <Textarea
              id="justification"
              placeholder="Explain why you're checking in from this location..."
              value={justification}
              onChange={(e) => setJustification(e.target.value)}
              rows={3}
            />
          </div>
          <div className="flex gap-2">
            <Button
              onClick={handleSubmitWithJustification}
              disabled={!justification.trim()}
              size="sm"
            >
              Submit Check-in
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setNeedsJustification(false);
                setCoordinates(null);
              }}
            >
              Cancel
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Compact version for table rows
  if (compact) {
    return (
      <Button
        onClick={handleCheckIn}
        disabled={isLoading}
        size="sm"
        variant="outline"
        className="gap-1 h-8"
      >
        {isLoading ? (
          <>
            <Loader2 className="h-3 w-3 animate-spin" />
            <span className="hidden sm:inline">Checking...</span>
          </>
        ) : (
          <>
            <MapPin className="h-3 w-3" />
            <span className="hidden sm:inline">Check In</span>
          </>
        )}
      </Button>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium">GPS Check-in Required</CardTitle>
        <CardDescription>
          Check in at the meeting location to verify your presence
        </CardDescription>
      </CardHeader>
      <CardContent>
        {error && (
          <div className="mb-4 p-3 bg-destructive/10 text-destructive text-sm rounded-lg">
            {error}
          </div>
        )}
        <Button
          onClick={handleCheckIn}
          disabled={isLoading}
          className={cn("w-full gap-2", isLoading && "opacity-70")}
        >
          {isLoading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Getting Location...
            </>
          ) : (
            <>
              <MapPin className="h-4 w-4" />
              Check In Now
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );
}
