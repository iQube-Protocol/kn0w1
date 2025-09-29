import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Play, BookOpen, Users, Award, Mic, Search } from "lucide-react";
import heroImage from "@/assets/hero-image.jpg";
import metakyntLogo from "@/assets/metaknyt-script.png";
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
  return <div className="min-h-screen cosmic-bg relative overflow-hidden">
      {/* Fixed Hero Section */}
      <section className="fixed inset-0 flex items-center justify-center p-4 z-10">
        {/* Background */}
        <div className="absolute inset-0 opacity-30" style={{
        backgroundImage: `url(${heroImage})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center'
      }} />
        
        {/* Fixed Hero Content */}
        <div className="relative text-center space-y-8 max-w-4xl mx-auto">
          <div className="space-y-4">
            <img 
              src={metakyntLogo} 
              alt="METAKNYT" 
              className="h-16 md:h-24 lg:h-28 w-auto mx-auto animate-electrify"
              style={{
                imageRendering: 'crisp-edges'
              }}
            />
            <h2 className="text-3xl md:text-5xl text-neon-magenta font-bold">QRIPTOPIA</h2>
            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              Welcome to Qriptopia. Would you like to explore or get started?
            </p>
            {/* Divider under QRIPTOPIA */}
            <div className="w-full max-w-md mx-auto mt-8 mb-4">
              <div className="h-px bg-gradient-to-r from-transparent via-border to-transparent"></div>
            </div>
          </div>
        </div>
      </section>

      {/* Scrollable Overlay Content */}
      <div className="absolute inset-0 z-20 pointer-events-none">
        <div className="h-full overflow-y-auto pointer-events-auto pt-[60vh]">
          <div className="bg-background/95 backdrop-blur-md border-t border-border/20 min-h-[50vh] p-6">
            {/* Sub Menu Items */}
            <div className="max-w-6xl mx-auto space-y-8">
              {/* Quick Access Paths */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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

              {/* Feature Cards */}
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

              {/* Footer Content */}
              <div className="border-t border-border/20 pt-8 text-center space-y-4">
                <p className="text-sm text-muted-foreground">
                  © 2024 myamiKNYT. Building the future of media and education.
                </p>
                <div className="flex justify-center gap-6 text-sm pb-24">
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
            </div>
          </div>
        </div>
      </div>

      {/* Fixed Bottom Buttons */}
      <div className="fixed bottom-0 left-0 right-0 z-30 p-4 bg-background/95 backdrop-blur-md border-t border-border/20">
        <div className="flex flex-col sm:flex-row gap-4 justify-center max-w-md mx-auto">
          <Button size="lg" onClick={() => navigate("/app")} className="hover-glow text-lg px-8 py-3 flex-1">
            <Play className="h-5 w-5 mr-2" />
            Explore Content
          </Button>
          <Button variant="outline" size="lg" onClick={() => navigate("/auth")} className="glass hover-glow text-lg px-8 py-3 flex-1">
            Get Started
          </Button>
        </div>
      </div>
    </div>;
};
export default Index;