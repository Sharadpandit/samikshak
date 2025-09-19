import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { type Policy } from "@shared/schema";

export default function Manage() {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [newPolicy, setNewPolicy] = useState({
    title: "",
    description: "",
    status: "draft" as const,
  });
  
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: policies, isLoading } = useQuery({
    queryKey: ["/api/policies"],
  });

  const createPolicyMutation = useMutation({
    mutationFn: async (policyData: { title: string; description: string; status: string }) => {
      const response = await apiRequest("POST", "/api/policies", policyData);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/policies"] });
      toast({
        title: "Policy created!",
        description: "Your new policy has been created successfully.",
      });
      setIsCreateDialogOpen(false);
      setNewPolicy({ title: "", description: "", status: "draft" });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to create policy. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleCreatePolicy = () => {
    if (!newPolicy.title.trim() || !newPolicy.description.trim()) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    createPolicyMutation.mutate(newPolicy);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-primary text-primary-foreground";
      case "draft":
        return "bg-yellow-100 text-yellow-800";
      case "under_review":
        return "bg-green-100 text-green-800";
      case "completed":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const formatStatus = (status: string) => {
    return status.replace("_", " ").replace(/\b\w/g, l => l.toUpperCase());
  };

  if (isLoading) {
    return (
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="animate-pulse">
          <div className="flex justify-between items-center mb-8">
            <div className="space-y-2">
              <div className="h-8 bg-muted rounded w-48"></div>
              <div className="h-4 bg-muted rounded w-64"></div>
            </div>
            <div className="h-10 bg-muted rounded w-32"></div>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-48 bg-muted rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-foreground" data-testid="manage-page-title">Manage Policies</h1>
          <p className="text-muted-foreground mt-1">Create, edit, and manage policy proposals</p>
        </div>
        
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button data-testid="button-new-policy">+ New Policy</Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>Create New Policy</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div>
                <Label htmlFor="title">Title *</Label>
                <Input
                  id="title"
                  value={newPolicy.title}
                  onChange={(e) => setNewPolicy({ ...newPolicy, title: e.target.value })}
                  placeholder="Enter policy title"
                  data-testid="input-policy-title"
                />
              </div>
              <div>
                <Label htmlFor="description">Description *</Label>
                <Textarea
                  id="description"
                  value={newPolicy.description}
                  onChange={(e) => setNewPolicy({ ...newPolicy, description: e.target.value })}
                  placeholder="Enter policy description"
                  rows={4}
                  data-testid="textarea-policy-description"
                />
              </div>
              <div>
                <Label htmlFor="status">Status</Label>
                <Select
                  value={newPolicy.status}
                  onValueChange={(value) => setNewPolicy({ ...newPolicy, status: value as any })}
                >
                  <SelectTrigger data-testid="select-policy-status">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="draft">Draft</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="under_review">Under Review</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex justify-end space-x-3 pt-4">
                <Button 
                  variant="outline" 
                  onClick={() => setIsCreateDialogOpen(false)}
                  data-testid="button-cancel-create"
                >
                  Cancel
                </Button>
                <Button 
                  onClick={handleCreatePolicy}
                  disabled={createPolicyMutation.isPending}
                  data-testid="button-create-policy"
                >
                  {createPolicyMutation.isPending ? "Creating..." : "Create Policy"}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Policy Management Grid */}
      {policies && policies.length > 0 ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {policies.map((policy: Policy) => (
            <Card key={policy.id} className="policy-card shadow-sm" data-testid={`manage-policy-card-${policy.id}`}>
              <CardContent className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <h3 className="font-semibold text-foreground leading-tight" data-testid={`manage-policy-title-${policy.id}`}>
                    {policy.title}
                  </h3>
                  <Badge className={getStatusColor(policy.status)}>
                    {formatStatus(policy.status)}
                  </Badge>
                </div>
                <p className="text-muted-foreground text-sm mb-4 line-clamp-3" data-testid={`manage-policy-description-${policy.id}`}>
                  {policy.description}
                </p>
                
                {/* Future: Add vote stats display here */}
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div className="text-center p-2 bg-muted rounded">
                    <div className="text-lg font-semibold text-foreground">-</div>
                    <div className="text-xs text-muted-foreground">Total Votes</div>
                  </div>
                  <div className="text-center p-2 bg-muted rounded">
                    <div className="text-lg font-semibold text-foreground">-</div>
                    <div className="text-xs text-muted-foreground">Engagement</div>
                  </div>
                </div>
                
                <div className="flex space-x-2">
                  <Button 
                    variant="secondary" 
                    size="sm" 
                    className="flex-1"
                    data-testid={`button-edit-policy-${policy.id}`}
                  >
                    Edit
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="flex-1"
                    data-testid={`button-view-details-${policy.id}`}
                  >
                    Details
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="pt-6 text-center">
            <h2 className="text-xl font-semibold text-foreground mb-4">No Policies Yet</h2>
            <p className="text-muted-foreground mb-6">Get started by creating your first policy proposal.</p>
            <Button onClick={() => setIsCreateDialogOpen(true)} data-testid="button-create-first-policy">
              Create Your First Policy
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
