import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { VoteOption } from "@/components/voting/vote-option";
import { LiveResults } from "@/components/voting/live-results";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts";

const voteOptions = [
  { voteType: "happy", emoji: "😀", label: "Happy", description: "This makes me optimistic" },
  { voteType: "angry", emoji: "😡", label: "Angry", description: "This concerns me" },
  { voteType: "neutral", emoji: "😐", label: "Neutral", description: "I'm undecided" },
  { voteType: "suggestion", emoji: "💡", label: "Suggestion", description: "I have ideas" },
];

export default function Voting() {
  const [selectedVote, setSelectedVote] = useState<string | null>(null);
  const [comment, setComment] = useState("");
  const [showCommentBox, setShowCommentBox] = useState(false);
  const [newComment, setNewComment] = useState("");
  const [authorName, setAuthorName] = useState("");
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: currentPolicy, isLoading: isLoadingPolicy } = useQuery({
    queryKey: ["/api/current-policy"],
  });

  const { data: voteStats, isLoading: isLoadingStats } = useQuery({
    queryKey: ["/api/policies", currentPolicy?.id, "stats"],
    enabled: !!currentPolicy?.id,
  });

  const { data: comments, isLoading: isLoadingComments } = useQuery({
    queryKey: ["/api/policies", currentPolicy?.id, "comments"],
    enabled: !!currentPolicy?.id,
  });

  const submitVoteMutation = useMutation({
    mutationFn: async (voteData: { policyId: string; voteType: string; comment?: string }) => {
      const response = await apiRequest("POST", "/api/votes", voteData);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/policies", currentPolicy?.id, "stats"] });
      toast({
        title: "Vote submitted!",
        description: "Thank you for your feedback.",
      });
      setSelectedVote(null);
      setComment("");
      setShowCommentBox(false);
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: "Failed to submit vote. Please try again.",
        variant: "destructive",
      });
    },
  });

  const submitCommentMutation = useMutation({
    mutationFn: async (commentData: { policyId: string; content: string; author?: string }) => {
      const response = await apiRequest("POST", "/api/comments", commentData);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/policies", currentPolicy?.id, "comments"] });
      toast({
        title: "Comment submitted!",
        description: "Thank you for sharing your thoughts.",
      });
      setNewComment("");
      setAuthorName("");
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to submit comment. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleVoteSelection = (voteType: string) => {
    setSelectedVote(voteType);
    setShowCommentBox(true);
  };

  const handleSubmitVote = () => {
    if (!selectedVote || !currentPolicy) return;

    submitVoteMutation.mutate({
      policyId: currentPolicy.id,
      voteType: selectedVote,
      comment: comment.trim() || undefined,
    });
  };

  const handleCancelVote = () => {
    setSelectedVote(null);
    setComment("");
    setShowCommentBox(false);
  };

  const handleSubmitComment = () => {
    if (!newComment.trim() || !currentPolicy) return;

    submitCommentMutation.mutate({
      policyId: currentPolicy.id,
      content: newComment.trim(),
      author: authorName.trim() || "Anonymous",
    });
  };

  if (isLoadingPolicy) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="animate-pulse space-y-8">
          <div className="text-center">
            <div className="h-8 bg-muted rounded w-1/3 mx-auto mb-2"></div>
            <div className="h-4 bg-muted rounded w-1/2 mx-auto"></div>
          </div>
          <div className="h-64 bg-muted rounded-lg"></div>
        </div>
      </div>
    );
  }

  if (!currentPolicy) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Card>
          <CardContent className="pt-6 text-center">
            <h1 className="text-2xl font-semibold text-foreground mb-4">No Active Policy</h1>
            <p className="text-muted-foreground">There are currently no active policies to vote on.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-foreground mb-2" data-testid="voting-page-title">Cast Your Vote</h1>
        <p className="text-muted-foreground">Share your emotional response to the current policy</p>
      </div>

      {/* Policy Summary Card */}
      <Card className="shadow-sm mb-8">
        <CardContent className="p-6">
          <h2 className="text-xl font-semibold text-foreground mb-3" data-testid="voting-policy-title">
            {currentPolicy.title}
          </h2>
          <p className="text-muted-foreground" data-testid="voting-policy-description">
            {currentPolicy.description}
          </p>
        </CardContent>
      </Card>

      {/* Voting Interface */}
      <Card className="shadow-sm mb-8">
        <CardContent className="p-8">
          <h3 className="text-lg font-semibold text-foreground mb-6 text-center">
            How does this policy make you feel?
          </h3>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
            {voteOptions.map((option) => (
              <VoteOption
                key={option.voteType}
                {...option}
                isSelected={selectedVote === option.voteType}
                onClick={handleVoteSelection}
              />
            ))}
          </div>

          {/* Comment Section */}
          {showCommentBox && (
            <div data-testid="comment-section">
              <Label className="block text-sm font-medium text-foreground mb-2">
                Share your thoughts (optional)
              </Label>
              <Textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                className="resize-none"
                rows={4}
                placeholder="Tell us more about your perspective..."
                data-testid="comment-textarea"
              />
              <div className="flex justify-end space-x-3 mt-4">
                <Button 
                  variant="ghost" 
                  onClick={handleCancelVote}
                  data-testid="button-cancel-vote"
                >
                  Cancel
                </Button>
                <Button 
                  onClick={handleSubmitVote}
                  disabled={submitVoteMutation.isPending}
                  data-testid="button-submit-vote"
                >
                  {submitVoteMutation.isPending ? "Submitting..." : "Submit Vote"}
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Live Results and Pie Chart */}
      {!isLoadingStats && voteStats && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <LiveResults voteStats={voteStats} />
          
          {/* Pie Chart */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg font-semibold text-foreground">Vote Distribution</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-80" data-testid="vote-pie-chart">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={[
                        { name: "😀 Happy", value: voteStats.stats.happy, color: "#3b82f6" },
                        { name: "😡 Angry", value: voteStats.stats.angry, color: "#ef4444" },
                        { name: "😐 Neutral", value: voteStats.stats.neutral, color: "#6b7280" },
                        { name: "💡 Suggestions", value: voteStats.stats.suggestion, color: "#eab308" },
                      ]}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => 
                        percent > 0 ? `${name} ${(percent * 100).toFixed(0)}%` : null
                      }
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {[
                        { name: "😀 Happy", value: voteStats.stats.happy, color: "#3b82f6" },
                        { name: "😡 Angry", value: voteStats.stats.angry, color: "#ef4444" },
                        { name: "😐 Neutral", value: voteStats.stats.neutral, color: "#6b7280" },
                        { name: "💡 Suggestions", value: voteStats.stats.suggestion, color: "#eab308" },
                      ].map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip 
                      formatter={(value: any, name: any) => [value, name]}
                      labelStyle={{ color: '#333' }}
                    />
                    <Legend 
                      verticalAlign="bottom" 
                      height={36}
                      iconType="circle"
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              {voteStats.total === 0 && (
                <div className="text-center text-muted-foreground py-8">
                  No votes yet. Be the first to cast your vote!
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {/* Comments Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-8">
        {/* Add Comment */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-foreground">Share Your Thoughts</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label className="block text-sm font-medium text-foreground mb-2">
                Your Name (optional)
              </Label>
              <input
                type="text"
                value={authorName}
                onChange={(e) => setAuthorName(e.target.value)}
                className="w-full px-3 py-2 border border-input rounded-md bg-background text-foreground"
                placeholder="Anonymous"
                data-testid="input-author-name"
              />
            </div>
            <div>
              <Label className="block text-sm font-medium text-foreground mb-2">
                Your Comment
              </Label>
              <Textarea
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                className="resize-none"
                rows={4}
                placeholder="Share your detailed thoughts on this policy..."
                data-testid="textarea-new-comment"
              />
            </div>
            <Button 
              onClick={handleSubmitComment}
              disabled={!newComment.trim() || submitCommentMutation.isPending}
              className="w-full"
              data-testid="button-submit-comment"
            >
              {submitCommentMutation.isPending ? "Submitting..." : "Submit Comment"}
            </Button>
          </CardContent>
        </Card>

        {/* Comments Display */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-foreground">Community Comments</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoadingComments ? (
              <div className="space-y-4">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="animate-pulse">
                    <div className="h-4 bg-muted rounded w-1/4 mb-2"></div>
                    <div className="h-16 bg-muted rounded"></div>
                  </div>
                ))}
              </div>
            ) : comments && comments.length > 0 ? (
              <div className="space-y-4 max-h-96 overflow-y-auto" data-testid="comments-list">
                {comments.map((comment: any, index: number) => (
                  <div key={comment.id} className="border-b border-border pb-4 last:border-b-0">
                    <div className="flex justify-between items-start mb-2">
                      <span className="font-medium text-foreground text-sm">{comment.author}</span>
                      <span className="text-xs text-muted-foreground">
                        {new Date(comment.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="text-muted-foreground text-sm" data-testid={`comment-content-${index}`}>
                      {comment.content}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center text-muted-foreground py-8">
                <div className="text-4xl mb-2">💬</div>
                <p className="text-sm">No comments yet. Be the first to share your thoughts!</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
