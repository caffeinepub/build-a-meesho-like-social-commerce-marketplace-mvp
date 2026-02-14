import { useState } from 'react';
import { useCurrentUser } from '@/hooks/useCurrentUser';
import { useSaveUserProfile } from '@/hooks/useQueries';
import RequireAuth from '@/components/auth/RequireAuth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Copy, Check, User, Shield, Key } from 'lucide-react';
import { toast } from 'sonner';

function ProfilePageContent() {
  const { identity, userProfile, isAdmin, isLoading } = useCurrentUser();
  const saveProfileMutation = useSaveUserProfile();
  
  const [name, setName] = useState(userProfile?.name || '');
  const [copied, setCopied] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  const principalId = identity?.getPrincipal().toText() || '';

  const handleCopyPrincipal = async () => {
    try {
      await navigator.clipboard.writeText(principalId);
      setCopied(true);
      toast.success('Principal ID copied to clipboard');
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      toast.error('Failed to copy Principal ID');
    }
  };

  const handleSaveProfile = async () => {
    const trimmedName = name.trim();
    
    if (!trimmedName) {
      toast.error('Name cannot be empty');
      return;
    }

    try {
      await saveProfileMutation.mutateAsync({ name: trimmedName });
      toast.success('Profile updated successfully');
      setIsEditing(false);
    } catch (error) {
      toast.error('Failed to update profile');
    }
  };

  const handleCancel = () => {
    setName(userProfile?.name || '');
    setIsEditing(false);
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-3xl">
        <div className="space-y-4">
          <div className="h-8 w-48 bg-muted animate-pulse rounded" />
          <Card>
            <CardHeader>
              <div className="h-6 w-32 bg-muted animate-pulse rounded" />
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="h-4 w-full bg-muted animate-pulse rounded" />
              <div className="h-4 w-3/4 bg-muted animate-pulse rounded" />
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-3xl">
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">My Profile</h1>
          <p className="text-muted-foreground mt-2">
            View and manage your account information
          </p>
        </div>

        {/* Principal ID Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Key className="h-5 w-5" />
              Principal ID
            </CardTitle>
            <CardDescription>
              Your unique identifier on the Internet Computer. This ID is used to determine admin access and ownership in this app.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <code className="flex-1 px-3 py-2 bg-muted rounded text-sm font-mono break-all">
                {principalId}
              </code>
              <Button
                variant="outline"
                size="icon"
                onClick={handleCopyPrincipal}
                className="shrink-0"
              >
                {copied ? (
                  <Check className="h-4 w-4 text-green-600" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Profile Name Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Profile Name
            </CardTitle>
            <CardDescription>
              {userProfile?.name 
                ? 'Your display name in the marketplace'
                : 'Set your display name to personalize your account'}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {isEditing ? (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Name</Label>
                  <Input
                    id="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Enter your name"
                    disabled={saveProfileMutation.isPending}
                  />
                </div>
                <div className="flex gap-2">
                  <Button
                    onClick={handleSaveProfile}
                    disabled={saveProfileMutation.isPending || !name.trim()}
                  >
                    {saveProfileMutation.isPending ? 'Saving...' : 'Save'}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={handleCancel}
                    disabled={saveProfileMutation.isPending}
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Current Name</p>
                    <p className="text-lg font-medium">
                      {userProfile?.name || (
                        <span className="text-muted-foreground italic">Not set</span>
                      )}
                    </p>
                  </div>
                  <Button
                    variant="outline"
                    onClick={() => setIsEditing(true)}
                  >
                    {userProfile?.name ? 'Edit' : 'Set Name'}
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Admin Status Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Account Status
            </CardTitle>
            <CardDescription>
              Your current role and permissions in the marketplace
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">Role:</span>
              {isAdmin ? (
                <Badge variant="default" className="gap-1">
                  <Shield className="h-3 w-3" />
                  Administrator
                </Badge>
              ) : (
                <Badge variant="secondary">User</Badge>
              )}
            </div>
            {isAdmin && (
              <p className="text-sm text-muted-foreground mt-3">
                As an administrator, you have full access to product management and marketplace settings.
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default function ProfilePage() {
  return (
    <RequireAuth>
      <ProfilePageContent />
    </RequireAuth>
  );
}
