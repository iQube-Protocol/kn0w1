import { useState, useEffect } from "react";
import { Eye, EyeOff, Mail, Lock, User, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { z } from "zod";
// Validation schemas
const signInSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters")
});

const signUpSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  confirmPassword: z.string(),
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required")
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"]
});

export default function Auth() {
  const [isSignUp, setIsSignUp] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    firstName: "",
    lastName: ""
  });
  
  const navigate = useNavigate();
  const { user, isAdmin, loading: authLoading } = useAuth();
  const { toast } = useToast();

  // Redirect if already authenticated - all users go to /app (consumer site)
  useEffect(() => {
    if (user && !authLoading) {
      setTimeout(() => {
        navigate("/app");
      }, 50);
    }
  }, [user, authLoading, navigate]);
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isSignUp) {
        // Validate sign-up form
        const validation = signUpSchema.safeParse(formData);
        if (!validation.success) {
          const error = validation.error.issues[0];
          toast({
            title: "Validation Error",
            description: error.message,
            variant: "destructive"
          });
          return;
        }

        // Sign up with Supabase
        const { error, data } = await supabase.auth.signUp({
          email: formData.email,
          password: formData.password,
          options: {
            emailRedirectTo: `${window.location.origin}/`,
            data: {
              first_name: formData.firstName,
              last_name: formData.lastName
            }
          }
        });

        if (error) {
          toast({
            title: "Sign Up Failed",
            description: error.message,
            variant: "destructive"
          });
          return;
        }

        if (data.user && !data.session) {
          toast({
            title: "Check Your Email",
            description: "We've sent you a confirmation link. Please check your email to complete registration.",
            variant: "default"
          });
        } else if (data.session) {
          toast({
            title: "Welcome!",
            description: "Account created successfully.",
            variant: "default"
          });
        }
      } else {
        // Validate sign-in form
        const validation = signInSchema.safeParse(formData);
        if (!validation.success) {
          const error = validation.error.issues[0];
          toast({
            title: "Validation Error",
            description: error.message,
            variant: "destructive"
          });
          return;
        }

        // Sign in with Supabase
        const { error } = await supabase.auth.signInWithPassword({
          email: formData.email,
          password: formData.password
        });

        if (error) {
          if (error.message.includes("Invalid login credentials")) {
            toast({
              title: "Sign In Failed",
              description: "Invalid email or password. Please try again.",
              variant: "destructive"
            });
          } else {
            toast({
              title: "Sign In Failed",
              description: error.message,
              variant: "destructive"
            });
          }
          return;
        }

        toast({
          title: "Welcome Back!",
          description: "Successfully signed in.",
          variant: "default"
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
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

            <Button type="submit" className="w-full hover-glow" disabled={loading}>
              {loading ? (isSignUp ? "Creating Account..." : "Signing In...") : (isSignUp ? "Create Account" : "Sign In")}
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