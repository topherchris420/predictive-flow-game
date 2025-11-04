import { GameCanvas } from '@/components/GameCanvas';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Clock } from 'lucide-react';

const Index = () => {
  return (
    <div className="relative w-screen h-screen overflow-hidden bg-background">
      {/* Main Game Canvas */}
      <GameCanvas />
      
      {/* Time Code Calculator Link */}
      <Link to="/timecode" className="absolute top-4 md:top-8 right-4 md:right-8">
        <Button variant="outline" size="sm" className="gap-2 bg-background/50 backdrop-blur-sm border-primary/30 hover:bg-primary/20">
          <Clock className="w-4 h-4" />
          <span className="hidden sm:inline">Time Code</span>
        </Button>
      </Link>
      
      {/* Vers3Dynamics Branding */}
      <div className="absolute bottom-4 md:bottom-8 right-4 md:right-8 text-right">
        <div className="text-xs md:text-sm text-muted-foreground tracking-wider">VERS3DYNAMICS</div>
        <div className="text-[10px] md:text-xs text-muted-foreground/50">PREDICTIVE ANTICIPATORY ACTIVITY</div>
      </div>
      
      {/* Tagline */}
      <div className="absolute bottom-4 md:bottom-8 left-4 md:left-8">
        <div className="text-sm md:text-lg font-light text-foreground/60 tracking-wide">
          Don't react. <span className="text-primary">Anticipate.</span>
        </div>
      </div>
    </div>
  );
};

export default Index;
