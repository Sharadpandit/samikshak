import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { type Comment } from "@shared/schema";

// Simple AI-like classification based on keywords and patterns
const classifyComment = (comment: Comment) => {
  const content = comment.content.toLowerCase();
  
  // Negative/Angry keywords and patterns
  const negativeKeywords = [
    'concerned', 'worry', 'worried', 'problem', 'issue', 'cost', 'expensive', 'waste', 
    'against', 'disagree', 'oppose', 'bad', 'wrong', 'terrible', 'awful', 'disappointed',
    'frustrated', 'angry', 'outraged', 'unacceptable', 'ridiculous', 'stupid'
  ];
  
  // Positive keywords and patterns
  const positiveKeywords = [
    'great', 'excellent', 'amazing', 'wonderful', 'perfect', 'love', 'like', 'support',
    'approve', 'fantastic', 'brilliant', 'awesome', 'good', 'better', 'best', 'helpful',
    'beneficial', 'important', 'necessary', 'exactly', 'right', 'correct', 'smart'
  ];
  
  // Suggestion keywords and patterns
  const suggestionKeywords = [
    'suggest', 'recommend', 'should', 'could', 'might', 'perhaps', 'maybe', 'consider',
    'what about', 'why not', 'how about', 'idea', 'proposal', 'alternative', 'instead',
    'better if', 'improve', 'enhancement', 'modify', 'change', 'add', 'include'
  ];
  
  let negativeScore = 0;
  let positiveScore = 0;
  let suggestionScore = 0;
  
  // Count keyword matches
  negativeKeywords.forEach(keyword => {
    if (content.includes(keyword)) negativeScore++;
  });
  
  positiveKeywords.forEach(keyword => {
    if (content.includes(keyword)) positiveScore++;
  });
  
  suggestionKeywords.forEach(keyword => {
    if (content.includes(keyword)) suggestionScore++;
  });
  
  // Question marks often indicate suggestions
  if (content.includes('?')) suggestionScore += 0.5;
  
  // Determine category based on highest score
  if (suggestionScore > negativeScore && suggestionScore > positiveScore) {
    return 'suggestion';
  } else if (negativeScore > positiveScore) {
    return 'negative';
  } else if (positiveScore > 0) {
    return 'positive';
  } else {
    return 'neutral';
  }
};

export default function Summary() {
  const { data: comments, isLoading } = useQuery({
    queryKey: ["/api/comments"],
  });

  const { data: currentPolicy } = useQuery({
    queryKey: ["/api/current-policy"],
  });

  // Classify comments into categories
  const categorizedComments = comments ? comments.reduce((acc: any, comment: Comment) => {
    const category = classifyComment(comment);
    
    if (category === 'negative') {
      acc.angry.push(comment);
    } else if (category === 'positive') {
      acc.positive.push(comment);
    } else if (category === 'suggestion') {
      acc.suggestions.push(comment);
    }
    
    return acc;
  }, { angry: [], positive: [], suggestions: [] }) : { angry: [], positive: [], suggestions: [] };

  if (isLoading) {
    return (
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="animate-pulse">
          <div className="h-8 bg-muted rounded w-1/3 mb-8"></div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-64 bg-muted rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground mb-2" data-testid="summary-page-title">
          AI Comment Analysis
        </h1>
        <p className="text-muted-foreground">
          Automated classification of community feedback into key sentiment categories
        </p>
      </div>

      {/* Current Policy Info */}
      {currentPolicy && (
        <Card className="mb-8">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="font-semibold text-foreground">Analysis for Policy</h2>
                <p className="text-sm text-muted-foreground">{currentPolicy.title}</p>
              </div>
              <div className="text-right">
                <p className="text-sm text-muted-foreground">Total Comments Analyzed</p>
                <p className="text-2xl font-bold text-foreground" data-testid="total-comments-analyzed">
                  {comments?.length || 0}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* AI Classification Results */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Angry Concerns */}
        <Card className="border-red-200 dark:border-red-800">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg font-semibold text-foreground flex items-center">
                <span className="text-2xl mr-2">😡</span>
                Angry Concerns
              </CardTitle>
              <Badge variant="destructive" data-testid="angry-count">
                {categorizedComments.angry.length}
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground">
              Comments expressing frustration, disagreement, or concerns
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            {categorizedComments.angry.length > 0 ? (
              <div className="max-h-96 overflow-y-auto space-y-3" data-testid="angry-comments">
                {categorizedComments.angry.map((comment: Comment, index: number) => (
                  <div key={comment.id} className="p-3 bg-red-50 dark:bg-red-950/20 rounded-lg border border-red-200 dark:border-red-800">
                    <div className="flex justify-between items-start mb-2">
                      <span className="font-medium text-sm text-foreground">{comment.author}</span>
                      <span className="text-xs text-muted-foreground">
                        {new Date(comment.createdAt!).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="text-sm text-foreground" data-testid={`angry-comment-${index}`}>
                      {comment.content}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center text-muted-foreground py-8">
                <div className="text-4xl mb-2">✨</div>
                <p className="text-sm">No angry concerns detected. Great!</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Positive Feedback */}
        <Card className="border-green-200 dark:border-green-800">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg font-semibold text-foreground flex items-center">
                <span className="text-2xl mr-2">😀</span>
                Positive Feedback
              </CardTitle>
              <Badge className="bg-green-500 text-white" data-testid="positive-count">
                {categorizedComments.positive.length}
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground">
              Comments showing support, approval, and enthusiasm
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            {categorizedComments.positive.length > 0 ? (
              <div className="max-h-96 overflow-y-auto space-y-3" data-testid="positive-comments">
                {categorizedComments.positive.map((comment: Comment, index: number) => (
                  <div key={comment.id} className="p-3 bg-green-50 dark:bg-green-950/20 rounded-lg border border-green-200 dark:border-green-800">
                    <div className="flex justify-between items-start mb-2">
                      <span className="font-medium text-sm text-foreground">{comment.author}</span>
                      <span className="text-xs text-muted-foreground">
                        {new Date(comment.createdAt!).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="text-sm text-foreground" data-testid={`positive-comment-${index}`}>
                      {comment.content}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center text-muted-foreground py-8">
                <div className="text-4xl mb-2">📢</div>
                <p className="text-sm">No positive feedback yet</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Suggestions */}
        <Card className="border-blue-200 dark:border-blue-800">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg font-semibold text-foreground flex items-center">
                <span className="text-2xl mr-2">💡</span>
                Suggestions
              </CardTitle>
              <Badge className="bg-blue-500 text-white" data-testid="suggestions-count">
                {categorizedComments.suggestions.length}
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground">
              Comments with ideas, recommendations, and improvements
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            {categorizedComments.suggestions.length > 0 ? (
              <div className="max-h-96 overflow-y-auto space-y-3" data-testid="suggestion-comments">
                {categorizedComments.suggestions.map((comment: Comment, index: number) => (
                  <div key={comment.id} className="p-3 bg-blue-50 dark:bg-blue-950/20 rounded-lg border border-blue-200 dark:border-blue-800">
                    <div className="flex justify-between items-start mb-2">
                      <span className="font-medium text-sm text-foreground">{comment.author}</span>
                      <span className="text-xs text-muted-foreground">
                        {new Date(comment.createdAt!).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="text-sm text-foreground" data-testid={`suggestion-comment-${index}`}>
                      {comment.content}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center text-muted-foreground py-8">
                <div className="text-4xl mb-2">🤔</div>
                <p className="text-sm">No suggestions detected yet</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Analysis Summary */}
      <Card className="mt-8">
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-foreground">Analysis Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 bg-muted rounded-lg">
              <div className="text-2xl font-bold text-foreground">
                {Math.round((categorizedComments.positive.length / (comments?.length || 1)) * 100)}%
              </div>
              <div className="text-sm text-muted-foreground">Positive Sentiment</div>
            </div>
            <div className="text-center p-4 bg-muted rounded-lg">
              <div className="text-2xl font-bold text-foreground">
                {Math.round((categorizedComments.angry.length / (comments?.length || 1)) * 100)}%
              </div>
              <div className="text-sm text-muted-foreground">Concerns Raised</div>
            </div>
            <div className="text-center p-4 bg-muted rounded-lg">
              <div className="text-2xl font-bold text-foreground">
                {Math.round((categorizedComments.suggestions.length / (comments?.length || 1)) * 100)}%
              </div>
              <div className="text-sm text-muted-foreground">Constructive Ideas</div>
            </div>
          </div>
          {comments && comments.length > 0 && (
            <div className="mt-4 text-center">
              <p className="text-sm text-muted-foreground">
                AI analysis powered by keyword detection and sentiment patterns.
                <br />
                This automated classification helps policymakers quickly understand community sentiment.
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}