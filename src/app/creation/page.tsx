
'use client';

import { useState, FormEvent } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { generateLinkedInCarousel, GenerateLinkedInCarouselOutput } from '@/ai/flows/generate-linkedin-carousel-flow';
import { Loader2 } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';

export default function ContentCreationPage() {
  const [topic, setTopic] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [carouselData, setCarouselData] = useState<GenerateLinkedInCarouselOutput | null>(null);
  const { toast } = useToast();

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (!topic.trim()) {
      toast({
        variant: 'destructive',
        title: 'Le sujet ne peut pas être vide.',
      });
      return;
    }
    setIsLoading(true);
    setCarouselData(null);
    try {
      const result = await generateLinkedInCarousel({ topic });
      setCarouselData(result);
    } catch (error: any) {
      console.error('Error generating carousel:', error);
      toast({
        variant: 'destructive',
        title: 'Erreur de Génération',
        description: error.message || "L'IA n'a pas pu générer d'idées. Veuillez réessayer.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      <Card>
        <CardHeader>
          <CardTitle>Générateur de Carrousels LinkedIn</CardTitle>
          <CardDescription>
            Entrez un sujet lié à la finance, au contrôle de gestion ou à l'automatisation, et laissez l'IA générer une structure de post en 5 slides pour vous.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-4">
            <Input
              type="text"
              placeholder="Ex: L'automatisation du reporting financier"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              disabled={isLoading}
              className="flex-grow"
            />
            <Button type="submit" disabled={isLoading} className="w-full sm:w-auto">
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Génération en cours...
                </>
              ) : (
                'Générer les idées'
              )}
            </Button>
          </form>
        </CardContent>
      </Card>

      <AnimatePresence>
        {carouselData && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-6"
          >
            <h2 className="text-2xl font-bold font-headline">Résultat du Carrousel</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {carouselData.slides.map((slide, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card className="h-full flex flex-col">
                    <CardHeader>
                      <CardTitle className="text-lg">
                        <span className="text-primary font-bold">Slide {index + 1}:</span> {slide.title}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="flex-grow">
                      <p className="whitespace-pre-wrap text-sm text-muted-foreground">{slide.content}</p>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
