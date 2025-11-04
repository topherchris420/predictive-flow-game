import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface MeaningPanelProps {
  cycleType: string;
}

const cycleExplanations: Record<string, {
  computation: string;
  opportunity: string;
  reflection: string;
  transformation: string;
}> = {
  '1 Year Cycle': {
    computation: 'Each resonant point is spaced exactly 1 year apart from the seed event, creating annual markers in time.',
    opportunity: 'Annual cycles often mark natural renewal points. These dates may coincide with personal or collective opportunities for growth.',
    reflection: 'Consider what patterns emerged at each yearly interval. What themes repeated? What evolved?',
    transformation: 'Each year represents a complete cycle of seasons and experiences, offering fresh perspectives on the original event.',
  },
  '5 Year Cycle': {
    computation: 'Resonant points occur every 5 years, aligning with significant developmental and social cycles.',
    opportunity: 'Five-year intervals often mark major life transitions: career changes, relationship milestones, or identity shifts.',
    reflection: 'Look back at each 5-year marker. How did you transform? What cycles of growth can you identify?',
    transformation: 'This cycle represents substantial change periods where fundamental aspects of life often reorganize.',
  },
  'Mayan Long Count (5,125 years)': {
    computation: 'Based on the Mayan Long Count calendar b\'ak\'tun cycle of 5,125 years, representing vast cosmic time scales.',
    opportunity: 'These are civilizational-scale cycles. Events at these markers may resonate with collective human consciousness.',
    reflection: 'Consider the seed event as part of vast historical patterns spanning millennia.',
    transformation: 'This cycle transcends individual lifetimes, connecting to archetypal shifts in human civilization.',
  },
  'Fibonacci 8 Year': {
    computation: 'Uses the Fibonacci number 8, creating intervals based on natural growth patterns found throughout nature.',
    opportunity: 'Fibonacci cycles align with natural rhythms. These dates may mark organic unfolding of situations.',
    reflection: 'Notice how situations initiated at the seed event naturally expanded over 8-year intervals.',
    transformation: 'Each cycle builds upon the previous, like spirals in a nautilus shell or petals in a flower.',
  },
  'Fibonacci 13 Year': {
    computation: 'Uses the Fibonacci number 13, creating longer intervals that align with deeper natural cycles.',
    opportunity: 'These longer Fibonacci intervals may mark profound shifts in life direction and purpose.',
    reflection: 'Examine how seeds planted at the original date fully matured over 13-year periods.',
    transformation: 'This cycle represents significant evolutionary steps in personal or collective development.',
  },
  'Fibonacci 21 Year': {
    computation: 'Uses the Fibonacci number 21, representing substantial growth cycles found in nature and time.',
    opportunity: 'Twenty-one year cycles often mark generational shifts and the completion of major life chapters.',
    reflection: 'These intervals may reveal how foundational events ripple across decades of experience.',
    transformation: 'This cycle represents deep transformation, often involving complete life reorganization.',
  },
  'Golden Ratio Multiplier': {
    computation: 'Each interval multiplies by φ (1.618), the golden ratio. Subsequent cycles: 1.618 years, 2.618 years, 4.236 years, etc.',
    opportunity: 'The golden ratio appears throughout nature in optimal growth patterns. These dates mark harmonic expansion points.',
    reflection: 'Notice how events may naturally spiral outward from the seed point in elegant, proportional ways.',
    transformation: 'This sacred geometry suggests divine proportion in time itself, where events unfold with mathematical beauty.',
  },
  'Metonic Cycle (19 years)': {
    computation: 'Based on the 19-year Metonic cycle where lunar and solar calendars synchronize. Used in ancient calendars worldwide.',
    opportunity: 'These points mark cosmic synchronization moments where different cycles align harmoniously.',
    reflection: 'Consider how celestial cycles might mirror or influence personal and historical patterns.',
    transformation: 'This cycle connects earthly events to celestial rhythms, suggesting larger cosmic intelligence at play.',
  },
};

export function MeaningPanel({ cycleType }: MeaningPanelProps) {
  const meanings = cycleExplanations[cycleType] || cycleExplanations['1 Year Cycle'];

  return (
    <Card className="p-6 bg-card/50 backdrop-blur-sm border-primary/20">
      <h2 className="text-lg font-light mb-4 text-primary">Cycle Interpretation</h2>
      
      <Tabs defaultValue="computation" className="w-full">
        <TabsList className="grid w-full grid-cols-4 bg-background/50">
          <TabsTrigger value="computation" className="text-xs">Computation</TabsTrigger>
          <TabsTrigger value="opportunity" className="text-xs">Opportunity</TabsTrigger>
          <TabsTrigger value="reflection" className="text-xs">Reflection</TabsTrigger>
          <TabsTrigger value="transformation" className="text-xs">Transformation</TabsTrigger>
        </TabsList>

        <TabsContent value="computation" className="mt-4 text-sm text-muted-foreground">
          <p className="leading-relaxed">{meanings.computation}</p>
        </TabsContent>

        <TabsContent value="opportunity" className="mt-4 text-sm text-muted-foreground">
          <p className="leading-relaxed">{meanings.opportunity}</p>
        </TabsContent>

        <TabsContent value="reflection" className="mt-4 text-sm text-muted-foreground">
          <p className="leading-relaxed">{meanings.reflection}</p>
        </TabsContent>

        <TabsContent value="transformation" className="mt-4 text-sm text-muted-foreground">
          <p className="leading-relaxed">{meanings.transformation}</p>
        </TabsContent>
      </Tabs>

      <div className="mt-6 p-4 bg-primary/5 rounded-md border border-primary/20">
        <p className="text-xs text-muted-foreground italic">
          <strong className="text-primary">Note:</strong> These interpretations are offered as contemplative frameworks, 
          not predictions. Cyclical time patterns invite reflection on recurring themes and rhythms in experience, 
          helping to recognize meaningful patterns without deterministic claims.
        </p>
      </div>
    </Card>
  );
}
