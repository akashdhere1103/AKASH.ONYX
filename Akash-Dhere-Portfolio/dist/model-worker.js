import {buildModel} from './models.js';
const mesh = buildModel();
self.postMessage(mesh, [mesh.buffer]);
