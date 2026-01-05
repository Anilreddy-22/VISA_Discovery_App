import { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { useAuth } from '../contexts/AuthContext';
import { useSession } from '../contexts/SessionContext';
import { sessionsAPI, Session } from '../lib/api';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Label } from '../components/ui/label';
import { Textarea } from '../components/ui/textarea';
import { Badge } from '../components/ui/badge';

export default function SessionSelector() {
  const [, setLocation] = useLocation();
  const { user, logout } = useAuth();
  const { createSession, loadSession } = useSession();
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    loadSessions();
  }, []);

  const loadSessions = async () => {
    setLoading(true);
    try {
      const data = await sessionsAPI.getAll();
      setSessions(data);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreating(true);
    try {
      await createSession(name, description);
      setLocation('/workshop');
    } finally {
      setCreating(false);
    }
  };

  const handleSelectSession = async (id: number) => {
    await loadSession(id);
    setLocation('/workshop');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <img src="/buyframe-logo.png" alt="BuyFrame" className="h-10" />
              <span className="text-2xl font-bold text-gray-400">×</span>
              <img src="/agentforce-logo.png" alt="Agentforce" className="h-10" />
              <span className="text-2xl font-bold text-gray-400">×</span>
              <img src="/visa-logo.png" alt="Visa" className="h-10" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900">Discovery Sessions</h1>
            <p className="text-gray-600 mt-1">Welcome, {user?.name}!</p>
          </div>
          <Button variant="outline" onClick={logout}>
            Sign Out
          </Button>
        </div>

        {showCreate ? (
          <Card>
            <CardHeader>
              <CardTitle>Create New Session</CardTitle>
              <CardDescription>Start a new collaborative discovery workshop</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleCreate} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Session Name</Label>
                  <Input
                    id="name"
                    placeholder="e.g., Currencycloud Discovery - Dec 2025"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="description">Description (Optional)</Label>
                  <Textarea
                    id="description"
                    placeholder="Brief description of this workshop session"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows={3}
                  />
                </div>

                <div className="flex gap-2">
                  <Button type="submit" disabled={creating}>
                    {creating ? 'Creating...' : 'Create Session'}
                  </Button>
                  <Button type="button" variant="outline" onClick={() => setShowCreate(false)}>
                    Cancel
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        ) : (
          <>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold text-gray-900">Your Sessions</h2>
              <Button onClick={() => setShowCreate(true)}>
                + New Session
              </Button>
            </div>

            {loading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                <p className="mt-4 text-gray-600">Loading sessions...</p>
              </div>
            ) : sessions.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <p className="text-gray-600 mb-4">No sessions yet. Create your first one!</p>
                  <Button onClick={() => setShowCreate(true)}>
                    Create First Session
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {sessions.map((session) => (
                  <Card key={session.id} className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => handleSelectSession(session.id)}>
                    <CardHeader>
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1">
                          <CardTitle className="text-lg">{session.name}</CardTitle>
                          <CardDescription>
                            {session.description || 'No description'}
                          </CardDescription>
                        </div>
                        <Badge 
                          variant={session.status === 'completed' ? 'default' : 'secondary'}
                          className={session.status === 'completed' ? 'bg-green-600 hover:bg-green-700' : 'bg-amber-500 hover:bg-amber-600'}
                        >
                          {session.status === 'completed' ? 'Completed' : 'Draft'}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="text-sm text-gray-600 space-y-1">
                        <p>Created by: {session.creatorName || 'Unknown'}</p>
                        <p>Updated: {new Date(session.updatedAt).toLocaleDateString()}</p>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
