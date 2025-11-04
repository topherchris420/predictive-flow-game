import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card } from '@/components/ui/card';
import { SpiralVisualization } from '@/components/timecode/SpiralVisualization';
import { MeaningPanel } from '@/components/timecode/MeaningPanel';
import { format } from 'date-fns';

interface ResonantDate {
  cycleNumber: number;
  date: Date;
  cycleLength: string;
  isPast: boolean;
}

const cycleTypes = {
  year: { value: 1, unit: 'year', name: '1 Year Cycle' },
  fiveYear: { value: 5, unit: 'year', name: '5 Year Cycle' },
  mayan: { value: 5125, unit: 'year', name: 'Mayan Long Count (5,125 years)' },
  fibonacci8: { value: 8, unit: 'year', name: 'Fibonacci 8 Year' },
  fibonacci13: { value: 13, unit: 'year', name: 'Fibonacci 13 Year' },
  fibonacci21: { value: 21, unit: 'year', name: 'Fibonacci 21 Year' },
  golden: { value: 1.618, unit: 'year', name: 'Golden Ratio Multiplier' },
  lunar: { value: 19, unit: 'year', name: 'Metonic Cycle (19 years)' },
};

export default function TimeCodeCalculator() {
  const [seedDate, setSeedDate] = useState<string>('');
  const [cycleType, setCycleType] = useState<string>('year');
  const [resonantDates, setResonantDates] = useState<ResonantDate[]>([]);
  const [showResults, setShowResults] = useState(false);

  const calculateResonantDates = () => {
    if (!seedDate) return;

    const seed = new Date(seedDate);
    const cycle = cycleTypes[cycleType as keyof typeof cycleTypes];
    const results: ResonantDate[] = [];
    const now = new Date();

    // Calculate past cycles (3 cycles back)
    for (let i = -3; i <= 0; i++) {
      if (i === 0) continue;
      const yearsOffset = cycle.value * i;
      const resonantDate = new Date(seed);
      resonantDate.setFullYear(seed.getFullYear() + yearsOffset);
      
      results.push({
        cycleNumber: i,
        date: resonantDate,
        cycleLength: `${Math.abs(i)} × ${cycle.name}`,
        isPast: true,
      });
    }

    // Add seed date
    results.push({
      cycleNumber: 0,
      date: seed,
      cycleLength: 'Seed Event',
      isPast: seed < now,
    });

    // Calculate future cycles (5 cycles forward)
    for (let i = 1; i <= 5; i++) {
      const yearsOffset = cycle.value * i;
      const resonantDate = new Date(seed);
      resonantDate.setFullYear(seed.getFullYear() + yearsOffset);
      
      results.push({
        cycleNumber: i,
        date: resonantDate,
        cycleLength: `${i} × ${cycle.name}`,
        isPast: resonantDate < now,
      });
    }

    setResonantDates(results);
    setShowResults(true);
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <header className="border-b border-border/20 backdrop-blur-sm bg-background/50 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link to="/">
            <Button variant="ghost" size="sm" className="gap-2">
              <ArrowLeft className="w-4 h-4" />
              Back to Game
            </Button>
          </Link>
          <div className="text-center">
            <h1 className="text-xl md:text-2xl font-light tracking-wider text-primary glow-cyan">
              TIME CODE CALCULATOR
            </h1>
            <p className="text-xs text-muted-foreground">Explore Cyclical Time Patterns</p>
          </div>
          <div className="w-24" /> {/* Spacer for centering */}
        </div>
      </header>

      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Input Section */}
        <Card className="p-6 md:p-8 mb-8 bg-card/50 backdrop-blur-sm border-primary/20">
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium mb-2 text-primary">
                Seed Event Date
              </label>
              <Input
                type="date"
                value={seedDate}
                onChange={(e) => setSeedDate(e.target.value)}
                className="bg-background/50 border-primary/30"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Enter a significant date (birthday, historical event, etc.)
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2 text-primary">
                Cycle Type
              </label>
              <Select value={cycleType} onValueChange={setCycleType}>
                <SelectTrigger className="bg-background/50 border-primary/30">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(cycleTypes).map(([key, cycle]) => (
                    <SelectItem key={key} value={key}>
                      {cycle.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground mt-1">
                Choose a fractal time interval for resonance calculations
              </p>
            </div>

            <Button 
              onClick={calculateResonantDates}
              className="w-full bg-primary hover:bg-primary/90 glow-cyan"
              disabled={!seedDate}
            >
              Calculate Resonant Dates
            </Button>
          </div>
        </Card>

        {/* Results Section */}
        {showResults && (
          <div className="grid md:grid-cols-2 gap-8">
            {/* Visualization */}
            <div>
              <h2 className="text-lg font-light mb-4 text-primary">Temporal Spiral</h2>
              <SpiralVisualization resonantDates={resonantDates} seedDate={new Date(seedDate)} />
            </div>

            {/* Dates List */}
            <div>
              <h2 className="text-lg font-light mb-4 text-primary">Resonant Points</h2>
              <div className="space-y-3 max-h-[500px] overflow-y-auto pr-2">
                {resonantDates.map((rd, idx) => (
                  <Card 
                    key={idx}
                    className={`p-4 ${
                      rd.cycleNumber === 0 
                        ? 'border-primary bg-primary/10 glow-cyan' 
                        : rd.isPast 
                        ? 'border-muted bg-card/30' 
                        : 'border-primary/50 bg-card/50'
                    }`}
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="text-sm font-medium text-foreground">
                          {format(rd.date, 'MMMM dd, yyyy')}
                        </div>
                        <div className="text-xs text-muted-foreground mt-1">
                          {rd.cycleLength}
                        </div>
                      </div>
                      <div className={`text-xs px-2 py-1 rounded ${
                        rd.cycleNumber === 0 
                          ? 'bg-primary text-primary-foreground' 
                          : rd.isPast 
                          ? 'bg-muted text-muted-foreground' 
                          : 'bg-primary/20 text-primary'
                      }`}>
                        {rd.cycleNumber === 0 ? 'Seed' : rd.isPast ? 'Past' : 'Future'}
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Meaning Panel */}
        {showResults && (
          <div className="mt-8">
            <MeaningPanel cycleType={cycleTypes[cycleType as keyof typeof cycleTypes].name} />
          </div>
        )}
      </div>

      {/* Footer Branding */}
      <footer className="mt-16 pb-8 text-center">
        <div className="text-xs text-muted-foreground tracking-wider">VERS3DYNAMICS</div>
        <div className="text-[10px] text-muted-foreground/50">TEMPORAL RESONANCE MAPPING</div>
      </footer>
    </div>
  );
}
