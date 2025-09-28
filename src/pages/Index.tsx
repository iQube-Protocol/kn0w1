import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Play, BookOpen, Users, Award, Mic, Search } from "lucide-react";
import heroImage from "@/assets/hero-image.jpg";
const Index = () => {
  const navigate = useNavigate();
  const features = [{
    icon: <Play className="h-6 w-6" />,
    title: "Rich Media Experience",
    description: "Immersive video and audio content with full-screen support"
  }, {
    icon: <Mic className="h-6 w-6" />,
    title: "Voice AI Assistant",
    description: "Natural language search and voice interactions"
  }, {
    icon: <BookOpen className="h-6 w-6" />,
    title: "Learn to Earn",
    description: "Educational content with reward mechanisms"
  }, {
    icon: <Users className="h-6 w-6" />,
    title: "Social Features",
    description: "Connect with community and share content"
  }];
  return <div className="min-h-screen cosmic-bg">
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center p-4">
        {/* Background */}
        <div className="absolute inset-0 opacity-30" style={{
        backgroundImage: `url(${heroImage})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center'
      }} />
        
        {/* Content */}
        <div className="relative text-center space-y-8 max-w-4xl mx-auto">
          <div className="space-y-4">
            <h1 className="text-6xl md:text-8xl font-bold neon-text animate-pulse-neon tracking-wide">METAKNYTS</h1>
            <h2 className="text-2xl md:text-4xl font-semibold text-neon-magenta">QRIPTOOPIA</h2>
            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              I'm Kn0w1—You're Guardian Aigent and QriptoMedia guide: you hold the keys, I do the heavy lifting, and your stuff goes with you, not the platform.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" onClick={() => navigate("/app")} className="hover-glow text-lg px-8 py-3">
              <Play className="h-5 w-5 mr-2" />
              Explore Content
            </Button>
            <Button variant="outline" size="lg" onClick={() => navigate("/auth")} className="glass hover-glow text-lg px-8 py-3">
              Get Started
            </Button>
          </div>

          {/* Quick Access Paths */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-12">
            <Card className="glass-card p-6 hover-float cursor-pointer" onClick={() => navigate("/gotv")}>
              <div className="text-center space-y-2">
                <Award className="h-8 w-8 text-neon-blue mx-auto" />
                <h3 className="text-xl font-semibold">Civic Readiness</h3>
                <p className="text-sm text-muted-foreground">
                  Nonpartisan civic education and voter registration resources
                </p>
              </div>
            </Card>
            
            <Card className="glass-card p-6 hover-float cursor-pointer" onClick={() => navigate("/l2e")}>
              <div className="text-center space-y-2">
                <BookOpen className="h-8 w-8 text-neon-orange mx-auto" />
                <h3 className="text-xl font-semibold">Learn to Earn</h3>
                <p className="text-sm text-muted-foreground">
                  Educational content with digital literacy and crypto rewards
                </p>
              </div>
            </Card>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center space-y-4 mb-16">
            <h2 className="text-4xl font-bold text-foreground">
              Next-Generation Media Platform
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Experience the future of content discovery and learning with AI-powered interactions
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => <Card key={index} className="glass-card p-6 hover-float">
                <div className="text-center space-y-4">
                  <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center mx-auto">
                    <div className="text-primary">{feature.icon}</div>
                  </div>
                  <h3 className="text-lg font-semibold">{feature.title}</h3>
                  <p className="text-sm text-muted-foreground">{feature.description}</p>
                </div>
              </Card>)}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/20 py-8 px-4">
        <div className="max-w-6xl mx-auto text-center space-y-4">
          <p className="text-sm text-muted-foreground">
            © 2024 myamiKNYT. Building the future of media and education.
          </p>
          <div className="flex justify-center gap-6 text-sm">
            <button className="text-muted-foreground hover:text-primary transition-colors">
              Terms
            </button>
            <button className="text-muted-foreground hover:text-primary transition-colors">
              Privacy
            </button>
            <button className="text-muted-foreground hover:text-primary transition-colors">
              Contact
            </button>
          </div>
        </div>
      </footer>
    </div>;
};
export default Index;