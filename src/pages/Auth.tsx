import { useState } from "react";
import { Eye, EyeOff, Mail, Lock, User, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
export default function Auth() {
  const [isSignUp, setIsSignUp] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    firstName: "",
    lastName: ""
  });
  const navigate = useNavigate();
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // In a real app, this would handle authentication
    console.log("Auth form submitted:", formData);
    // For now, just navigate to main app
    navigate("/app");
  };
  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };
  return <div className="min-h-screen cosmic-bg flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <Button variant="ghost" size="sm" onClick={() => navigate("/")} className="absolute top-4 left-4 hover-glow">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <h1 className="text-3xl font-bold neon-text tracking-wide">METAKNYTS</h1>
          <p className="text-muted-foreground">
            {isSignUp ? "Create your account" : "Welcome back"}
          </p>
        </div>

        {/* Auth Form */}
        <Card className="glass-card p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            {isSignUp && <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">
                    First Name
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input type="text" placeholder="John" value={formData.firstName} onChange={e => handleInputChange("firstName", e.target.value)} className="pl-10 glass border-primary/20 focus:border-primary/40" required={isSignUp} />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">
                    Last Name
                  </label>
                  <Input type="text" placeholder="Doe" value={formData.lastName} onChange={e => handleInputChange("lastName", e.target.value)} className="glass border-primary/20 focus:border-primary/40" required={isSignUp} />
                </div>
              </div>}

            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">
                Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input type="email" placeholder="john@example.com" value={formData.email} onChange={e => handleInputChange("email", e.target.value)} className="pl-10 glass border-primary/20 focus:border-primary/40" required />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input type={showPassword ? "text" : "password"} placeholder="••••••••" value={formData.password} onChange={e => handleInputChange("password", e.target.value)} className="pl-10 pr-10 glass border-primary/20 focus:border-primary/40" required />
                <Button type="button" variant="ghost" size="sm" onClick={() => setShowPassword(!showPassword)} className="absolute right-1 top-1 hover:bg-transparent">
                  {showPassword ? <EyeOff className="h-4 w-4 text-muted-foreground" /> : <Eye className="h-4 w-4 text-muted-foreground" />}
                </Button>
              </div>
            </div>

            {isSignUp && <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">
                  Confirm Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input type="password" placeholder="••••••••" value={formData.confirmPassword} onChange={e => handleInputChange("confirmPassword", e.target.value)} className="pl-10 glass border-primary/20 focus:border-primary/40" required={isSignUp} />
                </div>
              </div>}

            <Button type="submit" className="w-full hover-glow">
              {isSignUp ? "Create Account" : "Sign In"}
            </Button>
          </form>

          <div className="mt-4 text-center">
            <p className="text-sm text-muted-foreground">
              {isSignUp ? "Already have an account?" : "Don't have an account?"}
              <Button variant="link" onClick={() => setIsSignUp(!isSignUp)} className="p-0 ml-1 text-primary hover:text-primary/80">
                {isSignUp ? "Sign In" : "Sign Up"}
              </Button>
            </p>
          </div>
        </Card>

        {/* Additional Info */}
        <div className="text-center space-y-3">
          <p className="text-xs text-muted-foreground">
            By continuing, you agree to our Terms of Service and Privacy Policy
          </p>
          
          {/* Social Features Preview */}
          <div className="glass rounded-lg p-4 space-y-2">
            <h3 className="text-sm font-medium text-neon-cyan">Coming Soon</h3>
            <p className="text-xs text-muted-foreground">
              • Voice AI interactions
              • Learn-to-earn rewards
              • Social content sharing
              • Personalized recommendations
            </p>
          </div>
        </div>
      </div>
    </div>;
}