import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PolicyCard } from "@/components/policy/policy-card";
import { type Policy } from "@shared/schema";
import { Link } from "wouter";

export default function Dashboard() {
  const { data: currentPolicy, isLoading: isLoadingPolicy } = useQuery({
    queryKey: ["/api/current-policy"],
  });

  const { data: policies, isLoading: isLoadingPolicies } = useQuery({
    queryKey: ["/api/policies"],
  });

  const { data: voteStats, isLoading: isLoadingStats } = useQuery({
    queryKey: ["/api/policies", currentPolicy?.id, "stats"],
    enabled: !!currentPolicy?.id,
  });

  const otherPolicies = policies?.filter((p: Policy) => p.id !== currentPolicy?.id) || [];

  const voteConfig = [
    { type: "happy", emoji: "😀", label: "Happy" },
    { type: "angry", emoji: "😡", label: "Angry" },
    { type: "neutral", emoji: "😐", label: "Neutral" },
    { type: "suggestion", emoji: "💡", label: "Suggestions" },
  ];

  const parseDetails = (details: string) => {
    try {
      return JSON.parse(details || "{}");
    } catch {
      return {};
    }
  };

  if (isLoadingPolicy) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="animate-pulse">
          <div className="h-8 bg-muted rounded w-1/3 mb-6"></div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
              <div className="h-64 bg-muted rounded-lg"></div>
            </div>
            <div className="h-96 bg-muted rounded-lg"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!currentPolicy) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Card>
          <CardContent className="pt-6 text-center">
            <h1 className="text-2xl font-semibold text-foreground mb-4">No Active Policy</h1>
            <p className="text-muted-foreground mb-6">There are currently no active policies to display.</p>
            <Link href="/manage">
              <Button data-testid="button-manage-policies">Manage Policies</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  const policyDetails = parseDetails(currentPolicy.details);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content Area */}
        <div className="lg:col-span-2 space-y-6">
          {/* Current Policy Header */}
          <Card className="shadow-sm">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h1 className="text-2xl font-semibold text-foreground" data-testid="current-policy-title">
                  {currentPolicy.title}
                </h1>
                <Badge className="bg-primary text-primary-foreground">
                  Active Policy
                </Badge>
              </div>
              <p className="text-muted-foreground mb-6" data-testid="current-policy-description">
                {currentPolicy.description}
              </p>
              
              {/* Voting Summary */}
              {!isLoadingStats && voteStats && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                  {voteConfig.map((config) => (
                    <div key={config.type} className="text-center p-4 bg-muted rounded-lg">
                      <div className="text-2xl mb-1">{config.emoji}</div>
                      <div 
                        className="text-lg font-semibold text-foreground"
                        data-testid={`dashboard-vote-count-${config.type}`}
                      >
                        {voteStats.stats[config.type as keyof typeof voteStats.stats]}
                      </div>
                      <div className="text-xs text-muted-foreground">{config.label}</div>
                    </div>
                  ))}
                </div>
              )}

              <Link href="/voting">
                <Button 
                  className="w-full" 
                  size="lg"
                  data-testid="button-cast-vote"
                >
                  Cast Your Vote
                </Button>
              </Link>
            </CardContent>
          </Card>

          {/* Policy Details */}
          <Card className="shadow-sm">
            <CardContent className="p-6">
              <h2 className="text-xl font-semibold text-foreground mb-4">Policy Details</h2>
              <div className="space-y-4">
                {policyDetails.objectives && (
                  <div>
                    <h3 className="font-medium text-foreground mb-2">Key Objectives</h3>
                    <ul className="text-muted-foreground space-y-1 ml-4">
                      {policyDetails.objectives.map((objective: string, index: number) => (
                        <li key={index} data-testid={`objective-${index}`}>• {objective}</li>
                      ))}
                    </ul>
                  </div>
                )}
                {policyDetails.timeline && (
                  <div>
                    <h3 className="font-medium text-foreground mb-2">Timeline</h3>
                    <p className="text-muted-foreground" data-testid="policy-timeline">{policyDetails.timeline}</p>
                  </div>
                )}
                {policyDetails.budget && (
                  <div>
                    <h3 className="font-medium text-foreground mb-2">Budget Allocation</h3>
                    <p className="text-muted-foreground" data-testid="policy-budget">{policyDetails.budget}</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Auto-scrolling Right Sidebar */}
        <div className="lg:col-span-1">
          <Card className="shadow-sm">
            <CardContent className="p-6">
              <h2 className="text-lg font-semibold text-foreground mb-4">Other Policies</h2>
              {isLoadingPolicies ? (
                <div className="space-y-4">
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="h-20 bg-muted rounded-lg animate-pulse"></div>
                  ))}
                </div>
              ) : otherPolicies.length > 0 ? (
                <div className="h-96 overflow-hidden">
                  <div className="animate-scroll space-y-4" data-testid="policies-scroll-container">
                    {[...otherPolicies, ...otherPolicies].map((policy: Policy, index: number) => (
                      <div key={`${policy.id}-${index}`} className="bg-muted rounded-lg p-4 cursor-pointer hover:bg-accent transition-colors">
                        <h3 className="font-medium text-foreground mb-2 text-sm">{policy.title}</h3>
                        <p className="text-xs text-muted-foreground mb-3 line-clamp-2">
                          {policy.description}
                        </p>
                        <div className="flex justify-between text-xs text-muted-foreground">
                          <span>View details</span>
                          <span className="capitalize">{policy.status.replace("_", " ")}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <p className="text-muted-foreground text-sm">No other policies available.</p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
