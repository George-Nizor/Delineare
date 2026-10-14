// Pictures for the course cards. Thirteen lessons have a public-domain drawing from the Art
// Institute of Chicago (open access, CC0), resized into public/art. The rest show a line drawing
// of the lesson's exercise from public/art/icons.

export interface Drawing {
  src: string;
  credit: string;
}

const DRAWINGS: Record<string, Drawing> = {
  gesture: { src: './art/gesture-franco.jpg', credit: 'Battista Franco, Sketches of Figures, 1540/60' },
  'seeing-value': { src: './art/value-seurat.jpg', credit: 'Georges Seurat, Seated Woman with a Parasol, 1884/85' },
  proportions: { src: './art/proportions-corot.jpg', credit: 'Camille Corot, Standing Male Nude, 1843' },
  mannequin: { src: './art/mannequin-michelangelo-follower.jpg', credit: 'Follower of Michelangelo, Male Figure Study, 1540/50' },
  'figures-imagination': { src: './art/imagination-tiepolo.jpg', credit: 'Giovanni Battista Tiepolo, Fantasy on the Death of Seneca, 1735/40' },
  head: { src: './art/head-bandinelli.jpg', credit: 'Baccio Bandinelli, Two Studies of the Head of a Youth, about 1550' },
  features: { src: './art/features-burne-jones.jpg', credit: 'Edward Burne-Jones, Head of Woman with Eyes Closed, about 1875' },
  'hands-feet': { src: './art/hands-raphael.jpg', credit: 'Raphael, Upraised Right Hand, 1518/20' },
  clothing: { src: './art/drapery-verrocchio.jpg', credit: 'Andrea del Verrocchio, Drapery Study of a Standing Figure, about 1470' },
  plants: { src: './art/tree-vangogh.jpg', credit: 'Vincent van Gogh, Weeping Tree, 1889' },
  animals: { src: './art/horse-degas.jpg', credit: 'Edgar Degas, Studies of a Horse, 1868/75' },
  'rooms-streets': { src: './art/street-caillebotte.jpg', credit: 'Gustave Caillebotte, Study for Paris Street; Rainy Day, 1877' },
  composition: { src: './art/composition-puvis.jpg', credit: 'Pierre Puvis de Chavannes, study for The Sacred Grove, 1883/84' },
};

export const drawingFor = (slug: string): Drawing | undefined => DRAWINGS[slug];
export const iconFor = (number: number): string => `./art/icons/${String(number).padStart(2, '0')}.svg`;
