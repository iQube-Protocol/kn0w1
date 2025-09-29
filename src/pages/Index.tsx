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
    title: "Qripto Media Experiences",
    description: "Advanced multimedia content delivery with immersive playback technologies"
  }, {
    icon: <Mic className="h-6 w-6" />,
    title: "Learning & Teaching Tools",
    description: "Interactive educational resources and knowledge-sharing platforms"
  }, {
    icon: <BookOpen className="h-6 w-6" />,
    title: "Commercial Services",
    description: "Business solutions and monetization opportunities for creators"
  }, {
    icon: <Users className="h-6 w-6" />,
    title: "Social Utilities",
    description: "Community engagement tools and collaborative features"
  }];
  return <div className="min-h-screen cosmic-bg overflow-hidden">
      {/* Fixed Hero Section */}
      <section className="fixed inset-0 flex items-start justify-center pt-8 p-4 z-10">
        {/* Background */}
        <div className="absolute inset-0 opacity-30" style={{
          backgroundImage: `url(${heroImage})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center'
        }} />
        
        {/* Fixed Hero Content */}
        <div className="relative text-center space-y-6 max-w-4xl mx-auto">
          <div className="space-y-4">
            <img 
              src={metakyntLogo} 
              alt="METAKNYT" 
              className="h-14 md:h-20 lg:h-24 w-auto mx-auto animate-electrify"
              style={{
                imageRendering: 'crisp-edges'
              }}
            />
            <h2 className="text-2xl md:text-4xl text-neon-magenta font-bold">QRIPTOPIA</h2>
            
            {/* Divider */}
            <div className="w-full h-px bg-gradient-to-r from-transparent via-border to-transparent mt-6" />
          </div>
        </div>
      </section>

      {/* Scrollable Overlay */}
      <div className="fixed inset-0 z-20 pointer-events-none">
        <div className="h-full overflow-y-auto pt-[35vh] pointer-events-auto">
          <div className="bg-background/10 backdrop-blur-md border-t border-border/20 min-h-[60vh]">
            <div className="p-6 space-y-8">
              {/* Quick Access Paths */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-4xl mx-auto">
                <Card className="glass-card p-6 hover-float cursor-pointer bg-background/20 backdrop-blur-sm" onClick={() => navigate("/gotv")}>
                  <div className="text-center space-y-2">
                    <Award className="h-8 w-8 text-neon-blue mx-auto" />
                    <h3 className="text-xl font-semibold">Lore of One</h3>
                    <p className="text-sm text-muted-foreground">
                      Personal narratives and individual storytelling experiences
                    </p>
                  </div>
                </Card>
                
                <Card className="glass-card p-6 hover-float cursor-pointer bg-background/20 backdrop-blur-sm" onClick={() => navigate("/l2e")}>
                  <div className="text-center space-y-2">
                    <BookOpen className="h-8 w-8 text-neon-orange mx-auto" />
                    <h3 className="text-xl font-semibold">Learn to Earn</h3>
                    <p className="text-sm text-muted-foreground">
                      Educational content with digital literacy and crypto rewards
                    </p>
                  </div>
                </Card>
              </div>

              {/* Features Section */}
              <div className="max-w-6xl mx-auto">
                <div className="text-center space-y-4 mb-12">
                  <h2 className="text-3xl font-bold text-foreground">
                    Qriptopian Services
                  </h2>
                  <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                    Comprehensive tools and services for content creation, education, and community engagement
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  {features.map((feature, index) => (
                    <Card key={index} className="glass-card p-6 hover-float bg-background/20 backdrop-blur-sm">
                      <div className="text-center space-y-4">
                        <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center mx-auto">
                          <div className="text-primary">{feature.icon}</div>
                        </div>
                        <h3 className="text-lg font-semibold">{feature.title}</h3>
                        <p className="text-sm text-muted-foreground">{feature.description}</p>
                      </div>
                    </Card>
                  ))}
                </div>
              </div>

              {/* Footer */}
              <footer className="border-t border-border/20 py-8 px-4 bg-background/10 backdrop-blur-sm">
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
            </div>
          </div>
        </div>
      </div>

      {/* Fixed Bottom Buttons */}
      <div className="fixed bottom-6 left-0 right-0 z-30 px-4">
        <div className="flex flex-col sm:flex-row gap-4 justify-center max-w-lg mx-auto">
          <Button 
            variant="outline" 
            size="lg" 
            onClick={() => navigate("/app")} 
            className="hover-glow text-lg px-8 py-3 bg-background/40 backdrop-blur-sm border-border/30"
          >
            <Play className="h-5 w-5 mr-2" />
            Explore Content
          </Button>
          <Button 
            size="lg" 
            onClick={() => navigate("/auth")} 
            className="hover-glow text-lg px-8 py-3 bg-primary/90 backdrop-blur-sm"
          >
            Get Started
          </Button>
        </div>
      </div>
    </div>;
};
export default Index;