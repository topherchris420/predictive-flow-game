import { GameCanvas } from '@/components/GameCanvas';

const Index = () => {
  return (
    <div className="relative w-screen h-screen overflow-hidden bg-background">
      {/* Main Game Canvas */}
      <GameCanvas />
      
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
