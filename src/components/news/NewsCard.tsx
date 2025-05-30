
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar, User } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface NewsArticle {
  id: string;
  title: string;
  content: string;
  excerpt: string;
  author_id: string;
  category: string;
  image_url?: string;
  is_published: boolean;
  is_featured: boolean;
  published_at: string;
  created_at: string;
}

interface NewsCardProps {
  article: NewsArticle;
  onClick: () => void;
}

export const NewsCard: React.FC<NewsCardProps> = ({ article, onClick }) => {
  return (
    <Card 
      className="cursor-pointer hover:shadow-lg transition-shadow"
      onClick={onClick}
    >
      {article.image_url && (
        <div className="w-full h-48 overflow-hidden rounded-t-lg">
          <img 
            src={article.image_url} 
            alt={article.title}
            className="w-full h-full object-cover"
          />
        </div>
      )}
      <CardHeader>
        <div className="flex items-center justify-between mb-2">
          <Badge variant="secondary" className="capitalize">
            {article.category}
          </Badge>
          {article.is_featured && (
            <Badge variant="default">Featured</Badge>
          )}
        </div>
        <CardTitle className="line-clamp-2">{article.title}</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground line-clamp-3 mb-4">
          {article.excerpt || article.content.substring(0, 150) + '...'}
        </p>
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-1">
            <Calendar className="h-4 w-4" />
            {formatDistanceToNow(new Date(article.published_at || article.created_at), { addSuffix: true })}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
