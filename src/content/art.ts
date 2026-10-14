// Pictures for the course cards: one public-domain drawing per lesson, from the open access
// collections of the Art Institute of Chicago and the Metropolitan Museum of Art (both CC0),
// resized into public/art. The line drawings in public/art/icons label exercises in Practice.

export interface Drawing {
  src: string;
  credit: string;
}

const DRAWINGS: Record<string, Drawing> = {
  'confident-lines': { src: './art/confident-lines-met-338967.jpg', credit: 'Guercino, Rocky Landscape with Eight Figures, 1600s' },
  ellipses: { src: './art/ellipses-met-676595.jpg', credit: 'Claude Ballin the Elder, Bronze Garden Vase with Two Putti, after 1673' },
  contour: { src: './art/contour-met-369551.jpg', credit: 'Cornelius Varley, Portrait of a Man in Profile, 1800s' },
  measuring: { src: './art/measuring-met-355535.jpg', credit: 'Romain Cazes, Study of Legs, 1800s' },
  'block-in': { src: './art/block-in-met-370853.jpg', credit: 'Daniele da Volterra, Study for the Figure of Saint Peter, about 1545' },
  checking: { src: './art/checking-met-716636.jpg', credit: 'Antonio Busca, Studies of Figures, 1660/70' },
  memory: { src: './art/memory-met-334752.jpg', credit: 'Eugène Delacroix, Studies of Animals, 1800s' },
  'simple-forms': { src: './art/simple-forms-met-380379.jpg', credit: 'Peter Flötner, Perspectival Drawing with Three Cubes, 1528' },
  'contour-lines': { src: './art/contour-lines-met-338966.jpg', credit: 'Guercino, Saint Joseph with his Flowering Staff, 1600s' },
  'one-point': { src: './art/one-point-met-651744.jpg', credit: 'Hans Vredeman de Vries, Architectural Capriccio in Point Perspective, about 1595' },
  'plotted-boxes': { src: './art/plotted-boxes-met-389440.jpg', credit: 'Anonymous, Italian, Architectural Perspective Study, 1600s' },
  'freehand-boxes': { src: './art/freehand-boxes-met-335784.jpg', credit: 'Franz von Hauslab the Younger, Sketch of Building, 1800s' },
  cylinders: { src: './art/cylinders-met-390185.jpg', credit: 'Baldassarre Peruzzi, Study for a Colonnade in Perspective, about 1530' },
  'building-objects': { src: './art/building-objects-met-387079.jpg', credit: 'Anonymous, Chinese, Design for Export Furniture, about 1800' },
  'turning-objects': { src: './art/turning-objects-met-747500.jpg', credit: 'Eugène Delacroix, Study of Medieval Armor, 1825' },
  'seeing-value': { src: './art/value-seurat.jpg', credit: 'Georges Seurat, Seated Woman with a Parasol, 1884/85' },
  'light-on-form': { src: './art/light-on-form-met-441375.jpg', credit: 'Isidore Pils, Study of a Kabyle Man, 1861' },
  'cast-shadows': { src: './art/cast-shadows-met-651676.jpg', credit: 'Thorald Læssøe, A Sunny Street at Tivoli, 1846' },
  'tone-with-line': { src: './art/tone-with-line-met-371145.jpg', credit: 'Jacques de Gheyn II, Study of Eleven Heads, about 1600' },
  'still-life': { src: './art/still-life-met-335601.jpg', credit: 'Jan van Huysum, Still Life with Fruit, 1700s' },
  gesture: { src: './art/gesture-franco.jpg', credit: 'Battista Franco, Sketches of Figures, 1540/60' },
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
  designing: { src: './art/designing-met-389749.jpg', credit: 'Anonymous, Italian, Design for a Fountain with Dolphins, 1700s' },
  scene: { src: './art/scene-met-338944.jpg', credit: 'Francesco Guardi, Architectural Capriccio: A Palace Colonnade, 1700s' },
};

export const drawingFor = (slug: string): Drawing | undefined => DRAWINGS[slug];
export const iconFor = (number: number): string => `./art/icons/${String(number).padStart(2, '0')}.svg`;
