import { GameCanvas } from '@/components/GameCanvas';

const Index = () => {
  return (
    <div className="relative w-screen h-screen overflow-hidden bg-background">
      {/* Main Game Canvas */}
      <GameCanvas />
      
      {/* Vers3Dynamics Branding */}
      <div className="absolute bottom-8 right-8 text-right">
        <div className="text-sm text-muted-foreground tracking-wider">VERS3DYNAMICS</div>
        <div className="text-xs text-muted-foreground/50">PREDICTIVE ANTICIPATORY ACTIVITY</div>
      </div>
      
      {/* Tagline */}
      <div className="absolute bottom-8 left-8">
        <div className="text-lg font-light text-foreground/60 tracking-wide">
          Don't react. <span className="text-primary">Anticipate.</span>
        </div>
      </div>
    </div>
  );
};

export default Index;
