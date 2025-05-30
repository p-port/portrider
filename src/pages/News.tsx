
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Newspaper, ArrowLeft, Home } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const News = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-secondary">
      <div className="bg-card border-b border-border">
        <div className="max-w-6xl mx-auto px-4 py-6">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate(-1)}
                className="text-muted-foreground hover:text-foreground"
              >
                <ArrowLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate('/')}
                className="text-muted-foreground hover:text-foreground"
              >
                <Home className="h-4 w-4" />
              </Button>
            </div>
            <div className="flex items-center space-x-3">
              <Newspaper className="h-8 w-8 text-primary" />
              <div>
                <h1 className="text-2xl font-bold text-foreground">News</h1>
                <p className="text-muted-foreground">Latest motorcycle news and updates</p>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <div className="max-w-6xl mx-auto px-4 py-8">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Newspaper className="h-6 w-6 text-primary" />
              Coming Soon
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">
              The News feature is currently being developed. Soon you'll be able to:
            </p>
            <ul className="list-disc list-inside space-y-2 text-muted-foreground">
              <li>Read the latest motorcycle industry news</li>
              <li>Get updates on new bike releases</li>
              <li>Follow motorcycle events and shows</li>
              <li>Access gear reviews and recommendations</li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default News;
