import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { 
  Target, 
  PlusCircle, 
  Calendar,
  DollarSign,
  TrendingUp,
  Home,
  Car,
  Plane,
  GraduationCap
} from "lucide-react";

const goalIcons = {
  emergency: Home,
  vacation: Plane,
  car: Car,
  education: GraduationCap,
  investment: TrendingUp,
};

const mockGoals = [
  {
    id: 1,
    name: "Emergency Fund",
    target: 10000,
    current: 7300,
    deadline: "2024-12-31",
    category: "emergency",
    priority: "high"
  },
  {
    id: 2,
    name: "Summer Vacation",
    target: 5000,
    current: 2100,
    deadline: "2024-06-15",
    category: "vacation",
    priority: "medium"
  },
  {
    id: 3,
    name: "New Car",
    target: 25000,
    current: 8500,
    deadline: "2025-03-01",
    category: "car",
    priority: "low"
  },
];

export default function Goals() {
  const [showAddForm, setShowAddForm] = useState(false);
  const [newGoal, setNewGoal] = useState({
    name: "",
    target: "",
    deadline: "",
    category: "emergency"
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("New goal:", newGoal);
    setNewGoal({ name: "", target: "", deadline: "", category: "emergency" });
    setShowAddForm(false);
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high": return "bg-destructive text-destructive-foreground";
      case "medium": return "bg-warning text-warning-foreground";
      case "low": return "bg-success text-success-foreground";
      default: return "bg-muted text-muted-foreground";
    }
  };

  const getProgressColor = (percentage: number) => {
    if (percentage >= 75) return "text-success";
    if (percentage >= 50) return "text-warning";
    return "text-destructive";
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Financial Goals</h1>
          <p className="text-muted-foreground mt-2">
            Set and track your savings goals to achieve your dreams.
          </p>
        </div>
        <Button 
          onClick={() => setShowAddForm(!showAddForm)}
          className="bg-primary shadow-primary hover:shadow-elevated"
        >
          <PlusCircle className="h-4 w-4 mr-2" />
          Add Goal
        </Button>
      </div>

      {/* Add Goal Form */}
      {showAddForm && (
        <Card className="shadow-elevated">
          <CardHeader>
            <CardTitle>Create New Goal</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="grid gap-6 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="goalName">Goal Name</Label>
                <Input
                  id="goalName"
                  placeholder="e.g., Emergency Fund"
                  value={newGoal.name}
                  onChange={(e) => setNewGoal({...newGoal, name: e.target.value})}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="target">Target Amount</Label>
                <Input
                  id="target"
                  type="number"
                  placeholder="10000"
                  value={newGoal.target}
                  onChange={(e) => setNewGoal({...newGoal, target: e.target.value})}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="deadline">Target Date</Label>
                <Input
                  id="deadline"
                  type="date"
                  value={newGoal.deadline}
                  onChange={(e) => setNewGoal({...newGoal, deadline: e.target.value})}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="category">Category</Label>
                <select 
                  id="category"
                  className="w-full p-2 border rounded-md"
                  value={newGoal.category}
                  onChange={(e) => setNewGoal({...newGoal, category: e.target.value})}
                >
                  <option value="emergency">Emergency Fund</option>
                  <option value="vacation">Vacation</option>
                  <option value="car">Vehicle</option>
                  <option value="education">Education</option>
                  <option value="investment">Investment</option>
                </select>
              </div>

              <div className="md:col-span-2 flex gap-4">
                <Button type="submit" className="bg-primary">
                  Create Goal
                </Button>
                <Button type="button" variant="outline" onClick={() => setShowAddForm(false)}>
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Goals Overview */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {mockGoals.map((goal) => {
          const IconComponent = goalIcons[goal.category as keyof typeof goalIcons];
          const percentage = (goal.current / goal.target) * 100;
          const remaining = goal.target - goal.current;
          
          return (
            <Card key={goal.id} className="shadow-card hover:shadow-elevated transition-shadow">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <IconComponent className="h-5 w-5 text-primary" />
                    <CardTitle className="text-lg">{goal.name}</CardTitle>
                  </div>
                  <Badge className={getPriorityColor(goal.priority)}>
                    {goal.priority}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Progress</span>
                    <span className={`font-medium ${getProgressColor(percentage)}`}>
                      {Math.round(percentage)}%
                    </span>
                  </div>
                  <Progress value={percentage} className="h-3" />
                </div>

                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground">Current</p>
                    <p className="font-semibold text-success">
                      ${goal.current.toLocaleString()}
                    </p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Target</p>
                    <p className="font-semibold">
                      ${goal.target.toLocaleString()}
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center text-muted-foreground">
                    <Calendar className="h-4 w-4 mr-1" />
                    {new Date(goal.deadline).toLocaleDateString()}
                  </div>
                  <div className="text-muted-foreground">
                    ${remaining.toLocaleString()} to go
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button size="sm" className="flex-1">
                    <DollarSign className="h-3 w-3 mr-1" />
                    Add Money
                  </Button>
                  <Button size="sm" variant="outline">
                    Edit
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Goals Summary */}
      <Card className="shadow-card">
        <CardHeader>
          <CardTitle>Goals Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-6 md:grid-cols-3">
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">
                {mockGoals.length}
              </div>
              <p className="text-sm text-muted-foreground">Active Goals</p>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-success">
                ${mockGoals.reduce((acc, goal) => acc + goal.current, 0).toLocaleString()}
              </div>
              <p className="text-sm text-muted-foreground">Total Saved</p>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-warning">
                ${mockGoals.reduce((acc, goal) => acc + goal.target, 0).toLocaleString()}
              </div>
              <p className="text-sm text-muted-foreground">Total Target</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}