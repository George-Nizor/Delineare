// Step five: a lamp. Its foot is the spot on the floor under it. Floor lines run from the foot through
// each base corner, rays from the lamp over each top corner, and they cross at the tips. The rays
// spread out, so the shadow widens as it goes away from the box.
import { lampScene } from './scenes.js';

export default (kit) => kit.svg({ width: 540, height: 340 }, kit.rect(16, 8, 508, 324, { rx: 4 }), lampScene(kit).out);
